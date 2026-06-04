// ===== AIToolKit App v2 =====
(function() {
  "use strict";

  // --- State ---
  let state = {
    activeCategory: "all",
    activePricing: "all",
    activeTag: null,
    searchQuery: "",
    sortBy: "default",
    theme: localStorage.getItem("aitoolkit_theme") || "light",
    detailSlug: null
  };

  // --- DOM refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // --- Theme ---
  function initTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const btn = $("#themeToggle");
    if (btn) btn.textContent = state.theme === "dark" ? "☀️" : "🌙";
  }

  function toggleTheme() {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("aitoolkit_theme", state.theme);
    document.documentElement.setAttribute("data-theme", state.theme);
    $("#themeToggle").textContent = state.theme === "dark" ? "☀️" : "🌙";
  }

  // --- Filtering & Sorting ---
  function getFilteredTools() {
    let tools = [...TOOLS];

    // Category filter
    if (state.activeCategory !== "all") {
      tools = tools.filter((t) => t.category === state.activeCategory);
    }

    // Pricing filter
    if (state.activePricing !== "all") {
      tools = tools.filter((t) => t.pricing === state.activePricing);
    }

    // Tag filter
    if (state.activeTag) {
      tools = tools.filter((t) => t.tags.includes(state.activeTag));
    }

    // Search
    const query = state.searchQuery.toLowerCase().trim();
    if (query) {
      tools = tools.filter((t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        (t.scenarios && t.scenarios.some((s) => s.toLowerCase().includes(query)))
      );
    }

    // Sort
    switch (state.sortBy) {
      case "name-asc":
        tools.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        tools.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        tools.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured: hot first, then trending, then rest
        const badgeOrder = { hot: 0, trending: 1, "": 2 };
        tools.sort((a, b) => (badgeOrder[a.badge] || 2) - (badgeOrder[b.badge] || 2));
    }

    return tools;
  }

  function findToolBySlug(slug) {
    return TOOLS.find((t) => t.slug === slug);
  }

  function getAlternatives(tool) {
    if (!tool || !tool.alternatives) return [];
    return tool.alternatives
      .map((slug) => findToolBySlug(slug))
      .filter(Boolean)
      .slice(0, 6);
  }

  // --- Collect all unique tags ---
  function getAllTags(tools) {
    const tagSet = new Set();
    tools.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return [...tagSet].sort();
  }

  // --- Render ---
  function renderCategories() {
    const container = $("#categoryFilters");
    if (!container) return;
    container.innerHTML = CATEGORIES.map(
      (cat) =>
        `<button class="category-btn ${
          state.activeCategory === cat.id ? "active" : ""
        }" data-category="${cat.id}">
          ${cat.icon} ${cat.name}
        </button>`
    ).join("");
  }

  function renderPricing() {
    const container = $("#pricingFilters");
    if (!container) return;
    container.innerHTML = PRICING_OPTIONS.map(
      (opt) =>
        `<button class="pricing-btn ${
          state.activePricing === opt.id ? "active" : ""
        }" data-pricing="${opt.id}">
          ${opt.name}
        </button>`
    ).join("");
  }

  function renderSort() {
    const container = $("#sortSelect");
    if (!container) return;
    container.innerHTML = SORT_OPTIONS.map(
      (opt) =>
        `<option value="${opt.id}" ${
          state.sortBy === opt.id ? "selected" : ""
        }>${opt.name}</option>`
    ).join("");
  }

  function renderTagCloud() {
    const container = $("#tagCloud");
    if (!container) return;
    const tags = getAllTags(TOOLS);
    container.innerHTML = tags
      .map(
        (tag) =>
          `<button class="tag-btn ${
            state.activeTag === tag ? "active" : ""
          }" data-tag="${tag}">${tag}</button>`
      )
      .join("");
  }

  function renderScenarios() {
    const container = $("#scenarioSection");
    if (!container) return;
    container.innerHTML = `
      <h2 class="section-title">Find Tools for Your Needs</h2>
      <div class="scenario-grid">
        ${SCENARIOS.map(
          (s) => `
          <div class="scenario-card" data-scenario="${s.id}" onclick="window.AIToolKit.filterByScenario('${s.id}')">
            <div class="scenario-icon">${s.icon}</div>
            <div class="scenario-name">${s.name}</div>
            <div class="scenario-desc">${s.description}</div>
            <div class="scenario-count">${TOOLS.filter(t => t.scenarios && t.scenarios.includes(s.id)).length} tools</div>
          </div>`
        ).join("")}
      </div>
    `;
  }

  function getCategoryIcon(categoryId) {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat ? cat.icon : "🛠️";
  }

  function getBadgeHTML(badge) {
    if (!badge) return "";
    const labels = { hot: "🔥 Hot", trending: "📈 Trending", new: "🆕 New" };
    return `<span class="tool-badge badge-${badge}">${labels[badge] || badge}</span>`;
  }

  function renderTools() {
    const container = $("#toolsGrid");
    const countEl = $("#resultsCount");
    if (!container) return;

    const filtered = getFilteredTools();

    if (countEl) {
      const tagLabel = state.activeTag ? ` tagged "${state.activeTag}"` : "";
      countEl.textContent =
        filtered.length === TOOLS.length
          ? `Showing all ${TOOLS.length} tools`
          : `Showing ${filtered.length} of ${TOOLS.length} tools${tagLabel}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No tools found</h3>
          <p>Try adjusting your search, filters, or <a href="javascript:void(0)" onclick="window.AIToolKit.resetAll()" style="color:var(--accent);text-decoration:underline;">reset everything</a></p>
        </div>`;
      return;
    }

    container.innerHTML = filtered
      .map(
        (tool) => `
      <div class="tool-card" onclick="window.AIToolKit.openDetail('${tool.slug}')">
        <div class="tool-card-header">
          <div class="tool-icon">${getCategoryIcon(tool.category)}</div>
          <div class="tool-info">
            <div class="tool-name">
              ${tool.name}
              ${getBadgeHTML(tool.badge)}
              <span class="tool-pricing ${tool.pricing}">${tool.pricing}</span>
            </div>
            <div class="tool-url">${tool.url.replace("https://", "").replace("http://", "")}</div>
          </div>
        </div>
        <div class="tool-desc">${tool.description}</div>
        <div class="tool-tags">
          ${tool.tags.slice(0, 4).map((t) => `<span class="tool-tag clickable" data-tag="${t}" onclick="event.stopPropagation();window.AIToolKit.filterByTag('${t}')">${t}</span>`).join("")}
          ${tool.tags.length > 4 ? `<span class="tool-tag">+${tool.tags.length - 4}</span>` : ""}
        </div>
      </div>
    `
      )
      .join("");
  }

  
  // --- Trending ---
  function renderTrending() {
    const container = document.getElementById("trendingGrid");
    if (!container) return;
    const trending = TOOLS.filter(t => t.badge === "hot" || t.badge === "trending").slice(0, 6);
    container.innerHTML = trending.map(tool => `
      <div class="trending-card" onclick="window.AIToolKit.openDetail('${tool.slug}')">
        <div class="trending-icon">${getCategoryIcon(tool.category)}</div>
        <div class="trending-info">
          <div class="trending-name">${tool.name} ${getBadgeHTML(tool.badge)}</div>
          <div class="trending-desc">${tool.description.slice(0, 80)}...</div>
        </div>
      </div>
    `).join("");
  }
  function renderAll() {
    renderTrending();
    renderCategories();
    renderPricing();
    renderSort();
    renderTagCloud();
    renderTools();
  }

  // --- Modal ---
  function openDetail(slug) {
    const tool = findToolBySlug(slug);
    if (!tool) return;

    state.detailSlug = slug;
    const alternatives = getAlternatives(tool);

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "detailModal";
    overlay.innerHTML = `
      <div class="modal-content" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="window.AIToolKit.closeDetail()">✕</button>
        <div class="modal-icon">${getCategoryIcon(tool.category)}</div>
        <h2 class="modal-name">
          ${tool.name}
          ${getBadgeHTML(tool.badge)}
        </h2>
        <a href="${tool.url}" target="_blank" rel="noopener" class="modal-url-link modal-cta-link">
          ${tool.url.replace("https://", "").replace("http://", "")} ↗
        </a>
        <p class="modal-desc">${tool.description}</p>

        <div class="modal-actions">
          <a href="${tool.url}" target="_blank" rel="noopener" class="modal-cta">
            Visit ${tool.name} ↗
          </a>
          <a href="${tool.url}" target="_blank" rel="noopener" class="modal-cta-secondary">
            🔗 Copy Link
          </a>
        </div>

        <div class="modal-meta">
          <span class="tool-pricing ${tool.pricing}">${tool.pricing}</span>
          <span class="modal-category">${getCategoryIcon(tool.category)} ${CATEGORIES.find(c => c.id === tool.category).name}</span>
        </div>

        <div class="tool-tags">
          ${tool.tags.map((t) => `<span class="tool-tag clickable" data-tag="${t}" onclick="event.stopPropagation();window.AIToolKit.closeDetail();window.AIToolKit.filterByTag('${t}')">${t}</span>`).join("")}
        </div>

        ${alternatives.length > 0 ? `
        <div class="alternatives-section">
          <h3>🔀 Alternatives & Similar Tools</h3>
          <div class="alternatives-grid">
            ${alternatives.map(alt => `
              <div class="alt-card" onclick="event.stopPropagation();window.AIToolKit.openDetail('${alt.slug}')">
                <span class="alt-icon">${getCategoryIcon(alt.category)}</span>
                <span class="alt-name">${alt.name}</span>
                <span class="tool-pricing ${alt.pricing} alt-pricing">${alt.pricing}</span>
              </div>
            `).join("")}
          </div>
        </div>
        ` : ""}

        <!-- Ad Unit -->
        <div class="ad-unit" style="margin-top:24px;">
          <div>
            <span class="ad-unit-label">ADVERTISEMENT</span>
            <p>Google AdSense</p>
          </div>
        </div>
      </div>
    `;
    overlay.addEventListener("click", closeDetail);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }

  function closeDetail() {
    const modal = document.getElementById("detailModal");
    if (modal) {
      modal.remove();
      document.body.style.overflow = "";
      state.detailSlug = null;
    }
  }

  // --- Public actions ---
  function filterByTag(tag) {
    state.activeTag = state.activeTag === tag ? null : tag;
    if (state.activeTag) {
      state.activeCategory = "all"; // Reset category when filtering by tag
    }
    renderAll();
    window.scrollTo({ top: $("#toolsGrid")?.offsetTop - 100, behavior: "smooth" });
  }

  function filterByScenario(scenarioId) {
    state.searchQuery = scenarioId;
    const input = $("#searchInput");
    if (input) input.value = "";
    // Use scenario as a special search
    state.searchQuery = "";
    state.activeCategory = "all";
    state.activeTag = null;

    // Filter by scenario via search
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    $("#searchInput").value = scenario.name;
    state.searchQuery = scenarioId;
    renderAll();
    window.scrollTo({ top: $("#toolsGrid")?.offsetTop - 100, behavior: "smooth" });
  }

  function resetAll() {
    state.activeCategory = "all";
    state.activePricing = "all";
    state.activeTag = null;
    state.searchQuery = "";
    state.sortBy = "default";
    const input = $("#searchInput");
    if (input) input.value = "";
    renderAll();
  }

  // --- Events ---
  function bindEvents() {
    // Theme toggle
    $("#themeToggle")?.addEventListener("click", toggleTheme);

    // Category filters
    $("#categoryFilters")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".category-btn");
      if (!btn) return;
      state.activeCategory = btn.dataset.category;
      state.activeTag = null;
      renderAll();
    });

    // Pricing filters
    $("#pricingFilters")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".pricing-btn");
      if (!btn) return;
      state.activePricing = btn.dataset.pricing;
      renderAll();
    });

    // Tag cloud
    $("#tagCloud")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".tag-btn");
      if (!btn) return;
      state.activeTag = state.activeTag === btn.dataset.tag ? null : btn.dataset.tag;
      renderAll();
    });

    // Sort
    $("#sortSelect")?.addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      renderTools();
    });

    // Search
    const searchInput = $("#searchInput");
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = searchInput.value;
          state.activeTag = null;
          renderTools();
        }, 200);
      });
    }

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDetail();
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        $("#searchInput")?.focus();
      }
    });
  }

  // --- Init ---
  function init() {
    initTheme();
    renderScenarios();
    renderAll();
    bindEvents();

    // Check for direct detail page access
    const hash = window.location.hash;
    if (hash.startsWith("#tool-")) {
      const slug = hash.replace("#tool-", "");
      setTimeout(() => openDetail(slug), 300);
    }
  }

  // --- Public API ---
  window.AIToolKit = {
    openDetail,
    closeDetail,
    filterByTag,
    filterByScenario,
    resetAll
  };

  // --- Start ---
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
