(() => {
  const recordCount = document.getElementById("record-count");
  const indexRoot = document.getElementById("lore-index");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
  const searchStatus = document.getElementById("search-status");
  const viewBase = "view.php";

  if (!indexRoot) {
    return;
  }

  const normalize = (value) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "";
    }
    const date = new Date(Number(timestamp) * 1000);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const renderEmpty = (message) => {
    indexRoot.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "panel empty";
    empty.id = "empty-state";
    empty.textContent = message;
    indexRoot.appendChild(empty);
  };

  const buildEntryCard = (entry) => {
    const link = document.createElement("a");
    link.className = "entry";
    link.href = `${viewBase}?doc=${encodeURIComponent(entry.relative)}`;

    const meta = document.createElement("div");
    meta.className = "entry-meta";
    const path = document.createElement("span");
    path.className = "path";
    path.textContent = entry.relativeWithin || entry.relative;
    meta.appendChild(path);

    const heading = document.createElement("h3");
    heading.textContent = entry.title || "Untitled";

    const excerpt = document.createElement("p");
    excerpt.textContent =
      entry.excerpt || "Record unavailable. Awaiting archive sync.";

    const footer = document.createElement("div");
    footer.className = "entry-footer";
    const updated = document.createElement("span");
    const formatted = formatDate(entry.updated);
    updated.textContent = formatted ? `Last updated: ${formatted}` : "Status: archived";
    footer.appendChild(updated);

    link.appendChild(meta);
    link.appendChild(heading);
    link.appendChild(excerpt);
    link.appendChild(footer);
    return link;
  };

  const renderGrouped = (entries) => {
    if (entries.length === 0) {
      renderEmpty("No records detected. Awaiting archive intake.");
      return;
    }

    indexRoot.innerHTML = "";
    const sections = new Map();
    for (const entry of entries) {
      const folder = entry.folder || "Root";
      const list = sections.get(folder) || [];
      list.push(entry);
      sections.set(folder, list);
    }

    const sectionKeys = Array.from(sections.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    if (sectionKeys.includes("Root")) {
      sectionKeys.splice(sectionKeys.indexOf("Root"), 1);
      sectionKeys.unshift("Root");
    }

    for (const sectionName of sectionKeys) {
      const detail = document.createElement("details");
      detail.className = "folder-group";
      detail.open = true;

      const summary = document.createElement("summary");
      const title = document.createElement("span");
      title.className = "folder-title";
      title.textContent = sectionName;
      summary.appendChild(title);
      detail.appendChild(summary);

      const grid = document.createElement("div");
      grid.className = "index-grid";

      for (const entry of sections.get(sectionName)) {
        grid.appendChild(buildEntryCard(entry));
      }

      detail.appendChild(grid);
      indexRoot.appendChild(detail);
    }
  };

  const renderResults = (entries) => {
    if (entries.length === 0) {
      renderEmpty("No matches found. Refine the query.");
      return;
    }

    indexRoot.innerHTML = "";
    const detail = document.createElement("details");
    detail.className = "folder-group";
    detail.open = true;

    const summary = document.createElement("summary");
    const title = document.createElement("span");
    title.className = "folder-title";
    title.textContent = "Search results";
    summary.appendChild(title);
    detail.appendChild(summary);

    const grid = document.createElement("div");
    grid.className = "index-grid";
    for (const entry of entries) {
      grid.appendChild(buildEntryCard(entry));
    }

    detail.appendChild(grid);
    indexRoot.appendChild(detail);
  };

  const scoreEntry = (entry, query, tokens) => {
    if (!query) {
      return 0;
    }
    let score = 0;
    const title = entry.searchTitle || "";
    const body = entry.searchBody || "";
    const titleIndex = title.indexOf(query);
    if (titleIndex >= 0) {
      score += 120 - Math.min(titleIndex, 60);
    }
    const bodyIndex = body.indexOf(query);
    if (bodyIndex >= 0) {
      score += 80 - Math.min(bodyIndex, 80);
    }
    for (const token of tokens) {
      if (title.includes(token)) {
        score += 18;
      }
      if (body.includes(token)) {
        score += 6;
      }
    }
    return score;
  };

  const updateStatus = (query, matches, total) => {
    if (!searchStatus) {
      return;
    }
    if (!query) {
      searchStatus.textContent = `Showing all ${total} records.`;
    } else if (matches === 0) {
      searchStatus.textContent = "No matches found.";
    } else {
      searchStatus.textContent = `${matches} matches sorted by relevance.`;
    }
  };

  const hydrateEntries = (entries) =>
    entries.map((entry) => ({
      ...entry,
      searchTitle: normalize(entry.title || ""),
      searchBody: normalize(entry.search || entry.excerpt || ""),
    }));

  const applySearch = (entries, query) => {
    const normalized = normalize(query || "");
    if (!normalized) {
      renderGrouped(entries);
      updateStatus("", entries.length, entries.length);
      return;
    }

    const tokens = normalized.split(" ").filter((token) => token.length > 1);
    const scored = entries
      .map((entry) => ({
        entry,
        score: scoreEntry(entry, normalized, tokens),
      }))
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          Number(b.entry.updated || 0) - Number(a.entry.updated || 0)
      )
      .map((item) => item.entry);

    renderResults(scored);
    updateStatus(normalized, scored.length, entries.length);
  };

  const fetchEntries = async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${url}`);
    }
    return await response.json();
  };

  const loadEntries = async () => {
    try {
      return await fetchEntries("index.php?format=json");
    } catch (error) {
      console.error("Failed to load entries:", error);
      return { count: 0, entries: [] };
    }
  };

  const init = async () => {
    const data = await loadEntries();
    const entries = hydrateEntries(data.entries || []);
    if (recordCount) {
      recordCount.textContent = entries.length;
    }
    applySearch(entries, "");

    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        applySearch(entries, event.target.value);
      });
    }

    if (searchClear && searchInput) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        applySearch(entries, "");
        searchInput.focus();
      });
    }
  };

  window.addEventListener("DOMContentLoaded", init);
})();
