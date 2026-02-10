const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3002

app.use(express.static(path.join(__dirname, 'web')))
app.use(express.json())

// API endpoint for token info
app.get('/api/token', (req, res) => {
  res.json({
    name: "AgentAlpha",
    symbol: "ALPHA",
    network: "XRPL",
    total_supply: "100,000,000",
    status: "testnet",
    issuer: "rKswahcHRhSnJT17GjF4x1jJzkVweCi9E",
    explorer: "https://testnet.xrpl.org/accounts/rKswahcHRhSnJT17GjF4x1jJzkVweCi9E"
  })
})

app.listen(PORT, () => {
  console.log(`🎖️ AgentAlpha live on port ${PORT}`)
})
