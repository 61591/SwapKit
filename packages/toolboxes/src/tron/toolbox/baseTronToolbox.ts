import {
  type Asset,
  type AssetValue,
  Chain,
  type ChainSigner,
  FeeOption,
  SwapKitError,
  SwapKitNumber,
  isGasAsset,
} from "@swapkit/helpers";
import { trc20ABI } from "../contracts/trc20";
import {
  getTronWeb,
  validateTronAddress,
  toSun,
  fromSun,
  getTRC20ContractAddress,
} from "../helpers";
import type {
  TronApproveParams,
  TronIsApprovedParams,
  TronCallParams,
  TronTransferParams,
  TronCreateTransactionParams,
  TronTxParams,
} from "../types";

type TronToolboxWrapParams = {
  tronWeb: any;
  signer?: ChainSigner<TronTransferParams, string>;
};

export const MAX_APPROVAL = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export function BaseTronToolbox({
  tronWeb,
  signer,
}: {
  tronWeb: any;
  signer?: ChainSigner<TronTransferParams, string>;
}) {
  return {
    getAddress: () => {
      return signer?.getAddress() || tronWeb?.defaultAddress?.base58;
    },
    call: getCall({ tronWeb, signer }),
    approve: getApprove({ tronWeb, signer }),
    approvedAmount: getApprovedAmount({ tronWeb }),
    broadcastTransaction: getBroadcastTransaction({ tronWeb }),
    createApprovalTx: getCreateApprovalTx({ tronWeb, signer }),
    createContract: getCreateContract({ tronWeb }),
    createContractTxObject: getCreateContractTxObject({ tronWeb }),
    createTransferTx: getCreateTransferTx({ tronWeb, signer }),
    createTransaction: getCreateTransferTx({ tronWeb, signer }),
    estimateGasLimit: getEstimateGasLimit({ tronWeb }),
    estimateGasPrices: getEstimateGasPrices({ tronWeb }),
    isApproved: getIsApproved({ tronWeb }),
    sendTransaction: getSendTransaction({ tronWeb, signer }),
    signMessage: signer?.signMessage,
    transfer: getTransfer({ tronWeb, signer }),
    validateAddress: (address: string) => validateTronAddress(address),
  };
}

function getCreateContract({ tronWeb }: TronToolboxWrapParams) {
  return function createContract(address: string, abi?: any[]) {
    return tronWeb.contract(abi || trc20ABI, address);
  };
}

function getCall({ tronWeb, signer }: TronToolboxWrapParams) {
  return async function call<T>({
    contractAddress,
    abi,
    funcName,
    funcParams = [],
    feeLimit = 100_000_000, // 100 TRX default fee limit
    callValue = 0,
    from,
  }: TronCallParams): Promise<T> {
    if (!contractAddress) throw new SwapKitError("toolbox_tron_no_contract_address");

    const contract = tronWeb.contract(abi || trc20ABI, contractAddress);
    const fromAddress = from || signer?.getAddress() || tronWeb.defaultAddress?.base58;

    if (!fromAddress) throw new SwapKitError("toolbox_tron_no_from_address");

    try {
      // Check if this is a view function
      const abiFunction = (abi || trc20ABI).find((item: any) => item.name === funcName);
      const isView = abiFunction?.stateMutability === 'view' || abiFunction?.constant === true;

      if (isView) {
        // For view functions, use call method
        const result = await contract[funcName](...funcParams).call();
        return result;
      } else {
        // For state-changing functions, send transaction
        const tx = await contract[funcName](...funcParams).send({
          feeLimit,
          callValue,
          from: fromAddress,
        });
        return tx as T;
      }
    } catch (error) {
      throw new SwapKitError("toolbox_tron_call_failed", { error });
    }
  };
}

function getApprovedAmount({ tronWeb }: TronToolboxWrapParams) {
  return async function approvedAmount({
    assetAddress,
    spenderAddress,
    from,
  }: TronIsApprovedParams): Promise<string> {
    const call = getCall({ tronWeb });

    try {
      const result = await call<string>({
        contractAddress: assetAddress,
        abi: trc20ABI,
        funcName: "allowance",
        funcParams: [from, spenderAddress],
      });
      return result.toString();
    } catch (error) {
      return "0";
    }
  };
}

function getIsApproved({ tronWeb }: TronToolboxWrapParams) {
  return async function isApproved({
    assetAddress,
    spenderAddress,
    from,
    amount = MAX_APPROVAL,
  }: TronIsApprovedParams): Promise<boolean> {
    const approvedAmount = await getApprovedAmount({ tronWeb })({
      assetAddress,
      spenderAddress,
      from,
    });

    return SwapKitNumber.fromString(approvedAmount).gte(SwapKitNumber.fromString(amount.toString()));
  };
}

function getApprove({ tronWeb, signer }: TronToolboxWrapParams) {
  return async function approve({
    assetAddress,
    spenderAddress,
    amount = MAX_APPROVAL,
    feeLimit = 100_000_000,
    from,
  }: TronApproveParams): Promise<string> {
    const fromAddress = from || signer?.getAddress() || tronWeb.defaultAddress?.base58;
    if (!fromAddress) throw new SwapKitError("toolbox_tron_no_from_address");

    const call = getCall({ tronWeb, signer });

    return call<string>({
      contractAddress: assetAddress,
      abi: trc20ABI,
      funcName: "approve",
      funcParams: [spenderAddress, amount.toString()],
      feeLimit,
      from: fromAddress,
    });
  };
}

function getTransfer({ tronWeb, signer }: TronToolboxWrapParams) {
  return async function transfer({
    assetValue,
    memo,
    recipient,
    feeOptionKey = FeeOption.Fast,
    sender,
    feeLimit = 100_000_000,
  }: TronTransferParams): Promise<string> {
    const txAmount = assetValue.getBaseValue("string");
    const from = sender || signer?.getAddress() || tronWeb.defaultAddress?.base58;

    if (!from) throw new SwapKitError("toolbox_tron_no_from_address");

    if (assetValue.isGasAsset) {
      // Native TRX transfer
      try {
        const transaction = await tronWeb.transactionBuilder.sendTrx(
          recipient,
          toSun(txAmount),
          from
        );

        if (memo) {
          transaction.raw_data.data = tronWeb.toHex(memo);
        }

        const signedTx = await tronWeb.trx.sign(transaction);
        const result = await tronWeb.trx.sendRawTransaction(signedTx);
        
        if (result.result) {
          return result.transaction?.txID || result.txid;
        } else {
          throw new Error(result.message || "Transaction failed");
        }
      } catch (error) {
        throw new SwapKitError("toolbox_tron_transfer_failed", { error });
      }
    } else {
      // TRC20 token transfer
      const contractAddress = getTRC20ContractAddress(assetValue);
      if (!contractAddress) throw new SwapKitError("toolbox_tron_no_contract_address");

      const call = getCall({ tronWeb, signer });
      return call<string>({
        contractAddress,
        abi: trc20ABI,
        funcName: "transfer",
        funcParams: [recipient, txAmount],
        feeLimit,
        from,
      });
    }
  };
}

function getEstimateGasLimit({ tronWeb }: TronToolboxWrapParams) {
  return async function estimateGasLimit(): Promise<number> {
    // TRON uses bandwidth and energy, return typical fee limit
    return 100_000_000; // 100 TRX in SUN
  };
}

function getEstimateGasPrices({ tronWeb }: TronToolboxWrapParams) {
  return async function estimateGasPrices(): Promise<{
    [key in FeeOption]: {
      feeLimit: number;
    };
  }> {
    // TRON fee structure is different from EVM
    // Return fee limits for different speeds
    return {
      [FeeOption.Average]: { feeLimit: 50_000_000 }, // 50 TRX
      [FeeOption.Fast]: { feeLimit: 100_000_000 }, // 100 TRX
      [FeeOption.Fastest]: { feeLimit: 200_000_000 }, // 200 TRX
    };
  };
}

function getSendTransaction({ tronWeb, signer }: TronToolboxWrapParams) {
  return async function sendTransaction({
    to,
    from,
    amount = 0,
    feeLimit = 100_000_000,
    data,
  }: TronTxParams): Promise<string> {
    if (!to) throw new SwapKitError("toolbox_tron_no_to_address");

    const fromAddress = from || signer?.getAddress() || tronWeb.defaultAddress?.base58;
    if (!fromAddress) throw new SwapKitError("toolbox_tron_no_from_address");

    try {
      let transaction;
      
      if (amount > 0) {
        // TRX transfer
        transaction = await tronWeb.transactionBuilder.sendTrx(to, amount, fromAddress);
      } else {
        // Contract call or data transaction
        transaction = await tronWeb.transactionBuilder.createSmartContract({
          feeLimit,
          callValue: amount,
          userFeePercentage: 0,
          originEnergyLimit: 1,
        });
      }

      if (data) {
        transaction.raw_data.data = tronWeb.toHex(data);
      }

      const signedTx = await tronWeb.trx.sign(transaction);
      const result = await tronWeb.trx.sendRawTransaction(signedTx);
      
      if (result.result) {
        return result.transaction?.txID || result.txid;
      } else {
        throw new Error(result.message || "Transaction failed");
      }
    } catch (error) {
      throw new SwapKitError("toolbox_tron_send_transaction_failed", { error });
    }
  };
}

function getCreateTransferTx({ tronWeb, signer }: TronToolboxWrapParams) {
  return async function createTransferTx({
    assetValue,
    memo,
    recipient,
    data,
    sender,
    feeLimit = 100_000_000,
  }: TronCreateTransactionParams): Promise<any> {
    const txAmount = assetValue.getBaseValue("string");
    const from = sender || signer?.getAddress() || tronWeb.defaultAddress?.base58;

    if (!from) throw new SwapKitError("toolbox_tron_no_from_address");

    if (isGasAsset(assetValue)) {
      const transaction = await tronWeb.transactionBuilder.sendTrx(
        recipient,
        toSun(txAmount),
        from
      );

      if (memo || data) {
        transaction.raw_data.data = tronWeb.toHex(memo || data);
      }

      return transaction;
    }

    const contractAddress = getTRC20ContractAddress(assetValue);
    if (!contractAddress) throw new SwapKitError("toolbox_tron_no_contract_address");

    return getCreateContractTxObject({ tronWeb })({
      contractAddress,
      funcName: "transfer",
      funcParams: [recipient, txAmount],
      feeLimit,
      from,
    });
  };
}

function getCreateApprovalTx({ tronWeb, signer }: TronToolboxWrapParams) {
  return async function createApprovalTx({
    assetAddress,
    spenderAddress,
    amount = MAX_APPROVAL,
    from,
  }: TronApproveParams): Promise<any> {
    const fromAddress = from || signer?.getAddress() || tronWeb.defaultAddress?.base58;

    return getCreateContractTxObject({ tronWeb })({
      contractAddress: assetAddress,
      funcName: "approve",
      funcParams: [spenderAddress, amount.toString()],
      from: fromAddress,
    });
  };
}

function getCreateContractTxObject({ tronWeb }: TronToolboxWrapParams) {
  return async function createContractTxObject({
    contractAddress,
    abi,
    funcName,
    funcParams = [],
    feeLimit = 100_000_000,
    callValue = 0,
    from,
  }: TronCallParams & { from?: string }): Promise<any> {
    const contract = tronWeb.contract(abi || trc20ABI, contractAddress);
    
    return contract[funcName](...funcParams).send({
      feeLimit,
      callValue,
      from,
      shouldPollResponse: false,
    });
  };
}

function getBroadcastTransaction({ tronWeb }: TronToolboxWrapParams) {
  return async function broadcastTransaction(signedTx: any): Promise<string> {
    const result = await tronWeb.trx.sendRawTransaction(signedTx);
    
    if (result.result) {
      return result.transaction?.txID || result.txid;
    } else {
      throw new Error(result.message || "Broadcast failed");
    }
  };
}
