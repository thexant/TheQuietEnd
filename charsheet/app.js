const CHARACTER_STORAGE_KEY = "tqe-character-sheet";
const SHIP_STORAGE_KEY = "tqe-ship-sheet";
const CHARACTER_FILE_EXTENSION = ".tqechar";
const SHIP_FILE_EXTENSION = ".tqeship";

const form = document.getElementById("sheet-form");
const characterFields = Array.from(
  document.querySelectorAll('[data-sheet="character"] [data-field]')
);
const shipFields = Array.from(
  document.querySelectorAll('[data-sheet="ship"] [data-field]')
);
const exportButton = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const resetButton = document.getElementById("reset-btn");
const sheetToggleButton = document.getElementById("sheet-toggle-btn");
const sheetTitle = document.getElementById("sheet-title");
const sheetEyebrow = document.getElementById("sheet-eyebrow");
const sheetSubtitle = document.getElementById("sheet-subtitle");
const characterSheetView = document.querySelector('[data-sheet="character"]');
const shipSheetView = document.querySelector('[data-sheet="ship"]');
const radsInput = document.getElementById("rads");
const radsValue = document.getElementById("rads-value");
const clocksList = document.getElementById("clocks-list");
const addClockButton = document.getElementById("add-clock-btn");
const gearList = document.getElementById("gear-list");
const addGearButton = document.getElementById("add-gear-btn");
const movesList = document.getElementById("moves-list");
const addMoveButton = document.getElementById("add-move-btn");
const stressList = document.getElementById("stress-list");
const addStressButton = document.getElementById("add-stress-btn");
const contactsList = document.getElementById("contacts-list");
const addContactButton = document.getElementById("add-contact-btn");
const notesList = document.getElementById("notes-list");
const addNoteButton = document.getElementById("add-note-btn");
const modsList = document.getElementById("mods-list");
const addModButton = document.getElementById("add-mod-btn");
const debtsList = document.getElementById("debts-list");
const addDebtButton = document.getElementById("add-debt-btn");
const shipModulesList = document.getElementById("ship-modules-list");
const addShipModuleButton = document.getElementById("add-ship-module-btn");
const shipTrackInputs = Array.from(document.querySelectorAll("[data-ship-track]"));

const clockModal = document.getElementById("clock-modal");
const clockForm = document.getElementById("clock-form");
const clockNameInput = document.getElementById("clock-name");
const clockCancelButton = document.getElementById("clock-cancel");
const gearModal = document.getElementById("gear-modal");
const gearForm = document.getElementById("gear-form");
const gearNameInput = document.getElementById("gear-name");
const gearTypeInput = document.getElementById("gear-type");
const gearTagsInput = document.getElementById("gear-tags");
const gearDescriptionInput = document.getElementById("gear-description");
const gearMultipleInput = document.getElementById("gear-multiple");
const gearQuantityField = document.getElementById("gear-quantity-field");
const gearQuantityInput = document.getElementById("gear-quantity");
const gearQuantityMinusButton = document.getElementById("gear-quantity-minus");
const gearQuantityPlusButton = document.getElementById("gear-quantity-plus");
const gearCancelButton = document.getElementById("gear-cancel");
const moveModal = document.getElementById("move-modal");
const moveForm = document.getElementById("move-form");
const moveSelect = document.getElementById("move-select");
const moveNameInput = document.getElementById("move-name");
const moveDescriptionInput = document.getElementById("move-description");
const moveCancelButton = document.getElementById("move-cancel");
const stressModal = document.getElementById("stress-modal");
const stressForm = document.getElementById("stress-form");
const stressNameInput = document.getElementById("stress-name");
const stressDescriptionInput = document.getElementById("stress-description");
const stressCancelButton = document.getElementById("stress-cancel");
const contactModal = document.getElementById("contact-modal");
const contactForm = document.getElementById("contact-form");
const contactNameInput = document.getElementById("contact-name");
const contactDescriptionInput = document.getElementById("contact-description");
const contactCancelButton = document.getElementById("contact-cancel");
const noteModal = document.getElementById("note-modal");
const noteForm = document.getElementById("note-form");
const noteNameInput = document.getElementById("note-name");
const noteDescriptionInput = document.getElementById("note-description");
const noteCancelButton = document.getElementById("note-cancel");
const modModal = document.getElementById("mod-modal");
const modForm = document.getElementById("mod-form");
const modNameInput = document.getElementById("mod-name");
const modBenefitInput = document.getElementById("mod-benefit");
const modDrawbackInput = document.getElementById("mod-drawback");
const modDescriptionInput = document.getElementById("mod-description");
const modCancelButton = document.getElementById("mod-cancel");
const debtModal = document.getElementById("debt-modal");
const debtForm = document.getElementById("debt-form");
const debtWhatInput = document.getElementById("debt-what");
const debtWhoInput = document.getElementById("debt-who");
const debtCancelButton = document.getElementById("debt-cancel");
const shipModuleModal = document.getElementById("ship-module-modal");
const shipModuleForm = document.getElementById("ship-module-form");
const shipModuleNameInput = document.getElementById("ship-module-name");
const shipModuleDescriptionInput = document.getElementById(
  "ship-module-description"
);
const shipModuleCancelButton = document.getElementById("ship-module-cancel");
const removeModal = document.getElementById("remove-modal");
const removeCancelButton = document.getElementById("remove-cancel");
const removeConfirmButton = document.getElementById("remove-confirm");
const removeModalText = document.getElementById("remove-modal-text");
const statRows = Array.from(document.querySelectorAll(".stat"));
const roleSelect = document.getElementById("role");

// Dice Roller Elements
const diceRollerButton = document.getElementById("dice-roller-btn");
const diceRollerModal = document.getElementById("dice-roller-modal");
const diceRollerClose = document.getElementById("dice-roller-close");
const rollNameInput = document.getElementById("roll-name");
const characterRollSection = document.getElementById("character-roll-section");
const shipRollSection = document.getElementById("ship-roll-section");
const characterStatSelect = document.getElementById("character-stat-select");
const extraModifierInput = document.getElementById("extra-modifier");
const extraModifierField = document.getElementById("extra-modifier-field");
const toggleExtraModifierBtn = document.getElementById("toggle-extra-modifier-btn");
const extraModifierBtnText = document.getElementById("extra-modifier-btn-text");
const characterStatDisplay = document.getElementById("character-stat-display");
const characterModifierDisplay = document.getElementById("character-modifier-display");
const shipStatSelect = document.getElementById("ship-stat-select");
const operatorStatSelect = document.getElementById("operator-stat-select");
const shipStatDisplay = document.getElementById("ship-stat-display");
const operatorStatDisplay = document.getElementById("operator-stat-display");
const operatorEdgeDisplay = document.getElementById("operator-edge-display");
const shipModifierDisplay = document.getElementById("ship-modifier-display");
const rollDiceButton = document.getElementById("roll-dice-btn");
const diceDisplay = document.getElementById("dice-display");
const totalDisplay = document.getElementById("total-display");
const outcomeDisplay = document.getElementById("outcome-display");
const rollHistoryContainer = document.getElementById("roll-history");
const clearHistoryButton = document.getElementById("clear-history-btn");

const STAT_SELECT_FIELDS = new Set([
  "stats.grit",
  "stats.wits",
  "stats.tech",
  "stats.tact",
  "stats.face",
]);

const SHIP_STAT_SELECT_FIELDS = new Set([
  "ship.stats.hull",
  "ship.stats.drive",
  "ship.stats.shields",
  "ship.stats.sensors",
  "ship.stats.weapons",
]);

const CUSTOM_MOVE_VALUE = "custom";
const BASIC_MOVES = [
  {
    name: "Get Through It",
    description:
      "When you endure danger, roll +GRIT. 10+: hold steady; choose 2. 7-9: choose 1 and GM chooses 1. Choices: avoid harm, keep gear intact, do not lose time, do not gain RADS.",
  },
  {
    name: "Read the Situation",
    description:
      "Roll +WITS. Ask 2 (10+) or 1 (7-9): What's the real threat here? What's about to fail? Who has leverage? What's being hidden/missing? What's my best way in/out?",
  },
  {
    name: "Do the Fix",
    description:
      "Roll +TECH. On a hit, stabilize a system or repair something. 10+: also clear Strained or regain +1 PARTS. 7-9: it works but costs time, Parts, or creates a new flaw.",
  },
  {
    name: "Put Pressure On",
    description:
      "Roll +TACT. On a hit, you gain advantage in a standoff/fight. 10+: pick 2. 7-9: pick 1. Options: disarm, take position, force retreat, protect someone, capture.",
  },
  {
    name: "Make the Deal",
    description:
      "Roll +FACE. 10+: favorable terms + useful info. 7-9: fair terms or good info (pick one). 6-: you still get something, but you owe, get tagged, or Heat spikes.",
  },
];
const ROLE_MOVES = {
  Navigator: [
    {
      name: "Sense the Sour",
      description:
        "When you Read the Situation about a route, gate, or Corridor, on a hit ask +1 extra question. On a 10+, also gain +1 DATA.",
    },
    {
      name: "Stitch the Window",
      description:
        "Once per Corridor Run, you may turn a 7-9 on Run a Gated Corridor into a 10+. If you do, mark Exhausted or tick Ship System Strain +1.",
    },
    {
      name: "Dead Reckoning",
      description:
        "When you Realign the Gate Window, on a 10+ you may also reduce Corridor Instability by 1 segment (if it makes sense).",
    },
    {
      name: "Starblind",
      description:
        "When sensors fail (fog/EMI), you can still navigate. When the crew would lose time from blindness, reduce that cost (GM turns \"lose time\" into a different cost).",
    },
    {
      name: "Misexit Expert",
      description:
        "When you exit the wrong side of a system, you can declare you know a shortcut. Roll +WITS: 10+ you save a day; 7-9 you save hours but spend 1 FUEL or take 1 Heat.",
    },
  ],
  Engineer: [
    {
      name: "Jury-Rig Miracle",
      description:
        "When you Do the Fix without Parts, you can still make it work. On a hit, it works but the system gains a hidden flaw (GM clocks it) and Ship System Strain ticks +1.",
    },
    {
      name: "Hard Reset",
      description:
        "When you take a quiet moment to rebuild a failing subsystem, spend 1 PARTS to clear Strained on one ship system without a roll.",
    },
    {
      name: "Overbuild",
      description:
        "When you Patch the Hull, on a 10+ also choose one: regain +1 PARTS (from salvage/scrap) or reduce future hull-related complications on this job.",
    },
    {
      name: "EM-Hardened Instinct",
      description:
        "When Static Fog hits, you and your gear ignore the first \"systems go blind\" consequence (you still feel it, just not as badly).",
    },
    {
      name: "Spare the Good Stuff",
      description:
        "When a result would cost Parts, you may instead cost time. Tick Corridor Instability +1 (window tightens) or take +1 Heat, your choice.",
    },
  ],
  Medic: [
    {
      name: "Stitch & Stabilize",
      description:
        "When you treat someone in the field, roll +TECH. 10+: clear a Condition or downgrade a Wound to a Condition. 7-9: you do it, but spend a charge (Limited) or take time.",
    },
    {
      name: "Rad Protocols",
      description:
        "When you run decon or enforce shielding discipline, you can reduce RADS gain: the first time each session someone would gain RADS from travel/exposure, reduce it by 1 (min 0).",
    },
    {
      name: "Quarantine Voice",
      description:
        "When you Put Pressure On to make people follow safety procedure, roll +FACE instead of +TACT.",
    },
    {
      name: "Know What's Wrong",
      description:
        "When you Read the Situation about illness/contamination, on a hit ask +1 extra question and the GM must answer truthfully.",
    },
    {
      name: "Pain Management",
      description:
        "When someone would be taken out of a scene by Wounds, you can keep them in for a little longer. They stay, but take Exhausted and you start a 4-clock: Crash.",
    },
  ],
  Quartermaster: [
    {
      name: "Balance the Books",
      description:
        "Once per phase, you may convert one ship resource into another (1-for-1) if it makes sense in the fiction (trade/salvage/favors). The GM adds a string: +1 Heat, a debt, or a rumor complication.",
    },
    {
      name: "Drone Wrangler",
      description:
        "When you use drones to scout/salvage/repair, roll +TECH. 10+: gain +1 PARTS or +1 DATA and avoid danger. 7-9: gain it, but the drone is damaged, lost, or brings trouble back.",
    },
    {
      name: "Ghost Manifest",
      description:
        "When you try to move restricted cargo or fake paperwork, roll +FACE. 10+: it passes. 7-9: it passes but costs (Heat, a bribe, or you owe someone). 6-: it passes and gets noticed later (start a clock).",
    },
    {
      name: "Stockpiler",
      description:
        "When you Scavenge the Dead, on a hit gain +1 extra resource (your pick) but it's tagged: Contaminated or Illegal (GM chooses).",
    },
    {
      name: "Knows Everyone",
      description:
        "When you Make a Contact, on a 7-9 you may take the \"solid\" result anyway, but the contact also has a personal demand.",
    },
  ],
  Captain: [
    {
      name: "Call the Shot",
      description:
        "When you give an order that's actionable, roll +FACE. 10+: an ally takes +1 forward and avoids a cost. 7-9: +1 forward, but you take Heat or the ship takes Strain.",
    },
    {
      name: "Hold the Line",
      description:
        "When panic, mutiny, or despair hits, roll +GRIT. 10+: everyone steadies; clear Shaken on one person. 7-9: it holds, but you owe someone or sacrifice a resource.",
    },
    {
      name: "The Offer",
      description:
        "When you Make the Deal, on a 10+ you also choose one: reduce Heat by 1, gain +1 DATA, or secure a future favor.",
    },
    {
      name: "We Don't Leave People",
      description:
        "When you choose to rescue instead of profit, mark XP and take +1 ongoing to related rolls for the rest of the job. The GM will absolutely make it cost you.",
    },
    {
      name: "Bad Reputation",
      description:
        "When you enter a place where your name matters, declare what they've heard about you. Take +1 forward when acting in line with that reputation, but the GM gets a free complication.",
    },
  ],
  "Security Officer": [
    {
      name: "Boarding Protocol",
      description:
        "When you Put Pressure On during a boarding/raid/inspection, on a hit you also choose 1: hold them at range, protect a system from damage, or prevent a hostage situation.",
    },
    {
      name: "Clear the Passage",
      description:
        "When you force a route through danger (crowd, riot, tight corridor, zero-G), roll +TACT. 10+: you get through cleanly. 7-9: you get through but someone takes a Condition or you leave something behind.",
    },
    {
      name: "Rules of Engagement",
      description:
        "Once per scene you can reduce physical harm to you or an ally by 1. If you do, either mark Exhausted or tick HEAT +1 (it was loud or visible).",
    },
    {
      name: "Security Sweep",
      description:
        "When you arrive somewhere, you may immediately Read the Situation about threats here without rolling. The GM still answers, but also introduces a \"security complication\" you've noticed.",
    },
    {
      name: "Intimidation Is a Tool",
      description:
        "When you Make the Deal by threat instead of charm, roll +TACT instead of +FACE.",
    },
  ],
  Broker: [
    {
      name: "I Know a Person",
      description:
        "Once per Location Phase, declare a plausible contact here. Roll +FACE. On a 10+: they're available and helpful. 7-9: helpful, but they want payment now or they're trouble-adjacent.",
    },
    {
      name: "Cutouts",
      description:
        "When you would gain Heat from a deal, you can route it through someone else. Reduce Heat by 1, but start a 4-clock: Loose End. When the clock fills, the next heat level gained is directed to you/the party and +1 if from the same source.",
    },
    {
      name: "Dirty Luxury",
      description:
        "When you Indulge, on a hit you may also reduce HEAT by 1 or gain +1 DATA (your choice). On a 7-9, you also pick up a small debt.",
    },
    {
      name: "Paper Shield",
      description:
        "When authorities inspect you, roll +FACE. On a 10+: they pass you through. 7-9: they pass you through, but take a resource (SUPPLY/PARTS/DATA) or give you a condition: Compromised.",
    },
    {
      name: "Side Deal",
      description:
        "Once per Job, when someone else makes a deal, you can \"improve the terms.\" Roll +FACE. On a hit, add a benefit. On a 7-9, also add a hidden complication (GM starts a clock).",
    },
  ],
  Reclaimer: [
    {
      name: "Salvage Instinct",
      description:
        "When you Scavenge the Dead, on a hit gain +1 extra resource. If you take the bonus, the GM tags it Contaminated or Illegal.",
    },
    {
      name: "Bloom Sense",
      description:
        "When Vacuum Bloom is present, you always get a warning sign before it becomes lethal. The first Bloom consequence each session is reduced in severity.",
    },
    {
      name: "Zero-G Ghost",
      description:
        "When moving through derelicts/void, roll +WITS instead of +GRIT to Get Through It.",
    },
    {
      name: "Strip It Clean",
      description:
        "During Docks, you may convert 1 cargo/derelict access into +2 PARTS. If you do, tick Ship System Strain +1 (you pushed tools/crew too hard) or HEAT +1 (someone noticed).",
    },
    {
      name: "Black Box Recovery",
      description:
        "When you recover logs/records from a wreck, gain +1 DATA and ask the GM one direct question about what happened here. On a 7-9, the answer is true but incomplete.",
    },
  ],
  Cipher: [
    {
      name: "Chain of Custody",
      description:
        "When you gain DATA from salvage, rumors, or a contact, you may immediately roll +WITS to verify it. 10+: it's clean and also reduce Rumor Warp by 1 segment (if relevant). 7-9: it's mostly true, but pick 1: late, partial, or planted. 6-: it's compromised; GM starts a clock tied to who wants you misled.",
    },
    {
      name: "Black Box Forensics",
      description:
        "When you recover logs from a wreck/site, gain +1 DATA and ask the GM one direct question about what happened here. On a 7-9, the answer is true but creates a new problem (quarantine flag, Heat, contamination risk, or a pursuer clock).",
    },
    {
      name: "Spoof & Scrub",
      description:
        "When you try to avoid being tracked (IDs, transponders, docking logs), roll +TECH. 10+: reduce HEAT by 2 or prevent it from increasing this scene. 7-9: reduce HEAT by 1, but spend 1 DATA or 1 PARTS. 6-: it \"works\" and leaves a signature (start a 4-clock: Trace).",
    },
    {
      name: "Signal Ghost",
      description:
        "When systems go blind (Static Fog / EMI / sensor crash), you can keep one channel alive. Choose one: Comms, Sensors, or Nav telemetry. The crew avoids the first complication tied to that channel this session.",
    },
    {
      name: "Information Warfare",
      description:
        "When you deliberately spread or suppress a story to shape a situation, roll +WITS (planning) or +FACE (performance). 10+: pick 2. 7-9: pick 1. Options: create a distraction, sour a rival's deal, draw someone out, reduce Heat by 1, gain +1 DATA.",
    },
  ],
  Civilian: [
    {
      name: "Seen it All",
      description:
        "When you Read the Situation in a lived-in environment (stations, colonies, outposts), on a hit ask +1 extra question. On a 10+, you also spot a shortcut or a hiding hole: take +1 forward to Get Through It if you use it immediately.",
    },
    {
      name: "Practical Scrounger",
      description:
        "When you Scavenge the Dead or search a location for supplies, you can roll +WITS instead of +SENSORS. On a 7-9, you may choose to take a \"small but clean\" find: gain +1 resource but do not choose a cost.",
    },
    {
      name: "One of the Crowd",
      description:
        "When you Keep It Quiet by blending into a group of people rather than using ship systems, roll +FACE. On a 10+, reduce HEAT by 2. On a 7-9, reduce HEAT by 1, but you overhear a rumor that makes you Shaken.",
    },
    {
      name: "Makeshift Comforts",
      description:
        "During the Docks Phase, if you spend your action to improve the crew's living conditions, clear a Condition (other than Injured or Contaminated) from yourself and one ally.",
    },
    {
      name: "I'm Just a Passenger",
      description:
        "When you Make the Deal by appearing harmless or unimportant, on a hit you can choose to avoid any Heat spikes, even on a 7-9.",
    },
  ],
  Laborer: [
    {
      name: "Hardened Lungs",
      description:
        "You have spent years in poorly filtered environments. When you take the Exposed or Contaminated condition from bad air or fumes, you may roll +GRIT to ignore it. On a 10+, you ignore it completely; on a 7-9, ignore it but take the Exhausted condition instead.",
    },
    {
      name: "Good Enough Fix",
      description:
        "When you Do the Fix using whatever is at hand, you do not need to spend PARTS. On a hit, the repair holds, but the system gains the Strained tag immediately.",
    },
    {
      name: "Union Handshake",
      description:
        "When you Work the Crowd in industrial areas or docks, roll +GRIT instead of +FACE. On a hit, you can always ask \"Who is the real authority here?\" for free.",
    },
    {
      name: "Brute Resilience",
      description:
        "When you Get Through It to protect the ship or an ally from physical harm, you can choose to take a Condition yourself to give the ally a 10+ result automatically.",
    },
    {
      name: "Scrap-Sense",
      description:
        "When you Scavenge the Dead, on a 7-9 you may choose to find 1 extra PARTS instead of taking a cost, but you must mark Exhausted.",
    },
  ],
};

let clocks = [];
let gearItems = [];
let moves = [];
let stressEntries = [];
let contacts = [];
let notes = [];
let mods = [];
let debts = [];
let shipModules = [];
let pendingRemoveId = null;
let lastFocusedElement = null;
let activeSheet = "character";
let rollHistory = [];

const SHEET_COPY = {
  character: {
    title: "Character Sheet",
    eyebrow: "Character Sheet",
    subtitle: "Fill, save, export, and reload your character anywhere.",
  },
  ship: {
    title: "Ship Sheet",
    eyebrow: "Ship Sheet",
    subtitle: "Track ship stats, resources, systems, and modules.",
  },
};

const updateRadsDisplay = () => {
  if (!radsInput || !radsValue) return;
  radsValue.textContent = radsInput.value;
};

const updateShipTrackDisplay = (input) => {
  if (!input) return;
  const valueEl = document.querySelector(
    `[data-track-value-for="${input.id}"]`
  );
  if (valueEl) {
    valueEl.textContent = input.value;
  }
};

const updateShipTracksDisplay = () => {
  shipTrackInputs.forEach((input) => updateShipTrackDisplay(input));
};

const updateSheetView = () => {
  const copy = SHEET_COPY[activeSheet] || SHEET_COPY.character;
  if (characterSheetView) {
    characterSheetView.classList.toggle("is-hidden", activeSheet !== "character");
  }
  if (shipSheetView) {
    shipSheetView.classList.toggle("is-hidden", activeSheet !== "ship");
  }
  if (sheetToggleButton) {
    sheetToggleButton.textContent = activeSheet === "ship" ? "Character" : "Ship";
  }
  if (sheetTitle) sheetTitle.textContent = copy.title;
  if (sheetEyebrow) sheetEyebrow.textContent = copy.eyebrow;
  if (sheetSubtitle) sheetSubtitle.textContent = copy.subtitle;
  document.title = `The Quiet End - ${copy.title}`;
};

const setActiveSheet = (sheet) => {
  if (!sheet || sheet === activeSheet) return;
  activeSheet = sheet;
  updateSheetView();
};

const resetFields = (list) => {
  list.forEach((field) => {
    if (field.type === "checkbox" || field.type === "radio") {
      field.checked = field.defaultChecked;
      return;
    }
    field.value = field.defaultValue;
  });
};

const saveTimers = {
  character: null,
  ship: null,
};
const SAVE_DEBOUNCE_MS = 700;
const scheduleSave = (sheetType = activeSheet) => {
  const targetSheet = sheetType === "ship" ? "ship" : "character";
  if (saveTimers[targetSheet]) {
    clearTimeout(saveTimers[targetSheet]);
  }
  saveTimers[targetSheet] = setTimeout(() => {
    saveTimers[targetSheet] = null;
    const run = () => {
      saveToStorage(targetSheet);
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 700 });
    } else {
      setTimeout(run, 200);
    }
  }, SAVE_DEBOUNCE_MS);
};

const createClockId = () =>
  `clock-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const createEntryId = () =>
  `entry-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeMoveKey = (value) => normalizeText(value).toLowerCase();
const isBasicMoveName = (name) =>
  BASIC_MOVES.some(
    (move) => normalizeMoveKey(move.name) === normalizeMoveKey(name)
  );

const getRoleMoves = (role) => ROLE_MOVES[role] || [];

const getRoleMoveByName = (role, name) =>
  getRoleMoves(role).find((move) => move.name === name);

const ensureBaseMovesApplied = () => {
  const existing = new Set(moves.map((move) => normalizeMoveKey(move.name)));
  let added = false;
  BASIC_MOVES.forEach((move) => {
    if (existing.has(normalizeMoveKey(move.name))) return;
    moves.push({
      id: createEntryId(),
      name: move.name,
      description: move.description,
      isBase: true,
    });
    added = true;
  });

  if (added) {
    renderMoves();
    scheduleSave();
  }
};

const updateMoveFields = () => {
  if (!moveSelect || !moveNameInput || !moveDescriptionInput) return;
  const selected = moveSelect.value;
  const role = roleSelect ? roleSelect.value : "";

  if (selected === CUSTOM_MOVE_VALUE) {
    moveNameInput.readOnly = false;
    moveDescriptionInput.readOnly = false;
    moveNameInput.value = "";
    moveDescriptionInput.value = "";
    return;
  }

  const move = getRoleMoveByName(role, selected);
  moveNameInput.readOnly = true;
  moveDescriptionInput.readOnly = true;
  moveNameInput.value = move ? move.name : "";
  moveDescriptionInput.value = move ? move.description : "";
};

const updateMoveOptions = () => {
  if (!moveSelect) return;
  const role = roleSelect ? roleSelect.value : "";
  const roleMoves = getRoleMoves(role);
  moveSelect.innerHTML = "";

  if (!roleMoves.length) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = role
      ? "No moves available for this role"
      : "Select a role to load moves";
    placeholder.disabled = true;
    placeholder.selected = true;
    moveSelect.appendChild(placeholder);
  } else {
    roleMoves.forEach((move, index) => {
      const option = document.createElement("option");
      option.value = move.name;
      option.textContent = move.name;
      if (index === 0) {
        option.selected = true;
      }
      moveSelect.appendChild(option);
    });
  }

  const customOption = document.createElement("option");
  customOption.value = CUSTOM_MOVE_VALUE;
  customOption.textContent = "Custom move...";
  moveSelect.appendChild(customOption);
  updateMoveFields();
};

const initializeStatModifiers = () => {
  statRows.forEach((row) => {
    const toggle = row.querySelector(".stat-mod-toggle");
    const field = row.querySelector(".stat-mod-field");
    const input = row.querySelector(".stat-mod-input");
    if (!toggle || !field || !input) return;

    const syncVisibility = () => {
      const hasValue = input.value.trim() !== "";
      field.classList.toggle("is-open", hasValue || field.classList.contains("is-open"));
    };

    const openField = () => {
      field.classList.add("is-open");
      input.focus();
      input.select();
    };

    const closeField = () => {
      if (input.value.trim() === "") {
        field.classList.remove("is-open");
      }
    };

    toggle.addEventListener("click", () => {
      if (field.classList.contains("is-open")) {
        closeField();
      } else {
        openField();
      }
    });

    input.addEventListener("blur", () => {
      closeField();
    });

    input.addEventListener("input", () => {
      syncVisibility();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        closeField();
        toggle.focus();
      }
    });

    syncVisibility();
  });
};

const normalizeStatSelectValue = (value) => {
  if (value === null || value === undefined) return "0";
  const raw = value.toString().trim();
  if (!raw) return "0";
  if (raw === "-1" || raw === "0" || raw === "+1" || raw === "+2") {
    return raw;
  }
  if (raw === "1") return "+1";
  if (raw === "2") return "+2";
  return raw;
};

const normalizeGearItem = (item) => {
  const name = normalizeText(item && item.name);
  const tags = normalizeText(item && item.tags);
  const description = normalizeText(item && item.description);
  const allowedTypes = ["weapon", "armor", "item"];
  const type = allowedTypes.includes(item && item.type) ? item.type : "item";
  const quantity = clampQuantityValue(item && item.quantity);
  const multiple = Boolean(item && item.multiple) || quantity > 1;

  return {
    id: typeof item.id === "string" && item.id ? item.id : createEntryId(),
    name,
    type,
    tags,
    description,
    multiple,
    quantity: multiple ? quantity : 1,
  };
};

const normalizeNamedEntry = (item) => {
  const name = normalizeText(item && item.name);
  const description = normalizeText(item && item.description);
  return {
    id: typeof item.id === "string" && item.id ? item.id : createEntryId(),
    name,
    description,
  };
};

const normalizeMoveEntry = (item) => {
  const name = normalizeText(item && item.name);
  const description = normalizeText(item && item.description);
  return {
    id: typeof item.id === "string" && item.id ? item.id : createEntryId(),
    name,
    description,
    isBase: Boolean(item && item.isBase) || isBasicMoveName(name),
  };
};

const normalizeModEntry = (item) => {
  const name = normalizeText(item && item.name);
  const benefit = normalizeText(item && item.benefit);
  const drawback = normalizeText(item && item.drawback);
  const description = normalizeText(item && item.description);
  return {
    id: typeof item.id === "string" && item.id ? item.id : createEntryId(),
    name,
    benefit,
    drawback,
    description,
  };
};

const normalizeDebtEntry = (item) => {
  const what = normalizeText(item && item.what);
  const who = normalizeText(item && item.who);
  return {
    id: typeof item.id === "string" && item.id ? item.id : createEntryId(),
    what,
    who,
  };
};

const normalizeShipModuleEntry = (item) => {
  const name = normalizeText(item && item.name);
  const description = normalizeText(item && item.description);
  return {
    id: typeof item.id === "string" && item.id ? item.id : createEntryId(),
    name,
    description,
  };
};

const normalizeClock = (clock) => {
  const segments = [4, 6, 8].includes(Number(clock.segments))
    ? Number(clock.segments)
    : 4;
  const name = typeof clock.name === "string" ? clock.name.trim() : "";
  const checks = Array.from({ length: segments }, (_, index) =>
    Boolean(clock.checks && clock.checks[index])
  );

  return {
    id: typeof clock.id === "string" && clock.id ? clock.id : createClockId(),
    name: name || "Clock",
    segments,
    checks,
  };
};

const setClocks = (list) => {
  clocks = Array.isArray(list) ? list.map(normalizeClock) : [];
  renderClocks();
};

const setGearItems = (list) => {
  gearItems = Array.isArray(list) ? list.map(normalizeGearItem) : [];
  renderGearItems();
};

const setMoves = (list) => {
  moves = Array.isArray(list) ? list.map(normalizeMoveEntry) : [];
  renderMoves();
};

const setStressEntries = (list) => {
  stressEntries = Array.isArray(list) ? list.map(normalizeNamedEntry) : [];
  renderStress();
};

const setContacts = (list) => {
  contacts = Array.isArray(list) ? list.map(normalizeNamedEntry) : [];
  renderContacts();
};

const setNotes = (list) => {
  notes = Array.isArray(list) ? list.map(normalizeNamedEntry) : [];
  renderNotes();
};

const setMods = (list) => {
  mods = Array.isArray(list) ? list.map(normalizeModEntry) : [];
  renderMods();
};

const setDebts = (list) => {
  debts = Array.isArray(list) ? list.map(normalizeDebtEntry) : [];
  renderDebts();
};

const setShipModules = (list) => {
  shipModules = Array.isArray(list)
    ? list.map(normalizeShipModuleEntry)
    : [];
  renderShipModules();
};

const createField = (labelText, input) => {
  const field = document.createElement("div");
  field.className = "field";
  const label = document.createElement("label");
  label.textContent = labelText;
  if (input.id) {
    label.setAttribute("for", input.id);
  }
  field.appendChild(label);
  field.appendChild(input);
  return field;
};

const createEmptyState = (message) => {
  const empty = document.createElement("p");
  empty.className = "entry-empty";
  empty.textContent = message;
  return empty;
};

const clampQuantityValue = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 1;
  return Math.max(1, parsed);
};

const bindQuantityControls = (input, minusButton, plusButton, onCommit) => {
  if (!input) return () => {};
  const readValue = () => {
    if (Number.isFinite(input.valueAsNumber)) {
      return input.valueAsNumber;
    }
    return input.value;
  };
  const commit = (value) => {
    const nextValue = clampQuantityValue(value);
    input.value = String(nextValue);
    if (onCommit) {
      onCommit(nextValue);
    }
  };

  input.addEventListener("input", () => commit(readValue()));
  input.addEventListener("change", () => commit(readValue()));
  input.addEventListener("blur", () => commit(readValue()));

  if (minusButton) {
    minusButton.addEventListener("click", (event) => {
      event.preventDefault();
      commit(readValue() - 1);
    });
  }

  if (plusButton) {
    plusButton.addEventListener("click", (event) => {
      event.preventDefault();
      commit(readValue() + 1);
    });
  }

  return commit;
};

const serialize = () => {
  const data = {};
  characterFields.forEach((field) => {
    const key = field.dataset.field;
    if (!key) return;

    if (field.type === "checkbox") {
      data[key] = field.checked;
      return;
    }

    data[key] = field.value;
  });

  data["clocks.list"] = clocks.map((clock) => ({
    id: clock.id,
    name: clock.name,
    segments: clock.segments,
    checks: clock.checks.slice(),
  }));
  data["gear.items"] = gearItems.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    tags: item.tags,
    description: item.description,
    multiple: item.multiple,
    quantity: item.quantity,
  }));
  data["abilities.moves"] = moves.map((move) => ({
    id: move.id,
    name: move.name,
    description: move.description,
    isBase: Boolean(move.isBase),
  }));
  data["abilities.stress"] = stressEntries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    description: entry.description,
  }));
  data["notes.contacts"] = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
    description: contact.description,
  }));
  data["notes.general"] = notes.map((note) => ({
    id: note.id,
    name: note.name,
    description: note.description,
  }));
  data["mods.items"] = mods.map((mod) => ({
    id: mod.id,
    name: mod.name,
    benefit: mod.benefit,
    drawback: mod.drawback,
    description: mod.description,
  }));
  data["debts.list"] = debts.map((debt) => ({
    id: debt.id,
    what: debt.what,
    who: debt.who,
  }));

  return data;
};

const serializeShip = () => {
  const data = {};
  shipFields.forEach((field) => {
    const key = field.dataset.field;
    if (!key) return;

    if (field.type === "checkbox") {
      data[key] = field.checked;
      return;
    }

    data[key] = field.value;
  });

  data["ship.modules"] = shipModules.map((module) => ({
    id: module.id,
    name: module.name,
    description: module.description,
  }));

  return data;
};

const applyData = (data) => {
  characterFields.forEach((field) => {
    const key = field.dataset.field;
    if (!key || !(key in data)) return;

    if (field.type === "checkbox") {
      field.checked = Boolean(data[key]);
      return;
    }

    if (SHIP_STAT_SELECT_FIELDS.has(key)) {
      field.value = normalizeStatSelectValue(data[key]);
      return;
    }

    field.value = data[key];
  });

  setClocks(data["clocks.list"]);
  if (Array.isArray(data["gear.items"])) {
    setGearItems(data["gear.items"]);
  } else {
    const legacyGear = [];
    const weaponsText = normalizeText(data["gear.weapons"]);
    if (weaponsText) {
      legacyGear.push({
        id: createEntryId(),
        name: "Imported weapons",
        type: "weapon",
        tags: "",
        description: weaponsText,
      });
    }
    const equipmentText = normalizeText(data["gear.equipment"]);
    if (equipmentText) {
      legacyGear.push({
        id: createEntryId(),
        name: "Imported equipment",
        type: "item",
        tags: "",
        description: equipmentText,
      });
    }
    setGearItems(legacyGear);
  }

  if (Array.isArray(data["abilities.moves"])) {
    setMoves(data["abilities.moves"]);
  } else {
    const movesText = normalizeText(data["abilities.moves"]);
    setMoves(
      movesText
        ? [
            {
              id: createEntryId(),
              name: "Imported",
              description: movesText,
            },
          ]
        : []
    );
  }

  if (Array.isArray(data["abilities.stress"])) {
    setStressEntries(data["abilities.stress"]);
  } else {
    const stressText = normalizeText(data["abilities.stress"]);
    setStressEntries(
      stressText
        ? [
            {
              id: createEntryId(),
              name: "Imported",
              description: stressText,
            },
          ]
        : []
    );
  }

  if (Array.isArray(data["notes.contacts"])) {
    setContacts(data["notes.contacts"]);
  } else {
    const contactsText = normalizeText(data["notes.contacts"]);
    setContacts(
      contactsText
        ? [
            {
              id: createEntryId(),
              name: "Imported",
              description: contactsText,
            },
          ]
        : []
    );
  }

  if (Array.isArray(data["notes.general"])) {
    setNotes(data["notes.general"]);
  } else {
    const notesText = normalizeText(data["notes.general"]);
    setNotes(
      notesText
        ? [
            {
              id: createEntryId(),
              name: "Imported",
              description: notesText,
            },
          ]
        : []
    );
  }
  if (Array.isArray(data["mods.items"])) {
    setMods(data["mods.items"]);
  } else {
    setMods([]);
  }

  if (Array.isArray(data["debts.list"])) {
    setDebts(data["debts.list"]);
  } else {
    setDebts([]);
  }
  ensureBaseMovesApplied();
  updateMoveOptions();
  updateRadsDisplay();
};

const applyShipData = (data) => {
  shipFields.forEach((field) => {
    const key = field.dataset.field;
    if (!key || !(key in data)) return;

    if (field.type === "checkbox") {
      field.checked = Boolean(data[key]);
      return;
    }

    if (STAT_SELECT_FIELDS.has(key)) {
      field.value = normalizeStatSelectValue(data[key]);
      return;
    }

    field.value = data[key];
  });

  if (Array.isArray(data["ship.modules"])) {
    setShipModules(data["ship.modules"]);
  } else {
    setShipModules([]);
  }
  updateShipTracksDisplay();
};

const saveToStorage = (sheetType = activeSheet) => {
  const targetSheet = sheetType === "ship" ? "ship" : "character";
  const key =
    targetSheet === "ship" ? SHIP_STORAGE_KEY : CHARACTER_STORAGE_KEY;
  try {
    const data = targetSheet === "ship" ? serializeShip() : serialize();
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Unable to save sheet", error);
  }
};

const loadFromStorage = (sheetType) => {
  const targetSheet = sheetType === "ship" ? "ship" : "character";
  const key =
    targetSheet === "ship" ? SHIP_STORAGE_KEY : CHARACTER_STORAGE_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (targetSheet === "ship") {
      applyShipData(data);
    } else {
      applyData(data);
    }
  } catch (error) {
    console.error("Unable to load sheet", error);
  }
};

const resetSheet = (sheetType = activeSheet) => {
  if (!confirm("Start a new sheet? This clears the current one.")) return;
  const targetSheet = sheetType === "ship" ? "ship" : "character";

  if (targetSheet === "ship") {
    resetFields(shipFields);
    setShipModules([]);
    updateShipTracksDisplay();
    localStorage.removeItem(SHIP_STORAGE_KEY);
    return;
  }

  resetFields(characterFields);
  setClocks([]);
  setGearItems([]);
  setMoves([]);
  setStressEntries([]);
  setContacts([]);
  setNotes([]);
  setMods([]);
  setDebts([]);
  ensureBaseMovesApplied();
  updateMoveOptions();
  updateRadsDisplay();
  localStorage.removeItem(CHARACTER_STORAGE_KEY);
};

const exportSheet = (sheetType = activeSheet) => {
  const targetSheet = sheetType === "ship" ? "ship" : "character";
  const data = targetSheet === "ship" ? serializeShip() : serialize();
  const fileExtension =
    targetSheet === "ship" ? SHIP_FILE_EXTENSION : CHARACTER_FILE_EXTENSION;
  const filename =
    targetSheet === "ship"
      ? `tqe-ship${fileExtension}`
      : `tqe-${(data["identity.name"] || "character")
          .toString()
          .trim()
          .replace(/[^a-z0-9-_]+/gi, "-")
          .toLowerCase()}${fileExtension}`;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const importSheet = (file, sheetType = activeSheet) => {
  const filename = file?.name?.toLowerCase() || "";
  const targetSheet = filename.endsWith(CHARACTER_FILE_EXTENSION)
    ? "character"
    : filename.endsWith(SHIP_FILE_EXTENSION)
      ? "ship"
      : sheetType === "ship"
        ? "ship"
        : "character";
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (targetSheet === "ship") {
        applyShipData(data);
      } else {
        applyData(data);
      }
      saveToStorage(targetSheet);
    } catch (error) {
      alert("Could not read that JSON file.");
      console.error("Invalid JSON", error);
    }
  };
  reader.readAsText(file);
};

const openModal = (modal) => {
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
};

const openFormModal = (modal, form, focusEl) => {
  if (!modal || !form) return;
  form.reset();
  openModal(modal);
  if (focusEl) {
    setTimeout(() => focusEl.focus(), 0);
  }
};

const openAddClockModal = () => {
  if (!clockModal || !clockForm) return;
  clockForm.reset();
  openModal(clockModal);
  if (clockNameInput) {
    setTimeout(() => clockNameInput.focus(), 0);
  }
};

const openAddGearModal = () => {
  if (!gearModal || !gearForm) return;
  gearForm.reset();
  if (gearQuantityInput) {
    gearQuantityInput.value = "1";
  }
  if (gearMultipleInput) {
    gearMultipleInput.checked = false;
  }
  if (gearQuantityField) {
    gearQuantityField.classList.add("is-hidden");
  }
  openModal(gearModal);
  if (gearNameInput) {
    setTimeout(() => gearNameInput.focus(), 0);
  }
};

const openAddMoveModal = () => {
  if (!moveModal || !moveForm) return;
  moveForm.reset();
  updateMoveOptions();
  openModal(moveModal);
  if (moveSelect) {
    setTimeout(() => moveSelect.focus(), 0);
  }
};

const openAddStressModal = () =>
  openFormModal(stressModal, stressForm, stressNameInput);

const openAddContactModal = () =>
  openFormModal(contactModal, contactForm, contactNameInput);

const openAddNoteModal = () =>
  openFormModal(noteModal, noteForm, noteNameInput);

const openAddModModal = () =>
  openFormModal(modModal, modForm, modNameInput);

const openAddDebtModal = () =>
  openFormModal(debtModal, debtForm, debtWhatInput);

const openAddShipModuleModal = () =>
  openFormModal(shipModuleModal, shipModuleForm, shipModuleNameInput);

const openRemoveModal = (clock) => {
  if (!removeModal || !removeModalText) return;
  pendingRemoveId = clock.id;
  removeModalText.textContent = `Remove "${clock.name}"? This cannot be undone.`;
  openModal(removeModal);
};

const handleBackdropClick = (event) => {
  if (!event.target.classList.contains("modal-backdrop")) return;
  const modal = event.target.closest(".modal");
  closeModal(modal);
};

const handleKeydown = (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".modal.is-open").forEach((modal) => {
    closeModal(modal);
  });
};

const renderGearItems = () => {
  if (!gearList) return;
  gearList.innerHTML = "";

  if (!gearItems.length) {
    gearList.appendChild(createEmptyState("No gear added yet."));
    return;
  }

  gearItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const row = document.createElement("div");
    row.className = "entry-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `${item.id}-gear-name`;
    nameInput.value = item.name;
    nameInput.addEventListener("input", () => {
      item.name = nameInput.value;
      scheduleSave();
    });

    const typeSelect = document.createElement("select");
    typeSelect.id = `${item.id}-gear-type`;
    ["weapon", "armor", "item"].forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });
    typeSelect.value = item.type;
    typeSelect.addEventListener("change", () => {
      item.type = typeSelect.value;
      scheduleSave();
    });

    const tagsInput = document.createElement("input");
    tagsInput.type = "text";
    tagsInput.id = `${item.id}-gear-tags`;
    tagsInput.value = item.tags;
    tagsInput.addEventListener("input", () => {
      item.tags = tagsInput.value;
      scheduleSave();
    });

    const multipleInput = document.createElement("input");
    multipleInput.type = "checkbox";
    multipleInput.id = `${item.id}-gear-multiple`;
    multipleInput.checked = item.multiple;

    row.appendChild(createField("Name", nameInput));
    row.appendChild(createField("Type", typeSelect));
    row.appendChild(createField("Tags", tagsInput));
    row.appendChild(createField("Multiple", multipleInput));

    const descriptionInput = document.createElement("textarea");
    descriptionInput.rows = 3;
    descriptionInput.id = `${item.id}-gear-description`;
    descriptionInput.value = item.description;
    descriptionInput.addEventListener("input", () => {
      item.description = descriptionInput.value;
      scheduleSave();
    });

    const quantityField = document.createElement("div");
    quantityField.className = "field";
    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "Quantity";

    const quantityControls = document.createElement("div");
    quantityControls.className = "quantity-controls";
    const quantityMinusButton = document.createElement("button");
    quantityMinusButton.type = "button";
    quantityMinusButton.className = "btn ghost small qty-btn";
    quantityMinusButton.textContent = "-";
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.step = "1";
    quantityInput.inputMode = "numeric";
    quantityInput.id = `${item.id}-gear-quantity`;
    quantityInput.value = item.quantity;
    quantityLabel.setAttribute("for", quantityInput.id);
    const quantityPlusButton = document.createElement("button");
    quantityPlusButton.type = "button";
    quantityPlusButton.className = "btn ghost small qty-btn";
    quantityPlusButton.textContent = "+";

    quantityControls.appendChild(quantityMinusButton);
    quantityControls.appendChild(quantityInput);
    quantityControls.appendChild(quantityPlusButton);
    quantityField.appendChild(quantityLabel);
    quantityField.appendChild(quantityControls);
    quantityField.classList.toggle("is-hidden", !item.multiple);

    bindQuantityControls(
      quantityInput,
      quantityMinusButton,
      quantityPlusButton,
      (value) => {
        item.quantity = value;
        scheduleSave();
      }
    );

    multipleInput.addEventListener("change", () => {
      item.multiple = multipleInput.checked;
      if (!item.multiple) {
        item.quantity = 1;
        quantityInput.value = "1";
      }
      quantityField.classList.toggle("is-hidden", !item.multiple);
      scheduleSave();
    });

    const actions = document.createElement("div");
    actions.className = "entry-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn ghost small";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      gearItems = gearItems.filter((entry) => entry.id !== item.id);
      renderGearItems();
      scheduleSave();
    });
    actions.appendChild(removeButton);

    card.appendChild(row);
    card.appendChild(quantityField);
    card.appendChild(createField("Description", descriptionInput));
    card.appendChild(actions);
    gearList.appendChild(card);
  });
};

const renderMoves = () => {
  if (!movesList) return;
  movesList.innerHTML = "";

  if (!moves.length) {
    movesList.appendChild(createEmptyState("No moves added yet."));
    return;
  }

  moves.forEach((move) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `${move.id}-move-name`;
    nameInput.value = move.name;
    nameInput.addEventListener("input", () => {
      move.name = nameInput.value;
      scheduleSave();
    });

    const descriptionInput = document.createElement("textarea");
    descriptionInput.rows = 3;
    descriptionInput.id = `${move.id}-move-description`;
    descriptionInput.value = move.description;
    descriptionInput.addEventListener("input", () => {
      move.description = descriptionInput.value;
      scheduleSave();
    });

    card.appendChild(createField("Name", nameInput));
    card.appendChild(createField("Description", descriptionInput));
    if (!move.isBase) {
      const actions = document.createElement("div");
      actions.className = "entry-actions";
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "btn ghost small";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        moves = moves.filter((entry) => entry.id !== move.id);
        renderMoves();
        scheduleSave();
      });
      actions.appendChild(removeButton);
      card.appendChild(actions);
    }
    movesList.appendChild(card);
  });
};

const renderStress = () => {
  if (!stressList) return;
  stressList.innerHTML = "";

  if (!stressEntries.length) {
    stressList.appendChild(createEmptyState("No stress triggers added yet."));
    return;
  }

  stressEntries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `${entry.id}-stress-name`;
    nameInput.value = entry.name;
    nameInput.addEventListener("input", () => {
      entry.name = nameInput.value;
      scheduleSave();
    });

    const descriptionInput = document.createElement("textarea");
    descriptionInput.rows = 3;
    descriptionInput.id = `${entry.id}-stress-description`;
    descriptionInput.value = entry.description;
    descriptionInput.addEventListener("input", () => {
      entry.description = descriptionInput.value;
      scheduleSave();
    });

    const actions = document.createElement("div");
    actions.className = "entry-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn ghost small";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      stressEntries = stressEntries.filter((item) => item.id !== entry.id);
      renderStress();
      scheduleSave();
    });
    actions.appendChild(removeButton);

    card.appendChild(createField("Name", nameInput));
    card.appendChild(createField("Description", descriptionInput));
    card.appendChild(actions);
    stressList.appendChild(card);
  });
};

const renderContacts = () => {
  if (!contactsList) return;
  contactsList.innerHTML = "";

  if (!contacts.length) {
    contactsList.appendChild(createEmptyState("No contacts added yet."));
    return;
  }

  contacts.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `${entry.id}-contact-name`;
    nameInput.value = entry.name;
    nameInput.addEventListener("input", () => {
      entry.name = nameInput.value;
      scheduleSave();
    });

    const descriptionInput = document.createElement("textarea");
    descriptionInput.rows = 3;
    descriptionInput.id = `${entry.id}-contact-description`;
    descriptionInput.value = entry.description;
    descriptionInput.addEventListener("input", () => {
      entry.description = descriptionInput.value;
      scheduleSave();
    });

    const actions = document.createElement("div");
    actions.className = "entry-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn ghost small";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      contacts = contacts.filter((item) => item.id !== entry.id);
      renderContacts();
      scheduleSave();
    });
    actions.appendChild(removeButton);

    card.appendChild(createField("Name", nameInput));
    card.appendChild(createField("Notes", descriptionInput));
    card.appendChild(actions);
    contactsList.appendChild(card);
  });
};

const renderNotes = () => {
  if (!notesList) return;
  notesList.innerHTML = "";

  if (!notes.length) {
    notesList.appendChild(createEmptyState("No notes added yet."));
    return;
  }

  notes.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `${entry.id}-note-name`;
    nameInput.value = entry.name;
    nameInput.addEventListener("input", () => {
      entry.name = nameInput.value;
      scheduleSave();
    });

    const descriptionInput = document.createElement("textarea");
    descriptionInput.rows = 3;
    descriptionInput.id = `${entry.id}-note-description`;
    descriptionInput.value = entry.description;
    descriptionInput.addEventListener("input", () => {
      entry.description = descriptionInput.value;
      scheduleSave();
    });

    const actions = document.createElement("div");
    actions.className = "entry-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn ghost small";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      notes = notes.filter((item) => item.id !== entry.id);
      renderNotes();
      scheduleSave();
    });
    actions.appendChild(removeButton);

    card.appendChild(createField("Title", nameInput));
    card.appendChild(createField("Notes", descriptionInput));
    card.appendChild(actions);
    notesList.appendChild(card);
  });
};

const renderMods = () => {
  if (!modsList) return;
  modsList.innerHTML = "";

  if (!mods.length) {
    modsList.appendChild(createEmptyState("No mods or augments added yet."));
    return;
  }

  mods.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const row = document.createElement("div");
    row.className = "entry-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `${entry.id}-mod-name`;
    nameInput.value = entry.name;
    nameInput.addEventListener("input", () => {
      entry.name = nameInput.value;
      scheduleSave();
    });

    const benefitInput = document.createElement("input");
    benefitInput.type = "text";
    benefitInput.id = `${entry.id}-mod-benefit`;
    benefitInput.value = entry.benefit;
    benefitInput.addEventListener("input", () => {
      entry.benefit = benefitInput.value;
      scheduleSave();
    });

    const drawbackInput = document.createElement("input");
    drawbackInput.type = "text";
    drawbackInput.id = `${entry.id}-mod-drawback`;
    drawbackInput.value = entry.drawback;
    drawbackInput.addEventListener("input", () => {
      entry.drawback = drawbackInput.value;
      scheduleSave();
    });

    row.appendChild(createField("Name", nameInput));
    row.appendChild(createField("Benefit", benefitInput));
    row.appendChild(createField("Drawback", drawbackInput));

    const descriptionInput = document.createElement("textarea");
    descriptionInput.rows = 3;
    descriptionInput.id = `${entry.id}-mod-description`;
    descriptionInput.value = entry.description;
    descriptionInput.addEventListener("input", () => {
      entry.description = descriptionInput.value;
      scheduleSave();
    });

    const actions = document.createElement("div");
    actions.className = "entry-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn ghost small";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      mods = mods.filter((item) => item.id !== entry.id);
      renderMods();
      scheduleSave();
    });
    actions.appendChild(removeButton);

    card.appendChild(row);
    card.appendChild(createField("Description", descriptionInput));
    card.appendChild(actions);
    modsList.appendChild(card);
  });
};

const renderDebts = () => {
  if (!debtsList) return;
  debtsList.innerHTML = "";

  if (!debts.length) {
    debtsList.appendChild(createEmptyState("No debts added yet."));
    return;
  }

  debts.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const row = document.createElement("div");
    row.className = "entry-row";

    const whatInput = document.createElement("input");
    whatInput.type = "text";
    whatInput.id = `${entry.id}-debt-what`;
    whatInput.value = entry.what;
    whatInput.addEventListener("input", () => {
      entry.what = whatInput.value;
      scheduleSave();
    });

    const whoInput = document.createElement("input");
    whoInput.type = "text";
    whoInput.id = `${entry.id}-debt-who`;
    whoInput.value = entry.who;
    whoInput.addEventListener("input", () => {
      entry.who = whoInput.value;
      scheduleSave();
    });

    row.appendChild(createField("What do you owe?", whatInput));
    row.appendChild(createField("Who do you owe it to?", whoInput));

    const actions = document.createElement("div");
    actions.className = "entry-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn ghost small";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      debts = debts.filter((item) => item.id !== entry.id);
      renderDebts();
      scheduleSave();
    });
    actions.appendChild(removeButton);

    card.appendChild(row);
    card.appendChild(actions);
    debtsList.appendChild(card);
  });
};

const renderShipModules = () => {
  if (!shipModulesList) return;
  shipModulesList.innerHTML = "";

  if (!shipModules.length) {
    shipModulesList.appendChild(createEmptyState("No modules added yet."));
    return;
  }

  shipModules.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `${entry.id}-ship-module-name`;
    nameInput.value = entry.name;
    nameInput.addEventListener("input", () => {
      entry.name = nameInput.value;
      scheduleSave("ship");
    });

    const descriptionInput = document.createElement("textarea");
    descriptionInput.rows = 3;
    descriptionInput.id = `${entry.id}-ship-module-description`;
    descriptionInput.value = entry.description;
    descriptionInput.addEventListener("input", () => {
      entry.description = descriptionInput.value;
      scheduleSave("ship");
    });

    const actions = document.createElement("div");
    actions.className = "entry-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn ghost small";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      shipModules = shipModules.filter((item) => item.id !== entry.id);
      renderShipModules();
      scheduleSave("ship");
    });
    actions.appendChild(removeButton);

    card.appendChild(createField("Module", nameInput));
    card.appendChild(createField("Description", descriptionInput));
    card.appendChild(actions);
    shipModulesList.appendChild(card);
  });
};

const renderClocks = () => {
  if (!clocksList) return;
  clocksList.innerHTML = "";

  if (!clocks.length) {
    const empty = document.createElement("p");
    empty.className = "clock-empty";
    empty.textContent = "No clocks yet.";
    clocksList.appendChild(empty);
    return;
  }

  clocks.forEach((clock) => {
    const item = document.createElement("div");
    item.className = "clock-item";

    const header = document.createElement("div");
    header.className = "clock-header";

    const nameBlock = document.createElement("div");
    const title = document.createElement("p");
    title.className = "clock-name";
    title.textContent = clock.name;

    const meta = document.createElement("p");
    meta.className = "clock-meta";
    meta.textContent = `${clock.segments} segments`;

    nameBlock.appendChild(title);
    nameBlock.appendChild(meta);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn ghost small";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      openRemoveModal(clock);
    });

    header.appendChild(nameBlock);
    header.appendChild(removeButton);

    const grid = document.createElement("div");
    grid.className = "chip-grid clock-grid";

    for (let i = 0; i < clock.segments; i += 1) {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(clock.checks[i]);
      checkbox.addEventListener("change", () => {
        clock.checks[i] = checkbox.checked;
        scheduleSave();
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` Segment ${i + 1}`));
      grid.appendChild(label);
    }

    item.appendChild(header);
    item.appendChild(grid);
    clocksList.appendChild(item);
  });
};

const addClock = (name, segments) => {
  clocks.push({
    id: createClockId(),
    name,
    segments,
    checks: Array(segments).fill(false),
  });

  renderClocks();
  scheduleSave();
};

const addGearItem = (item) => {
  gearItems.push(normalizeGearItem(item));
  renderGearItems();
  scheduleSave();
};

const addMove = (item) => {
  moves.push(normalizeMoveEntry(item));
  renderMoves();
  scheduleSave();
};

const addStressEntry = (item) => {
  stressEntries.push(normalizeNamedEntry(item));
  renderStress();
  scheduleSave();
};

const addContact = (item) => {
  contacts.push(normalizeNamedEntry(item));
  renderContacts();
  scheduleSave();
};

const addNote = (item) => {
  notes.push(normalizeNamedEntry(item));
  renderNotes();
  scheduleSave();
};

const addMod = (item) => {
  mods.push(normalizeModEntry(item));
  renderMods();
  scheduleSave();
};

const addDebt = (item) => {
  debts.push(normalizeDebtEntry(item));
  renderDebts();
  scheduleSave();
};

const addShipModule = (item) => {
  shipModules.push(normalizeShipModuleEntry(item));
  renderShipModules();
  scheduleSave("ship");
};

// Dice Roller Functions
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

const getCharacterStat = (statName) => {
  const baseField = document.querySelector(`[data-field="stats.${statName}"]`);
  const modifierField = document.querySelector(`[data-field="stats.${statName}Modifier"]`);

  const baseValue = baseField ? parseStatValue(baseField.value) : 0;
  const modifierValue = modifierField ? parseStatValue(modifierField.value) : 0;

  return baseValue + modifierValue;
};

const getShipStat = (statName) => {
  const field = document.querySelector(`[data-field="ship.stats.${statName}"]`);
  return field ? parseStatValue(field.value) : 0;
};

const calculateOperatorEdge = (characterStatValue) => {
  const stat = parseStatValue(characterStatValue);
  if (stat >= 2) return 1;
  if (stat >= 0) return 0;
  return -1;
};

const formatStatValue = (value) => {
  const num = parseStatValue(value);
  if (num > 0) return `+${num}`;
  return num.toString();
};

const performCharacterRoll = () => {
  const statName = characterStatSelect.value;
  const statValue = getCharacterStat(statName);
  const extraMod = parseInt(extraModifierInput.value, 10) || 0;
  const dice = rollDice(2);
  const diceTotal = dice.reduce((sum, d) => sum + d, 0);
  const total = diceTotal + statValue + extraMod;
  const outcome = getOutcome(total);
  const rollName = rollNameInput.value.trim();

  const roll = {
    timestamp: new Date(),
    name: rollName,
    type: "character",
    stat: statName.toUpperCase(),
    dice: dice,
    modifier: statValue + extraMod,
    total: total,
    outcome: outcome
  };

  return roll;
};

const performShipRoll = () => {
  const shipStatName = shipStatSelect.value;
  const operatorStatName = operatorStatSelect.value;
  const shipStatValue = getShipStat(shipStatName);
  const operatorStatValue = getCharacterStat(operatorStatName);
  const operatorEdge = calculateOperatorEdge(operatorStatValue);
  const dice = rollDice(2);
  const diceTotal = dice.reduce((sum, d) => sum + d, 0);
  const total = diceTotal + shipStatValue + operatorEdge;
  const outcome = getOutcome(total);
  const rollName = rollNameInput.value.trim();

  const roll = {
    timestamp: new Date(),
    name: rollName,
    type: "ship",
    stat: shipStatName.toUpperCase(),
    operatorStat: operatorStatName.toUpperCase(),
    operatorEdge: operatorEdge,
    dice: dice,
    modifier: shipStatValue + operatorEdge,
    total: total,
    outcome: outcome
  };

  return roll;
};

const displayRollResult = (roll) => {
  const diceText = roll.dice.map(d => `[${d}]`).join(" ");
  const modText = formatStatValue(roll.modifier);

  diceDisplay.textContent = diceText;
  totalDisplay.textContent = `${diceText} ${modText >= 0 ? '+' : ''}${modText} = ${roll.total}`;
  outcomeDisplay.textContent = roll.outcome;
  outcomeDisplay.className = "outcome-display";

  if (roll.outcome === "Success") {
    outcomeDisplay.classList.add("success");
  } else if (roll.outcome === "Success with a Catch") {
    outcomeDisplay.classList.add("partial");
  } else {
    outcomeDisplay.classList.add("failure");
  }
};

const addRollToHistory = (roll) => {
  rollHistory.unshift(roll);
  if (rollHistory.length > 10) {
    rollHistory.pop();
  }
  renderRollHistory();
};

const renderRollHistory = () => {
  if (!rollHistoryContainer) return;

  rollHistoryContainer.innerHTML = "";

  if (rollHistory.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "No rolls yet.";
    rollHistoryContainer.appendChild(empty);
    return;
  }

  rollHistory.forEach((roll) => {
    const item = document.createElement("div");
    item.className = "history-item";

    const diceText = roll.dice.map(d => `[${d}]`).join(" ");
    const modText = formatStatValue(roll.modifier);

    let rollDescription = "";
    if (roll.type === "ship") {
      rollDescription = `${roll.stat} (${roll.operatorStat})`;
    } else {
      rollDescription = roll.stat;
    }

    const nameText = roll.name ? `${roll.name}: ` : "";
    const resultText = `${nameText}${rollDescription} ${diceText}${modText >= 0 ? '+' : ''}${modText} = ${roll.total}`;

    const resultLine = document.createElement("p");
    resultLine.className = "history-result";
    resultLine.textContent = resultText;

    const outcomeLine = document.createElement("p");
    outcomeLine.className = "history-outcome";
    outcomeLine.textContent = roll.outcome;

    if (roll.outcome === "Success") {
      outcomeLine.classList.add("success");
    } else if (roll.outcome === "Success with a Catch") {
      outcomeLine.classList.add("partial");
    } else {
      outcomeLine.classList.add("failure");
    }

    item.appendChild(resultLine);
    item.appendChild(outcomeLine);
    rollHistoryContainer.appendChild(item);
  });
};

const updateDiceRollerDisplay = () => {
  const isShipSheet = activeSheet === "ship";

  if (characterRollSection && shipRollSection) {
    characterRollSection.classList.toggle("is-hidden", isShipSheet);
    shipRollSection.classList.toggle("is-hidden", !isShipSheet);
  }

  if (!isShipSheet) {
    updateCharacterRollDisplay();
  } else {
    updateShipRollDisplay();
  }
};

const updateCharacterRollDisplay = () => {
  if (!characterStatSelect || !characterStatDisplay) return;
  const statName = characterStatSelect.value;
  const statValue = getCharacterStat(statName);
  const extraMod = parseInt(extraModifierInput.value, 10) || 0;
  const totalMod = statValue + extraMod;

  characterStatDisplay.textContent = `Current stat: ${formatStatValue(statValue)}`;

  if (characterModifierDisplay) {
    if (extraMod !== 0) {
      characterModifierDisplay.textContent = `Roll modifier: ${formatStatValue(totalMod)}`;
      characterModifierDisplay.style.display = "block";
    } else {
      characterModifierDisplay.style.display = "none";
    }
  }
};

const updateShipRollDisplay = () => {
  if (!shipStatSelect || !operatorStatSelect) return;

  const shipStatName = shipStatSelect.value;
  const operatorStatName = operatorStatSelect.value;
  const shipStatValue = getShipStat(shipStatName);
  const operatorStatValue = getCharacterStat(operatorStatName);
  const operatorEdge = calculateOperatorEdge(operatorStatValue);
  const totalMod = shipStatValue + operatorEdge;

  if (shipStatDisplay) {
    shipStatDisplay.textContent = `Ship stat: ${formatStatValue(shipStatValue)}`;
  }
  if (operatorStatDisplay) {
    operatorStatDisplay.textContent = `Operator stat: ${formatStatValue(operatorStatValue)}`;
  }
  if (operatorEdgeDisplay) {
    operatorEdgeDisplay.textContent = `Operator edge: ${formatStatValue(operatorEdge)}`;
  }
  if (shipModifierDisplay) {
    if (operatorEdge !== 0) {
      shipModifierDisplay.textContent = `Roll modifier: ${formatStatValue(totalMod)}`;
      shipModifierDisplay.style.display = "block";
    } else {
      shipModifierDisplay.style.display = "none";
    }
  }
};

const performRoll = () => {
  const roll = activeSheet === "ship" ? performShipRoll() : performCharacterRoll();
  displayRollResult(roll);
  addRollToHistory(roll);
};

const openDiceRollerModal = () => {
  if (!diceRollerModal) return;
  updateDiceRollerDisplay();
  renderRollHistory();
  openModal(diceRollerModal);
  if (rollNameInput) {
    rollNameInput.value = "";
  }
  if (extraModifierInput) {
    extraModifierInput.value = "0";
  }
  // Hide extra modifier field by default
  if (extraModifierField) {
    extraModifierField.classList.add("is-hidden");
  }
  if (extraModifierBtnText) {
    extraModifierBtnText.textContent = "Add Extra Modifier";
  }
};

const toggleExtraModifier = () => {
  if (!extraModifierField || !extraModifierBtnText) return;

  const isHidden = extraModifierField.classList.contains("is-hidden");

  if (isHidden) {
    extraModifierField.classList.remove("is-hidden");
    extraModifierBtnText.textContent = "Hide Extra Modifier";
    if (extraModifierInput) {
      extraModifierInput.focus();
    }
  } else {
    extraModifierField.classList.add("is-hidden");
    extraModifierBtnText.textContent = "Add Extra Modifier";
    if (extraModifierInput) {
      extraModifierInput.value = "0";
    }
    updateCharacterRollDisplay();
  }
};

const clearRollHistory = () => {
  rollHistory = [];
  renderRollHistory();
  diceDisplay.textContent = "—";
  totalDisplay.textContent = "—";
  outcomeDisplay.textContent = "—";
  outcomeDisplay.className = "outcome-display";
};

characterFields.forEach((field) => {
  if (field === radsInput) return;
  const handler = () => {
    scheduleSave("character");
  };

  field.addEventListener("input", handler);
  field.addEventListener("change", handler);
});

shipFields.forEach((field) => {
  if (shipTrackInputs.includes(field)) return;
  const handler = () => {
    scheduleSave("ship");
  };

  field.addEventListener("input", handler);
  field.addEventListener("change", handler);
});

if (moveSelect) {
  moveSelect.addEventListener("change", updateMoveFields);
}

if (roleSelect) {
  roleSelect.addEventListener("change", () => {
    updateMoveOptions();
  });
}

if (radsInput) {
  const radsHandler = () => {
    updateRadsDisplay();
    scheduleSave("character");
  };
  radsInput.addEventListener("input", radsHandler);
  radsInput.addEventListener("change", radsHandler);
}

if (shipTrackInputs.length) {
  shipTrackInputs.forEach((input) => {
    const handler = () => {
      updateShipTrackDisplay(input);
      scheduleSave("ship");
    };
    input.addEventListener("input", handler);
    input.addEventListener("change", handler);
  });
}

exportButton.addEventListener("click", () => exportSheet());
resetButton.addEventListener("click", () => resetSheet());

if (sheetToggleButton) {
  sheetToggleButton.addEventListener("click", () => {
    setActiveSheet(activeSheet === "ship" ? "character" : "ship");
  });
}

if (addClockButton) {
  addClockButton.addEventListener("click", openAddClockModal);
}

if (addGearButton) {
  addGearButton.addEventListener("click", openAddGearModal);
}

if (addMoveButton) {
  addMoveButton.addEventListener("click", openAddMoveModal);
}

if (addStressButton) {
  addStressButton.addEventListener("click", openAddStressModal);
}

if (addContactButton) {
  addContactButton.addEventListener("click", openAddContactModal);
}

if (addNoteButton) {
  addNoteButton.addEventListener("click", openAddNoteModal);
}

if (addModButton) {
  addModButton.addEventListener("click", openAddModModal);
}

if (addDebtButton) {
  addDebtButton.addEventListener("click", openAddDebtModal);
}

if (addShipModuleButton) {
  addShipModuleButton.addEventListener("click", openAddShipModuleModal);
}

if (clockCancelButton) {
  clockCancelButton.addEventListener("click", () => closeModal(clockModal));
}

if (gearCancelButton) {
  gearCancelButton.addEventListener("click", () => closeModal(gearModal));
}

if (gearMultipleInput && gearQuantityField && gearQuantityInput) {
  gearMultipleInput.addEventListener("change", () => {
    gearQuantityField.classList.toggle("is-hidden", !gearMultipleInput.checked);
    if (!gearMultipleInput.checked) {
      gearQuantityInput.value = "1";
    }
  });
}

if (gearQuantityInput) {
  bindQuantityControls(
    gearQuantityInput,
    gearQuantityMinusButton,
    gearQuantityPlusButton
  );
}

if (moveCancelButton) {
  moveCancelButton.addEventListener("click", () => closeModal(moveModal));
}

if (stressCancelButton) {
  stressCancelButton.addEventListener("click", () => closeModal(stressModal));
}

if (contactCancelButton) {
  contactCancelButton.addEventListener("click", () => closeModal(contactModal));
}

if (noteCancelButton) {
  noteCancelButton.addEventListener("click", () => closeModal(noteModal));
}

if (modCancelButton) {
  modCancelButton.addEventListener("click", () => closeModal(modModal));
}

if (debtCancelButton) {
  debtCancelButton.addEventListener("click", () => closeModal(debtModal));
}

if (shipModuleCancelButton) {
  shipModuleCancelButton.addEventListener("click", () =>
    closeModal(shipModuleModal)
  );
}

if (clockForm) {
  clockForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = clockNameInput ? clockNameInput.value.trim() : "";
    if (!name) {
      clockNameInput.focus();
      return;
    }

    const segmentsInput = clockForm.querySelector(
      "input[name=\"clock-segments\"]:checked"
    );
    const segments = segmentsInput ? Number(segmentsInput.value) : 4;
    if (![4, 6, 8].includes(segments)) {
      return;
    }

    addClock(name, segments);
    closeModal(clockModal);
  });
}

if (gearForm) {
  gearForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = gearNameInput ? gearNameInput.value.trim() : "";
    if (!name) {
      gearNameInput.focus();
      return;
    }
    const type = gearTypeInput ? gearTypeInput.value : "item";
    const tags = gearTagsInput ? gearTagsInput.value.trim() : "";
    const description = gearDescriptionInput
      ? gearDescriptionInput.value.trim()
      : "";
    const multiple = gearMultipleInput ? gearMultipleInput.checked : false;
    const quantity = multiple
      ? clampQuantityValue(gearQuantityInput ? gearQuantityInput.value : 1)
      : 1;

    addGearItem({
      id: createEntryId(),
      name,
      type,
      tags,
      description,
      multiple,
      quantity,
    });
    closeModal(gearModal);
  });
}

if (moveForm) {
  moveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selection = moveSelect ? moveSelect.value : "";
    if (!selection) {
      if (moveSelect) moveSelect.focus();
      return;
    }

    let name = "";
    let description = "";

    if (selection === CUSTOM_MOVE_VALUE) {
      name = moveNameInput ? moveNameInput.value.trim() : "";
      if (!name) {
        moveNameInput.focus();
        return;
      }
      description = moveDescriptionInput
        ? moveDescriptionInput.value.trim()
        : "";
    } else {
      const role = roleSelect ? roleSelect.value : "";
      const move = getRoleMoveByName(role, selection);
      if (!move) {
        if (moveSelect) moveSelect.focus();
        return;
      }
      name = move.name;
      description = move.description;
    }
    addMove({
      id: createEntryId(),
      name,
      description,
    });
    closeModal(moveModal);
  });
}

if (stressForm) {
  stressForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = stressNameInput ? stressNameInput.value.trim() : "";
    if (!name) {
      stressNameInput.focus();
      return;
    }
    const description = stressDescriptionInput
      ? stressDescriptionInput.value.trim()
      : "";
    addStressEntry({
      id: createEntryId(),
      name,
      description,
    });
    closeModal(stressModal);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = contactNameInput ? contactNameInput.value.trim() : "";
    if (!name) {
      contactNameInput.focus();
      return;
    }
    const description = contactDescriptionInput
      ? contactDescriptionInput.value.trim()
      : "";
    addContact({
      id: createEntryId(),
      name,
      description,
    });
    closeModal(contactModal);
  });
}

if (noteForm) {
  noteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = noteNameInput ? noteNameInput.value.trim() : "";
    if (!name) {
      noteNameInput.focus();
      return;
    }
    const description = noteDescriptionInput
      ? noteDescriptionInput.value.trim()
      : "";
    addNote({
      id: createEntryId(),
      name,
      description,
    });
    closeModal(noteModal);
  });
}

if (modForm) {
  modForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = modNameInput ? modNameInput.value.trim() : "";
    if (!name) {
      modNameInput.focus();
      return;
    }
    const benefit = modBenefitInput ? modBenefitInput.value.trim() : "";
    const drawback = modDrawbackInput ? modDrawbackInput.value.trim() : "";
    const description = modDescriptionInput
      ? modDescriptionInput.value.trim()
      : "";

    addMod({
      id: createEntryId(),
      name,
      benefit,
      drawback,
      description,
    });
    closeModal(modModal);
  });
}

if (debtForm) {
  debtForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const what = debtWhatInput ? debtWhatInput.value.trim() : "";
    if (!what) {
      debtWhatInput.focus();
      return;
    }
    const who = debtWhoInput ? debtWhoInput.value.trim() : "";
    if (!who) {
      debtWhoInput.focus();
      return;
    }

    addDebt({
      id: createEntryId(),
      what,
      who,
    });
    closeModal(debtModal);
  });
}

if (shipModuleForm) {
  shipModuleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = shipModuleNameInput ? shipModuleNameInput.value.trim() : "";
    if (!name) {
      shipModuleNameInput.focus();
      return;
    }
    const description = shipModuleDescriptionInput
      ? shipModuleDescriptionInput.value.trim()
      : "";
    addShipModule({
      id: createEntryId(),
      name,
      description,
    });
    closeModal(shipModuleModal);
  });
}

if (removeCancelButton) {
  removeCancelButton.addEventListener("click", () => closeModal(removeModal));
}

if (removeConfirmButton) {
  removeConfirmButton.addEventListener("click", () => {
    if (!pendingRemoveId) return;
    clocks = clocks.filter((item) => item.id !== pendingRemoveId);
    pendingRemoveId = null;
    renderClocks();
    scheduleSave();
    closeModal(removeModal);
  });
}

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", handleBackdropClick);
});

document.addEventListener("keydown", handleKeydown);

window.addEventListener("pagehide", () => {
  saveToStorage("character");
  saveToStorage("ship");
});

importInput.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  importSheet(file, activeSheet);
  event.target.value = "";
});

// Dice Roller Event Listeners
if (diceRollerButton) {
  diceRollerButton.addEventListener("click", openDiceRollerModal);
}

if (diceRollerClose) {
  diceRollerClose.addEventListener("click", () => closeModal(diceRollerModal));
}

if (rollDiceButton) {
  rollDiceButton.addEventListener("click", performRoll);
}

if (clearHistoryButton) {
  clearHistoryButton.addEventListener("click", clearRollHistory);
}

if (characterStatSelect) {
  characterStatSelect.addEventListener("change", updateCharacterRollDisplay);
}

if (shipStatSelect) {
  shipStatSelect.addEventListener("change", updateShipRollDisplay);
}

if (operatorStatSelect) {
  operatorStatSelect.addEventListener("change", updateShipRollDisplay);
}

if (toggleExtraModifierBtn) {
  toggleExtraModifierBtn.addEventListener("click", toggleExtraModifier);
}

if (extraModifierInput) {
  extraModifierInput.addEventListener("input", updateCharacterRollDisplay);
  extraModifierInput.addEventListener("change", updateCharacterRollDisplay);
}

renderClocks();
renderGearItems();
renderMoves();
renderStress();
renderContacts();
renderNotes();
renderMods();
renderDebts();
renderShipModules();
updateRadsDisplay();
updateShipTracksDisplay();
loadFromStorage("character");
loadFromStorage("ship");
ensureBaseMovesApplied();
updateMoveOptions();
initializeStatModifiers();
updateSheetView();
