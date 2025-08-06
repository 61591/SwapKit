import {
  Chain,
  ChainToChainId,
  SKConfig,
  WalletOption,
  filterSupportedChains,
} from "@swapkit/helpers";
import { createWallet, getWalletSupportedChains } from "@swapkit/wallet-core";

import { getWalletMethods } from "./signer";

export const coinbaseWallet = createWallet({
  name: "connectCoinbaseWallet",
  walletType: WalletOption.COINBASE_MOBILE,
  supportedChains: [
    Chain.Arbitrum,
    Chain.Aurora,,
    Chain.Avalanche,
    Chain.Base,
    Chain.Berachain,,
    Chain.BinanceSmartChain,
    Chain.Botanix,
    Chain.Core,
    Chain.Corn,
    Chain.Ethereum,
    Chain.Gnosis,
    Chain.HyperEVM,
    Chain.Optimism,
    Chain.Polygon,
    Chain.Unichain,
  ],
  connect: ({ addChain, walletType, supportedChains }) =>
    async function connectCoinbaseWallet(chains: Chain[]) {
      const { createCoinbaseWalletSDK } = await import("@coinbase/wallet-sdk");

      const filteredChains = filterSupportedChains({ chains, supportedChains, walletType });

      const coinbaseConfig = SKConfig.get("integrations").coinbase || {
        appName: "Swapkit Playground",
      };

      const coinbaseSdk = createCoinbaseWalletSDK({
        ...coinbaseConfig,
        appChainIds: filteredChains.map((chain) => Number(ChainToChainId[chain])),
      });

      await Promise.all(
        filteredChains.map(async (chain) => {
          const walletMethods = await getWalletMethods({ chain, coinbaseSdk });

          addChain({ ...walletMethods, chain, walletType });
        }),
      );

      return true;
    },
});

export const COINBASE_SUPPORTED_CHAINS = getWalletSupportedChains(coinbaseWallet);
