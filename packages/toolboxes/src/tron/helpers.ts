import {
  AssetValue,
  BaseDecimal,
  Chain,
  ChainToExplorerUrl,
  type NetworkParams,
  SKConfig,
  SwapKitNumber,
  FeeOption,
} from "@swapkit/helpers";

export async function getTronWeb(customUrl?: string): Promise<any> {
  const TronWeb = (await import("tronweb")).default;
  
  const fullHost = customUrl || SKConfig.get("rpcUrls")[Chain.Tron] || "https://api.trongrid.io";
  
  return new TronWeb({
    fullHost,
    headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  });
}

export function validateTronAddress(address: string): boolean {
  try {
    // TRON addresses are base58 encoded and start with 'T'
    if (!address || !address.startsWith('T') || address.length !== 34) {
      return false;
    }
    // Additional validation could be added here using TronWeb's isAddress
    return true;
  } catch (error) {
    return false;
  }
}

export function toSun(trx: string | number): string {
  // Convert TRX to SUN (1 TRX = 1,000,000 SUN)
  return SwapKitNumber.fromString(trx.toString()).mul(1_000_000).getValue("string");
}

export function fromSun(sun: string | number): string {
  // Convert SUN to TRX
  return SwapKitNumber.fromString(sun.toString()).div(1_000_000).getValue("string");
}

export function getNetworkParams() {
  return (): NetworkParams => ({
    chainName: "TRON Mainnet",
    chainId: "0x2b6653dc", // TRON mainnet chain ID
    rpcUrls: [SKConfig.get("rpcUrls")[Chain.Tron] || "https://api.trongrid.io"],
    blockExplorerUrls: [ChainToExplorerUrl[Chain.Tron]],
    nativeCurrency: {
      name: "TRON",
      symbol: "TRX",
      decimals: BaseDecimal[Chain.Tron],
    },
  });
}

export function getTRC20ContractAddress(asset: any): string | null {
  try {
    const { chain, symbol, ticker } = asset;
    
    if (chain === Chain.Tron && symbol === "TRX" && ticker === "TRX") {
      return null; // Native TRX doesn't have a contract address
    }
    
    // For TRC20 tokens, extract contract address from symbol
    // Format: TRX.USDT-TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
    if (symbol.includes('-')) {
      return symbol.split('-')[1];
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
