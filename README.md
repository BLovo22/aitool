# AIToolKit.io

> Discover the Best AI Tools — A curated, auto-updating directory of AI tools for writing, coding, design, and more.

## 🚀 Live

Visit: [aitoolkit.io](https://aitoolkit.io)

---

## 📦 Tech Stack

- **Pure HTML/CSS/JS** — zero dependencies, zero build step
- **GitHub Pages** — free hosting with custom domain
- **Google AdSense** — monetization
- **Google Analytics** — traffic insights
- **GitHub Actions** — automated weekly data refresh

---

## 🤖 Automated Weekly Updates

The database refreshes automatically every **Monday at 06:00 UTC** via GitHub Actions.

### How it works:

```
┌─────────────────────────────────────────────────────┐
│  GitHub Actions (cron: weekly)                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  scripts/update-manual.mjs                     │  │
│  │  ├─ Checks 12-tool watchlist for new entries   │  │
│  │  ├─ Adds missing tools to js/data.js           │  │
│  │  └─ Updates tool count in index.html           │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Auto-commit & push → GitHub Pages redeploys   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Trigger options:

| Trigger | How |
|---------|-----|
| **Weekly auto** | Runs every Monday 06:00 UTC |
| **Manual** | GitHub → Actions → "Auto-Update AI Tools" → Run workflow |
| **Local** | `node scripts/update-manual.mjs` |

### Adding tools to the watchlist:

Edit `scripts/update-manual.mjs` → `WATCHLIST` array. Each entry needs:
```js
{
  name: "Tool Name",
  url: "https://...",
  category: "coding",       // see CATEGORIES in data.js
  pricing: "freemium",      // free | freemium | paid
  tags: ["tag1", "tag2"],
  description: "What it does..."
}
```

Next time the script runs, any watchlist tools not yet in the database will be added automatically.

---

## 💡 User Submissions

Users can suggest tools via GitHub Issues:

1. Go to [Issues → New Issue → "Suggest an AI Tool"](https://github.com/YOUR_USERNAME/aitoolkit/issues/new?template=suggest-tool.yml)
2. Fill in the template
3. The issue gets the `suggestion` label
4. Review and add to the watchlist for auto-inclusion

---

## 🛠 Local Development

```bash
# Preview — just open in browser
open index.html

# Run manual update
node scripts/update-manual.mjs

# Or use the batch file (Windows)
scripts\update.bat
```

---

## 📁 Project Structure

```
aitoolkit/
├── index.html                          # Main page
├── css/style.css                       # Styles + dark/light theme
├── js/
│   ├── data.js                         # AI tools database (30+ tools)
│   └── app.js                          # Search, filters, modal, theme
├── scripts/
│   ├── update-manual.mjs               # Auto-update script
│   └── update.bat                      # Windows launcher
├── .github/
│   ├── workflows/auto-update.yml       # Weekly cron + manual trigger
│   └── ISSUE_TEMPLATE/suggest-tool.yml # User submission template
├── ads.txt / robots.txt / sitemap.xml  # SEO + AdSense
├── CNAME                               # Custom domain
└── README.md
```

---

## ⚙️ Production Setup

1. **Domain**: Buy a domain and point DNS to GitHub Pages
2. **AdSense**: Replace `ca-pub-XXXXXXXXXXXX` in `index.html` with your publisher ID
3. **Analytics**: Replace `G-XXXXXXXXXX` with your GA4 measurement ID
4. **ads.txt**: Replace `pub-XXXXXXXXXXXX` with your publisher ID
5. **GitHub Issues link**: Replace `YOUR_USERNAME` in `index.html` and `README.md` with your GitHub username
6. **Push to GitHub** — the weekly auto-update starts immediately

---

## 🔮 Roadmap

- [ ] RSS feed for new tool additions
- [ ] Tool comparison pages ("X vs Y")
- [ ] Affiliate link support (tagged URLs)
- [ ] Blog / use-case guides for SEO
- [ ] Traffic-based dynamic ranking
- [ ] User voting/reviews via GitHub Issues
