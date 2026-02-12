const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3002

// ── Security Headers Middleware ──────────────────────────────────
// Sets defense-in-depth HTTP headers on every response.
// Reference: OWASP Secure Headers Project, MDN HTTP Headers
app.use((req, res, next) => {
  // Content-Security-Policy: only allow own origin for scripts/styles/images
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://testnet.xrpl.org https://s.altnet.rippletest.net",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '))
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY')
  // Control referrer info leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Restrict browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  // Prevent opening new windows from having access to opener
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  // HTTPS enforcement (1 year, include subdomains)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})

// ── Rate Limiting (simple in-memory) ─────────────────────────────
const rateLimit = new Map()
const RATE_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_MAX = 60 // 60 requests per minute per IP

app.use('/api/', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateLimit.set(ip, { start: now, count: 1 })
    return next()
  }
  entry.count++
  if (entry.count > RATE_MAX) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' })
  }
  next()
})

// Clean up rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimit) {
    if (now - entry.start > RATE_WINDOW_MS) rateLimit.delete(ip)
  }
}, 5 * 60 * 1000)

app.use(express.static(path.join(__dirname, 'web')))
app.use(express.json({ limit: '10kb' })) // Limit body size to prevent abuse

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

// ── 404 handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Error handler (don't leak stack traces) ──────────────────────
app.use((err, req, res, _next) => {
  console.error('Server error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🎖️ AgentAlpha live on port ${PORT}`)
})
