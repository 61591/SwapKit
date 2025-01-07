"use client";

import { decryptFromKeystore } from "@swapkit/wallet-keystore";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useSwapKit } from "~/lib/swapKit";
import { useKeystore } from "./KeystoreContext";

export const GlobalKeystoreDialog = () => {
  const { isOpen, setIsOpen, isDecrypting, setIsDecrypting, keystoreFile, setKeystoreFile } =
    useKeystore();
  const { swapKit } = useSwapKit();
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setPassword("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPassword = password.trim();
    if (!trimmedPassword || !keystoreFile || !swapKit) return;

    try {
      setIsDecrypting(true);
      const phrase = await decryptFromKeystore(keystoreFile.keystore, trimmedPassword);
      if (!phrase) throw new Error("Failed to decrypt keystore");
      await swapKit.connectKeystore(keystoreFile.chains, phrase);
      setIsOpen(false);
      setKeystoreFile(null);
    } catch (error) {
      console.error("Failed to decrypt keystore:", error);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setKeystoreFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Enter Keystore Password</DialogTitle>
            <DialogDescription>
              Please enter your keystore password to decrypt and connect your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              ref={inputRef}
              disabled={isDecrypting}
              className="col-span-3"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isDecrypting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isDecrypting}>
              {isDecrypting ? "Decrypting..." : "Unlock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const triggerKeystoreFileSelect = (onSelect: (file: File) => void) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,.json";
  input.style.display = "none";
  document.body.appendChild(input);

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) onSelect(file);
    document.body.removeChild(input);
  };

  input.click();
};
