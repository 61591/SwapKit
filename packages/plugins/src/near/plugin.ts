import {
  AssetValue,
  Chain,
  type CryptoChain,
  ProviderName,
  SwapKitError,
  type SwapParams,
} from "@swapkit/helpers";
import { type QuoteResponseRoute, SwapKitApi } from "@swapkit/helpers/api";
import type { NearWallet } from "@swapkit/toolboxes/near";
import { createPlugin } from "../utils";
import { calculateNearNameCost, validateNearName } from "./nearNames";
import type { NearAccountInfo, NearNameRegistrationParams } from "./types";

export const NearPlugin = createPlugin({
  name: "near",
  properties: {
    supportedSwapkitProviders: [ProviderName.NEAR],
  },
  methods: ({ getWallet }) => ({
    async swap(swapParams: SwapParams<"near", QuoteResponseRoute>) {
      const {
        route: {
          buyAsset: buyAssetString,
          sellAsset: sellAssetString,
          sellAmount,
          meta: { near },
        },
      } = swapParams;

      if (!(sellAssetString && buyAssetString && near?.sellAsset)) {
        throw new SwapKitError("core_swap_asset_not_recognized");
      }

      const sellAsset = await AssetValue.from({
        asyncTokenLookup: true,
        asset: sellAssetString,
        value: sellAmount,
      });

      const wallet = getWallet(sellAsset.chain as Exclude<CryptoChain, Chain.Radix>);

      if (!wallet) {
        throw new SwapKitError("core_wallet_connection_not_found");
      }

      const { depositAddress } = await SwapKitApi.getNearDepositChannel(near);

      const tx = await wallet.transfer({
        assetValue: sellAsset,
        recipient: depositAddress,
        isProgramDerivedAddress: true,
      });

      return tx as string;
    },

    // NEAR Names functionality
    nearNames: {
      async resolve(name: string) {
        const normalizedName = name.toLowerCase().replace(/\.near$/, "");

        if (!validateNearName(normalizedName)) {
          throw new SwapKitError("plugin_near_invalid_name");
        }

        const accountId = `${normalizedName}.near`;
        const wallet = getWallet(Chain.Near);

        if (!wallet) {
          throw new SwapKitError("plugin_near_no_connection");
        }

        try {
          // Ask RPC whether the account exists
          await wallet.provider.query({
            request_type: "view_account",
            finality: "final",
            account_id: accountId,
          });
          // If no error is thrown, the account exists
          return accountId; // Account is taken, return the account ID as "owner"
        } catch (err: any) {
          // UNKNOWN_ACCOUNT means it hasn't been created yet → available
          if (/UNKNOWN_ACCOUNT|does not exist while viewing/.test(err.message)) {
            return null;
          }
          // Re-throw any unexpected errors
          throw err;
        }
      },

      async isAvailable(name: string) {
        const owner = await this.resolve(name);
        return owner === null;
      },

      async getInfo(name: string): Promise<NearAccountInfo | null> {
        const normalizedName = name.toLowerCase().replace(/\.near$/, "");

        if (!validateNearName(normalizedName)) {
          throw new SwapKitError("plugin_near_invalid_name");
        }

        const accountId = `${normalizedName}.near`;
        const wallet = getWallet(Chain.Near);

        if (!wallet) {
          throw new SwapKitError("plugin_near_no_connection");
        }

        try {
          // Get account info
          const accountInfo = await wallet.provider.query({
            request_type: "view_account",
            finality: "final",
            account_id: accountId,
          });

          // Optionally get the account's public keys
          const keysInfo = await wallet.provider.query({
            request_type: "view_access_key_list",
            finality: "final",
            account_id: accountId,
          });

          return {
            accountId,
            balance: (accountInfo as any).amount,
            storageUsed: (accountInfo as any).storage_usage,
            codeHash: (accountInfo as any).code_hash,
            publicKeys: (keysInfo as any).keys?.map((k: any) => k.public_key) || [],
          };
        } catch (err: any) {
          if (/UNKNOWN_ACCOUNT|does not exist while viewing/.test(err.message)) {
            return null;
          }
          throw err;
        }
      },

      async lookupNames(accountId: string) {
        // NEAR doesn't have a central registry to look up all names owned by an account
        // This would require indexing or an external service
        // For now, we can only check if a specific account exists
        const wallet = getWallet(Chain.Near);

        if (!wallet) {
          throw new SwapKitError("plugin_near_no_connection");
        }

        try {
          // Check if the account exists
          await wallet.provider.query({
            request_type: "view_account",
            finality: "final",
            account_id: accountId,
          });

          // If the account ID ends with .near, it's a NEAR name
          if (accountId.endsWith(".near")) {
            return [accountId];
          }

          // Otherwise, we can't determine what names they own without an indexer
          return [];
        } catch {
          return [];
        }
      },

      async register(params: NearNameRegistrationParams) {
        const { name, publicKey: publicKeyOverwrite } = params;
        const normalizedName = name.toLowerCase().replace(/\.near$/, "");

        if (!validateNearName(normalizedName)) {
          throw new SwapKitError("plugin_near_invalid_name");
        }

        const wallet = getWallet(Chain.Near) as NearWallet;

        const newPublicKey = publicKeyOverwrite || (await wallet.getPublicKey());

        const cost = calculateNearNameCost(normalizedName);

        return wallet.callFunction({
          contractId: "near",
          methodName: "create_account",
          args: {
            new_account_id: `${normalizedName}.near`,
            new_public_key: newPublicKey,
          },
          deposit: cost,
        });
      },

      transfer(name: string, newOwner: string) {
        const normalizedName = name.toLowerCase().replace(/\.near$/, "");

        if (!validateNearName(normalizedName)) {
          throw new SwapKitError("plugin_near_invalid_name");
        }

        const wallet = getWallet(Chain.Near) as NearWallet;

        return wallet.callFunction({
          contractId: "near",
          methodName: "transfer",
          args: {
            name: normalizedName,
            new_owner: newOwner,
          },
          deposit: "1",
        });
      },
    },
  }),
});
