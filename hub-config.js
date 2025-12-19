(() => {
  const configPath = "hub-config.json";
  const signalEl = document.getElementById("signal-stability");
  const statusListEl = document.getElementById("current-status-list");
  const footerEl = document.getElementById("hub-footer");
  const auxListEl = document.getElementById("aux-diagnostics-list");
  const heroEl = document.querySelector(".hero");
  const signalCanvas = document.querySelector(".signal-canvas");
  const verifiedSignalsEl = document.getElementById("verified-signals-count");

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const defaultDiagnostics = [
    { key: "gate", label: "Gate lock", value: 68, min: 52, max: 78, step: 0.7, unit: "%", digits: 0 },
    { key: "drift", label: "Corridor drift", value: 0.3, min: -1.8, max: 1.8, step: 0.06, unit: " deg", digits: 1 },
    { key: "rad", label: "Radiation load", value: 0.42, min: 0.28, max: 0.78, step: 0.02, unit: " sv", digits: 2 },
    { key: "delay", label: "Comms delay", value: 14.6, min: 8.0, max: 22.0, step: 0.25, unit: " hr", digits: 1 },
    { key: "hull", label: "Hull integrity", value: 92, min: 86, max: 98, step: 0.5, unit: "%", digits: 0 },
    {
      key: "fog",
      label: "Fog risk",
      value: 0,
      min: 0,
      max: 3,
      step: 1,
      type: "state",
      states: ["low", "trace", "moderate", "severe"],
    },
  ];

  const waveformDefaults = {
    erraticity: 0.55,
    targetChance: 0.08,
    surgeChance: 0.02,
    spikeChance: 0.01,
    spikeDecay: 0.86,
    spikeStrength: 1,
    targetClamp: 1.6,
    baseTargetRange: 1.3,
    surgeRange: 1.6,
    pointLerp: 0.05,
    phaseStep: 0.08,
    wobbleScale: 0.12,
    noiseScale: 0.08,
    amplitudeScale: 0.32,
  };

  let auxSensors = {};
  let auxElements = {};
  let auxIntervalId = null;
  let auxIntervalMs = 1200;
  let verifiedSignalsTimeoutId = null;
  const verifiedSignalsWindowMs = 24 * 60 * 60 * 1000;
  const verifiedSignalsKey = "tqe_verified_signals_log";
  const verifiedVisitorKey = "tqe_verified_visitor_id";
  let memorySignalsLog = [];

  const applyTextPreset = (preset) => {
    if (!preset) return;

    if (signalEl && preset.signalStability) {
      signalEl.textContent = preset.signalStability;
    }

    if (statusListEl && Array.isArray(preset.currentStatus)) {
      statusListEl.innerHTML = "";
      preset.currentStatus.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        statusListEl.appendChild(li);
      });
    }

    if (footerEl && preset.footer) {
      footerEl.textContent = preset.footer;
    }
  };

  const buildWaveformSettings = (preset = {}) => {
    const erraticity = Number.isFinite(preset.erraticity) ? preset.erraticity : waveformDefaults.erraticity;
    const erraticityClamped = clamp(erraticity, 0, 1);
    const chanceScale = 0.6 + erraticityClamped * 1.1;
    const intensityScale = 0.7 + erraticityClamped * 0.8;
    const scaled = {
      ...waveformDefaults,
      erraticity: erraticityClamped,
      targetChance: waveformDefaults.targetChance * chanceScale,
      surgeChance: waveformDefaults.surgeChance * chanceScale,
      spikeChance: waveformDefaults.spikeChance * chanceScale,
      noiseScale: waveformDefaults.noiseScale * intensityScale,
      wobbleScale: waveformDefaults.wobbleScale * (0.8 + erraticityClamped * 0.7),
      amplitudeScale: waveformDefaults.amplitudeScale * (0.85 + erraticityClamped * 0.45),
      phaseStep: waveformDefaults.phaseStep * (0.85 + erraticityClamped * 0.6),
      spikeStrength: waveformDefaults.spikeStrength * intensityScale,
    };
    const merged = { ...scaled, ...preset };
    merged.erraticity = erraticityClamped;
    return merged;
  };

  const normalizeDiagnostic = (diag, index) => {
    const key = diag.key || diag.id || `diag-${index}`;
    return {
      key,
      label: diag.label || "Signal",
      value: typeof diag.value === "number" ? diag.value : 0,
      min: typeof diag.min === "number" ? diag.min : 0,
      max: typeof diag.max === "number" ? diag.max : 100,
      step: typeof diag.step === "number" ? diag.step : 1,
      unit: typeof diag.unit === "string" ? diag.unit : "",
      digits: typeof diag.digits === "number" ? diag.digits : 0,
      type: diag.type === "state" ? "state" : "value",
      states: Array.isArray(diag.states) && diag.states.length ? diag.states : ["low", "trace", "moderate", "severe"],
    };
  };

  const buildAuxDiagnostics = (diagnostics) => {
    if (!auxListEl) return;
    auxListEl.innerHTML = "";
    auxSensors = {};
    auxElements = {};

    diagnostics.forEach((diag, index) => {
      const normalized = normalizeDiagnostic(diag, index);
      const li = document.createElement("li");
      const labelSpan = document.createElement("span");
      labelSpan.className = "label";
      labelSpan.textContent = normalized.label;
      const valueSpan = document.createElement("span");
      valueSpan.className = "value";
      valueSpan.dataset.sensorKey = normalized.key;
      li.appendChild(labelSpan);
      li.appendChild(valueSpan);
      auxListEl.appendChild(li);
      auxSensors[normalized.key] = normalized;
      auxElements[normalized.key] = valueSpan;
    });
  };

  const updateSensors = () => {
    Object.keys(auxSensors).forEach((key) => {
      const sensor = auxSensors[key];
      const el = auxElements[key];
      if (!el) return;

      if (sensor.type === "state") {
        if (Math.random() > 0.7) {
          sensor.value = clamp(sensor.value + (Math.random() > 0.5 ? 1 : -1), sensor.min, sensor.max);
        }
        const index = clamp(Math.round(sensor.value), 0, sensor.states.length - 1);
        el.textContent = sensor.states[index];
        return;
      }

      const delta = (Math.random() - 0.5) * sensor.step * 2;
      sensor.value = clamp(sensor.value + delta, sensor.min, sensor.max);
      const formatted = sensor.value.toFixed(sensor.digits);
      el.textContent = `${formatted}${sensor.unit}`;
    });
  };

  const applyAuxDiagnostics = (preset) => {
    if (!auxListEl) return;
    const diagnostics = Array.isArray(preset.auxDiagnostics) && preset.auxDiagnostics.length
      ? preset.auxDiagnostics
      : defaultDiagnostics;
    buildAuxDiagnostics(diagnostics);
    updateSensors();
    const nextInterval = Number.isFinite(preset.auxDiagnosticsIntervalMs)
      ? Math.max(200, preset.auxDiagnosticsIntervalMs)
      : 1200;
    if (nextInterval !== auxIntervalMs) {
      auxIntervalMs = nextInterval;
      if (auxIntervalId) {
        clearInterval(auxIntervalId);
      }
      auxIntervalId = setInterval(updateSensors, auxIntervalMs);
    } else if (!auxIntervalId) {
      auxIntervalId = setInterval(updateSensors, auxIntervalMs);
    }
  };

  let signalState = null;

  const initWaveform = () => {
    if (!heroEl || !signalCanvas) return;
    const ctx = signalCanvas.getContext("2d");
    if (!ctx) return;
    signalState = {
      width: 0,
      height: 0,
      points: [],
      targets: [],
      phase: 0,
      spikes: [],
      settings: buildWaveformSettings(),
    };

    const initPoints = (count) => {
      signalState.points = Array.from({ length: count }, () => (Math.random() * 2 - 1) * 0.6);
      signalState.targets = signalState.points.slice();
      signalState.spikes = Array.from({ length: count }, () => 0);
    };

    const resizeCanvas = () => {
      const rect = signalCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      signalCanvas.width = Math.floor(width * dpr);
      signalCanvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      signalState.width = width;
      signalState.height = height;
      const pointCount = Math.max(26, Math.floor(width / 12));
      initPoints(pointCount);
    };

    const updatePoints = () => {
      const settings = signalState.settings;
      for (let i = 0; i < signalState.points.length; i += 1) {
        if (Math.random() < settings.targetChance) {
          signalState.targets[i] = (Math.random() * 2 - 1) * settings.baseTargetRange;
        }
        if (Math.random() < settings.surgeChance) {
          signalState.targets[i] += (Math.random() > 0.5 ? 1 : -1) * settings.surgeRange;
        }
        signalState.targets[i] = clamp(signalState.targets[i], -settings.targetClamp, settings.targetClamp);
        if (Math.random() < settings.spikeChance) {
          signalState.spikes[i] = (Math.random() > 0.5 ? 1 : -1) * (0.9 + Math.random() * 0.8) * settings.spikeStrength;
        }
        signalState.spikes[i] *= settings.spikeDecay;
        signalState.points[i] += (signalState.targets[i] - signalState.points[i]) * settings.pointLerp;
      }
      signalState.phase += settings.phaseStep;
    };

    const drawTrace = (color, lineWidth, alphaScale = 1) => {
      if (!signalState.points.length) return;
      const settings = signalState.settings;
      ctx.beginPath();
      const mid = signalState.height / 2;
      const amplitude = signalState.height * settings.amplitudeScale;
      const count = signalState.points.length;
      for (let i = 0; i < count; i += 1) {
        const x = (i / (count - 1)) * signalState.width;
        const wobble = Math.sin(signalState.phase + i * 0.6) * settings.wobbleScale;
        const noise = (Math.random() - 0.5) * settings.noiseScale;
        const y = mid + (signalState.points[i] + signalState.spikes[i] + wobble + noise) * amplitude;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = alphaScale;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const animateSignal = () => {
      ctx.clearRect(0, 0, signalState.width, signalState.height);
      updatePoints();
      drawTrace("rgba(118, 226, 183, 0.2)", 1, 0.5);
      drawTrace("rgba(118, 226, 183, 0.6)", 1.4, 0.75 + Math.sin(signalState.phase * 0.7) * 0.1);
      requestAnimationFrame(animateSignal);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    requestAnimationFrame(animateSignal);
  };

  const applyWaveformSettings = (preset) => {
    if (!signalState) return;
    signalState.settings = buildWaveformSettings(preset.waveform || {});
  };

  const applyPreset = (preset) => {
    if (!preset) return;
    applyTextPreset(preset);
    applyAuxDiagnostics(preset);
    applyWaveformSettings(preset);
  };

  const getPresetOverride = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("preset");
  };

  const resolvePresetKey = (key, config) => {
    if (!key) return key;
    const normalized = String(key).toLowerCase();
    const aliases = {
      default: "low",
      steady: "stable",
    };
    const mapped = aliases[normalized] || normalized;
    if (config.presets && config.presets[mapped]) {
      return mapped;
    }
    if (config.presets && config.presets[key]) {
      return key;
    }
    return mapped;
  };

  const loadConfig = async () => {
    try {
      const response = await fetch(configPath, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const config = await response.json();
      const override = getPresetOverride();
      const presetKey = resolvePresetKey(override || config.activePreset, config);
      applyPreset(config.presets && config.presets[presetKey]);
    } catch (error) {
      // Keep defaults if config is missing or invalid.
    }
  };

  const storageAvailable = (() => {
    try {
      const testKey = "__tqe_storage_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  })();

  const readSignalsLog = () => {
    if (!storageAvailable) {
      return memorySignalsLog;
    }
    try {
      const stored = localStorage.getItem(verifiedSignalsKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const writeSignalsLog = (log) => {
    if (!storageAvailable) {
      memorySignalsLog = log;
      return;
    }
    try {
      localStorage.setItem(verifiedSignalsKey, JSON.stringify(log));
    } catch (error) {
      // Ignore storage write errors.
    }
  };

  const getVisitorId = () => {
    if (!storageAvailable) {
      return "session";
    }
    try {
      const existing = localStorage.getItem(verifiedVisitorKey);
      if (existing) return existing;
      const id = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `visitor-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      localStorage.setItem(verifiedVisitorKey, id);
      return id;
    } catch (error) {
      return "session";
    }
  };

  const pruneSignalsLog = (log, now) =>
    log.filter((entry) =>
      entry && Number.isFinite(entry.lastSeen) && now - entry.lastSeen < verifiedSignalsWindowMs);

  const touchSignalsLog = (log, now) => {
    const visitorId = getVisitorId();
    const existing = log.find((entry) => entry.id === visitorId);
    if (existing) {
      existing.lastSeen = now;
      return log;
    }
    return [...log, { id: visitorId, lastSeen: now }];
  };

  const renderSignalsCount = (log) => {
    if (!verifiedSignalsEl) return;
    verifiedSignalsEl.textContent = String(log.length);
  };

  const scheduleSignalsSweep = (log, now) => {
    if (!verifiedSignalsEl) return;
    if (verifiedSignalsTimeoutId) {
      clearTimeout(verifiedSignalsTimeoutId);
    }
    if (!log.length) return;
    const nextExpiry = Math.min(...log.map((entry) => entry.lastSeen + verifiedSignalsWindowMs));
    const delay = Math.max(1000, nextExpiry - now + 50);
    verifiedSignalsTimeoutId = setTimeout(() => refreshSignals(false), delay);
  };

  const refreshSignals = (touch) => {
    if (!verifiedSignalsEl) return;
    const now = Date.now();
    let log = pruneSignalsLog(readSignalsLog(), now);
    if (touch) {
      log = touchSignalsLog(log, now);
    }
    writeSignalsLog(log);
    renderSignalsCount(log);
    scheduleSignalsSweep(log, now);
  };

  const initSignals = () => {
    if (!verifiedSignalsEl) return;
    refreshSignals(true);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshSignals(true);
      }
    });
    window.addEventListener("storage", (event) => {
      if (event.key === verifiedSignalsKey) {
        refreshSignals(false);
      }
    });
  };

  initWaveform();
  applyAuxDiagnostics({});
  loadConfig();
  initSignals();
})();
