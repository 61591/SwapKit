import { Chain, SKConfig } from "@swapkit/helpers";
import { P, match } from "ts-pattern";
import { getTronApi } from "../api";
import { getTronWeb, getNetworkParams } from "../helpers";
import type { TronToolboxParams } from "../types";
import { BaseTronToolbox } from "./baseTronToolbox";

export async function TronToolbox(params: TronToolboxParams = {}) {
  const { tronWeb: tronWebParam, ...toolboxSignerParams } = params;
  
  const rpcUrl = SKConfig.get("rpcUrls")[Chain.Tron];
  const tronWeb = tronWebParam || (await getTronWeb(rpcUrl));

  const signer = match(toolboxSignerParams)
    .with({ phrase: P.string }, ({ phrase }) => {
      // Create signer from mnemonic
      const account = tronWeb.utils.accounts.generateAccountWithMnemonic(phrase);
      tronWeb.setPrivateKey(account.privateKey);
      return {
        getAddress: () => account.address,
        signMessage: (message: string) => tronWeb.trx.sign(message),
      };
    })
    .with({ privateKey: P.string }, ({ privateKey }) => {
      tronWeb.setPrivateKey(privateKey);
      const address = tronWeb.address.fromPrivateKey(privateKey);
      return {
        getAddress: () => address,
        signMessage: (message: string) => tronWeb.trx.sign(message),
      };
    })
    .with({ signer: P.any }, ({ signer }) => signer)
    .otherwise(() => undefined);

  const tronToolbox = BaseTronToolbox({ tronWeb, signer });

  return {
    ...tronToolbox,
    getNetworkParams: getNetworkParams(),
    getBalance: getTronApi().getBalance,
  };
}
