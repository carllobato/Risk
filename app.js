const STORAGE_KEY = "risk-mvp-data-v1";
const THEME_KEY = "risk-mvp-theme";
const APP_VERSION = "v1.3.0 (2026-02-21 10:15 UTC)";
const NAV_ITEMS = ["Dashboard", "Risk Register", "Outputs"];
const SETTINGS_PAGE = "Settings";

const categories = ["Cost", "Schedule", "Commercial", "Scope", "Delivery"];
const statuses = ["Open", "Mitigating", "Closed"];

const defaultData = {
  project: {
    id: "p-1",
    name: "Demo Project",
    client: "Northwind Infrastructure",
    project_number: "GSQ-001",
    location: "Sydney",
    currency: "USD",
    baseline_cost: 12000000,
    contingency: 950000,
    units: "Days",
    completion_date: "2027-12-31",
    contingency_days: 20,
    target_p_value: 80,
    number_scale: "millions",
    currency_decimals: 2,
    date_format: "DD/MM/YYYY",
    chart_label_mode: "hover",
    project_stage: "Planning",
    updated_at: new Date().toISOString()
  },
  risks: [
    {
      id: crypto.randomUUID(),
      project_id: "p-1",
      title: "Steel price escalation",
      description: "Commodity volatility may increase procurement prices.",
      category: "Cost",
      owner: "Procurement Lead",
      status: "Open",
      probability: 0.45,
      impact_cost_low: 120000,
      impact_cost_mid: 320000,
      impact_cost_high: 700000,
      impact_days_low: 0,
      impact_days_mid: 7,
      impact_days_high: 18,
      mitigation: "Lock supplier framework contracts for 60% of volume.",
      notes: "Reassess monthly with market index.",
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      project_id: "p-1",
      title: "Planning permit delay",
      description: "Local authority approvals may slip.",
      category: "Schedule",
      owner: "Project Manager",
      status: "Mitigating",
      probability: 0.35,
      impact_cost_low: 60000,
      impact_cost_mid: 150000,
      impact_cost_high: 350000,
      impact_days_low: 10,
      impact_days_mid: 25,
      impact_days_high: 45,
      mitigation: "Early authority engagement and weekly tracking.",
      notes: "Critical path activity.",
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      project_id: "p-1",
      title: "Scope creep from client changes",
      description: "Late design modifications could expand work packages.",
      category: "Scope",
      owner: "Commercial Manager",
      status: "Open",
      probability: 0.4,
      impact_cost_low: 90000,
      impact_cost_mid: 250000,
      impact_cost_high: 520000,
      impact_days_low: 4,
      impact_days_mid: 12,
      impact_days_high: 28,
      mitigation: "Change control board with cost/time gates.",
      notes: "Monitor RFI volume weekly.",
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      project_id: "p-1",
      title: "Subcontractor insolvency",
      description: "One critical subcontractor has weak cash flow.",
      category: "Delivery",
      owner: "Contracts Lead",
      status: "Open",
      probability: 0.2,
      impact_cost_low: 100000,
      impact_cost_mid: 400000,
      impact_cost_high: 1000000,
      impact_days_low: 8,
      impact_days_mid: 20,
      impact_days_high: 50,
      mitigation: "Identify alternate supplier and secure parent guarantee.",
      notes: "Financial health check due next review.",
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      project_id: "p-1",
      title: "Contract claim dispute",
      description: "Disputed change orders may delay payment.",
      category: "Commercial",
      owner: "Legal Counsel",
      status: "Mitigating",
      probability: 0.3,
      impact_cost_low: 70000,
      impact_cost_mid: 180000,
      impact_cost_high: 400000,
      impact_days_low: 3,
      impact_days_mid: 8,
      impact_days_high: 20,
      mitigation: "Pre-negotiate dispute resolution path.",
      notes: "Track aged claims monthly.",
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      project_id: "p-1",
      title: "Weather disruption",
      description: "Severe storms during civil works window.",
      category: "Schedule",
      owner: "Construction Manager",
      status: "Closed",
      probability: 0.15,
      impact_cost_low: 20000,
      impact_cost_mid: 50000,
      impact_cost_high: 140000,
      impact_days_low: 1,
      impact_days_mid: 5,
      impact_days_high: 15,
      mitigation: "Resequenced activities and temporary protections.",
      notes: "Closed after season planning update.",
      updated_at: new Date().toISOString()
    }
  ]
};

const state = {
  data: loadData(),
  page: "Dashboard",
  editingRiskId: null,
  simulation: {
    isRunning: false,
    result: null,
    iterations: 100,
    morph: {
      active: false,
      progress: 1,
      durationMs: 1000,
      fromResult: null,
      toResult: null
    }
  }
};

const navMenu = document.getElementById("nav-menu");
const pageContent = document.getElementById("page-content");
const projectTitle = document.getElementById("project-title");
const lastUpdated = document.getElementById("last-updated");
const modalBackdrop = document.getElementById("modal-backdrop");
const closeModalBtn = document.getElementById("close-modal");
const riskForm = document.getElementById("risk-form");
const riskModalTitle = document.getElementById("risk-modal-title");
const versionBadge = document.getElementById("app-version");
const settingsLink = document.getElementById("settings-link");


function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  document.body.dataset.theme = isDark ? "dark" : "light";
}

function initTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(storedTheme);
}

function handleThemeToggle(event) {
  const nextTheme = event.target.checked ? "dark" : "light";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.project.units) {
      parsed.project.units = "Days";
    }
    if (!parsed.project.project_number) {
      parsed.project.project_number = "GSQ-001";
    }
    if (!parsed.project.location) {
      parsed.project.location = "Sydney";
    }
    if (!parsed.project.completion_date) {
      parsed.project.completion_date = "2027-12-31";
    }
    if (typeof parsed.project.contingency_days !== "number") {
      parsed.project.contingency_days = 20;
    }
    if (typeof parsed.project.target_p_value !== "number") {
      parsed.project.target_p_value = 80;
    }
    parsed.project.target_p_value = Math.max(0, Math.min(100, Math.round(parsed.project.target_p_value / 10) * 10));
    if (!parsed.project.number_scale) {
      parsed.project.number_scale = "millions";
    }
    if (typeof parsed.project.currency_decimals !== "number") {
      parsed.project.currency_decimals = 2;
    }
    if (!parsed.project.date_format) {
      parsed.project.date_format = "DD/MM/YYYY";
    }
    if (!parsed.project.chart_label_mode) {
      parsed.project.chart_label_mode = "hover";
    }
    if (!parsed.project.project_stage) {
      parsed.project.project_stage = "Planning";
    }
    return parsed;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
}

function saveData() {
  state.data.project.updated_at = new Date().toISOString();
  state.simulation.result = null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  render();
}

function fmtNumber(value, currency = false) {
  if (currency) {
    const amount = Number(value || 0);
    const decimals = Math.max(0, Math.min(4, Number(state.data.project.currency_decimals ?? 2)));
    const scale = state.data.project.number_scale || "millions";

    if (scale === "millions") {
      const scaled = amount / 1_000_000;
      const symbol =
        new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: state.data.project.currency || "USD",
          currencyDisplay: "narrowSymbol",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })
          .formatToParts(0)
          .find((part) => part.type === "currency")?.value || "$";
      return `${symbol}${scaled.toFixed(decimals)}m`;
    }

    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: state.data.project.currency || "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }

  return new Intl.NumberFormat().format(Number(value || 0));
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString();
}

function getActiveRisks() {
  return state.data.risks.filter((risk) => risk.status !== "Closed");
}

function calcMetrics() {
  const active = getActiveRisks();
  const openCount = active.length;
  const expectedCost = active.reduce((sum, risk) => sum + risk.probability * risk.impact_cost_mid, 0);
  const expectedDays = active.reduce((sum, risk) => sum + risk.probability * risk.impact_days_mid, 0);
  const topRisk = active
    .slice()
    .sort((a, b) => b.probability * b.impact_cost_mid - a.probability * a.impact_cost_mid)[0];

  return { openCount, expectedCost, expectedDays, topRisk };
}

function calcContingencyPValue() {
  return calcContingencyPValueFromResults(state.simulation.result?.costResults);
}

function formatPValue(pValue) {
  if (!pValue) {
    return "P0";
  }

  return `P${pValue.percentile.toFixed(0)}`;
}

function calcContingencyPValueFromResults(results) {
  const contingency = Number(state.data.project.contingency || 0);

  if (!results || !results.length) {
    return null;
  }

  const atOrBelow = results.filter((value) => value <= contingency).length;
  return {
    percentile: (atOrBelow / results.length) * 100,
    contingency,
    runs: results.length
  };
}


function formatDateOnly(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  const format = state.data.project.date_format || "DD/MM/YYYY";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());

  if (format === "MM/DD/YYYY") {
    return `${mm}/${dd}/${yyyy}`;
  }
  if (format === "YYYY-MM-DD") {
    return `${yyyy}-${mm}-${dd}`;
  }
  return `${dd}/${mm}/${yyyy}`;
}

function calcForecastCompletionDate(scheduleImpactValue) {
  const baseDate = new Date(state.data.project.completion_date);
  if (Number.isNaN(baseDate.getTime())) {
    return "N/A";
  }

  const scheduleUnitsInDays = state.data.project.units === "Weeks" ? 7 : 1;
  const contingencyDays = Number(state.data.project.contingency_days || 0);
  const riskImpactDays = Number(scheduleImpactValue || 0) * scheduleUnitsInDays;
  const offsetDays = riskImpactDays - contingencyDays;

  baseDate.setDate(baseDate.getDate() + Math.round(offsetDays));
  return formatDateOnly(baseDate);
}

function calcScheduleContingencyPValueFromResults(results) {
  const contingencyDays = Number(state.data.project.contingency_days || 0);

  if (!results || !results.length) {
    return null;
  }

  const atOrBelow = results.filter((value) => value <= contingencyDays).length;
  return {
    percentile: (atOrBelow / results.length) * 100,
    contingencyDays,
    runs: results.length
  };
}


function calcCurrentAllowanceDate() {
  const baseDate = new Date(state.data.project.completion_date);
  if (Number.isNaN(baseDate.getTime())) {
    return "N/A";
  }

  const contingencyDays = Number(state.data.project.contingency_days || 0);
  baseDate.setDate(baseDate.getDate() - Math.round(contingencyDays));
  return formatDateOnly(baseDate);
}

function calcTargetCompletionDateFromResults(scheduleResults) {
  if (!scheduleResults || !scheduleResults.length) {
    return "N/A";
  }

  const sorted = scheduleResults.slice().sort((a, b) => a - b);
  const targetPercentile = Math.max(0, Math.min(100, Number(state.data.project.target_p_value || 0)));
  const scheduleAtTarget = getPercentileValue(sorted, targetPercentile);
  return calcForecastCompletionDate(scheduleAtTarget);
}


function calcTargetValue(sortedValues, targetPValue) {
  if (!sortedValues || !sortedValues.length) {
    return 0;
  }
  return getPercentileValue(sortedValues, targetPValue);
}

function formatDeltaPair(deltaValue, unit = "") {
  const sign = deltaValue >= 0 ? "+" : "-";
  if (unit) {
    return `${sign}${Math.abs(deltaValue).toFixed(1)} ${unit}`;
  }
  return `${sign}${fmtNumber(Math.abs(deltaValue), true)}`;
}

function lerpNumber(from, to, progress) {
  return from + (to - from) * progress;
}

function blendArray(from = [], to = [], progress = 1) {
  const total = Math.max(from.length, to.length);
  if (!total) {
    return [];
  }

  const fromLast = from[from.length - 1] ?? 0;
  const toLast = to[to.length - 1] ?? fromLast;

  return Array.from({ length: total }, (_, index) => {
    const a = from[index] ?? fromLast;
    const b = to[index] ?? toLast;
    return lerpNumber(a, b, progress);
  });
}

function blendStats(from = {}, to = {}, progress = 1) {
  const keys = ["mean", "median", "p50", "p80", "p90", "min", "max"];
  const output = {};
  keys.forEach((key) => {
    const a = Number(from[key] ?? 0);
    const b = Number(to[key] ?? a);
    output[key] = lerpNumber(a, b, progress);
  });
  return output;
}

function blendRiskContributions(from = [], to = [], progress = 1) {
  const byId = new Map();
  from.forEach((entry) => byId.set(entry.id, { ...entry }));

  to.forEach((entry) => {
    const base = byId.get(entry.id) || {
      id: entry.id,
      title: entry.title,
      costLow: 0,
      costHigh: 0,
      scheduleLow: 0,
      scheduleHigh: 0
    };

    byId.set(entry.id, {
      id: entry.id,
      title: entry.title || base.title,
      costLow: lerpNumber(Number(base.costLow || 0), Number(entry.costLow || 0), progress),
      costHigh: lerpNumber(Number(base.costHigh || 0), Number(entry.costHigh || 0), progress),
      scheduleLow: lerpNumber(Number(base.scheduleLow || 0), Number(entry.scheduleLow || 0), progress),
      scheduleHigh: lerpNumber(Number(base.scheduleHigh || 0), Number(entry.scheduleHigh || 0), progress)
    });
  });

  return Array.from(byId.values());
}

function getMorphProgress(progress) {
  const t = Math.max(0, Math.min(1, Number(progress || 0)));
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function getDisplaySimulationResult() {
  const base = state.simulation.result;
  if (!base) {
    return null;
  }

  const morph = state.simulation.morph;
  if (!morph.active || !morph.fromResult || !morph.toResult) {
    return base;
  }

  const t = getMorphProgress(morph.progress);
  return {
    iterations: morph.toResult.iterations,
    costResults: blendArray(morph.fromResult.costResults, morph.toResult.costResults, t),
    scheduleResults: blendArray(morph.fromResult.scheduleResults, morph.toResult.scheduleResults, t),
    costStats: blendStats(morph.fromResult.costStats, morph.toResult.costStats, t),
    scheduleStats: blendStats(morph.fromResult.scheduleStats, morph.toResult.scheduleStats, t),
    riskContributions: blendRiskContributions(
      morph.fromResult.riskContributions || [],
      morph.toResult.riskContributions || [],
      t
    )
  };
}

function getRagStatus(currentPercentile, targetPercentile) {
  const current = Number(currentPercentile || 0);
  const target = Number(targetPercentile || 0);

  if (current >= target) {
    return { className: "rag-green", label: "On target" };
  }

  if (current >= target - 10) {
    return { className: "rag-amber", label: "Near target" };
  }

  return { className: "rag-red", label: "Below target" };
}

function formatPValueWithRag(pValue, targetPercentile) {
  const rag = getRagStatus(pValue?.percentile, targetPercentile);
  return `<span class="pvalue-with-rag"><span class="rag-dot ${rag.className}" title="${rag.label}" aria-label="${rag.label}"></span>${formatPValue(
    pValue
  )}</span>`;
}

function ensureSimulationResult() {
  if (!state.simulation.result && window.SimulationEngine) {
    state.simulation.result = window.SimulationEngine.runMonteCarlo(
      state.data.risks,
      state.simulation.iterations
    );
  }
}

function renderNav() {
  navMenu.innerHTML = "";
  NAV_ITEMS.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = `nav-item ${state.page === item ? "active" : ""}`;
    btn.textContent = item;
    btn.onclick = () => {
      state.page = item;
      render();
    };
    navMenu.appendChild(btn);
  });
}

function makeCard(label, value) {
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `<div class="tile-label">${label}</div><div class="tile-value">${value}</div>`;
  return el;
}

function makeTileGroup(title, cards, tilesClass = "tiles") {
  const group = document.createElement("section");
  group.className = "tile-group card";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const tiles = document.createElement("div");
  tiles.className = tilesClass;
  if (tilesClass.includes("tiles-fixed-5")) {
    group.classList.add("fixed-tiles");
  }
  tiles.append(...cards);
  group.append(heading, tiles);
  return group;
}

function makeListCard(title, rows) {
  const card = document.createElement("section");
  card.className = "card summary-list-card";
  const safeRows = rows
    .map(
      (row) =>
        `<div class="summary-row"><span class="summary-label">${row.label}</span><span class="summary-value">${row.value}</span></div>`
    )
    .join("");
  card.innerHTML = `<h3>${title}</h3><div class="summary-list">${safeRows}</div>`;
  return card;
}

function buildTopRiskTornadoEntries(simulationResult, type = "cost", limit = 5) {
  const isCost = type === "cost";
  const entries = (simulationResult?.riskContributions || []).map((entry) => ({
    label: entry.title,
    low: Math.max(0, Number(isCost ? entry.costLow : entry.scheduleLow) || 0),
    high: Math.max(0, Number(isCost ? entry.costHigh : entry.scheduleHigh) || 0)
  }));

  return entries
    .sort((a, b) => b.high - a.high)
    .slice(0, limit);
}

function renderTornadoChart(title, entries, formatter = (v) => String(v), typeLabel = "impact") {
  const card = document.createElement("div");
  card.className = "card tornado-chart";

  if (!entries.length) {
    card.innerHTML = `<h3>${title}</h3><p class="tile-label">No open risks available.</p>`;
    return card;
  }

  const maxValue = Math.max(...entries.map((entry) => Math.max(entry.low, entry.high)), 1);
  const rows = entries
    .map((entry) => {
      const lowPct = (Math.max(entry.low, 0) / maxValue) * 100;
      const highPct = (Math.max(entry.high, 0) / maxValue) * 100;
      const tooltip = `${entry.label}: likely ${typeLabel} range ${formatter(entry.low)} to ${formatter(entry.high)}`;
      return `
        <div class="tornado-row">
          <div class="tornado-label" title="${entry.label}">${entry.label}</div>
          <div class="tornado-track-wrap" data-tooltip="${tooltip}">
            <div class="tornado-track">
              <div class="tornado-centerline"></div>
              <div class="tornado-bar tornado-bar-low" style="width:${lowPct.toFixed(1)}%"></div>
              <div class="tornado-bar tornado-bar-high" style="width:${highPct.toFixed(1)}%"></div>
            </div>
          </div>
          <div class="tornado-values">${formatter(entry.low)} – ${formatter(entry.high)}</div>
        </div>
      `;
    })
    .join("");

  card.innerHTML = `<h3>${title}</h3><div class="tornado-body">${rows}</div><div class="chart-tooltip tooltip-hidden"></div>`;

  const tooltip = card.querySelector(".chart-tooltip");
  card.querySelectorAll("[data-tooltip]").forEach((element) => {
    const positionTooltip = (event) => {
      const bounds = card.getBoundingClientRect();
      tooltip.style.left = `${event.clientX - bounds.left + 10}px`;
      tooltip.style.top = `${event.clientY - bounds.top - 10}px`;
    };

    element.addEventListener("mouseenter", (event) => {
      tooltip.textContent = element.dataset.tooltip;
      tooltip.classList.remove("tooltip-hidden");
      positionTooltip(event);
    });

    element.addEventListener("mousemove", (event) => {
      positionTooltip(event);
    });

    element.addEventListener("mouseleave", () => {
      tooltip.classList.add("tooltip-hidden");
    });
  });

  return card;
}

function renderBarChart(title, entries, formatter = (v) => v) {
  const template = document.getElementById("chart-template");
  const node = template.content.firstElementChild.cloneNode(true);
  node.querySelector("h3").textContent = title;
  const bars = node.querySelector(".chart-bars");
  const max = Math.max(...entries.map((e) => e.value), 1);

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    const widthPct = (entry.value / max) * 100;
    row.innerHTML = `
      <div>${entry.label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${widthPct}%"></div></div>
      <div>${formatter(entry.value)}</div>
    `;
    bars.appendChild(row);
  });

  return node;
}

function buildDensitySeries(values, points = 60) {
  if (!values || !values.length) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ x: min, y: 1 }];
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance) || 1;
  const bandwidth = Math.max((1.06 * stdDev) / Math.pow(values.length, 0.2), (max - min) / 100);

  const domainMin = min - bandwidth * 2;
  const domainMax = max + bandwidth * 2;
  const step = (domainMax - domainMin) / (points - 1);

  const gaussian = (u) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);

  const densities = Array.from({ length: points }, (_, index) => {
    const x = domainMin + step * index;
    const y = values.reduce((sum, value) => sum + gaussian((x - value) / bandwidth), 0) / (values.length * bandwidth);
    return { x, y };
  });

  return densities;
}

function getPercentileValue(sortedValues, percentile) {
  if (!sortedValues.length) {
    return 0;
  }

  const rank = (percentile / 100) * (sortedValues.length - 1);
  const lowIndex = Math.floor(rank);
  const highIndex = Math.ceil(rank);

  if (lowIndex === highIndex) {
    return sortedValues[lowIndex];
  }

  const weight = rank - lowIndex;
  return sortedValues[lowIndex] * (1 - weight) + sortedValues[highIndex] * weight;
}

function interpolateDensity(points, xValue) {
  if (xValue <= points[0].x) {
    return points[0].y;
  }

  if (xValue >= points[points.length - 1].x) {
    return points[points.length - 1].y;
  }

  for (let i = 1; i < points.length; i += 1) {
    const left = points[i - 1];
    const right = points[i];
    if (xValue <= right.x) {
      const t = (xValue - left.x) / (right.x - left.x);
      return left.y + t * (right.y - left.y);
    }
  }

  return points[points.length - 1].y;
}


function buildInterpolatedSeries(values, targetValues, progress) {
  const source = buildDensitySeries(values);

  if (!targetValues || progress >= 1) {
    return source;
  }

  const target = buildDensitySeries(targetValues);
  const total = Math.max(source.length, target.length);
  if (!total) {
    return source;
  }

  const getPoint = (arr, idx) => arr[Math.min(arr.length - 1, idx)];

  return Array.from({ length: total }, (_, index) => {
    const a = getPoint(source, index);
    const b = getPoint(target, index);
    return {
      x: a.x + (b.x - a.x) * progress,
      y: a.y + (b.y - a.y) * progress
    };
  });
}

function renderDistributionLineChart(title, values, options = {}) {
  const card = document.createElement("div");
  card.className = "card distribution-chart";
  const points = buildInterpolatedSeries(values, options.morphTargetValues, options.morphProgress || 0);

  if (!points.length) {
    card.innerHTML = `<h3>${title}</h3><p class="tile-label">No simulation data available.</p>`;
    return card;
  }

  const width = 640;
  const height = 220;
  const padX = 36;
  const padY = 18;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const xMin = points[0].x;
  const xMax = points[points.length - 1].x;
  const yMin = 0;
  const yMax = Math.max(...points.map((point) => point.y), 1e-9);

  const xToSvg = (value) => {
    const xRatio = xMax === xMin ? 0.5 : (value - xMin) / (xMax - xMin);
    return padX + xRatio * usableW;
  };

  const yToSvg = (value) => {
    const yRatio = yMax === yMin ? 0.5 : (value - yMin) / (yMax - yMin);
    return padY + (1 - yRatio) * usableH;
  };

  const scaled = points.map((point) => ({
    x: xToSvg(point.x),
    y: yToSvg(point.y)
  }));

  const linePath = scaled
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${(width - padX).toFixed(1)},${(height - padY).toFixed(1)} L${padX.toFixed(1)},${(height - padY).toFixed(1)} Z`;

  const chartId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const formatter = options.valueFormatter || ((value) => fmtNumber(value));

  const sortedValues = values.slice().sort((a, b) => a - b);
  const markerPercentiles = options.markerPercentiles || [10, 20, 30, 40, 50, 60, 70, 80, 90];
  const targetMarkerPercentile = Number(options.targetPercentile);
  const labelMode = options.labelMode === "callout" ? "callout" : "hover";

  const markerElements = markerPercentiles
    .map((percentile) => {
      const xValue = getPercentileValue(sortedValues, percentile);
      const yValue = interpolateDensity(points, xValue);
      const x = xToSvg(xValue);
      const y = yToSvg(yValue);
      const isTarget = Number.isFinite(targetMarkerPercentile) && percentile === targetMarkerPercentile;
      const tooltip = `P${percentile}: ${formatter(xValue)}`;
      const markerClass = isTarget ? "chart-marker chart-marker-target" : "chart-marker";
      const hitRadius = isTarget ? 11 : 9;
      const callout = labelMode === "callout" ? `<text x="${x.toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" class="chart-callout">P${percentile}</text>` : "";
      return `<g>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${hitRadius}" class="chart-marker-hit" data-tooltip="${tooltip}" />
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${isTarget ? 4.8 : 3.2}" class="${markerClass}" />
        ${callout}
      </g>`;
    })
    .join("");

  const referenceLines = [];
  if (typeof options.projectPercentile === "number") {
    referenceLines.push({
      percentile: options.projectPercentile,
      label: options.projectLabel || "Current Project P",
      className: options.projectLineClass || "chart-project-line"
    });
  }

  if (Array.isArray(options.referenceLines)) {
    referenceLines.push(...options.referenceLines);
  }

  const projectP = Number(options.projectPercentile);
  const targetP = Number(options.targetPercentile);
  const hasBand = Number.isFinite(projectP) && Number.isFinite(targetP);
  let bandElement = "";
  if (hasBand) {
    const projectX = xToSvg(getPercentileValue(sortedValues, Math.max(0, Math.min(100, projectP))));
    const targetX = xToSvg(getPercentileValue(sortedValues, Math.max(0, Math.min(100, targetP))));
    const bandX = Math.min(projectX, targetX);
    const bandW = Math.abs(targetX - projectX);
    const ragClass = (options.projectLineClass || "").includes("rag-red")
      ? "rag-red"
      : (options.projectLineClass || "").includes("rag-amber")
        ? "rag-amber"
        : "rag-green";
    bandElement = `<rect x="${bandX.toFixed(1)}" y="${padY}" width="${bandW.toFixed(1)}" height="${(height - padY * 2).toFixed(1)}" class="chart-gap-fill ${ragClass}" />`;
  }

  const referenceLineElements = referenceLines
    .filter((line) => typeof line.percentile === "number")
    .map((line) => {
      const clamped = Math.max(0, Math.min(100, line.percentile));
      const xValue = getPercentileValue(sortedValues, clamped);
      const x = xToSvg(xValue);
      const tooltip = `${line.label || "Reference"}: P${clamped.toFixed(0)} (${formatter(xValue)})`;
      const className = line.className || "chart-project-line";
      const callout = labelMode === "callout" ? `<text x="${x.toFixed(1)}" y="${(padY + 10).toFixed(1)}" text-anchor="middle" class="chart-callout">${line.label || `P${clamped.toFixed(0)}`}</text>` : "";
      return `<g>
        <line x1="${x.toFixed(1)}" y1="${padY}" x2="${x.toFixed(1)}" y2="${height - padY}" class="${className}" />
        <line x1="${x.toFixed(1)}" y1="${padY}" x2="${x.toFixed(1)}" y2="${height - padY}" class="chart-reference-hit" data-tooltip="${tooltip}" />
        ${callout}
      </g>`;
    })
    .join("");

  card.innerHTML = `
    <h3>${title}</h3>
    <svg class="distribution-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="grad-${chartId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.35" />
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.04" />
        </linearGradient>
      </defs>
      <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" class="chart-axis" />
      <line x1="${padX}" y1="${padY + usableH / 2}" x2="${width - padX}" y2="${padY + usableH / 2}" class="chart-grid" />
      <path d="${areaPath}" class="chart-area" style="fill:url(#grad-${chartId})" />
      ${bandElement}
      <path d="${linePath}" class="chart-line" />
      <path d="${linePath}" class="chart-line-hit" data-tooltip="${title} curve" />
      ${referenceLineElements}
      ${markerElements}
      <text x="${padX}" y="${height - 2}" class="chart-tick">${formatter(xMin)}</text>
      <text x="${width - padX}" y="${height - 2}" text-anchor="end" class="chart-tick">${formatter(xMax)}</text>
    </svg>
    <div class="chart-tooltip tooltip-hidden"></div>
  `;

  const tooltip = card.querySelector(".chart-tooltip");
  if (labelMode === "hover") {
    card.querySelectorAll("[data-tooltip]").forEach((element) => {
      element.addEventListener("mouseenter", () => {
        tooltip.textContent = element.dataset.tooltip;
        tooltip.classList.remove("tooltip-hidden");
      });

      element.addEventListener("mousemove", (event) => {
        const bounds = card.getBoundingClientRect();
        tooltip.style.left = `${event.clientX - bounds.left + 10}px`;
        tooltip.style.top = `${event.clientY - bounds.top - 10}px`;
      });

      element.addEventListener("mouseleave", () => {
        tooltip.classList.add("tooltip-hidden");
      });
    });
  } else {
    tooltip.remove();
  }

  return card;
}

function renderDashboard() {
  ensureSimulationResult();
  const simulation = getDisplaySimulationResult() || state.simulation.result;
  const metrics = calcMetrics();
  const totalRisks = state.data.risks.length;
  const openCount = state.data.risks.filter((risk) => risk.status === "Open").length;
  const mitigatingCount = state.data.risks.filter((risk) => risk.status === "Mitigating").length;
  const closedCount = state.data.risks.filter((risk) => risk.status === "Closed").length;
  const riskValueIdentified = state.data.risks.reduce((sum, risk) => sum + Number(risk.impact_cost_mid || 0), 0);
  const scheduleRiskIdentified = state.data.risks.reduce((sum, risk) => sum + Number(risk.impact_days_mid || 0), 0);

  const contingencyPValue = calcContingencyPValueFromResults(simulation?.costResults);
  const contingencyDaysPValue = calcScheduleContingencyPValueFromResults(simulation?.scheduleResults);
  const targetPValue = Math.max(0, Math.min(100, Number(state.data.project.target_p_value || 0)));

  const topCostTornado = buildTopRiskTornadoEntries(simulation, "cost", 5);
  const topScheduleTornado = buildTopRiskTornadoEntries(simulation, "schedule", 5);

  const projectTiles = makeTileGroup(
    "Project Details",
    [
      makeCard("Project Name", state.data.project.name || "N/A"),
      makeCard("Client", state.data.project.client || "N/A"),
      makeCard("Project Stage", state.data.project.project_stage || "Planning"),
      makeCard("Project Value", fmtNumber(state.data.project.baseline_cost, true)),
      makeCard("Completion Date", formatDateOnly(state.data.project.completion_date))
    ],
    "tiles tiles-fixed-5"
  );

  const riskAnalysisTiles = makeTileGroup(
    "Risk Analysis",
    [
      makeCard("Risks Identified", String(totalRisks)),
      makeCard("Value of Risks Identified", fmtNumber(riskValueIdentified, true)),
      makeCard("Schedule Risk Identified", `${scheduleRiskIdentified.toFixed(1)} days`),
      makeCard("Risk Status (O/M/C)", `${openCount} / ${mitigatingCount} / ${closedCount}`),
      makeCard("Expected Cost Exposure", fmtNumber(metrics.expectedCost, true))
    ],
    "tiles tiles-fixed-5"
  );

  const commercialTiles = makeTileGroup("Commercial", [
    makeCard("P50 Cost", fmtNumber(simulation?.costStats?.p50 || 0, true)),
    makeCard("P80 Cost", fmtNumber(simulation?.costStats?.p80 || 0, true)),
    makeCard("P90 Cost", fmtNumber(simulation?.costStats?.p90 || 0, true))
  ]);

  const scheduleTiles = makeTileGroup("Schedule", [
    makeCard("P50 Schedule (days)", Number(simulation?.scheduleStats?.p50 || 0).toFixed(1)),
    makeCard("P80 Schedule (days)", Number(simulation?.scheduleStats?.p80 || 0).toFixed(1)),
    makeCard("P90 Schedule (days)", Number(simulation?.scheduleStats?.p90 || 0).toFixed(1))
  ]);

  const dashboardLayout = document.createElement("div");
  dashboardLayout.className = "grid-2 outputs-layout";
  projectTiles.classList.add("output-project-full");
  riskAnalysisTiles.classList.add("output-project-full");

  const commercialRag = getRagStatus(contingencyPValue?.percentile, targetPValue);
  const scheduleRag = getRagStatus(contingencyDaysPValue?.percentile, targetPValue);

  const commercialColumn = document.createElement("div");
  commercialColumn.className = "outputs-column";
  commercialColumn.append(
    commercialTiles,
    renderDistributionLineChart("Cost Distribution", simulation?.costResults || [], {
      projectPercentile: contingencyPValue?.percentile,
      projectLabel: "Current project P-value",
      projectLineClass: `chart-project-line ${commercialRag.className}`,
      referenceLines: [{ percentile: targetPValue, label: `Target P${targetPValue.toFixed(0)}`, className: "chart-target-line" }],
      valueFormatter: (value) => fmtNumber(value, true),
      targetPercentile: targetPValue,
      labelMode: state.data.project.chart_label_mode
    }),
    renderTornadoChart("Top 5 Cost Risks (Tornado)", topCostTornado, (value) => fmtNumber(value, true), "cost exposure")
  );

  const scheduleColumn = document.createElement("div");
  scheduleColumn.className = "outputs-column";
  scheduleColumn.append(
    scheduleTiles,
    renderDistributionLineChart("Schedule Distribution", simulation?.scheduleResults || [], {
      projectPercentile: contingencyDaysPValue?.percentile,
      projectLabel: "Current contingency days",
      projectLineClass: `chart-project-line ${scheduleRag.className}`,
      referenceLines: [{ percentile: targetPValue, label: `Target P${targetPValue.toFixed(0)}`, className: "chart-target-line" }],
      valueFormatter: (value) => `${value.toFixed(1)}d`,
      targetPercentile: targetPValue,
      labelMode: state.data.project.chart_label_mode
    }),
    renderTornadoChart("Top 5 Schedule Risks (Tornado)", topScheduleTornado, (value) => `${value.toFixed(1)}d`, "schedule impact")
  );

  dashboardLayout.append(projectTiles, riskAnalysisTiles, commercialColumn, scheduleColumn);
  pageContent.append(dashboardLayout);
}

function renderSettings() {
  const wrapper = document.createElement("div");
  wrapper.className = "settings-list";
  const isDark = document.body.classList.contains("dark-theme");

  wrapper.innerHTML = `
    <section class="card settings-section">
      <h3>General Settings</h3>
      <form id="general-settings-form" class="settings-list-form">
        <div class="setting-row">
          <label for="settings-currency">Currency</label>
          <input id="settings-currency" name="currency" value="${state.data.project.currency}" required />
        </div>
        <div class="setting-row">
          <label for="settings-units">Schedule Units</label>
          <select id="settings-units" name="units">
            <option value="Days" ${state.data.project.units === "Days" ? "selected" : ""}>Days</option>
            <option value="Weeks" ${state.data.project.units === "Weeks" ? "selected" : ""}>Weeks</option>
          </select>
        </div>
        <div class="setting-row">
          <label for="settings-number-scale">Rounding / Scale</label>
          <select id="settings-number-scale" name="number_scale">
            <option value="millions" ${state.data.project.number_scale === "millions" ? "selected" : ""}>Millions (e.g. $12.00m)</option>
            <option value="full" ${state.data.project.number_scale === "full" ? "selected" : ""}>Full Value</option>
          </select>
        </div>
        <div class="setting-row">
          <label for="settings-currency-decimals">Currency Decimals</label>
          <input id="settings-currency-decimals" name="currency_decimals" type="number" min="0" max="4" step="1" value="${state.data.project.currency_decimals ?? 2}" required />
        </div>
        <div class="setting-row">
          <label for="settings-date-format">Date Format</label>
          <select id="settings-date-format" name="date_format">
            <option value="DD/MM/YYYY" ${state.data.project.date_format === "DD/MM/YYYY" ? "selected" : ""}>DD/MM/YYYY</option>
            <option value="MM/DD/YYYY" ${state.data.project.date_format === "MM/DD/YYYY" ? "selected" : ""}>MM/DD/YYYY</option>
            <option value="YYYY-MM-DD" ${state.data.project.date_format === "YYYY-MM-DD" ? "selected" : ""}>YYYY-MM-DD</option>
          </select>
        </div>
        <div class="setting-row">
          <label for="settings-chart-label-mode">Chart Data Labels</label>
          <select id="settings-chart-label-mode" name="chart_label_mode">
            <option value="hover" ${state.data.project.chart_label_mode === "hover" ? "selected" : ""}>Show on hover</option>
            <option value="callout" ${state.data.project.chart_label_mode === "callout" ? "selected" : ""}>Show as callouts</option>
          </select>
        </div>
        <div class="setting-row">
          <label for="settings-theme-toggle">Theme</label>
          <label class="inline-toggle">
            <input id="settings-theme-toggle" type="checkbox" ${isDark ? "checked" : ""} />
            <span>${isDark ? "Dark" : "Light"}</span>
          </label>
        </div>
        <div class="actions"><button type="submit">Save General</button></div>
      </form>
    </section>

    <section class="card settings-section">
      <h3>Project Settings</h3>
      <form id="project-settings-form" class="settings-list-form">
        <div class="setting-row">
          <label for="settings-project-name">Project Name</label>
          <input id="settings-project-name" name="name" value="${state.data.project.name}" required />
        </div>
        <div class="setting-row">
          <label for="settings-client">Client</label>
          <input id="settings-client" name="client" value="${state.data.project.client || ""}" />
        </div>
        <div class="setting-row">
          <label for="settings-project-number">Project Number</label>
          <input id="settings-project-number" name="project_number" value="${state.data.project.project_number || ""}" />
        </div>
        <div class="setting-row">
          <label for="settings-location">Location</label>
          <input id="settings-location" name="location" value="${state.data.project.location || ""}" />
        </div>
        <div class="setting-row">
          <label for="settings-project-stage">Project Stage</label>
          <input id="settings-project-stage" name="project_stage" value="${state.data.project.project_stage || "Planning"}" />
        </div>
        <div class="setting-row">
          <label for="settings-project-value">Project Value</label>
          <input id="settings-project-value" name="baseline_cost" type="number" min="0" step="1" value="${state.data.project.baseline_cost}" required />
        </div>
        <div class="setting-row">
          <label for="settings-contingency">Current Contingency</label>
          <input id="settings-contingency" name="contingency" type="number" min="0" step="1" value="${state.data.project.contingency}" required />
        </div>
        <div class="setting-row">
          <label for="settings-completion-date">Current Completion Date</label>
          <input id="settings-completion-date" name="completion_date" type="date" value="${state.data.project.completion_date || ""}" required />
        </div>
        <div class="setting-row">
          <label for="settings-contingency-days">Current Contingency Days</label>
          <input id="settings-contingency-days" name="contingency_days" type="number" min="0" step="0.1" value="${state.data.project.contingency_days ?? 20}" required />
        </div>
        <div class="setting-row">
          <label for="settings-target-p">Target P Value</label>
          <input id="settings-target-p" name="target_p_value" type="number" min="0" max="100" step="10" value="${state.data.project.target_p_value ?? 80}" required />
        </div>
        <div class="actions"><button type="submit">Save Project</button></div>
      </form>
      <p class="tile-label">Last updated: ${fmtDate(state.data.project.updated_at)}</p>
    </section>
  `;

  const themeToggle = wrapper.querySelector("#settings-theme-toggle");
  const themeLabel = wrapper.querySelector(".inline-toggle span");
  themeToggle.addEventListener("change", (event) => {
    handleThemeToggle(event);
    themeLabel.textContent = event.target.checked ? "Dark" : "Light";
  });

  wrapper.querySelector("#general-settings-form").onsubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    state.data.project = {
      ...state.data.project,
      currency: form.get("currency"),
      units: form.get("units"),
      number_scale: form.get("number_scale"),
      currency_decimals: Number(form.get("currency_decimals")),
      date_format: form.get("date_format"),
      chart_label_mode: form.get("chart_label_mode"),
      updated_at: new Date().toISOString()
    };
    state.simulation.result = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    render();
  };

  wrapper.querySelector("#project-settings-form").onsubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    state.data.project = {
      ...state.data.project,
      name: form.get("name"),
      client: form.get("client"),
      project_number: form.get("project_number"),
      location: form.get("location"),
      project_stage: form.get("project_stage"),
      baseline_cost: Number(form.get("baseline_cost")),
      contingency: Number(form.get("contingency")),
      completion_date: form.get("completion_date"),
      contingency_days: Number(form.get("contingency_days")),
      target_p_value: Math.round(Number(form.get("target_p_value")) / 10) * 10,
      updated_at: new Date().toISOString()
    };
    state.simulation.result = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    render();
  };

  pageContent.appendChild(wrapper);
}

function renderRiskRegister() {
  const section = document.createElement("div");
  section.className = "card";
  section.innerHTML = `<div class="actions"><h3 style="margin-right:auto;">Risk Register</h3><button id="add-risk">Add Risk</button></div>`;

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Title</th><th>Category</th><th>Owner</th><th>Status</th><th>Probability</th><th>Cost Mid</th><th>Days Mid</th><th>Updated</th><th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${state.data.risks
        .map(
          (risk) => `
        <tr data-risk-id="${risk.id}">
          <td>${risk.title}</td>
          <td>${risk.category}</td>
          <td>${risk.owner}</td>
          <td><span class="status-badge">${risk.status}</span></td>
          <td>${risk.probability.toFixed(2)}</td>
          <td>${fmtNumber(risk.impact_cost_mid, true)}</td>
          <td>${risk.impact_days_mid}</td>
          <td>${fmtDate(risk.updated_at)}</td>
          <td><button class="secondary delete-risk" data-id="${risk.id}">Delete</button></td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  table.querySelectorAll("tbody tr").forEach((row) => {
    row.onclick = (event) => {
      if (event.target.classList.contains("delete-risk")) {
        return;
      }
      openRiskModal(row.dataset.riskId);
    };
  });

  table.querySelectorAll(".delete-risk").forEach((btn) => {
    btn.onclick = (event) => {
      event.stopPropagation();
      const id = btn.dataset.id;
      if (confirm("Delete this risk?")) {
        state.data.risks = state.data.risks.filter((risk) => risk.id !== id);
        saveData();
      }
    };
  });

  section.querySelector("#add-risk").onclick = () => openRiskModal();
  section.appendChild(table);
  pageContent.appendChild(section);
}

function buildRiskForm(risk) {
  riskForm.innerHTML = `
    <div class="form-grid">
      <label>Title <input name="title" required value="${risk.title || ""}" /></label>
      <label>Category
        <select name="category">${categories
          .map((c) => `<option value="${c}" ${risk.category === c ? "selected" : ""}>${c}</option>`)
          .join("")}</select>
      </label>
      <label>Owner <input name="owner" value="${risk.owner || ""}" /></label>
      <label>Status
        <select name="status">${statuses
          .map((s) => `<option value="${s}" ${risk.status === s ? "selected" : ""}>${s}</option>`)
          .join("")}</select>
      </label>
      <label>Probability (slider) <input id="prob-slider" type="range" min="0" max="1" step="0.01" value="${risk.probability ?? 0.1}" /></label>
      <label>Probability (0-1) <input id="prob-number" name="probability" type="number" min="0" max="1" step="0.01" value="${risk.probability ?? 0.1}" required /></label>
      <label>Cost Impact Low <input name="impact_cost_low" type="number" min="0" value="${risk.impact_cost_low || 0}" /></label>
      <label>Cost Impact Mid <input name="impact_cost_mid" type="number" min="0" value="${risk.impact_cost_mid || 0}" /></label>
      <label>Cost Impact High <input name="impact_cost_high" type="number" min="0" value="${risk.impact_cost_high || 0}" /></label>
      <label>Days Impact Low <input name="impact_days_low" type="number" min="0" value="${risk.impact_days_low || 0}" /></label>
      <label>Days Impact Mid <input name="impact_days_mid" type="number" min="0" value="${risk.impact_days_mid || 0}" /></label>
      <label>Days Impact High <input name="impact_days_high" type="number" min="0" value="${risk.impact_days_high || 0}" /></label>
    </div>
    <label>Description <textarea name="description">${risk.description || ""}</textarea></label>
    <label>Mitigation <textarea name="mitigation">${risk.mitigation || ""}</textarea></label>
    <label>Notes <textarea name="notes">${risk.notes || ""}</textarea></label>
    <div class="actions">
      <button type="submit">Save Risk</button>
      <button type="button" id="cancel-risk" class="secondary">Cancel</button>
    </div>
  `;

  const slider = riskForm.querySelector("#prob-slider");
  const number = riskForm.querySelector("#prob-number");
  slider.oninput = () => {
    number.value = slider.value;
  };
  number.oninput = () => {
    const safe = Math.max(0, Math.min(1, Number(number.value || 0)));
    slider.value = safe;
  };

  riskForm.querySelector("#cancel-risk").onclick = closeRiskModal;

  riskForm.onsubmit = (event) => {
    event.preventDefault();
    const form = new FormData(riskForm);
    const payload = {
      id: risk.id || crypto.randomUUID(),
      project_id: state.data.project.id,
      title: form.get("title"),
      description: form.get("description"),
      category: form.get("category"),
      owner: form.get("owner"),
      status: form.get("status"),
      probability: Number(form.get("probability")),
      impact_cost_low: Number(form.get("impact_cost_low")),
      impact_cost_mid: Number(form.get("impact_cost_mid")),
      impact_cost_high: Number(form.get("impact_cost_high")),
      impact_days_low: Number(form.get("impact_days_low")),
      impact_days_mid: Number(form.get("impact_days_mid")),
      impact_days_high: Number(form.get("impact_days_high")),
      mitigation: form.get("mitigation"),
      notes: form.get("notes"),
      updated_at: new Date().toISOString()
    };

    const existing = state.data.risks.findIndex((item) => item.id === payload.id);
    if (existing >= 0) {
      state.data.risks[existing] = payload;
    } else {
      state.data.risks.push(payload);
    }

    closeRiskModal();
    saveData();
  };
}

function openRiskModal(riskId = null) {
  state.editingRiskId = riskId;
  const risk = state.data.risks.find((item) => item.id === riskId) || {};
  riskModalTitle.textContent = riskId ? "Edit Risk" : "Add Risk";
  buildRiskForm(risk);
  modalBackdrop.classList.remove("hidden");
}

function closeRiskModal() {
  modalBackdrop.classList.add("hidden");
  state.editingRiskId = null;
}

function renderOutputs() {
  const controls = document.createElement("div");
  controls.className = "card";
  controls.innerHTML = `
    <div class="actions">
      <h3 style="margin-right:auto;">Simulation Outputs</h3>
      <button id="run-simulation">Run Simulation</button>
    </div>
  `;

  const runBtn = controls.querySelector("#run-simulation");
  runBtn.disabled = state.simulation.isRunning || state.simulation.morph.active;
  runBtn.textContent = state.simulation.isRunning ? "Running..." : state.simulation.morph.active ? "Updating..." : "Run Simulation";
  runBtn.onclick = runSimulation;
  pageContent.appendChild(controls);

  if (!state.simulation.result && state.simulation.isRunning) {
    const loadingCard = document.createElement("div");
    loadingCard.className = "card";
    loadingCard.innerHTML = `<p class="tile-label">Running ${state.simulation.iterations} iterations...</p>`;
    pageContent.appendChild(loadingCard);
    return;
  }

  if (!state.simulation.result) {
    const emptyCard = document.createElement("div");
    emptyCard.className = "card";
    emptyCard.innerHTML = `<p class="tile-label">Click <strong>Run Simulation</strong> to generate probabilistic cost and schedule distributions.</p>`;
    pageContent.appendChild(emptyCard);
    return;
  }

  const simulation = getDisplaySimulationResult();

  const contingencyPValue = calcContingencyPValueFromResults(simulation?.costResults);
  const contingencyDaysPValue = calcScheduleContingencyPValueFromResults(simulation?.scheduleResults);
  const targetPValue = Math.max(0, Math.min(100, Number(state.data.project.target_p_value || 0)));

  const projectTiles = makeTileGroup("Project Details", [
    makeCard("Project Cost", fmtNumber(state.data.project.baseline_cost, true)),
    makeCard("Commercial Contingency", fmtNumber(state.data.project.contingency, true)),
    makeCard("Completion Date", formatDateOnly(state.data.project.completion_date)),
    makeCard("Schedule Contingency", `${Number(state.data.project.contingency_days || 0).toFixed(1)} days`),
    makeCard("Target P Value", `P${targetPValue.toFixed(0)}`)
  ]);

  const sortedCostResults = simulation.costResults.slice().sort((a, b) => a - b);
  const sortedScheduleResults = simulation.scheduleResults.slice().sort((a, b) => a - b);
  const targetCostValue = calcTargetValue(sortedCostResults, targetPValue);
  const targetScheduleValue = calcTargetValue(sortedScheduleResults, targetPValue);
  const commercialDeltaValue = Number(state.data.project.contingency || 0) - targetCostValue;
  const scheduleDeltaValue = Number(state.data.project.contingency_days || 0) - targetScheduleValue;

  const simulationSummaryTiles = makeTileGroup("Simulation Results", [
    makeCard("Current Commercial P-value", formatPValueWithRag(contingencyPValue, targetPValue)),
    makeCard(
      "Commercial Delta to Target",
      formatDeltaPair(commercialDeltaValue)
    ),
    makeCard("Current Schedule P-value", formatPValueWithRag(contingencyDaysPValue, targetPValue)),
    makeCard(
      "Schedule Delta to Target",
      formatDeltaPair(scheduleDeltaValue, "days")
    )
  ]);

  const commercialTiles = makeTileGroup("Commercial", [
    makeCard("P50 Cost", fmtNumber(simulation.costStats.p50, true)),
    makeCard("P80 Cost", fmtNumber(simulation.costStats.p80, true)),
    makeCard("P90 Cost", fmtNumber(simulation.costStats.p90, true))
  ]);

  const scheduleTiles = makeTileGroup("Schedule", [
    makeCard("P50 Schedule (days)", simulation.scheduleStats.p50.toFixed(1)),
    makeCard("P80 Schedule (days)", simulation.scheduleStats.p80.toFixed(1)),
    makeCard("P90 Schedule (days)", simulation.scheduleStats.p90.toFixed(1))
  ]);

  const outputLayout = document.createElement("div");
  outputLayout.className = "grid-2 outputs-layout";

  projectTiles.classList.add("output-project-full");
  simulationSummaryTiles.classList.add("output-project-full");

  const topCostTornado = buildTopRiskTornadoEntries(simulation, "cost", 5);
  const topScheduleTornado = buildTopRiskTornadoEntries(simulation, "schedule", 5);

  const commercialRag = getRagStatus(contingencyPValue?.percentile, targetPValue);
  const scheduleRag = getRagStatus(contingencyDaysPValue?.percentile, targetPValue);

  const commercialColumn = document.createElement("div");
  commercialColumn.className = "outputs-column";
  commercialColumn.append(
    commercialTiles,
    renderDistributionLineChart("Cost Distribution", simulation.costResults, {
      projectPercentile: contingencyPValue?.percentile,
      projectLabel: "Current project P-value",
      projectLineClass: `chart-project-line ${commercialRag.className}`,
      referenceLines: [
        {
          percentile: targetPValue,
          label: `Target P${targetPValue.toFixed(0)}`,
          className: "chart-target-line"
        }
      ],
      valueFormatter: (value) => fmtNumber(value, true),
      targetPercentile: targetPValue,
      labelMode: state.data.project.chart_label_mode
    }),
    renderTornadoChart("Top 5 Cost Risks (Tornado)", topCostTornado, (value) => fmtNumber(value, true), "cost exposure")
  );

  const scheduleColumn = document.createElement("div");
  scheduleColumn.className = "outputs-column";
  scheduleColumn.append(
    scheduleTiles,
    renderDistributionLineChart("Schedule Distribution", simulation.scheduleResults, {
      projectPercentile: contingencyDaysPValue?.percentile,
      projectLabel: "Current contingency days",
      projectLineClass: `chart-project-line ${scheduleRag.className}`,
      referenceLines: [
        {
          percentile: targetPValue,
          label: `Target P${targetPValue.toFixed(0)}`,
          className: "chart-target-line"
        }
      ],
      valueFormatter: (value) => `${value.toFixed(1)}d`,
      targetPercentile: targetPValue,
      labelMode: state.data.project.chart_label_mode
    }),
    renderTornadoChart("Top 5 Schedule Risks (Tornado)", topScheduleTornado, (value) => `${value.toFixed(1)}d`, "schedule impact")
  );

  outputLayout.append(projectTiles, simulationSummaryTiles, commercialColumn, scheduleColumn);
  pageContent.append(outputLayout);
}

function runSimulation() {
  if (state.simulation.isRunning || state.simulation.morph.active) {
    return;
  }

  state.simulation.isRunning = true;
  render();

  setTimeout(() => {
    const nextResult = window.SimulationEngine.runMonteCarlo(
      state.data.risks,
      state.simulation.iterations
    );

    const fromResult = state.simulation.result || nextResult;
    state.simulation.isRunning = false;
    state.simulation.morph = {
      ...state.simulation.morph,
      active: true,
      progress: 0,
      fromResult,
      toResult: nextResult
    };

    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min(1, (now - start) / state.simulation.morph.durationMs);
      state.simulation.morph.progress = progress;
      state.simulation.result = state.simulation.morph.fromResult;
      render();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        state.simulation.result = state.simulation.morph.toResult;
        state.simulation.morph.active = false;
        state.simulation.morph.progress = 1;
        render();
      }
    };

    requestAnimationFrame(animate);
  }, 20);
}

function render() {
  projectTitle.textContent = state.data.project.name;
  versionBadge.textContent = APP_VERSION;
  lastUpdated.textContent = `Project updated: ${fmtDate(state.data.project.updated_at)}`;
  pageContent.innerHTML = "";
  renderNav();
  ensureSimulationResult();

  if (state.page === "Dashboard") {
    renderDashboard();
  } else if (state.page === SETTINGS_PAGE) {
    renderSettings();
  } else if (state.page === "Risk Register") {
    renderRiskRegister();
  } else if (state.page === "Outputs") {
    renderOutputs();
  }
}

closeModalBtn.onclick = closeRiskModal;
settingsLink.onclick = () => {
  state.page = SETTINGS_PAGE;
  render();
};

modalBackdrop.onclick = (event) => {
  if (event.target === modalBackdrop) {
    closeRiskModal();
  }
};

initTheme();
render();
