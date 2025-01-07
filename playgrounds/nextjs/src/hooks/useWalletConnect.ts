"use client";

import { type Chain, WalletOption } from "@swapkit/helpers";
import { useCallback, useState } from "react";
import { triggerKeystoreFileSelect } from "~/components/GlobalKeystoreDialog";
import { useKeystore } from "~/components/KeystoreContext";
import { useSwapKit } from "~/lib/swapKit";

export const useWalletConnect = (chains: Chain[]) => {
  const { swapKit, connectWallet } = useSwapKit();
  const { setKeystoreFile, setIsOpen } = useKeystore();
  const [loadingWallet, setLoadingWallet] = useState<WalletOption | null>(null);

  const handleConnect = useCallback(
    async (option: WalletOption) => {
      if (!swapKit) return;

      setLoadingWallet(option);

      try {
        if (option === WalletOption.KEYSTORE) {
          triggerKeystoreFileSelect(async (file) => {
            try {
              const keystoreFile = await file.text();
              const parsed = JSON.parse(keystoreFile);

              if (!parsed.crypto?.kdfparams?.salt || !parsed.crypto?.ciphertext) {
                throw new Error("Invalid keystore format");
              }

              setKeystoreFile({ keystore: parsed, file, chains });
              setIsOpen(true);
            } catch (error) {
              console.error("Failed to read keystore file:", error);
            } finally {
              setLoadingWallet(null);
            }
          });
          return;
        }

        await connectWallet(option, chains);
      } catch (error) {
        console.error(`Failed to connect ${option}:`, error);
      } finally {
        setLoadingWallet(null);
      }
    },
    [chains, swapKit, connectWallet, setKeystoreFile, setIsOpen],
  );

  return {
    loadingWallet,
    handleConnect,
  };
};
