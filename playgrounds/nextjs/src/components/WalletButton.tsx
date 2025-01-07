"use client";

import { Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSwapKit } from "~/lib/swapKit";
import { WalletConnect } from "./WalletConnect";
import { WalletDrawer } from "./WalletDrawer";

export function WalletButton() {
  const { disconnectWallet, isWalletConnected, walletType } = useSwapKit();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isWalletConnected) {
    return (
      <>
        <Button onClick={() => setDrawerOpen(true)} variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          {walletType}
        </Button>
        <WalletDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isWalletConnected}>
          <Wallet className="mr-2 h-4 w-4" />
          {isWalletConnected ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[600px]">
        <WalletConnect />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
