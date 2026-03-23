const resolveBase = (base) => {
  if (!base) return "";
  return base.endsWith("/") ? base : `${base}/`;
};

const BASE_URL =
  typeof window !== "undefined" && window.TQE_BASE_URL
    ? resolveBase(window.TQE_BASE_URL)
    : "";

const CONFIG_URL =
  typeof window !== "undefined" && window.TQE_CONFIG_URL
    ? window.TQE_CONFIG_URL
    : "data/config.json";
const locationEl = document.getElementById("location-value");
const locationLabelEl = document.getElementById("location-label");
const syncStatusEl = document.getElementById("sync-status");
const crewListEl = document.getElementById("crew-list");
const shipPanelEl = document.getElementById("ship-panel");
const loreEl = document.getElementById("lore-content");
const locationInfoPanelEl = document.getElementById("location-info-panel");
const locationInfoEl = document.getElementById("location-info");
const notableListEl = document.getElementById("notable-list");

const state = {
  refreshMs: 5000,
  timer: null,
  busy: false,
  lastSync: null,
};

const resolveUrl = (url) => {
  if (!BASE_URL) return url;
  if (/^(?:[a-z]+:)?\/\//i.test(url) || url.startsWith("/")) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

const cacheBust = (url) => `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;

const fetchText = async (url) => {
  const resolvedUrl = resolveUrl(url);
  const response = await fetch(cacheBust(resolvedUrl), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status}) for ${resolvedUrl}`);
  }
  return response.text();
};

const fetchJson = async (url) => {
  const text = await fetchText(url);
  return JSON.parse(text);
};

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Process player asterisk formatting: ***bold-italic***, **bold**, *italic*
const formatMessageText = (text) => {
  let formatted = escapeHtml(text);
  // Order matters: process triple asterisks first, then double, then single
  formatted = formatted.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return formatted;
};

const formatInlineMarkdown = (text) => {
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  formatted = formatted.replace(/_([^_]+)_/g, "<em>$1</em>");
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );
  return formatted;
};

const parseMarkdown = (text) => {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let paragraph = [];
  let inUl = false;
  let inOl = false;
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = "";

  const flushParagraph = () => {
    if (paragraph.length) {
      html += `<p>${formatInlineMarkdown(paragraph.join(" "))}</p>`;
      paragraph = [];
    }
  };

  const closeLists = () => {
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }
    if (inOl) {
      html += "</ol>";
      inOl = false;
    }
  };

  const flushCodeBlock = () => {
    const escaped = escapeHtml(codeLines.join("\n"));
    const langClass = codeLang ? ` class="language-${codeLang}"` : "";
    html += `<pre><code${langClass}>${escaped}</code></pre>`;
    inCodeBlock = false;
    codeLines = [];
    codeLang = "";
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushParagraph();
        closeLists();
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      return;
    }

    if (!trimmed) {
      flushParagraph();
      closeLists();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeLists();
      const level = headingMatch[1].length;
      html += `<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`;
      return;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!inOl) {
        closeLists();
        html += "<ol>";
        inOl = true;
      }
      html += `<li>${formatInlineMarkdown(orderedMatch[2])}</li>`;
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (!inUl) {
        closeLists();
        html += "<ul>";
        inUl = true;
      }
      html += `<li>${formatInlineMarkdown(unorderedMatch[1])}</li>`;
      return;
    }

    paragraph.push(trimmed);
  });

  if (inCodeBlock) {
    flushCodeBlock();
  }
  flushParagraph();
  closeLists();

  return html;
};

const normalizeLocationParts = (parts) => {
  if (!Array.isArray(parts)) return [];
  return parts
    .map((part) => {
      if (typeof part === "string") {
        return { text: part, color: "", className: "" };
      }
      if (part && typeof part === "object") {
        return {
          text: part.text ? String(part.text) : "",
          color: typeof part.color === "string" ? part.color : "",
          className: typeof part.className === "string" ? part.className : "",
        };
      }
      return { text: "", color: "", className: "" };
    })
    .filter((part) => part.text);
};

const normalizeConfig = (raw) => {
  const config = raw && typeof raw === "object" ? raw : {};
  return {
    locationLabel: String(config.locationLabel || "CURRENT LOCATION:"),
    location: String(config.location || "UNKNOWN"),
    locationParts: normalizeLocationParts(config.locationParts),
    crewFiles: Array.isArray(config.crewFiles)
      ? config.crewFiles.filter((entry) => Boolean(entry))
      : [],
    shipFile: typeof config.shipFile === "string" ? config.shipFile : "",
    loreFile: typeof config.loreFile === "string" ? config.loreFile : "",
    notableCharactersFile:
      typeof config.notableCharactersFile === "string"
        ? config.notableCharactersFile
        : "",
    locationInfoEnabled:
      typeof config.locationInfoEnabled === "boolean"
        ? config.locationInfoEnabled
        : true,
    locationInfoFile:
      typeof config.locationInfoFile === "string" ? config.locationInfoFile : "",
    refreshSeconds:
      Number.isFinite(Number(config.refreshSeconds)) && Number(config.refreshSeconds) > 0
        ? Number(config.refreshSeconds)
        : 5,
  };
};

const formatSigned = (value, fallback = "0") => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) return fallback;
  return numeric > 0 ? `+${numeric}` : `${numeric}`;
};

const formatModifier = (value) => {
  if (value === undefined || value === null) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (text.startsWith("+") || text.startsWith("-")) return text;
  const numeric = Number.parseInt(text, 10);
  if (Number.isNaN(numeric)) return "";
  return numeric > 0 ? `+${numeric}` : `${numeric}`;
};

const buildStatChip = (label, value, modifier) => {
  const chip = document.createElement("div");
  chip.className = "stat-chip";
  const name = document.createElement("span");
  name.textContent = label;
  const val = document.createElement("strong");
  const modText = formatModifier(modifier);
  val.textContent = modText ? `${formatSigned(value)} (${modText})` : formatSigned(value);
  chip.appendChild(name);
  chip.appendChild(val);
  return chip;
};

const renderEmptyState = (text, tagName = "p") => {
  const empty = document.createElement(tagName);
  empty.className = "empty-state";
  empty.textContent = text;
  return empty;
};

const renderCrew = (crew) => {
  crewListEl.innerHTML = "";
  if (!crew.length) {
    crewListEl.appendChild(renderEmptyState("No crew files configured."));
    return;
  }

  crew.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "crew-card";
    if (entry.error) {
      card.classList.add("crew-error");
    } else {
      card.classList.add("crew-card-clickable");
      card.addEventListener("click", () => openCharacterDetail(entry));
    }

    const title = document.createElement("h3");
    title.textContent = entry.name || "Unknown";
    const role = document.createElement("p");
    role.className = "crew-role";
    role.textContent = entry.role || "Role unknown";
    card.appendChild(title);
    card.appendChild(role);

    if (entry.callsign) {
      const callsign = document.createElement("p");
      callsign.className = "crew-callsign";
      callsign.textContent = entry.callsign;
      card.appendChild(callsign);
    }

    const stats = document.createElement("div");
    stats.className = "stat-grid";
    stats.appendChild(buildStatChip("Grit", entry.stats.grit, entry.stats.gritMod));
    stats.appendChild(buildStatChip("Wits", entry.stats.wits, entry.stats.witsMod));
    stats.appendChild(buildStatChip("Tech", entry.stats.tech, entry.stats.techMod));
    stats.appendChild(buildStatChip("Tact", entry.stats.tact, entry.stats.tactMod));
    stats.appendChild(buildStatChip("Face", entry.stats.face, entry.stats.faceMod));
    card.appendChild(stats);

    if (entry.error && entry.path) {
      const errorText = document.createElement("p");
      errorText.className = "crew-callsign";
      errorText.textContent = `Missing file: ${entry.path}`;
      card.appendChild(errorText);
    }

    crewListEl.appendChild(card);
  });
};

// Character Detail Panel
let currentDetailCharacter = null;
let currentDetailCharacterFile = null;

const openCharacterDetail = (character) => {
  const overlay = document.getElementById("character-detail-overlay");
  const panel = document.getElementById("character-detail-panel");
  if (!overlay || !panel) return;

  currentDetailCharacter = character;
  currentDetailCharacterFile = character.path || null;

  // Check if this is the logged-in character's own sheet
  const isOwnCharacter = terminalState.mode === 'character' &&
    terminalState.characterData &&
    terminalState.characterData["identity.name"] === character.name;

  // GM can edit any character
  const isGM = terminalState.mode === 'gm';
  const canEdit = isOwnCharacter || isGM;

  panel.innerHTML = renderCharacterDetailContent(character, canEdit, isGM);
  overlay.classList.add("visible");
  document.body.style.overflow = "hidden";

  // Add close handlers
  const closeBtn = panel.querySelector(".detail-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeCharacterDetail);
  }

  // Add edit handlers if can edit
  if (canEdit) {
    setupCharacterEditHandlers(panel, character);
  }
};

const closeCharacterDetail = () => {
  const overlay = document.getElementById("character-detail-overlay");
  if (overlay) {
    overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }
  currentDetailCharacter = null;
  currentDetailCharacterFile = null;
};

const setupCharacterEditHandlers = (panel, character) => {
  // Condition toggles
  panel.querySelectorAll('.condition-toggle').forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const condition = toggle.dataset.condition;
      const currentValue = toggle.classList.contains('active');
      const newValue = !currentValue;

      toggle.classList.toggle('active', newValue);

      await updateCharacterField(`conditions.${condition}`, newValue);
    });
  });

  // Wound toggles
  panel.querySelectorAll('.wound-toggle').forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const wound = toggle.dataset.wound;
      const currentValue = toggle.classList.contains('active');
      const newValue = !currentValue;

      toggle.classList.toggle('active', newValue);

      await updateCharacterField(`wounds.${wound}`, newValue);
    });
  });

  // Health clock toggles
  panel.querySelectorAll('.health-toggle').forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const clock = toggle.dataset.clock;
      const currentValue = toggle.classList.contains('active');
      const newValue = !currentValue;

      toggle.classList.toggle('active', newValue);

      await updateCharacterField(`health.${clock}`, newValue);
    });
  });

  // RADs input
  const radsInput = panel.querySelector('.rads-input');
  if (radsInput) {
    radsInput.addEventListener('change', async () => {
      const newValue = radsInput.value;
      await updateCharacterField('tracks.rads', newValue);
    });
  }

  // Gear management
  setupGearEditHandlers(panel, character);

  // Export button
  const exportBtn = panel.querySelector('.export-sheet-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportCharacterSheet);
  }
};

const setupGearEditHandlers = (panel, character) => {
  // Remove item buttons
  panel.querySelectorAll('.gear-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.dataset.itemId;
      const updatedGear = (currentDetailCharacter.gear || []).filter(item => item.id !== itemId);

      await updateCharacterField('gear.items', updatedGear);

      // Update local state and re-render gear list
      currentDetailCharacter.gear = updatedGear;
      rerenderGearList(panel);
    });
  });

  // Add item form
  const addItemForm = panel.querySelector('.gear-add-form');
  const addItemBtn = panel.querySelector('.gear-add-btn');
  const showAddFormBtn = panel.querySelector('.gear-show-add-btn');

  if (showAddFormBtn && addItemForm) {
    showAddFormBtn.addEventListener('click', () => {
      addItemForm.classList.toggle('visible');
      showAddFormBtn.textContent = addItemForm.classList.contains('visible') ? 'Cancel' : '+ Add Item';
    });
  }

  if (addItemBtn && addItemForm) {
    addItemBtn.addEventListener('click', async () => {
      const nameInput = addItemForm.querySelector('.gear-new-name');
      const typeSelect = addItemForm.querySelector('.gear-new-type');
      const tagsInput = addItemForm.querySelector('.gear-new-tags');
      const descInput = addItemForm.querySelector('.gear-new-desc');

      const name = nameInput.value.trim();
      if (!name) {
        showDetailFeedback('Item name required', true);
        return;
      }

      const newItem = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: name,
        type: typeSelect.value,
        tags: tagsInput.value.trim(),
        description: descInput.value.trim()
      };

      const updatedGear = [...(currentDetailCharacter.gear || []), newItem];

      await updateCharacterField('gear.items', updatedGear);

      // Update local state and re-render
      currentDetailCharacter.gear = updatedGear;
      rerenderGearList(panel);

      // Clear form and hide
      nameInput.value = '';
      tagsInput.value = '';
      descInput.value = '';
      typeSelect.value = 'item';
      addItemForm.classList.remove('visible');
      showAddFormBtn.textContent = '+ Add Item';
    });
  }
};

const rerenderGearList = (panel) => {
  const gearSection = panel.querySelector('.detail-gear-section');
  if (!gearSection) return;

  const gear = currentDetailCharacter.gear || [];

  gearSection.innerHTML = `
    <h3>Gear</h3>
    ${gear.length > 0 ? `
      <ul class="detail-gear-list">
        ${gear.map(item => `
          <li class="gear-item gear-type-${escapeHtml(item.type || 'item')}">
            <div class="gear-item-content">
              <span class="gear-name">${escapeHtml(item.name)}</span>
              ${item.tags ? `<span class="gear-tags">${escapeHtml(item.tags)}</span>` : ""}
              ${item.description ? `<span class="gear-desc">${escapeHtml(item.description)}</span>` : ""}
            </div>
            <button type="button" class="gear-remove-btn" data-item-id="${escapeHtml(item.id)}" title="Remove item">&times;</button>
          </li>
        `).join("")}
      </ul>
    ` : '<p class="detail-muted">No gear</p>'}
    <button type="button" class="gear-show-add-btn">+ Add Item</button>
    <div class="gear-add-form">
      <input type="text" class="gear-new-name" placeholder="Item name" />
      <select class="gear-new-type">
        <option value="item">Item</option>
        <option value="weapon">Weapon</option>
        <option value="armor">Armor</option>
      </select>
      <input type="text" class="gear-new-tags" placeholder="Tags (e.g., rugged, precise)" />
      <input type="text" class="gear-new-desc" placeholder="Description (optional)" />
      <button type="button" class="gear-add-btn">Add</button>
    </div>
  `;

  // Re-attach handlers
  setupGearEditHandlers(panel, currentDetailCharacter);
};

const updateCharacterField = async (field, value) => {
  if (!terminalState.code) return;

  try {
    const payload = {
      code: terminalState.code,
      updates: { [field]: value }
    };

    // If GM is editing another character, include the character file
    if (terminalState.mode === 'gm' && currentDetailCharacterFile) {
      payload.characterFile = currentDetailCharacterFile;
    }

    const response = await fetch('api.php?action=character_update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Update failed');
    }

    // Update local state for own character
    if (terminalState.mode === 'character' && terminalState.characterData) {
      terminalState.characterData[field] = value;
    }

    // Show brief feedback
    showDetailFeedback('Saved');
  } catch (error) {
    console.error('Character update error:', error);
    showDetailFeedback(error.message || 'Error saving', true);
  }
};

const showDetailFeedback = (message, isError = false) => {
  const panel = document.getElementById("character-detail-panel");
  let feedback = panel.querySelector('.detail-feedback');

  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'detail-feedback';
    panel.insertBefore(feedback, panel.firstChild);
  }

  feedback.textContent = message;
  feedback.classList.toggle('error', isError);
  feedback.classList.add('visible');

  setTimeout(() => {
    feedback.classList.remove('visible');
  }, 1500);
};

// Export character sheet as JSON file
const exportCharacterSheet = async () => {
  if (!currentDetailCharacter) return;

  const char = currentDetailCharacter;

  // Reconstruct the flat format used by .tqechar files
  const exportData = {
    "identity.name": char.name || "",
    "identity.callsign": char.callsign || "",
    "identity.role": char.role || "",
    "identity.background": char.background || "",
    "identity.pronouns": char.pronouns || "",
    "stats.grit": char.stats?.grit || "0",
    "stats.gritModifier": char.stats?.gritMod || "",
    "stats.wits": char.stats?.wits || "0",
    "stats.witsModifier": char.stats?.witsMod || "",
    "stats.tech": char.stats?.tech || "0",
    "stats.techModifier": char.stats?.techMod || "",
    "stats.tact": char.stats?.tact || "0",
    "stats.tactModifier": char.stats?.tactMod || "",
    "stats.face": char.stats?.face || "0",
    "stats.faceModifier": char.stats?.faceMod || "",
    "conditions.injured": char.conditions?.injured || false,
    "conditions.exposed": char.conditions?.exposed || false,
    "conditions.shaken": char.conditions?.shaken || false,
    "conditions.exhausted": char.conditions?.exhausted || false,
    "conditions.contaminated": char.conditions?.contaminated || false,
    "conditions.compromised": char.conditions?.compromised || false,
    "wounds.wound1": char.wounds?.wound1 || false,
    "wounds.wound2": char.wounds?.wound2 || false,
    "wounds.wound3": char.wounds?.wound3 || false,
    "health.clock1": char.health?.clock1 || false,
    "health.clock2": char.health?.clock2 || false,
    "health.clock3": char.health?.clock3 || false,
    "health.clock4": char.health?.clock4 || false,
    "tracks.rads": char.rads || "0",
    "clocks.list": [],
    "gear.items": char.gear || [],
    "abilities.moves": char.abilities || [],
    "abilities.stress": [],
    "notes.contacts": [],
    "notes.general": [],
    "mods.items": [],
    "debts.list": []
  };

  // Create filename based on character name
  const safeName = (char.name || "character").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${safeName}-${timestamp}.tqechar`;

  // Create and download the file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showDetailFeedback(`Exported ${filename}`);
};

const renderCharacterDetailContent = (char, isEditable = false, isGM = false) => {
  const activeConditions = Object.entries(char.conditions || {})
    .filter(([_, active]) => active)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

  const woundCount = [char.wounds?.wound1, char.wounds?.wound2, char.wounds?.wound3]
    .filter(Boolean).length;

  const healthFilled = [char.health?.clock1, char.health?.clock2, char.health?.clock3, char.health?.clock4]
    .filter(Boolean).length;

  const baseMoves = (char.abilities || []).filter(a => a.isBase);
  const specialMoves = (char.abilities || []).filter(a => !a.isBase);

  const conditionNames = ['injured', 'exposed', 'shaken', 'exhausted', 'contaminated', 'compromised'];

  const editModeLabel = isGM ? 'GM Edit Mode' : 'Edit Mode';

  return `
    <button class="detail-close-btn" type="button" aria-label="Close">&times;</button>
    <div class="detail-header">
      <h2>${escapeHtml(char.name)}</h2>
      <p class="detail-role">${escapeHtml(char.role)}</p>
      ${char.callsign ? `<p class="detail-callsign">"${escapeHtml(char.callsign)}"</p>` : ""}
      ${char.pronouns ? `<p class="detail-pronouns">${escapeHtml(char.pronouns)}</p>` : ""}
      ${isEditable ? `<p class="detail-edit-mode ${isGM ? 'gm-mode' : ''}">${editModeLabel}</p>` : ""}
    </div>

    <div class="detail-section">
      <h3>Stats</h3>
      <div class="detail-stat-grid">
        <div class="detail-stat"><span>Grit</span><strong>${formatSigned(char.stats.grit)}${formatModifier(char.stats.gritMod) ? ` (${formatModifier(char.stats.gritMod)})` : ""}</strong></div>
        <div class="detail-stat"><span>Wits</span><strong>${formatSigned(char.stats.wits)}${formatModifier(char.stats.witsMod) ? ` (${formatModifier(char.stats.witsMod)})` : ""}</strong></div>
        <div class="detail-stat"><span>Tech</span><strong>${formatSigned(char.stats.tech)}${formatModifier(char.stats.techMod) ? ` (${formatModifier(char.stats.techMod)})` : ""}</strong></div>
        <div class="detail-stat"><span>Tact</span><strong>${formatSigned(char.stats.tact)}${formatModifier(char.stats.tactMod) ? ` (${formatModifier(char.stats.tactMod)})` : ""}</strong></div>
        <div class="detail-stat"><span>Face</span><strong>${formatSigned(char.stats.face)}${formatModifier(char.stats.faceMod) ? ` (${formatModifier(char.stats.faceMod)})` : ""}</strong></div>
      </div>
    </div>

    <div class="detail-section">
      <h3>Status</h3>
      ${isEditable ? `
        <div class="detail-editable-status">
          <div class="editable-row">
            <span class="status-label">Wounds</span>
            <div class="toggle-group">
              <button type="button" class="wound-toggle ${char.wounds?.wound1 ? 'active' : ''}" data-wound="wound1">1</button>
              <button type="button" class="wound-toggle ${char.wounds?.wound2 ? 'active' : ''}" data-wound="wound2">2</button>
              <button type="button" class="wound-toggle ${char.wounds?.wound3 ? 'active' : ''}" data-wound="wound3">3</button>
            </div>
          </div>
          <div class="editable-row">
            <span class="status-label">Health Clock</span>
            <div class="toggle-group">
              <button type="button" class="health-toggle ${char.health?.clock1 ? 'active' : ''}" data-clock="clock1">1</button>
              <button type="button" class="health-toggle ${char.health?.clock2 ? 'active' : ''}" data-clock="clock2">2</button>
              <button type="button" class="health-toggle ${char.health?.clock3 ? 'active' : ''}" data-clock="clock3">3</button>
              <button type="button" class="health-toggle ${char.health?.clock4 ? 'active' : ''}" data-clock="clock4">4</button>
            </div>
          </div>
          <div class="editable-row">
            <span class="status-label">RADs</span>
            <input type="number" class="rads-input" value="${escapeHtml(char.rads || '0')}" min="0" />
          </div>
        </div>
        <div class="detail-conditions-edit">
          <span class="status-label">Conditions</span>
          <div class="condition-toggles">
            ${conditionNames.map(c => `
              <button type="button" class="condition-toggle ${char.conditions?.[c] ? 'active' : ''}" data-condition="${c}">
                ${c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            `).join("")}
          </div>
        </div>
      ` : `
        <div class="detail-status-row">
          <div class="detail-status-item">
            <span class="status-label">Wounds</span>
            <span class="status-value ${woundCount > 0 ? 'status-warn' : ''}">${woundCount}/3</span>
          </div>
          <div class="detail-status-item">
            <span class="status-label">Health</span>
            <span class="status-value">${healthFilled}/4</span>
          </div>
          <div class="detail-status-item">
            <span class="status-label">RADs</span>
            <span class="status-value ${parseInt(char.rads) > 0 ? 'status-alert' : ''}">${char.rads}</span>
          </div>
        </div>
        ${activeConditions.length > 0 ? `
          <div class="detail-conditions">
            <span class="status-label">Conditions</span>
            <div class="condition-tags">
              ${activeConditions.map(c => `<span class="condition-tag">${c}</span>`).join("")}
            </div>
          </div>
        ` : `<p class="detail-muted">No active conditions</p>`}
      `}
    </div>

    <div class="detail-section detail-gear-section">
      <h3>Gear</h3>
      ${char.gear && char.gear.length > 0 ? `
        <ul class="detail-gear-list">
          ${char.gear.map(item => `
            <li class="gear-item gear-type-${escapeHtml(item.type || 'item')}">
              <div class="gear-item-content">
                <span class="gear-name">${escapeHtml(item.name)}</span>
                ${item.tags ? `<span class="gear-tags">${escapeHtml(item.tags)}</span>` : ""}
                ${item.description ? `<span class="gear-desc">${escapeHtml(item.description)}</span>` : ""}
              </div>
              ${isEditable ? `<button type="button" class="gear-remove-btn" data-item-id="${escapeHtml(item.id)}" title="Remove item">&times;</button>` : ""}
            </li>
          `).join("")}
        </ul>
      ` : '<p class="detail-muted">No gear</p>'}
      ${isEditable ? `
        <button type="button" class="gear-show-add-btn">+ Add Item</button>
        <div class="gear-add-form">
          <input type="text" class="gear-new-name" placeholder="Item name" />
          <select class="gear-new-type">
            <option value="item">Item</option>
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
          </select>
          <input type="text" class="gear-new-tags" placeholder="Tags (e.g., rugged, precise)" />
          <input type="text" class="gear-new-desc" placeholder="Description (optional)" />
          <button type="button" class="gear-add-btn">Add</button>
        </div>
      ` : ""}
    </div>

    ${specialMoves.length > 0 ? `
    <div class="detail-section">
      <h3>Special Abilities</h3>
      <ul class="detail-abilities-list">
        ${specialMoves.map(move => `
          <li class="ability-item">
            <span class="ability-name">${escapeHtml(move.name)}</span>
            <span class="ability-desc">${escapeHtml(move.description)}</span>
          </li>
        `).join("")}
      </ul>
    </div>
    ` : ""}

    ${baseMoves.length > 0 ? `
    <div class="detail-section detail-section-collapsed">
      <h3>Base Moves</h3>
      <ul class="detail-abilities-list">
        ${baseMoves.map(move => `
          <li class="ability-item">
            <span class="ability-name">${escapeHtml(move.name)}</span>
            <span class="ability-desc">${escapeHtml(move.description)}</span>
          </li>
        `).join("")}
      </ul>
    </div>
    ` : ""}

    ${isEditable ? `
    <div class="detail-section detail-export-section">
      <button type="button" class="export-sheet-btn">Export Character Sheet</button>
      <p class="export-hint">Download a copy of this character sheet to save your progress</p>
    </div>
    ` : ""}
  `;
};

const renderLocation = (location, parts) => {
  locationEl.innerHTML = "";
  if (parts.length) {
    parts.forEach((part) => {
      const segment = document.createElement("span");
      segment.className = "location-segment";
      if (part.className) {
        segment.classList.add(part.className);
      }
      segment.textContent = part.text;
      if (part.color) {
        segment.style.color = part.color;
      }
      locationEl.appendChild(segment);
    });
  } else {
    locationEl.textContent = location;
  }
};

const parseCrewEntry = (data, path, error) => ({
  name: data ? data["identity.name"] || "Unknown" : "File missing",
  role: data ? data["identity.role"] || "Unknown Role" : "Unavailable",
  callsign: data ? data["identity.callsign"] || "" : "",
  pronouns: data ? data["identity.pronouns"] || "" : "",
  background: data ? data["identity.background"] || "" : "",
  stats: {
    grit: data ? data["stats.grit"] : "0",
    wits: data ? data["stats.wits"] : "0",
    tech: data ? data["stats.tech"] : "0",
    tact: data ? data["stats.tact"] : "0",
    face: data ? data["stats.face"] : "0",
    gritMod: data ? data["stats.gritModifier"] : "",
    witsMod: data ? data["stats.witsModifier"] : "",
    techMod: data ? data["stats.techModifier"] : "",
    tactMod: data ? data["stats.tactModifier"] : "",
    faceMod: data ? data["stats.faceModifier"] : "",
  },
  conditions: data ? {
    injured: data["conditions.injured"] || false,
    exposed: data["conditions.exposed"] || false,
    shaken: data["conditions.shaken"] || false,
    exhausted: data["conditions.exhausted"] || false,
    contaminated: data["conditions.contaminated"] || false,
    compromised: data["conditions.compromised"] || false,
  } : {},
  wounds: data ? {
    wound1: data["wounds.wound1"] || false,
    wound2: data["wounds.wound2"] || false,
    wound3: data["wounds.wound3"] || false,
  } : {},
  health: data ? {
    clock1: data["health.clock1"] || false,
    clock2: data["health.clock2"] || false,
    clock3: data["health.clock3"] || false,
    clock4: data["health.clock4"] || false,
  } : {},
  rads: data ? data["tracks.rads"] || "0" : "0",
  gear: data && Array.isArray(data["gear.items"]) ? data["gear.items"] : [],
  abilities: data && Array.isArray(data["abilities.moves"]) ? data["abilities.moves"] : [],
  path,
  error,
});

const loadCrew = async (crewFiles) => {
  if (!crewFiles.length) return [];
  const results = await Promise.all(
    crewFiles.map(async (file) => {
      try {
        const data = await fetchJson(file);
        return parseCrewEntry(data, file, null);
      } catch (error) {
        return parseCrewEntry(null, file, error);
      }
    })
  );
  return results;
};

const renderShip = (ship) => {
  shipPanelEl.innerHTML = "";
  if (!ship) {
    shipPanelEl.appendChild(renderEmptyState("No ship file configured."));
    return;
  }

  const header = document.createElement("div");
  header.className = "ship-title";
  const title = document.createElement("h3");
  title.textContent = ship.name || "Unnamed vessel";
  const model = document.createElement("p");
  model.textContent = ship.model || "Model unknown";
  header.appendChild(title);
  header.appendChild(model);

  if (ship.description) {
    const description = document.createElement("p");
    description.textContent = ship.description;
    header.appendChild(description);
  }
  shipPanelEl.appendChild(header);

  const stats = document.createElement("div");
  stats.className = "ship-grid";
  stats.appendChild(buildStatChip("Hull", ship.stats.hull));
  stats.appendChild(buildStatChip("Drive", ship.stats.drive));
  stats.appendChild(buildStatChip("Shields", ship.stats.shields));
  stats.appendChild(buildStatChip("Sensors", ship.stats.sensors));
  stats.appendChild(buildStatChip("Weapons", ship.stats.weapons));
  shipPanelEl.appendChild(stats);

  const tracks = document.createElement("div");
  tracks.className = "ship-grid";
  tracks.appendChild(buildStatChip("Supply", ship.tracks.supply));
  tracks.appendChild(buildStatChip("Fuel", ship.tracks.fuel));
  tracks.appendChild(buildStatChip("Parts", ship.tracks.parts));
  tracks.appendChild(buildStatChip("Heat", ship.tracks.heat));
  shipPanelEl.appendChild(tracks);

  const systemsTitle = document.createElement("p");
  systemsTitle.className = "crew-callsign";
  systemsTitle.textContent = "Systems";
  shipPanelEl.appendChild(systemsTitle);

  const systems = document.createElement("ul");
  systems.className = "system-list";
  ship.systems.forEach((system) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = system.label;
    const value = document.createElement("span");
    value.textContent = system.value;
    item.appendChild(label);
    item.appendChild(value);
    systems.appendChild(item);
  });
  shipPanelEl.appendChild(systems);

  const modulesTitle = document.createElement("p");
  modulesTitle.className = "crew-callsign";
  modulesTitle.textContent = "Modules";
  shipPanelEl.appendChild(modulesTitle);

  const modules = document.createElement("ul");
  modules.className = "module-list";
  if (!ship.modules.length) {
    modules.appendChild(renderEmptyState("No modules listed.", "li"));
  } else {
    ship.modules.forEach((module) => {
      const item = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = module.name;
      const description = document.createElement("span");
      description.textContent = module.description || "";
      item.appendChild(name);
      item.appendChild(description);
      modules.appendChild(item);
    });
  }
  shipPanelEl.appendChild(modules);
};

const renderNotableCharacters = (payload) => {
  notableListEl.innerHTML = "";
  if (!payload) {
    notableListEl.appendChild(
      renderEmptyState("No notable characters file configured.")
    );
    return;
  }

  if (payload.error) {
    notableListEl.appendChild(
      renderEmptyState(`Missing file: ${payload.path}`)
    );
    return;
  }

  if (!payload.entries.length) {
    notableListEl.appendChild(renderEmptyState("No notable characters listed."));
    return;
  }

  payload.entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "notable-card";
    const name = document.createElement("h3");
    name.textContent = entry.name || "Unknown";
    const role = document.createElement("p");
    role.className = "notable-role";
    role.textContent = entry.role || "Role unknown";
    card.appendChild(name);
    card.appendChild(role);

    if (entry.note) {
      const note = document.createElement("p");
      note.className = "notable-note";
      note.textContent = entry.note;
      card.appendChild(note);
    }

    notableListEl.appendChild(card);
  });
};

const parseShip = (data) => ({
  name: data["ship.info.name"] || "Unnamed vessel",
  model: data["ship.info.model"] || "Model unknown",
  description: data["ship.info.description"] || "",
  stats: {
    hull: data["ship.stats.hull"] || "0",
    drive: data["ship.stats.drive"] || "0",
    shields: data["ship.stats.shields"] || "0",
    sensors: data["ship.stats.sensors"] || "0",
    weapons: data["ship.stats.weapons"] || "0",
  },
  tracks: {
    supply: data["ship.tracks.supply"] || "0",
    fuel: data["ship.tracks.fuel"] || "0",
    parts: data["ship.tracks.parts"] || "0",
    heat: data["ship.tracks.heat"] || "0",
  },
  systems: [
    { label: "Life Support", value: data["ship.systems.lifeSupport"] || "OK" },
    { label: "Reactor", value: data["ship.systems.reactor"] || "OK" },
    { label: "Shielding", value: data["ship.systems.shielding"] || "OK" },
    { label: "Nav", value: data["ship.systems.nav"] || "OK" },
    { label: "Comms", value: data["ship.systems.comms"] || "OK" },
    { label: "Cargo", value: data["ship.systems.cargo"] || "OK" },
  ],
  modules: Array.isArray(data["ship.modules"])
    ? data["ship.modules"].map((module) => ({
        name: module.name || "Unnamed module",
        description: module.description || "",
      }))
    : [],
});

const loadShip = async (shipFile) => {
  if (!shipFile) return null;
  try {
    const data = await fetchJson(shipFile);
    return parseShip(data);
  } catch (error) {
    return {
      name: "Ship data unavailable",
      model: `Missing file: ${shipFile}`,
      description: "",
      stats: { hull: "0", drive: "0", shields: "0", sensors: "0", weapons: "0" },
      tracks: { supply: "0", fuel: "0", parts: "0", heat: "0" },
      systems: [
        { label: "Status", value: "Error loading ship file" },
      ],
      modules: [],
    };
  }
};

const parseNotableCharacters = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.characters)) return data.characters;
  return [];
};

const loadNotableCharacters = async (notableFile) => {
  if (!notableFile) return null;
  try {
    const data = await fetchJson(notableFile);
    const entries = parseNotableCharacters(data).map((entry) => ({
      name: entry.name || "Unknown",
      role: entry.role || "Unknown Role",
      note: entry.note || "",
    }));
    return { entries, error: null, path: notableFile };
  } catch (error) {
    return { entries: [], error, path: notableFile };
  }
};

const renderLore = (text, isHtml) => {
  loreEl.classList.toggle("is-html", Boolean(isHtml));
  if (isHtml) {
    loreEl.innerHTML = text;
  } else {
    loreEl.textContent = text;
  }
};

const renderLocationInfo = (text, isHtml) => {
  locationInfoEl.classList.toggle("is-html", Boolean(isHtml));
  if (isHtml) {
    locationInfoEl.innerHTML = text;
  } else {
    locationInfoEl.textContent = text;
  }
};

const loadLore = async (loreFile) => {
  if (!loreFile) {
    renderLore("No lore file configured.", false);
    return;
  }
  try {
    const text = await fetchText(loreFile);
    const lower = loreFile.toLowerCase();
    if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
      renderLore(parseMarkdown(text), true);
    } else {
      renderLore(text, lower.endsWith(".html") || lower.endsWith(".htm"));
    }
  } catch (error) {
    renderLore(`Unable to load lore file: ${loreFile}`, false);
  }
};

const loadLocationInfo = async (infoFile) => {
  if (!infoFile) {
    renderLocationInfo("No location info file configured.", false);
    return;
  }
  try {
    const text = await fetchText(infoFile);
    const lower = infoFile.toLowerCase();
    if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
      renderLocationInfo(parseMarkdown(text), true);
    } else {
      renderLocationInfo(text, lower.endsWith(".html") || lower.endsWith(".htm"));
    }
  } catch (error) {
    renderLocationInfo(`Unable to load location info: ${infoFile}`, false);
  }
};

const updateSyncStatus = (statusText, isError = false) => {
  syncStatusEl.textContent = statusText;
  syncStatusEl.style.color = isError ? "var(--alert)" : "var(--signal)";
};

const updateOnce = async () => {
  if (state.busy) return;

  // Pause polling if GM is editing
  if (typeof gmEditingActive !== 'undefined' && gmEditingActive) {
    updateSyncStatus('Polling paused (GM editing)', false);
    return;
  }

  state.busy = true;
  try {
    const config = normalizeConfig(await fetchJson(CONFIG_URL));
    locationLabelEl.textContent = config.locationLabel;
    renderLocation(config.location, config.locationParts);
    locationInfoPanelEl.hidden = !config.locationInfoEnabled;

    const nextRefreshMs = Math.max(2000, config.refreshSeconds * 1000);
    if (nextRefreshMs !== state.refreshMs) {
      state.refreshMs = nextRefreshMs;
      if (state.timer) {
        clearInterval(state.timer);
        state.timer = setInterval(updateOnce, state.refreshMs);
      }
    }

    const [crew, ship, notableCharacters] = await Promise.all([
      loadCrew(config.crewFiles),
      loadShip(config.shipFile),
      loadNotableCharacters(config.notableCharactersFile),
    ]);
    renderCrew(crew);
    renderShip(ship);
    renderNotableCharacters(notableCharacters);
    await loadLore(config.loreFile);
    if (config.locationInfoEnabled) {
      await loadLocationInfo(config.locationInfoFile);
    }

    // Fetch new messages (even when locked for public view)
    await fetchMessages();

    state.lastSync = new Date();
    updateSyncStatus(
      `Live feed // last sync ${state.lastSync.toLocaleTimeString()}`
    );
  } catch (error) {
    updateSyncStatus("Sync error. Waiting for next cycle.", true);
    console.error(error);
  } finally {
    state.busy = false;
  }
};

// Terminal functionality
const terminalState = {
  mode: 'locked',
  code: null,
  characterData: null,
  shipData: null,
  lastMessageTimestamp: null
};

let gmEditingActive = false;

// WebSocket connection for real-time terminal updates
let terminalWs = null;
let wsReconnectTimer = null;
const WS_RECONNECT_DELAY = 3000;

function connectTerminalWebSocket() {
  // Determine WebSocket URL based on current location (proxied through nginx)
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}/ws/dashboard`;

  try {
    terminalWs = new WebSocket(wsUrl);

    terminalWs.onopen = () => {
      console.log('Terminal WebSocket connected');
      if (wsReconnectTimer) {
        clearTimeout(wsReconnectTimer);
        wsReconnectTimer = null;
      }
    };

    terminalWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          // Immediately fetch new messages
          fetchMessages();
        }
      } catch (e) {
        console.error('WebSocket message parse error:', e);
      }
    };

    terminalWs.onclose = () => {
      console.log('Terminal WebSocket disconnected, reconnecting...');
      terminalWs = null;
      scheduleReconnect();
    };

    terminalWs.onerror = (err) => {
      console.error('Terminal WebSocket error');
      terminalWs = null;
    };
  } catch (e) {
    console.error('WebSocket connection failed:', e);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (!wsReconnectTimer) {
    wsReconnectTimer = setTimeout(() => {
      wsReconnectTimer = null;
      connectTerminalWebSocket();
    }, WS_RECONNECT_DELAY);
  }
}

// Initialize WebSocket connection
connectTerminalWebSocket();

// Terminal DOM elements
const terminalCodeInput = document.getElementById('terminal-code-input');
const terminalCodeSubmit = document.getElementById('terminal-code-submit');
const terminalError = document.getElementById('terminal-error');
const terminalCharName = document.getElementById('terminal-char-name');
const terminalRollType = document.getElementById('terminal-roll-type');
const terminalStat = document.getElementById('terminal-stat');
const terminalModifier = document.getElementById('terminal-modifier');
const terminalRollBtn = document.getElementById('terminal-roll-btn');
const terminalShipStat = document.getElementById('terminal-ship-stat');
const terminalOperatorStat = document.getElementById('terminal-operator-stat');
const terminalShipRollBtn = document.getElementById('terminal-ship-roll-btn');
const terminalMessagesPublic = document.getElementById('terminal-messages-public');
const terminalMessages = document.getElementById('terminal-messages');
const terminalMessageType = document.getElementById('terminal-message-type');
const terminalMessageInput = document.getElementById('terminal-message-input');
const terminalSendMessage = document.getElementById('terminal-send-message');
const terminalGmMessages = document.getElementById('terminal-gm-messages');
const terminalGmMessageType = document.getElementById('terminal-gm-message-type');
const terminalGmMessageInput = document.getElementById('terminal-gm-message-input');
const terminalGmSendMessage = document.getElementById('terminal-gm-send-message');
const terminalClearHistory = document.getElementById('terminal-clear-history');
const terminalGmRollDice = document.getElementById('terminal-gm-roll-dice');
const terminalGmRollModifier = document.getElementById('terminal-gm-roll-modifier');
const terminalGmRollName = document.getElementById('terminal-gm-roll-name');
const terminalGmRollNpc = document.getElementById('terminal-gm-roll-npc');
const terminalGmRollBtn = document.getElementById('terminal-gm-roll-btn');
const terminalLore = document.getElementById('terminal-lore');
const terminalLocationInfo = document.getElementById('terminal-location-info');
const terminalLocationParts = document.getElementById('terminal-location-parts');
const terminalNotableList = document.getElementById('terminal-notable-list');
const terminalAddLocationPart = document.getElementById('terminal-add-location-part');
const terminalAddNotable = document.getElementById('terminal-add-notable');
const terminalApply = document.getElementById('terminal-apply');
const terminalFeedback = document.getElementById('terminal-feedback');
const terminalGmToggle = document.getElementById('terminal-gm-toggle');
const terminalGmContent = document.getElementById('terminal-gm-content');
const terminalLockCheckbox = document.getElementById('terminal-lock-checkbox');
const terminalLockLabel = document.getElementById('terminal-lock-label');

// Rolling functions (from charsheet)
const rollDice = (numDice) => {
  const results = [];
  for (let i = 0; i < numDice; i++) {
    results.push(Math.floor(Math.random() * 6) + 1);
  }
  return results;
};

const getOutcome = (total) => {
  if (total >= 10) return "Success";
  if (total >= 7) return "Success with a Catch";
  return "Failure";
};

const parseStatValue = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const str = value.toString().trim();
  if (str === "+1" || str === "1") return 1;
  if (str === "+2" || str === "2") return 2;
  if (str === "-1") return -1;
  if (str === "0" || str === "+0") return 0;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 0 : parsed;
};

const calculateOperatorEdge = (characterStatValue) => {
  const stat = parseStatValue(characterStatValue);
  if (stat >= 2) return 1;
  if (stat >= 0) return 0;
  return -1;
};

// Terminal state management
const switchTerminalState = (state) => {
  document.querySelectorAll('.terminal-state').forEach(el => {
    el.classList.add('hidden');
  });
  const targetState = document.querySelector(`.terminal-state[data-state="${state}"]`);
  if (targetState) {
    targetState.classList.remove('hidden');
  }
};

const showTerminalError = (message) => {
  terminalError.textContent = message;
  setTimeout(() => {
    terminalError.textContent = '';
  }, 3000);
};

// Code validation
const validateCode = async (code) => {
  try {
    const response = await fetch('api.php?action=validate_code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase() })
    });

    const data = await response.json();

    // Check if system is locked for character users
    if (!response.ok) {
      if (data.locked) {
        showTerminalError('SYSTEM LOCKED - MAINTENANCE MODE');
      } else {
        showTerminalError('ACCESS DENIED - INVALID CODE');
      }
      return;
    }

    terminalState.code = code.toUpperCase();

    if (data.type === 'gm') {
      terminalState.mode = 'gm';
      await loadGMInterface();
      switchTerminalState('gm');
    } else if (data.type === 'character') {
      terminalState.mode = 'character';
      terminalState.characterData = data.character;
      terminalState.shipData = data.ship;
      await loadCharacterInterface(data.characterName, data.ship);
      switchTerminalState('character');
    }
  } catch (error) {
    showTerminalError('ACCESS DENIED - INVALID CODE');
  }
};

// Character interface
const loadCharacterInterface = async (characterName, ship) => {
  terminalCharName.textContent = characterName;

  // Show/hide ship roll option based on ship availability
  if (ship && Object.keys(ship).length > 0) {
    terminalRollType.querySelector('option[value="ship"]').style.display = 'block';
  } else {
    terminalRollType.querySelector('option[value="ship"]').style.display = 'none';
    terminalRollType.value = 'character';
  }

  // Clear and load messages
  terminalMessages.innerHTML = '';
  terminalState.lastMessageTimestamp = null;
  await fetchMessages();
};

// Character rolling
const performTerminalCharacterRoll = async () => {
  const statName = terminalStat.value;
  const extraMod = parseInt(terminalModifier.value) || 0;

  const baseValue = parseStatValue(terminalState.characterData[`stats.${statName}`]);
  const modValue = parseStatValue(terminalState.characterData[`stats.${statName}Modifier`]);
  const statValue = baseValue + modValue;

  const dice = rollDice(2);
  const diceTotal = dice.reduce((sum, d) => sum + d, 0);
  const total = diceTotal + statValue + extraMod;
  const outcome = getOutcome(total);

  // Send roll as message
  await sendMessage('roll', `Rolled ${statName.toUpperCase()}`, {
    stat: statName.toUpperCase(),
    dice: dice,
    modifier: statValue + extraMod,
    total: total,
    outcome: outcome
  });
};

const performTerminalShipRoll = async () => {
  const shipStatName = terminalShipStat.value;
  const operatorStatName = terminalOperatorStat.value;

  const shipStatValue = parseStatValue(terminalState.shipData[`ship.stats.${shipStatName}`]);

  const operatorBase = parseStatValue(terminalState.characterData[`stats.${operatorStatName}`]);
  const operatorMod = parseStatValue(terminalState.characterData[`stats.${operatorStatName}Modifier`]);
  const operatorStatValue = operatorBase + operatorMod;
  const operatorEdge = calculateOperatorEdge(operatorStatValue);

  const dice = rollDice(2);
  const diceTotal = dice.reduce((sum, d) => sum + d, 0);
  const total = diceTotal + shipStatValue + operatorEdge;
  const outcome = getOutcome(total);

  // Send roll as message
  await sendMessage('roll', `Rolled ${shipStatName.toUpperCase()}`, {
    stat: shipStatName.toUpperCase(),
    operatorStat: operatorStatName.toUpperCase(),
    operatorEdge: operatorEdge,
    dice: dice,
    modifier: shipStatValue + operatorEdge,
    total: total,
    outcome: outcome
  });
};

// GM rolling
const performGMRoll = async () => {
  const numDice = parseInt(terminalGmRollDice.value) || 2;
  const modifier = parseInt(terminalGmRollModifier.value) || 0;
  const rollName = terminalGmRollName.value.trim();
  const npcName = terminalGmRollNpc.value.trim();

  const dice = rollDice(numDice);
  const diceTotal = dice.reduce((sum, d) => sum + d, 0);
  const total = diceTotal + modifier;
  const outcome = getOutcome(total);

  // Build the roll label
  let label = rollName || `${numDice}d6`;
  if (npcName) {
    label = `${npcName}: ${label}`;
  }

  // Send roll as message
  await sendMessage('roll', label, {
    rollName: rollName || null,
    npcName: npcName || null,
    numDice: numDice,
    dice: dice,
    modifier: modifier,
    total: total,
    outcome: outcome,
    isGMRoll: true
  });

  // Clear the optional fields after rolling
  terminalGmRollName.value = '';
  terminalGmRollNpc.value = '';
};

// GM interface
const loadGMInterface = async () => {
  // Collapse the edit panel by default
  terminalGmToggle.classList.remove('expanded');
  terminalGmContent.classList.remove('expanded');

  const config = await fetchJson(CONFIG_URL);

  // Set lock toggle state
  const isLocked = config.terminal?.lockedDown || false;
  terminalLockCheckbox.checked = isLocked;
  terminalLockLabel.textContent = isLocked ? 'LOCKED' : 'UNLOCKED';
  terminalLockLabel.classList.toggle('locked', isLocked);

  // Location parts
  terminalLocationParts.innerHTML = '';
  config.locationParts.forEach((part) => {
    addLocationPartEditor(terminalLocationParts, part);
  });

  // Lore
  const loreContent = await fetchText(config.loreFile);
  terminalLore.value = loreContent;

  // Location info
  const locationInfoContent = await fetchText(config.locationInfoFile);
  terminalLocationInfo.value = locationInfoContent;

  // Notable characters
  const notableData = await fetchJson(config.notableCharactersFile);
  terminalNotableList.innerHTML = '';
  notableData.characters.forEach((char) => {
    addNotableCharacterEditor(terminalNotableList, char);
  });

  // Clear and load messages
  terminalGmMessages.innerHTML = '';
  terminalState.lastMessageTimestamp = null;
  await fetchMessages();
};

const addLocationPartEditor = (container, part) => {
  const editor = document.createElement('div');
  editor.className = 'terminal-location-part-editor';

  editor.innerHTML = `
    <input type="text" class="location-part-text" value="${escapeHtml(part.text || '')}"
           placeholder="Text" style="flex: 2;" />
    <input type="text" class="location-part-color" value="${escapeHtml(part.color || '')}"
           placeholder="#hex" style="flex: 1;" />
    <button class="remove-location-part" type="button">×</button>
  `;

  editor.querySelector('.remove-location-part').addEventListener('click', () => {
    editor.remove();
  });

  container.appendChild(editor);
};

const addNotableCharacterEditor = (container, char) => {
  const editor = document.createElement('div');
  editor.className = 'terminal-notable-editor';

  editor.innerHTML = `
    <input type="text" class="notable-name" value="${escapeHtml(char.name || '')}"
           placeholder="Name" style="width: 100%; margin-bottom: 6px;" />
    <input type="text" class="notable-role" value="${escapeHtml(char.role || '')}"
           placeholder="Role" style="width: 100%; margin-bottom: 6px;" />
    <textarea class="notable-note" placeholder="Note" rows="2"
              style="width: 100%; margin-bottom: 6px;">${escapeHtml(char.note || '')}</textarea>
    <button class="remove-notable" type="button">Remove</button>
  `;

  editor.querySelector('.remove-notable').addEventListener('click', () => {
    editor.remove();
  });

  container.appendChild(editor);
};

const applyGMChanges = async () => {
  const locationParts = Array.from(document.querySelectorAll('.terminal-location-part-editor'))
    .map(editor => ({
      text: editor.querySelector('.location-part-text').value,
      color: editor.querySelector('.location-part-color').value
    }))
    .filter(part => part.text.trim());

  const notableCharacters = Array.from(document.querySelectorAll('.terminal-notable-editor'))
    .map(editor => ({
      name: editor.querySelector('.notable-name').value,
      role: editor.querySelector('.notable-role').value,
      note: editor.querySelector('.notable-note').value
    }))
    .filter(char => char.name.trim());

  const updates = {
    locationParts: locationParts,
    loreContent: terminalLore.value,
    locationInfoContent: terminalLocationInfo.value,
    notableCharacters: notableCharacters
  };

  try {
    const response = await fetch('api.php?action=gm_update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: terminalState.code,
        updates: updates
      })
    });

    if (!response.ok) throw new Error('Update failed');

    terminalFeedback.textContent = 'CHANGES APPLIED';
    terminalFeedback.style.color = 'var(--signal)';

    setTimeout(() => {
      terminalFeedback.textContent = '';
    }, 3000);

    gmEditingActive = false;
    await updateOnce();
  } catch (error) {
    terminalFeedback.textContent = 'ERROR: UPDATE FAILED';
    terminalFeedback.style.color = 'var(--alert)';
  }
};

// Logout
const terminalLogout = () => {
  terminalState.mode = 'locked';
  terminalState.code = null;
  terminalState.characterData = null;
  terminalState.shipData = null;
  terminalState.rollHistory = [];

  terminalCodeInput.value = '';
  terminalError.textContent = '';
  if (terminalMessages) terminalMessages.innerHTML = '';
  if (terminalGmMessages) terminalGmMessages.innerHTML = '';

  gmEditingActive = false;

  switchTerminalState('locked');
};

// Messaging functions
const sendMessage = async (type, text, metadata = {}) => {
  if (!terminalState.code) return;
  if (!text || !text.trim()) return;

  try {
    const response = await fetch('api.php?action=send_message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: terminalState.code,
        type: type,
        text: text,
        metadata: metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    // Clear input after sending
    if (terminalState.mode === 'character') {
      terminalMessageInput.value = '';
    } else if (terminalState.mode === 'gm') {
      terminalGmMessageInput.value = '';
    }

    // WebSocket will trigger fetchMessages() automatically
  } catch (error) {
    console.error('Send message error:', error);
    showTerminalError(error.message);
  }
};

const fetchMessages = async () => {
  try {
    const url = terminalState.lastMessageTimestamp
      ? `api.php?action=get_messages&since=${encodeURIComponent(terminalState.lastMessageTimestamp)}`
      : 'api.php?action=get_messages';

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch messages');

    const data = await response.json();
    const messages = data.messages || [];

    if (messages.length > 0) {
      messages.forEach(msg => renderMessage(msg));
      terminalState.lastMessageTimestamp = messages[messages.length - 1].timestamp;
    }
  } catch (error) {
    console.error('Fetch messages error:', error);
  }
};

const renderMessage = (message) => {
  const messageEl = document.createElement('div');
  messageEl.className = `terminal-message msg-type-${message.type}`;
  messageEl.dataset.messageId = message.id;

  let content = '';

  switch (message.type) {
    case 'say':
      content = `<span class="msg-char">${escapeHtml(message.characterName)}</span>: <span class="msg-say">"${formatMessageText(message.text)}"</span>`;
      break;

    case 'act':
      content = `<span class="msg-char">${escapeHtml(message.characterName)}</span> <span class="msg-act">${formatMessageText(message.text)}</span>`;
      break;

    case 'ooc':
      content = `<span class="msg-char">${escapeHtml(message.characterName)}</span> <span class="msg-ooc">(OOC):</span> ${formatMessageText(message.text)}`;
      break;

    case 'world':
      content = `<span class="msg-world">${formatMessageText(message.text)}</span>`;
      break;

    case 'gm':
      content = `<span class="msg-gm">GM:</span> ${formatMessageText(message.text)}`;
      break;

    case 'npc':
      const npcName = message.metadata.npcName || 'NPC';
      const npcAction = message.metadata.npcAction || 'say';
      if (npcAction === 'say') {
        content = `<span class="msg-npc">${escapeHtml(npcName)}</span>: <span class="msg-say">"${formatMessageText(message.text)}"</span>`;
      } else {
        content = `<span class="msg-npc">${escapeHtml(npcName)}</span> <span class="msg-act">${formatMessageText(message.text)}</span>`;
      }
      break;

    case 'roll':
      const dice = message.metadata.dice || [];
      const diceText = dice.map(d => `[${d}]`).join(' ');
      const modifier = message.metadata.modifier || 0;
      const modText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
      const total = message.metadata.total || 0;
      const outcome = message.metadata.outcome || 'Unknown';
      const stat = message.metadata.stat || null;
      const isGMRoll = message.metadata.isGMRoll || false;
      const rollNpcName = message.metadata.npcName || null;
      const rollName = message.metadata.rollName || null;
      const numDice = message.metadata.numDice || dice.length;

      let outcomeClass = 'outcome-success';
      if (outcome.includes('Failure')) outcomeClass = 'outcome-failure';
      else if (outcome.includes('Catch')) outcomeClass = 'outcome-partial';

      if (isGMRoll) {
        // GM roll display
        const rollerName = rollNpcName
          ? `<span class="msg-npc">${escapeHtml(rollNpcName)}</span>`
          : `<span class="msg-gm">GM</span>`;
        const rollLabel = rollName
          ? `<strong>${escapeHtml(rollName)}</strong>`
          : `<strong>${numDice}d6</strong>`;
        content = `${rollerName} rolled ${rollLabel}: ${diceText} ${modText} = <strong>${total}</strong> - <span class="${outcomeClass}">${outcome.toUpperCase()}</span>`;
      } else {
        // Character roll display
        const operatorInfo = message.metadata.operatorStat
          ? ` (Op: ${message.metadata.operatorStat} Edge: ${message.metadata.operatorEdge > 0 ? '+' : ''}${message.metadata.operatorEdge})`
          : '';
        content = `<span class="msg-char">${escapeHtml(message.characterName)}</span> rolled <strong>${stat || 'UNKNOWN'}</strong>${operatorInfo}: ${diceText} ${modText} = <strong>${total}</strong> - <span class="${outcomeClass}">${outcome.toUpperCase()}</span>`;
      }
      messageEl.classList.add('msg-roll');
      break;
  }

  messageEl.innerHTML = content;

  // Determine which containers to render to
  const containers = [];

  // Always add to public view
  if (terminalMessagesPublic) {
    containers.push(terminalMessagesPublic);
  }

  // Add to mode-specific container if logged in
  if (terminalState.mode === 'gm' && terminalGmMessages) {
    containers.push(terminalGmMessages);
  } else if (terminalState.mode === 'character' && terminalMessages) {
    containers.push(terminalMessages);
  }

  containers.forEach((container, index) => {
    // Clone element for additional containers
    const el = index === 0 ? messageEl : messageEl.cloneNode(true);
    container.appendChild(el);

    // Keep only last 100 messages
    while (container.children.length > 100) {
      container.removeChild(container.firstChild);
    }

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  });
};

const clearMessages = async () => {
  if (!confirm('Clear all message history? This cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch('api.php?action=clear_messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: terminalState.code })
    });

    if (!response.ok) throw new Error('Failed to clear messages');

    // Clear local display
    if (terminalGmMessages) terminalGmMessages.innerHTML = '';
    if (terminalMessages) terminalMessages.innerHTML = '';
    if (terminalMessagesPublic) terminalMessagesPublic.innerHTML = '';
    terminalState.lastMessageTimestamp = null;

    alert('Message history cleared');
  } catch (error) {
    console.error('Clear messages error:', error);
    alert('Failed to clear messages');
  }
};

// Event listeners
terminalCodeSubmit.addEventListener('click', () => {
  const code = terminalCodeInput.value.trim();
  if (code) validateCode(code);
});

terminalCodeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const code = terminalCodeInput.value.trim();
    if (code) validateCode(code);
  }
});

document.querySelectorAll('.terminal-logout').forEach(btn => {
  btn.addEventListener('click', terminalLogout);
});

terminalRollBtn.addEventListener('click', performTerminalCharacterRoll);
terminalShipRollBtn.addEventListener('click', performTerminalShipRoll);
terminalGmRollBtn.addEventListener('click', performGMRoll);

terminalRollType.addEventListener('change', (e) => {
  const isShip = e.target.value === 'ship';
  document.querySelector('.terminal-character-roll').classList.toggle('hidden', isShip);
  document.querySelector('.terminal-ship-roll').classList.toggle('hidden', !isShip);
});

// Message send buttons
terminalSendMessage.addEventListener('click', () => {
  const type = terminalMessageType.value;
  const text = terminalMessageInput.value.trim();
  if (text) sendMessage(type, text);
});

terminalGmSendMessage.addEventListener('click', () => {
  const type = terminalGmMessageType.value;
  const text = terminalGmMessageInput.value.trim();
  if (text) sendMessage(type, text);
});

// Message input Enter key
terminalMessageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const type = terminalMessageType.value;
    const text = terminalMessageInput.value.trim();
    if (text) sendMessage(type, text);
  }
});

terminalGmMessageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const type = terminalGmMessageType.value;
    const text = terminalGmMessageInput.value.trim();
    if (text) sendMessage(type, text);
  }
});

// Clear message history button
terminalClearHistory.addEventListener('click', clearMessages);

terminalAddLocationPart.addEventListener('click', () => {
  addLocationPartEditor(terminalLocationParts, { text: '', color: '' });
});

terminalAddNotable.addEventListener('click', () => {
  addNotableCharacterEditor(terminalNotableList, { name: '', role: '', note: '' });
});

terminalApply.addEventListener('click', applyGMChanges);

// GM lock toggle - updates immediately on change
terminalLockCheckbox.addEventListener('change', async () => {
  const isLocked = terminalLockCheckbox.checked;
  terminalLockLabel.textContent = isLocked ? 'LOCKED' : 'UNLOCKED';
  terminalLockLabel.classList.toggle('locked', isLocked);

  try {
    const response = await fetch('api.php?action=gm_update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: terminalState.code,
        updates: { lockedDown: isLocked }
      })
    });

    if (!response.ok) throw new Error('Failed to update lock status');

    terminalFeedback.textContent = isLocked ? 'SYSTEM LOCKED' : 'SYSTEM UNLOCKED';
    terminalFeedback.style.color = isLocked ? 'var(--alert)' : 'var(--signal)';
    setTimeout(() => { terminalFeedback.textContent = ''; }, 2000);
  } catch (error) {
    // Revert checkbox on error
    terminalLockCheckbox.checked = !isLocked;
    terminalLockLabel.textContent = !isLocked ? 'LOCKED' : 'UNLOCKED';
    terminalLockLabel.classList.toggle('locked', !isLocked);
    terminalFeedback.textContent = 'ERROR: LOCK UPDATE FAILED';
    terminalFeedback.style.color = 'var(--alert)';
  }
});

// GM edit panel toggle
terminalGmToggle.addEventListener('click', () => {
  terminalGmToggle.classList.toggle('expanded');
  terminalGmContent.classList.toggle('expanded');
});

// Track GM editing to pause polling
document.querySelectorAll('.terminal-gm-form input, .terminal-gm-form textarea')
  .forEach(el => {
    el.addEventListener('focus', () => {
      gmEditingActive = true;
    });
    el.addEventListener('blur', () => {
      setTimeout(() => {
        gmEditingActive = false;
      }, 2000);
    });
  });

// Character detail overlay click-to-close
const characterDetailOverlay = document.getElementById("character-detail-overlay");
if (characterDetailOverlay) {
  characterDetailOverlay.addEventListener("click", (e) => {
    if (e.target === characterDetailOverlay) {
      closeCharacterDetail();
    }
  });
}

// Escape key to close character detail
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCharacterDetail();
  }
});

updateOnce();
state.timer = setInterval(updateOnce, state.refreshMs);
