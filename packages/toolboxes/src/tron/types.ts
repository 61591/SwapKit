import type {
  AssetValue,
  ChainSigner,
  DerivationPathArray,
  FeeOption,
  GenericCreateTransactionParams,
  GenericTransferParams,
} from "@swapkit/helpers";
import { Chain } from "@swapkit/helpers";

export type TronWeb = any; // Import from tronweb package
export type TronProvider = any; // TronWeb provider type

export type TronApproveParams = {
  assetAddress: string;
  spenderAddress: string;
  feeOptionKey?: FeeOption;
  amount?: string | number;
  from?: string;
  feeLimit?: number;
};

export type TronIsApprovedParams = {
  assetAddress: string;
  spenderAddress: string;
  from: string;
  amount?: string | number;
};

export type TronCallParams = {
  contractAddress: string;
  abi?: any[];
  funcName: string;
  funcParams?: unknown[];
  feeLimit?: number;
  callValue?: number;
  from?: string;
};

export type TronTransferParams = GenericTransferParams & {
  sender?: string;
  feeLimit?: number;
};

export type TronCreateTransactionParams = Omit<GenericCreateTransactionParams, "feeRate"> & {
  feeLimit?: number;
  data?: string;
};

export type TronTxParams = {
  to?: string;
  from?: string;
  amount?: number;
  data?: string;
  feeLimit?: number;
};

export type TronToolboxParams = {
  tronWeb?: TronWeb;
} & (
  | {
      signer?: ChainSigner<TronTransferParams, string>;
    }
  | {
      phrase?: string;
      derivationPath?: DerivationPathArray;
      index?: number;
    }
  | {
      privateKey?: string;
    }
);
