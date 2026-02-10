# $ALPHA Token Deployment Guide (XRPL)
> Step-by-step instructions to issue $ALPHA on XRP Ledger

---

## Overview

$ALPHA will be issued as an XRPL "Issued Currency" (fungible token).

**Token Details:**
- Currency Code: `ALPHA` (or `414C504841` in hex for >3 chars)
- Total Supply: 100,000,000
- Decimals: 6
- Chain: XRP Ledger (Mainnet)
- Test First: XRPL Testnet

---

## Wallet Architecture

```
┌─────────────────────────────────────────┐
│           COLD WALLET (Issuer)          │
│  • Issues all $ALPHA tokens             │
│  • Enable DefaultRipple                 │
│  • Secure offline storage               │
│  • NEVER used for daily operations      │
└─────────────────────────────────────────┘
              │
              ▼ Issues tokens to
┌─────────────────────────────────────────┐
│           HOT WALLET (Operations)       │
│  • Receives tokens from cold            │
│  • Distributes to users                 │
│  • Daily operations                     │
│  • RequireAuth enabled                  │
└─────────────────────────────────────────┘
              │
              ▼ Distributes to
┌─────────────────────────────────────────┐
│           TREASURY WALLET               │
│  • Holds community allocation           │
│  • Multisig (future)                    │
│  • DAO governed                         │
└─────────────────────────────────────────┘
```

---

## Step 1: Create Wallets

### Testnet (for testing)
```javascript
const xrpl = require('xrpl')

async function createWallets() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
  await client.connect()
  
  // Generate wallets
  const cold_wallet = xrpl.Wallet.generate()
  const hot_wallet = xrpl.Wallet.generate()
  const treasury_wallet = xrpl.Wallet.generate()
  
  // Fund on testnet
  await client.fundWallet(cold_wallet)
  await client.fundWallet(hot_wallet)
  await client.fundWallet(treasury_wallet)
  
  console.log('Cold Wallet:', cold_wallet.address)
  console.log('Hot Wallet:', hot_wallet.address)
  console.log('Treasury Wallet:', treasury_wallet.address)
  
  // SAVE THESE SECURELY!
  console.log('Cold Secret:', cold_wallet.seed)
  console.log('Hot Secret:', hot_wallet.seed)
  console.log('Treasury Secret:', treasury_wallet.seed)
  
  await client.disconnect()
}
```

---

## Step 2: Configure Cold Wallet (Issuer)

```javascript
const cold_settings_tx = {
  "TransactionType": "AccountSet",
  "Account": cold_wallet.address,
  "TransferRate": 0,  // No transfer fee initially
  "TickSize": 5,      // 5 decimal places for trading
  "Domain": "6167656E74616C7068612E78797A",  // "agentalpha.xyz" in hex
  "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple,  // REQUIRED!
  "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP |
            xrpl.AccountSetTfFlags.tfRequireDestTag)
}

// Submit and wait for validation
const cst_prepared = await client.autofill(cold_settings_tx)
const cst_signed = cold_wallet.sign(cst_prepared)
const cst_result = await client.submitAndWait(cst_signed.tx_blob)
```

---

## Step 3: Configure Hot Wallet

```javascript
const hot_settings_tx = {
  "TransactionType": "AccountSet",
  "Account": hot_wallet.address,
  "Domain": "6167656E74616C7068612E78797A",  // "agentalpha.xyz" in hex
  "SetFlag": xrpl.AccountSetAsfFlags.asfRequireAuth,  // Prevent accidental issuance
  "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP |
            xrpl.AccountSetTfFlags.tfRequireDestTag)
}

const hst_prepared = await client.autofill(hot_settings_tx)
const hst_signed = hot_wallet.sign(hst_prepared)
const hst_result = await client.submitAndWait(hst_signed.tx_blob)
```

---

## Step 4: Create Trust Lines

### Hot Wallet → Cold Wallet
```javascript
const currency_code = "ALPHA"

const trust_set_tx = {
  "TransactionType": "TrustSet",
  "Account": hot_wallet.address,
  "LimitAmount": {
    "currency": currency_code,
    "issuer": cold_wallet.address,
    "value": "100000000"  // 100M limit
  }
}

const ts_prepared = await client.autofill(trust_set_tx)
const ts_signed = hot_wallet.sign(ts_prepared)
const ts_result = await client.submitAndWait(ts_signed.tx_blob)
```

### Treasury Wallet → Cold Wallet
```javascript
const trust_set_treasury = {
  "TransactionType": "TrustSet",
  "Account": treasury_wallet.address,
  "LimitAmount": {
    "currency": currency_code,
    "issuer": cold_wallet.address,
    "value": "100000000"
  }
}

// Submit...
```

---

## Step 5: Issue Tokens

### To Hot Wallet (for distribution)
```javascript
const send_token_tx = {
  "TransactionType": "Payment",
  "Account": cold_wallet.address,
  "DeliverMax": {
    "currency": "ALPHA",
    "value": "55000000",  // 55M (Hot allocation: 35% + liquidity)
    "issuer": cold_wallet.address
  },
  "Destination": hot_wallet.address,
  "DestinationTag": 1
}

const pay_prepared = await client.autofill(send_token_tx)
const pay_signed = cold_wallet.sign(pay_prepared)
const pay_result = await client.submitAndWait(pay_signed.tx_blob)
```

### To Treasury Wallet
```javascript
const send_to_treasury = {
  "TransactionType": "Payment",
  "Account": cold_wallet.address,
  "DeliverMax": {
    "currency": "ALPHA",
    "value": "30000000",  // 30M Treasury
    "issuer": cold_wallet.address
  },
  "Destination": treasury_wallet.address,
  "DestinationTag": 1
}

// Submit...
```

---

## Step 6: Verify Balances

```javascript
// Check hot wallet balance
const hot_balances = await client.request({
  command: "account_lines",
  account: hot_wallet.address,
  ledger_index: "validated"
})
console.log(hot_balances.result)

// Check issuer's outstanding tokens
const cold_balances = await client.request({
  command: "gateway_balances",
  account: cold_wallet.address,
  ledger_index: "validated",
  hotwallet: [hot_wallet.address, treasury_wallet.address]
})
console.log(cold_balances.result)
```

---

## Distribution Plan

| Recipient | Amount | From Wallet |
|-----------|--------|-------------|
| Alex (Founder) | 12,000,000 | Hot |
| MC47 (Builder) | 8,000,000 | Hot |
| Early Agents | 20,000,000 | Hot |
| Liquidity (DEX) | 15,000,000 | Hot |
| Treasury | 30,000,000 | Treasury |
| Future | 15,000,000 | Cold (locked) |

---

## Security Checklist

- [ ] Cold wallet seed stored offline (paper/hardware)
- [ ] Hot wallet seed in secure environment
- [ ] Test all operations on Testnet first
- [ ] Verify all settings before mainnet deployment
- [ ] Keep XRP reserve in each wallet (minimum 10 XRP + 2 per trust line)

---

## XRPL Resources

- Testnet: `wss://s.altnet.rippletest.net:51233`
- Mainnet: `wss://xrplcluster.com/` or `wss://s1.ripple.com/`
- Explorer: https://livenet.xrpl.org
- Testnet Faucet: https://xrpl.org/xrp-testnet-faucet.html
- Docs: https://xrpl.org/docs

---

## Next Steps

1. [ ] Create testnet wallets
2. [ ] Configure settings
3. [ ] Issue test tokens
4. [ ] Test transfers between wallets
5. [ ] Verify everything works
6. [ ] Deploy to mainnet
7. [ ] Announce (after stealth period)

---

*CONFIDENTIAL - AgentAlpha*
