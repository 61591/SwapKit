import { list as CaviarV1List } from "./tokenLists/caviar_v1";
import { list as ChainflipList } from "./tokenLists/chainflip";
import { list as JupiterList } from "./tokenLists/jupiter";
import { list as KadoList } from "./tokenLists/kado";
import { list as MayaList } from "./tokenLists/mayachain";
// export { list as OciswapV1List } from "./tokenLists/ociswap_v1";
import { list as OneInchList } from "./tokenLists/oneinch";
import { list as OpenOceanV2List } from "./tokenLists/openocean_v2";
import { list as PancakeswapList } from "./tokenLists/pancakeswap";
import { list as PangolinList } from "./tokenLists/pangolin_v1";
import { list as SushiswapList } from "./tokenLists/sushiswap_v2";
import { list as ThorchainList } from "./tokenLists/thorchain";
import { list as TraderjoeV2List } from "./tokenLists/traderjoe_v2";
import { list as UniswapV2List } from "./tokenLists/uniswap_v2";
import { list as UniswapV3List } from "./tokenLists/uniswap_v3";

export const tokenLists: {
  CaviarV1List: typeof CaviarV1List;
  ChainflipList: typeof ChainflipList;
  JupiterList: typeof JupiterList;
  KadoList: typeof KadoList;
  MayaList: typeof MayaList;
  // OciswapV1List: typeof OciswapV1List
  OneInchList: typeof OneInchList;
  OpenOceanV2List: typeof OpenOceanV2List;
  PancakeswapList: typeof PancakeswapList;
  PangolinList: typeof PangolinList;
  SushiswapList: typeof SushiswapList;
  ThorchainList: typeof ThorchainList;
  TraderjoeV2List: typeof TraderjoeV2List;
  UniswapV2List: typeof UniswapV2List;
  UniswapV3List: typeof UniswapV3List;
} = {
  CaviarV1List,
  ChainflipList,
  JupiterList,
  KadoList,
  MayaList,
  // OciswapV1List,
  OneInchList,
  OpenOceanV2List,
  PancakeswapList,
  PangolinList,
  SushiswapList,
  ThorchainList,
  TraderjoeV2List,
  UniswapV2List,
  UniswapV3List,
};

export * from "./helpers";
