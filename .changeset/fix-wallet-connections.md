---
"@swapkit/wallets": patch
---

Fix wallet connection issues

- Fixed Bitget Solana connection by creating proper signer object with `getAddress()` method and using `publicKey.toBase58()` for address formatting
- Fixed Bitget Tron connection by adding proper response code validation before accessing accounts
- Fixed OKX Cosmos connection by adding defensive checks for empty accounts array
- Fixed Tronlink connection and ready state detection
- Fixed Walletconnect SignClient creation
