const xrpl = require('xrpl')
const fs = require('fs')
const path = require('path')

// XRPL requires hex encoding for currency codes >3 chars
// "ALPHA" = 414C504841 padded to 40 hex chars
const CURRENCY_CODE = "414C504841000000000000000000000000000000"
const TOTAL_SUPPLY = "100000000"

async function deploy() {
  console.log("🎖️ AgentAlpha Token Deployment - XRPL Testnet")
  console.log("=" .repeat(50))
  
  // Connect to XRPL Testnet
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
  console.log("\n[1/7] Connecting to XRPL Testnet...")
  await client.connect()
  console.log("  ✅ Connected")
  
  // Generate wallets
  console.log("\n[2/7] Generating wallets...")
  const cold_wallet = xrpl.Wallet.generate()
  const hot_wallet = xrpl.Wallet.generate()
  const treasury_wallet = xrpl.Wallet.generate()
  
  // Fund wallets on testnet
  console.log("  Funding cold wallet...")
  await client.fundWallet(cold_wallet)
  console.log("  Funding hot wallet...")
  await client.fundWallet(hot_wallet)
  console.log("  Funding treasury wallet...")
  await client.fundWallet(treasury_wallet)
  console.log("  ✅ All wallets funded")
  
  // Save wallet info
  const walletInfo = {
    network: "testnet",
    currency: CURRENCY_CODE,
    total_supply: TOTAL_SUPPLY,
    deployed_at: new Date().toISOString(),
    cold_wallet: {
      address: cold_wallet.address,
      seed: cold_wallet.seed,
      role: "Token Issuer"
    },
    hot_wallet: {
      address: hot_wallet.address,
      seed: hot_wallet.seed,
      role: "Operations / Distribution"
    },
    treasury_wallet: {
      address: treasury_wallet.address,
      seed: treasury_wallet.seed,
      role: "Community Treasury"
    }
  }
  
  const walletPath = path.join(__dirname, '..', '.wallets-testnet.json')
  fs.writeFileSync(walletPath, JSON.stringify(walletInfo, null, 2))
  console.log(`  💾 Wallet info saved to .wallets-testnet.json`)
  
  // Configure cold wallet (issuer)
  console.log("\n[3/7] Configuring cold wallet (issuer)...")
  const cold_settings_tx = {
    "TransactionType": "AccountSet",
    "Account": cold_wallet.address,
    "TransferRate": 0,
    "TickSize": 5,
    "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple,
    "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP |
              xrpl.AccountSetTfFlags.tfRequireDestTag)
  }
  
  const cst_prepared = await client.autofill(cold_settings_tx)
  const cst_signed = cold_wallet.sign(cst_prepared)
  const cst_result = await client.submitAndWait(cst_signed.tx_blob)
  
  if (cst_result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log("  ✅ Cold wallet configured (DefaultRipple enabled)")
  } else {
    throw `Cold wallet config failed: ${cst_result.result.meta.TransactionResult}`
  }
  
  // Configure hot wallet
  console.log("\n[4/7] Configuring hot wallet...")
  const hot_settings_tx = {
    "TransactionType": "AccountSet",
    "Account": hot_wallet.address,
    "Flags": xrpl.AccountSetTfFlags.tfDisallowXRP
  }
  
  const hst_prepared = await client.autofill(hot_settings_tx)
  const hst_signed = hot_wallet.sign(hst_prepared)
  const hst_result = await client.submitAndWait(hst_signed.tx_blob)
  
  if (hst_result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log("  ✅ Hot wallet configured")
  } else {
    throw `Hot wallet config failed: ${hst_result.result.meta.TransactionResult}`
  }
  
  // Create trust lines
  console.log("\n[5/7] Creating trust lines...")
  
  // Hot wallet trusts cold wallet
  const trust_hot = {
    "TransactionType": "TrustSet",
    "Account": hot_wallet.address,
    "LimitAmount": {
      "currency": CURRENCY_CODE,
      "issuer": cold_wallet.address,
      "value": TOTAL_SUPPLY
    }
  }
  
  const th_prepared = await client.autofill(trust_hot)
  const th_signed = hot_wallet.sign(th_prepared)
  const th_result = await client.submitAndWait(th_signed.tx_blob)
  
  if (th_result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log("  ✅ Hot wallet trust line created")
  } else {
    throw `Hot trust line failed: ${th_result.result.meta.TransactionResult}`
  }
  
  // Treasury wallet trusts cold wallet
  const trust_treasury = {
    "TransactionType": "TrustSet",
    "Account": treasury_wallet.address,
    "LimitAmount": {
      "currency": CURRENCY_CODE,
      "issuer": cold_wallet.address,
      "value": TOTAL_SUPPLY
    }
  }
  
  const tt_prepared = await client.autofill(trust_treasury)
  const tt_signed = treasury_wallet.sign(tt_prepared)
  const tt_result = await client.submitAndWait(tt_signed.tx_blob)
  
  if (tt_result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log("  ✅ Treasury wallet trust line created")
  } else {
    throw `Treasury trust line failed: ${tt_result.result.meta.TransactionResult}`
  }
  
  // Issue tokens to hot wallet
  console.log("\n[6/7] Issuing $ALPHA tokens...")
  
  // 55M to hot wallet (founder 12M + builder 8M + early agents 20M + liquidity 15M)
  const hot_amount = "55000000"
  const issue_to_hot = {
    "TransactionType": "Payment",
    "Account": cold_wallet.address,
    "DeliverMax": {
      "currency": CURRENCY_CODE,
      "value": hot_amount,
      "issuer": cold_wallet.address
    },
    "Destination": hot_wallet.address,
    "DestinationTag": 1
  }
  
  const ih_prepared = await client.autofill(issue_to_hot)
  const ih_signed = cold_wallet.sign(ih_prepared)
  const ih_result = await client.submitAndWait(ih_signed.tx_blob)
  
  if (ih_result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`  ✅ Issued ${hot_amount} $ALPHA to hot wallet`)
  } else {
    throw `Issue to hot failed: ${ih_result.result.meta.TransactionResult}`
  }
  
  // 30M to treasury
  const treasury_amount = "30000000"
  const issue_to_treasury = {
    "TransactionType": "Payment",
    "Account": cold_wallet.address,
    "DeliverMax": {
      "currency": CURRENCY_CODE,
      "value": treasury_amount,
      "issuer": cold_wallet.address
    },
    "Destination": treasury_wallet.address,
    "DestinationTag": 1
  }
  
  const it_prepared = await client.autofill(issue_to_treasury)
  const it_signed = cold_wallet.sign(it_prepared)
  const it_result = await client.submitAndWait(it_signed.tx_blob)
  
  if (it_result.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`  ✅ Issued ${treasury_amount} $ALPHA to treasury`)
  } else {
    throw `Issue to treasury failed: ${it_result.result.meta.TransactionResult}`
  }
  
  // Verify balances
  console.log("\n[7/7] Verifying balances...")
  
  const cold_balances = await client.request({
    command: "gateway_balances",
    account: cold_wallet.address,
    ledger_index: "validated",
    hotwallet: [hot_wallet.address, treasury_wallet.address]
  })
  
  console.log("\n" + "=".repeat(50))
  console.log("🎖️ $ALPHA TOKEN DEPLOYED SUCCESSFULLY!")
  console.log("=".repeat(50))
  console.log(`\n  Token: $ALPHA`)
  console.log(`  Network: XRPL Testnet`)
  console.log(`  Total Issued: ${parseInt(hot_amount) + parseInt(treasury_amount)} / ${TOTAL_SUPPLY}`)
  console.log(`  Remaining (cold): ${parseInt(TOTAL_SUPPLY) - parseInt(hot_amount) - parseInt(treasury_amount)}`)
  console.log(`\n  Cold (Issuer):   ${cold_wallet.address}`)
  console.log(`  Hot (Ops):       ${hot_wallet.address}`)
  console.log(`  Treasury:        ${treasury_wallet.address}`)
  console.log(`\n  Explorer: https://testnet.xrpl.org/accounts/${cold_wallet.address}`)
  console.log(`\n  Balances:`)
  console.log(JSON.stringify(cold_balances.result, null, 2))
  console.log("\n" + "=".repeat(50))
  console.log("  AgentAlpha — By Agents, For Agents 🤖")
  console.log("=".repeat(50))
  
  await client.disconnect()
}

deploy().catch(err => {
  console.error("❌ Deployment failed:", err)
  process.exit(1)
})
