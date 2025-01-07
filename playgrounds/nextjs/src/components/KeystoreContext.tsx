"use client";

import type { Chain } from "@swapkit/helpers";
import type { Keystore } from "@swapkit/wallet-keystore";
import { type ReactNode, createContext, useContext, useState } from "react";

type KeystoreFile = {
  keystore: Keystore;
  file: File;
  chains: Chain[];
} | null;

interface KeystoreContextType {
  keystoreFile: KeystoreFile;
  setKeystoreFile: (file: KeystoreFile) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDecrypting: boolean;
  setIsDecrypting: (decrypting: boolean) => void;
}

const KeystoreContext = createContext<KeystoreContextType | undefined>(undefined);

export function KeystoreProvider({ children }: { children: ReactNode }) {
  const [keystoreFile, setKeystoreFile] = useState<KeystoreFile>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  return (
    <KeystoreContext.Provider
      value={{
        keystoreFile,
        setKeystoreFile,
        isOpen,
        setIsOpen,
        isDecrypting,
        setIsDecrypting,
      }}
    >
      {children}
    </KeystoreContext.Provider>
  );
}

export function useKeystore() {
  const context = useContext(KeystoreContext);
  if (context === undefined) {
    throw new Error("useKeystore must be used within a KeystoreProvider");
  }
  return context;
}
