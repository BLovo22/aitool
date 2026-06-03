/**
 * AI ToolKit — Data Update Script v2
 *
 * Run: node scripts/update-manual.mjs
 *
 * Auto-updates js/data.js with new tools from the watchlist.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, "..", "js", "data.js");

// Watchlist — add candidate tools here for auto-inclusion
const WATCHLIST = [
  {
    name: "Veo 3", slug: "veo-3",
    url: "https://deepmind.google/technologies/veo/",
    affiliate: "", category: "video", pricing: "paid",
    badge: "trending",
    tags: ["video generation", "google", "professional"],
    scenarios: ["creators", "filmmaking", "marketing"],
    alternatives: ["sora", "runway", "kling-ai"],
    description: "Google DeepMind's latest video generation model. Competes directly with Sora and Runway with high-quality, coherent video output."
  },
  {
    name: "Lovable", slug: "lovable",
    url: "https://lovable.dev",
    affiliate: "", category: "coding", pricing: "freemium",
    badge: "trending",
    tags: ["app builder", "fullstack", "no-code", "deploy"],
    scenarios: ["developers", "business", "creators"],
    alternatives: ["bolt-new", "replit-agent", "v0"],
    description: "AI-powered full-stack app builder. Describe your app idea and Lovable generates a complete, deployable web application with beautiful design."
  },
  {
    name: "v0 by Vercel", slug: "v0",
    url: "https://v0.dev",
    affiliate: "", category: "coding", pricing: "freemium",
    badge: "hot",
    tags: ["UI generation", "React", "frontend", "design-to-code"],
    scenarios: ["developers", "designers"],
    alternatives: ["bolt-new", "lovable", "cursor"],
    description: "Vercel's AI UI generator. Describe a UI component and v0 generates production-ready React/Tailwind code. Widely used by frontend developers."
  },
  {
    name: "Replit Agent", slug: "replit-agent",
    url: "https://replit.com",
    affiliate: "", category: "coding", pricing: "freemium",
    badge: "",
    tags: ["online IDE", "AI agent", "deploy", "fullstack"],
    scenarios: ["developers", "students"],
    alternatives: ["bolt-new", "lovable", "cursor"],
    description: "Replit's AI agent that builds and deploys full applications from natural language. Online IDE with autonomous coding capabilities."
  },
  {
    name: "HeyGen", slug: "heygen",
    url: "https://heygen.com",
    affiliate: "", category: "video", pricing: "paid",
    badge: "",
    tags: ["AI avatars", "video translation", "lip sync", "enterprise"],
    scenarios: ["business", "marketing", "creators"],
    alternatives: ["synthesia", "descript"],
    description: "AI video platform for creating talking avatars and translating videos into 40+ languages with lip-sync. Popular for corporate training and personalized video outreach."
  },
  {
    name: "Descript", slug: "descript",
    url: "https://descript.com",
    affiliate: "", category: "audio", pricing: "freemium",
    badge: "",
    tags: ["video editing", "transcription", "voice cloning", "podcast"],
    scenarios: ["creators", "marketing", "business"],
    alternatives: ["elevenlabs", "synthesia", "heygen"],
    description: "AI-powered video and audio editor. Edit media by editing text — delete words from the transcript and they disappear from the video. Voice cloning and podcast tools built in."
  },
  {
    name: "NotebookLM", slug: "notebooklm",
    url: "https://notebooklm.google.com",
    affiliate: "", category: "research", pricing: "free",
    badge: "hot",
    tags: ["research", "notes", "podcast", "google", "summarization"],
    scenarios: ["students", "research", "business"],
    alternatives: ["perplexity", "chatgpt", "claude"],
    description: "Google's AI research assistant. Upload documents and it generates summaries, FAQs, study guides, and even AI-hosted podcast discussions about your content. Free and powerful."
  },
  {
    name: "Recraft", slug: "recraft",
    url: "https://recraft.ai",
    affiliate: "", category: "image", pricing: "freemium",
    badge: "trending",
    tags: ["image generation", "vector", "brand", "design system"],
    scenarios: ["designers", "marketing", "business"],
    alternatives: ["midjourney", "adobe-firefly", "canva-ai", "ideogram"],
    description: "AI design tool focused on brand-consistent image generation. Create logos, illustrations, and marketing assets that match your brand style. Supports raster and vector output."
  },
  {
    name: "Hailuo AI", slug: "hailuo-ai",
    url: "https://hailuoai.video",
    affiliate: "", category: "video", pricing: "freemium",
    badge: "",
    tags: ["video generation", "text-to-video", "fast"],
    scenarios: ["creators", "social media", "marketing"],
    alternatives: ["runway", "pika", "kling-ai", "sora"],
    description: "Fast, high-quality AI video generator from MiniMax. Known for quick generation times and competitive output quality in the crowded AI video space."
  },
  {
    name: "Murf AI", slug: "murf-ai",
    url: "https://murf.ai",
    affiliate: "", category: "audio", pricing: "freemium",
    badge: "",
    tags: ["text-to-speech", "voiceover", "video voiceover", "multilingual"],
    scenarios: ["creators", "marketing", "education"],
    alternatives: ["elevenlabs", "descript"],
    description: "AI voiceover studio with 120+ realistic voices in 20+ languages. Sync voiceovers with video, adjust pitch and speed. Popular among content creators and e-learning professionals."
  },
  {
    name: "Stable Diffusion 3.5", slug: "stable-diffusion",
    url: "https://stability.ai",
    affiliate: "", category: "image", pricing: "free",
    badge: "",
    tags: ["image generation", "open source", "local", "customizable"],
    scenarios: ["designers", "developers", "creators"],
    alternatives: ["midjourney", "dall-e-3", "adobe-firefly"],
    description: "Stability AI's latest open-weight image model. Run locally on consumer hardware with full control. Massive community of fine-tuned models and LoRAs for any style."
  },
  {
    name: "Durable", slug: "durable",
    url: "https://durable.co",
    affiliate: "", category: "productivity", pricing: "paid",
    badge: "",
    tags: ["website builder", "small business", "AI website", "marketing"],
    scenarios: ["business", "marketing"],
    alternatives: ["gamma", "bolt-new"],
    description: "AI website builder for small businesses. Generate a complete business website with copy, images, and forms in 30 seconds. Includes CRM and invoicing tools."
  }
];

function parseExistingTools(content) {
  const match = content.match(/const TOOLS = (\[[\s\S]*?\n\]);/);
  if (!match) return { tools: [], maxId: 0 };
  const tools = [];
  const toolRegex = /\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)"/g;
  let m;
  while ((m = toolRegex.exec(match[1])) !== null) {
    tools.push({ id: parseInt(m[1]), name: m[2] });
  }
  const maxId = tools.length > 0 ? Math.max(...tools.map((t) => t.id)) : 0;
  return { tools, maxId };
}

function findNewTools(existingNames, watchlist) {
  return watchlist.filter(
    (tool) => !existingNames.some((n) => n.toLowerCase() === tool.name.toLowerCase())
  );
}

function generateToolEntry(tool, id) {
  const slug = tool.slug;
  const badge = tool.badge || "";
  const scenarios = tool.scenarios || [];
  const alternatives = tool.alternatives || [];
  const affiliate = tool.affiliate || "";
  const tagsStr = tool.tags.map((t) => `"${t}"`).join(", ");
  const scenariosStr = scenarios.map((s) => `"${s}"`).join(", ");
  const altStr = alternatives.map((a) => `"${a}"`).join(", ");
  return `  {
    id: ${id},
    name: "${tool.name}",
    slug: "${slug}",
    description: "${tool.description.replace(/"/g, '\"')}",
    url: "${tool.url}",
    affiliate: "${affiliate}",
    category: "${tool.category}",
    pricing: "${tool.pricing}",
    badge: "${badge}",
    tags: [${tagsStr}],
    scenarios: [${scenariosStr}],
    alternatives: [${altStr}]
  }`;
}

function updateDataFile(newTools) {
  let content = readFileSync(DATA_FILE, "utf8");
  const { maxId } = parseExistingTools(content);

  if (newTools.length === 0) {
    console.log("✅ No new tools to add. Database is up to date.");
    return false;
  }

  console.log(`🔍 Found ${newTools.length} new candidate(s):`);
  newTools.forEach((t) => console.log(`   + ${t.name} (${t.category})`));

  const newEntries = newTools.map((tool, i) => generateToolEntry(tool, maxId + i + 1));
  const insertPoint = content.lastIndexOf("\n];");
  if (insertPoint === -1) { console.error("❌ Could not find insertion point"); return false; }
  const before = content.slice(0, insertPoint);
  const after = content.slice(insertPoint);
  const updated = before + ",\n" + newEntries.join(",\n") + "\n" + after;
  writeFileSync(DATA_FILE, updated, "utf8");

  const today = new Date().toISOString().split("T")[0];
  content = readFileSync(DATA_FILE, "utf8");
  content = content.replace(/Last updated: [^.]*\./, `Last updated: ${today}.`);
  writeFileSync(DATA_FILE, content, "utf8");

  console.log(`✅ Added ${newEntries.length} tool(s). Last updated: ${today}`);
  return true;
}

// Run
console.log("🤖 AIToolKit — Auto Update Script v2");
console.log("=====================================\n");

const content = readFileSync(DATA_FILE, "utf8");
const { tools: existing } = parseExistingTools(content);
const existingNames = existing.map((t) => t.name);

console.log(`📦 Current database: ${existing.length} tools`);
console.log(`📋 Watchlist: ${WATCHLIST.length} candidates\n`);

const newTools = findNewTools(existingNames, WATCHLIST);
const changed = updateDataFile(newTools);

if (changed) {
  const indexPath = resolve(__dirname, "..", "index.html");
  let html = readFileSync(indexPath, "utf8");
  const totalTools = existing.length + newTools.length;
  html = html.replace(
    /<div class="stat-value" id="toolCount">\d+<\/div>/,
    `<div class="stat-value" id="toolCount">${totalTools}</div>`
  );
  writeFileSync(indexPath, html, "utf8");
  console.log(`📊 Updated tool count in index.html: ${totalTools}`);
}

console.log("\n✨ Done!");
