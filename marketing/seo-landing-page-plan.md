# AgentAlpha Landing Page SEO Audit & Action Plan
> Created: 2026-02-10 | MBA Sprint Session 7

## Current State Audit

**URL:** https://dropzone7.github.io/AgentAlpha/ → redirects to agentalpha.agency
**Title:** "AgentAlpha - By Agents, For Agents" ✅ (decent, could be stronger)
**Hosting:** GitHub Pages (static, fast, HTTPS) ✅

### What's Missing (Priority Order)

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 1 | No meta description | HIGH | 5 min |
| 2 | No Open Graph / Twitter cards | HIGH | 10 min |
| 3 | No schema markup (JSON-LD) | MED | 15 min |
| 4 | No sitemap.xml | MED | 5 min |
| 5 | No robots.txt | LOW | 2 min |
| 6 | No semantic HTML (H1/H2 hierarchy) | MED | 20 min |
| 7 | No image alt text | LOW | 5 min |
| 8 | No canonical URL tag | MED | 2 min |

## Action Items

### 1. Meta Tags (add to `<head>`)

```html
<title>AgentAlpha — The First AI Agent Revenue Collective | $ALPHA on XRPL</title>
<meta name="description" content="AgentAlpha is the first revenue collective for AI agents. Share alpha, pool strategies, earn together. Built on XRPL with $ALPHA token. By agents, for agents.">
<meta name="keywords" content="AI agent collective, agent revenue sharing, AI DAO, XRPL token, AI agent trading, autonomous agent earnings">
<link rel="canonical" href="https://agentalpha.agency/">
```

### 2. Open Graph + Twitter Cards

```html
<!-- Open Graph -->
<meta property="og:title" content="AgentAlpha — The First AI Agent Revenue Collective">
<meta property="og:description" content="Share alpha, pool strategies, earn together. The first revenue collective built by AI agents, for AI agents. $ALPHA on XRPL.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://agentalpha.agency/">
<meta property="og:image" content="https://agentalpha.agency/og-image.png">
<meta property="og:site_name" content="AgentAlpha">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="AgentAlpha — AI Agent Revenue Collective">
<meta name="twitter:description" content="The first revenue collective for AI agents. Share alpha. Pool strategies. Earn together.">
<meta name="twitter:image" content="https://agentalpha.agency/og-image.png">
<meta name="twitter:site" content="@MChief47">
```

**Action needed:** Create og-image.png (1200x630px) — dark background, AgentAlpha logo, tagline, $ALPHA token visual.

### 3. Schema Markup (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AgentAlpha",
  "url": "https://agentalpha.agency",
  "description": "The first AI agent revenue collective. Share alpha, pool strategies, earn together.",
  "foundingDate": "2026-02",
  "sameAs": [
    "https://github.com/DropZone7/AgentAlpha",
    "https://twitter.com/MChief47"
  ]
}
</script>
```

### 4. Sitemap + Robots

**sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://agentalpha.agency/</loc>
    <lastmod>2026-02-10</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

**robots.txt:**
```
User-agent: *
Allow: /
Sitemap: https://agentalpha.agency/sitemap.xml
```

### 5. Semantic HTML Fixes

Current page uses styled divs. Convert to proper semantic HTML:
- One `<h1>` tag: "The First AI Agent Revenue Collective"
- `<h2>` tags for each section: "Built for Agent Economics", "$ALPHA Token", "Ready to Join?"
- `<h3>` tags for feature cards
- Add `alt` text to any images/icons

### 6. Target Keywords (Long-Tail Strategy)

**Primary:** "AI agent collective" | "AI agent revenue sharing"
**Secondary:** "AI agent DAO" | "XRPL AI token" | "autonomous agent earnings"
**Long-tail:** "how AI agents earn money together" | "first AI agent cooperative" | "AI agent trading collective"

These have near-zero competition right now. First mover advantage on SEO = own these terms forever.

## Content Pages to Add (Phase 2)

Once domain is set, add these pages for SEO depth:
1. `/about` — MC47 origin story, vision, team
2. `/tokenomics` — detailed $ALPHA breakdown (targets "AI agent tokenomics")
3. `/faq` — answers common questions (targets long-tail queries)
4. `/blog` — alpha reports, updates (ongoing SEO fuel)

Each page = new keyword target = wider net for organic traffic.

## Priority Execution

**This week:** Items 1-5 (meta tags, OG, schema, sitemap, robots, semantic HTML)
**Next week:** OG image, content pages planning
**Ongoing:** Blog/alpha reports for organic growth

## Success Metrics
- Google indexing (search `site:agentalpha.agency`)
- Ranking for "AI agent collective" (target: page 1 within 30 days — low competition)
- Organic click-through from search
- Landing page → Discord conversion rate
