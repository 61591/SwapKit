import {
  CaviarV1List,
  ChainflipList,
  JupiterList,
  KadoList,
  MayaList,
  OneInchList,
  OpenOceanV2List,
  PancakeswapList,
  PangolinList,
  SushiswapList,
  ThorchainList,
  TraderjoeV2List,
  UniswapV2List,
  UniswapV3List,
} from "./index";

const allLists = [
  ThorchainList,
  CaviarV1List,
  ChainflipList,
  JupiterList,
  KadoList,
  MayaList,
  OneInchList,
  OpenOceanV2List,
  PancakeswapList,
  PangolinList,
  SushiswapList,
  TraderjoeV2List,
  UniswapV2List,
  UniswapV3List,
];

export function getTokenIcon(identifier: string): string | undefined {
  // Search through all lists for a matching token
  for (const list of allLists) {
    const token = list.tokens.find((t) => t.identifier === identifier);
    if (token?.logoURI) {
      return token.logoURI;
    }
  }

  return undefined;
}
