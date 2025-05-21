import { Chain } from "@swapkit/helpers";
import { getTronWeb } from "../helpers";
import type { TronToolboxParams } from "../types";
import { TronToolbox } from "./tron";

export async function getTronToolbox(params?: TronToolboxParams) {
  const toolboxParams = {
    ...params,
    tronWeb: params?.tronWeb || (await getTronWeb()),
  };

  return TronToolbox(toolboxParams);
}

export * from "./baseTronToolbox";
export * from "./tron";
