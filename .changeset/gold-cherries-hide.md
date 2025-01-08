---
"@swapkit/tokens": major
"@swapkit/wallet-evm-extensions": minor
"@swapkit/wallet-keepkey-bex": minor
"@swapkit/wallet-polkadotjs": minor
"@swapkit/toolbox-cosmos": minor
"@swapkit/toolbox-solana": minor
"@swapkit/wallet-coinbase": minor
"@swapkit/wallet-keystore": minor
"@swapkit/wallet-talisman": minor
"@swapkit/helpers": minor
"@swapkit/wallet-keepkey": minor
"@swapkit/wallet-phantom": minor
"@swapkit/wizard": minor
"@swapkit/wallet-bitget": minor
"@swapkit/wallet-exodus": minor
"@swapkit/wallet-ledger": minor
"@swapkit/wallet-trezor": minor
"@swapkit/toolbox-evm": minor
"@swapkit/wallet-keplr": minor
"@swapkit/wallet-radix": minor
"@swapkit/wallet-ctrl": minor
"@swapkit/api": minor
"@swapkit/wallet-okx": minor
"@swapkit/wallet-wc": minor
---

Breaking Change in @swapkit/tokens:

**What:**

- Moved the tokenlists exports from into a new subobject `tokenLists` within the same module
- added getTokenIcon that returns the Icon url for a given identifier

**How to adept code:**
Use new way of importing the lists

```

import {tokenLists, getTokenIcon} from '@swapkit/tokens'

```

Other packages just got some typing updates - no code changes needed
