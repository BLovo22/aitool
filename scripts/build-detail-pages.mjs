/**
 * Build Script — Generate individual tool detail pages for SEO
 *
 * Run: node scripts/build-detail-pages.mjs
 *
 * Creates tools/[slug].html for each tool with proper SEO meta tags.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TOOLS_DIR = resolve(ROOT, "tools");
const DATA_FILE = resolve(ROOT, "js", "data.js");

// Parse tools from data.js
const dataContent = readFileSync(DATA_FILE, "utf8");
const toolsMatch = dataContent.match(/const TOOLS = (\[[\s\S]*?\n\]);/);
if (!toolsMatch) { console.error("Could not parse tools"); process.exit(1); }

// Extract each tool using a more careful approach
const tools = [];
const toolRegex = /\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*description:\s*"((?:[^"\\]|\\.)*)",[\s\S]*?url:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)",[\s\S]*?pricing:\s*"([^"]+)",/g;
let m;
while ((m = toolRegex.exec(toolsMatch[1])) !== null) {
  tools.push({
    id: parseInt(m[1]),
    name: m[2],
    slug: m[3],
    description: m[4].replace(/\\"/g, '"'),
    url: m[5],
    category: m[6],
    pricing: m[7]
  });
}

console.log(`Found ${tools.length} tools to generate pages for.\n`);

// Create tools directory
if (!existsSync(TOOLS_DIR)) mkdirSync(TOOLS_DIR, { recursive: true });

// Template for each detail page
function generatePage(tool) {
  const catIcons = {
    chat: "💬", writing: "✍️", image: "🎨", video: "🎬",
    coding: "💻", audio: "🎵", design: "🎯", marketing: "📢",
    productivity: "⚡", research: "🔬"
  };
  const icon = catIcons[tool.category] || "🛠️";
  const title = `${tool.name} — AI ${tool.category.charAt(0).toUpperCase() + tool.category.slice(1)} Tool | AIToolKit`;
  const desc = tool.description.length > 160 ? tool.description.slice(0, 157) + "..." : tool.description;

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${desc}" />
  <meta name="keywords" content="${tool.name}, AI ${tool.category} tool, ${tool.pricing}, best AI tools" />

  <meta property="og:title" content="${tool.name} — ${tool.pricing === 'free' ? 'Free' : tool.pricing.charAt(0).toUpperCase() + tool.pricing.slice(1)} AI ${tool.category.charAt(0).toUpperCase() + tool.category.slice(1)} Tool" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://aitoolkit.io/tools/${tool.slug}" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${tool.name} — AI Tool Review" />
  <meta name="twitter:description" content="${desc}" />

  <link rel="canonical" href="https://aitoolkit.io/tools/${tool.slug}" />

  <title>${title}</title>

  <link rel="stylesheet" href="../css/style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

  <!-- AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX" crossorigin="anonymous"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');</script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${tool.name}",
    "description": "${desc}",
    "url": "${tool.url}",
    "applicationCategory": "${tool.category}",
    "offers": { "@type": "Offer", "price": "${tool.pricing === 'free' ? '0' : '0'}", "priceCurrency": "USD" }
  }
  </script>
</head>
<body>

  <header class="header">
    <div class="container header-inner">
      <a href="../" class="logo"><div class="logo-icon">⚡</div>AI<span class="logo-accent">ToolKit</span></a>
      <button id="themeToggle" class="theme-toggle" onclick="var t=document.documentElement;var d=t.getAttribute('data-theme')==='dark'?'light':'dark';t.setAttribute('data-theme',d);localStorage.setItem('aitoolkit_theme',d);this.textContent=d==='dark'?'☀️':'🌙';" aria-label="Toggle dark mode">🌙</button>
    </div>
  </header>

  <main class="container" style="padding-top:40px;padding-bottom:60px;max-width:800px;">
    <nav style="margin-bottom:24px;font-size:0.85rem;color:var(--text-muted);">
      <a href="../" style="color:var(--accent);">← Back to all tools</a>
    </nav>

    <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:20px;">
      <div style="width:64px;height:64px;border-radius:12px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;">${icon}</div>
      <div>
        <h1 style="font-size:2rem;font-weight:800;letter-spacing:-1px;margin-bottom:4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          ${tool.name}
          <span class="tool-pricing ${tool.pricing}">${tool.pricing}</span>
        </h1>
        <a href="${tool.url}" target="_blank" rel="noopener" style="color:var(--accent);font-size:0.9rem;">${tool.url.replace('https://','')} ↗</a>
      </div>
    </div>

    <p style="font-size:1.1rem;color:var(--text-secondary);line-height:1.8;margin-bottom:24px;">
      ${tool.description}
    </p>

    <a href="${tool.url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:var(--accent);color:white;border-radius:12px;font-weight:600;font-size:1rem;text-decoration:none;transition:all .2s;">
      Visit ${tool.name} ↗
    </a>

    <!-- Ad Unit -->
    <div class="ad-unit" style="margin:32px 0;">
      <div><span class="ad-unit-label">ADVERTISEMENT</span><p>Google AdSense</p></div>
    </div>

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--border);">
      <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:12px;">🔀 Explore Similar Tools</h3>
      <p style="color:var(--text-muted);margin-bottom:12px;">
        <a href="../" style="color:var(--accent);">Browse all ${tools.length}+ AI tools</a> or search by category.
      </p>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-links">
        <a href="../">Home</a>
        <a href="../#filters">Browse Tools</a>
        <a href="#">Privacy Policy</a>
      </div>
      <p>© 2026 AIToolKit. All rights reserved.</p>
    </div>
  </footer>

</body>
</html>`;
}

// Generate pages
let generated = 0;
tools.forEach((tool) => {
  const filePath = resolve(TOOLS_DIR, `${tool.slug}.html`);
  const html = generatePage(tool);
  writeFileSync(filePath, html, "utf8");
  generated++;
  console.log(`  ✅ ${tool.slug}.html`);
});

console.log(`\n✨ Generated ${generated} detail pages in tools/`);
console.log("   Each page has unique SEO meta tags for Google indexing.");
