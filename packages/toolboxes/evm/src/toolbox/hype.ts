import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl, SwapKitError } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { AlchemyApiType, CovalentApiType } from "../index";
import { EVMToolbox } from "./EVMToolbox";

const getNetworkParams = () => ({
  chainId: ChainId.HyperliquidHex,
  chainName: "HyperEVM",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: BaseDecimal.BSC },
  rpcUrls: ["https://rpc.hyperliquid.xyz/evm"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Hyperliquid]],
});

export const HYPEToolbox = ({
  api,
  provider,
  signer,
  apiKey,
}: {
  api?: CovalentApiType | AlchemyApiType;
  apiKey?: string;
  signer?: Signer;
  provider: JsonRpcProvider | BrowserProvider;
}) => {
  if (!(api || apiKey)) {
    throw new SwapKitError({
      errorKey: "wallet_missing_api_key",
      info: {
        chain: Chain.BinanceSmartChain,
      },
    });
  }

  const evmToolbox = EVMToolbox({ provider, signer, isEIP1559Compatible: false });

  return {
    ...evmToolbox,
    getNetworkParams,
  };
};
