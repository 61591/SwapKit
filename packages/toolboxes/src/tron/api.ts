import { SKConfig, warnOnce } from "@swapkit/helpers";
import { Chain } from "@swapkit/helpers";
import { getBalance } from "../utils";

export function getTronApi() {
  const customTronApi = SKConfig.get("apis")[Chain.Tron];

  if (customTronApi) {
    warnOnce(true, "Using custom TRON API. Be sure to implement all methods to avoid issues.");
    return customTronApi as ReturnType<typeof tronApi>;
  }

  return tronApi();
}

export function createCustomTronApi(methods: ReturnType<typeof getTronApi>) {
  return methods;
}

function tronApi() {
  return { getBalance: getBalance(Chain.Tron) };
}
