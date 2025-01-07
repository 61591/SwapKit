"use client";

import { Chain, WalletOption } from "@swapkit/helpers";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ChainIcon } from "~/components/ui/chain-icon";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { WalletIcon } from "~/components/ui/wallet-icon";
import { useWalletConnect } from "~/hooks/useWalletConnect";

const CHAIN_GROUPS = {
  "EVM Chains": [
    Chain.Ethereum,
    Chain.BinanceSmartChain,
    Chain.Avalanche,
    Chain.Polygon,
    Chain.Arbitrum,
    Chain.Optimism,
    Chain.Base,
  ],
  "UTXO Chains": [Chain.Bitcoin, Chain.BitcoinCash, Chain.Litecoin, Chain.Dogecoin, Chain.Dash],
  "Cosmos Chains": [Chain.Cosmos, Chain.THORChain, Chain.Maya, Chain.Kujira],
  "Other Chains": [Chain.Solana, Chain.Polkadot, Chain.Radix, Chain.Chainflip],
};

const WALLET_GROUPS = {
  "Hardware Wallets": [
    WalletOption.LEDGER,
    WalletOption.LEDGER_LIVE,
    WalletOption.TREZOR,
    WalletOption.KEEPKEY,
    WalletOption.KEEPKEY_BEX,
  ],
  "Browser Extensions": [
    WalletOption.METAMASK,
    WalletOption.PHANTOM,
    WalletOption.KEPLR,
    WalletOption.EXODUS,
    WalletOption.BRAVE,
    WalletOption.OKX,
    WalletOption.LEAP,
    WalletOption.POLKADOT_JS,
    WalletOption.TALISMAN,
    WalletOption.EIP6963,
  ],
  "Mobile Wallets": [
    WalletOption.WALLETCONNECT,
    WalletOption.COINBASE_WEB,
    WalletOption.COINBASE_MOBILE,
    WalletOption.TRUSTWALLET_WEB,
    WalletOption.OKX_MOBILE,
    WalletOption.BITGET,
  ],
  Other: [WalletOption.KEYSTORE, WalletOption.CTRL, WalletOption.RADIX_WALLET],
};

const WALLET_CHAIN_SUPPORT: Record<WalletOption, Chain[]> = {
  [WalletOption.METAMASK]: [
    Chain.Ethereum,
    Chain.BinanceSmartChain,
    Chain.Arbitrum,
    Chain.Optimism,
    Chain.Avalanche,
    Chain.Polygon,
  ],
  [WalletOption.PHANTOM]: [Chain.Solana],
  [WalletOption.KEPLR]: [Chain.Cosmos, Chain.THORChain, Chain.Maya, Chain.Kujira],
  [WalletOption.EXODUS]: [
    Chain.Ethereum,
    Chain.BinanceSmartChain,
    Chain.Solana,
    Chain.Bitcoin,
    Chain.BitcoinCash,
  ],
  [WalletOption.LEDGER]: [
    Chain.Bitcoin,
    Chain.Ethereum,
    Chain.THORChain,
    Chain.BinanceSmartChain,
    Chain.Cosmos,
    Chain.BitcoinCash,
    Chain.Litecoin,
    Chain.Dash,
    Chain.Dogecoin,
  ],
  [WalletOption.LEDGER_LIVE]: [
    Chain.Bitcoin,
    Chain.Ethereum,
    Chain.THORChain,
    Chain.BinanceSmartChain,
    Chain.Cosmos,
    Chain.BitcoinCash,
    Chain.Litecoin,
    Chain.Dash,
    Chain.Dogecoin,
  ],
  [WalletOption.TREZOR]: [
    Chain.Bitcoin,
    Chain.Ethereum,
    Chain.BinanceSmartChain,
    Chain.BitcoinCash,
    Chain.Litecoin,
    Chain.Dogecoin,
  ],
  [WalletOption.WALLETCONNECT]: [
    Chain.Ethereum,
    Chain.BinanceSmartChain,
    Chain.Arbitrum,
    Chain.Optimism,
    Chain.Avalanche,
    Chain.Polygon,
  ],
  [WalletOption.COINBASE_WEB]: [Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.COINBASE_MOBILE]: [Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.TRUSTWALLET_WEB]: [Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.BITGET]: [Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.BRAVE]: [Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.CTRL]: [
    Chain.Bitcoin,
    Chain.Ethereum,
    Chain.THORChain,
    Chain.BinanceSmartChain,
    Chain.Cosmos,
  ],
  [WalletOption.EIP6963]: [Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.KEEPKEY]: [Chain.Bitcoin, Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.KEEPKEY_BEX]: [Chain.Bitcoin, Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.KEYSTORE]: [
    Chain.Bitcoin,
    Chain.Ethereum,
    Chain.THORChain,
    Chain.BinanceSmartChain,
    Chain.Cosmos,
  ],
  [WalletOption.LEAP]: [Chain.Cosmos, Chain.THORChain],
  [WalletOption.OKX]: [Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.OKX_MOBILE]: [Chain.Ethereum, Chain.BinanceSmartChain],
  [WalletOption.POLKADOT_JS]: [Chain.Polkadot],
  [WalletOption.RADIX_WALLET]: [Chain.Radix],
  [WalletOption.TALISMAN]: [Chain.Polkadot],
};

export const WalletConnect = () => {
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);
  const { loadingWallet, handleConnect } = useWalletConnect(selectedChains);

  return (
    <div className="grid grid-cols-2 divide-x">
      <div className="pr-2">
        <DropdownMenuLabel className="font-bold text-center">Select Chains</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {Object.entries(CHAIN_GROUPS).map(([groupName, chains]) => (
            <div key={groupName} className="px-2 py-1.5">
              <DropdownMenuLabel className="font-bold text-sm">{groupName}</DropdownMenuLabel>
              <div className="grid grid-cols-1 gap-1">
                {chains.map((chain) => {
                  const isSelected = selectedChains.includes(chain);
                  return (
                    <Button
                      key={chain}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setSelectedChains((prev) =>
                          isSelected ? prev.filter((c) => c !== chain) : [...prev, chain],
                        );
                      }}
                    >
                      <ChainIcon chain={chain} className="mr-2" />
                      <span className="truncate">{chain}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pl-2">
        <DropdownMenuLabel className="font-bold text-center">
          Select Wallet
          {selectedChains.length > 0 && (
            <div className="font-normal text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
              {selectedChains.map((chain) => (
                <span key={chain} className="inline-flex items-center">
                  <ChainIcon chain={chain} className="mr-1" />
                  {chain}
                </span>
              ))}
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {selectedChains.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Select chains to see compatible wallets
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {(() => {
              const supportedWallets = Object.entries(WALLET_GROUPS)
                .map(([groupName, wallets]) => {
                  const groupWallets = wallets.filter((wallet) => {
                    const supportedChains = WALLET_CHAIN_SUPPORT[wallet];
                    return selectedChains.every((chain) => supportedChains?.includes(chain));
                  });

                  if (groupWallets.length === 0) return null;

                  return (
                    <div key={groupName}>
                      <DropdownMenuLabel className="font-bold">{groupName}</DropdownMenuLabel>
                      {groupWallets.map((wallet) => (
                        <DropdownMenuItem
                          key={wallet}
                          onClick={() => handleConnect(wallet)}
                          disabled={loadingWallet !== null}
                          className="cursor-pointer pl-4"
                        >
                          <WalletIcon wallet={wallet} className="mr-2" />
                          <span className="flex-1">{wallet}</span>
                          {loadingWallet === wallet && (
                            <span className="text-xs text-muted-foreground">Connecting...</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>
                  );
                })
                .filter(Boolean);

              if (supportedWallets.length === 0) {
                return (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No wallets support this combination of chains. Please select different chains.
                  </div>
                );
              }

              return supportedWallets;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
