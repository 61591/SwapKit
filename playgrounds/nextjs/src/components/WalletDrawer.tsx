"use client";

import type { Chain } from "@swapkit/helpers";
import { LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ChainIcon } from "~/components/ui/chain-icon";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useSwapKit } from "~/lib/swapKit";

interface WalletDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletDrawer({ open, onOpenChange }: WalletDrawerProps) {
  const { balances, walletType, swapKit, disconnectWallet } = useSwapKit();

  const connectedChains = Object.entries(swapKit?.getAllWallets() ?? {}).map(
    ([chain]) => chain as Chain,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Connected Wallets</SheetTitle>
          <SheetDescription>
            {walletType} connected to {connectedChains.length} chain
            {connectedChains.length !== 1 ? "s" : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 pb-16">
          {connectedChains.map((chain) => {
            const chainBalances = balances.filter((b) => b.chain === chain);
            const address = swapKit?.getAddress(chain);

            return (
              <div key={chain} className="space-y-4">
                <div className="flex items-center gap-2">
                  <ChainIcon chain={chain} className="h-6 w-6" />
                  <h3 className="font-semibold">{chain}</h3>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground font-mono mb-2">{address}</div>
                  <div className="space-y-1">
                    {chainBalances.map((balance) => (
                      <div key={balance.symbol} className="flex justify-between">
                        <span>{balance.symbol}</span>
                        <span>{balance.getValue("string")}</span>
                      </div>
                    ))}
                    {chainBalances.length === 0 && (
                      <div className="text-sm text-muted-foreground">No balances found</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              disconnectWallet();
              onOpenChange(false);
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
