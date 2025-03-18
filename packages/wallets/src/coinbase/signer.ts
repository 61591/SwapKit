import type { CoinbaseWalletProvider } from "@coinbase/wallet-sdk";
import type { createCoinbaseWalletSDK } from "@coinbase/wallet-sdk/dist/createCoinbaseWalletSDK.js";
import { Chain } from "@swapkit/helpers";

export const getWalletMethods = async ({
  chain,
  coinbaseSdk,
}: {
  chain: Chain;
  coinbaseSdk: ReturnType<typeof createCoinbaseWalletSDK>;
}) => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.Avalanche:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Base:
    case Chain.BinanceSmartChain: {
      const walletProvider = coinbaseSdk.getProvider() as CoinbaseWalletProvider;

      const { getToolboxByChain } = await import("@swapkit/toolboxes/evm");
      const { BrowserProvider } = await import("ethers");

      async function getAddress() {
        const accounts = await walletProvider.request<string[]>({
          method: "eth_requestAccounts",
        });

        if (!accounts[0]) throw new Error("No Account found");

        return accounts[0];
      }

      const address = await getAddress();

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const toolbox = getToolboxByChain(chain)({ provider, signer });

      return { ...toolbox, address };
    }

    default:
      throw new Error(`No wallet for chain ${chain}`);
  }
};
