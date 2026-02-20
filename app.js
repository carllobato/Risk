const STORAGE_KEY = "risk-mvp-data-v1";
const NAV_ITEMS = ["Dashboard", "Project Data / Inputs", "Risk Register", "Outputs"];

const categories = ["Cost", "Schedule", "Commercial", "Scope", "Delivery"];
const statuses = ["Open", "Mitigating", "Closed"];

const defaultData = {
  project: {
    id: "p-1",
    name: "Demo Project",
    client: "Northwind Infrastructure",
    currency: "USD",
    baseline_cost: 12000000,
    contingency: 950000,
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
  editingRiskId: null
};

const navMenu = document.getElementById("nav-menu");
const pageContent = document.getElementById("page-content");
const projectTitle = document.getElementById("project-title");
const lastUpdated = document.getElementById("last-updated");
const modalBackdrop = document.getElementById("modal-backdrop");
const closeModalBtn = document.getElementById("close-modal");
const riskForm = document.getElementById("risk-form");
const riskModalTitle = document.getElementById("risk-modal-title");

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
}

function saveData() {
  state.data.project.updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  render();
}

function fmtNumber(value, currency = false) {
  if (currency) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: state.data.project.currency || "USD",
      maximumFractionDigits: 0
    }).format(value || 0);
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

function renderDashboard() {
  const metrics = calcMetrics();
  const wrapper = document.createElement("div");
  wrapper.className = "page-section";

  const tiles = document.createElement("div");
  tiles.className = "tiles";
  tiles.append(
    makeCard("Open risks", metrics.openCount),
    makeCard("Expected cost exposure", fmtNumber(metrics.expectedCost, true)),
    makeCard("Expected schedule exposure (days)", metrics.expectedDays.toFixed(1)),
    makeCard("Top risk", metrics.topRisk ? metrics.topRisk.title : "N/A")
  );

  const byCategory = categories.map((category) => ({
    label: category,
    value: getActiveRisks().reduce(
      (sum, risk) => (risk.category === category ? sum + risk.probability * risk.impact_cost_mid : sum),
      0
    )
  }));

  const byStatus = statuses.map((status) => ({
    label: status,
    value: state.data.risks.filter((risk) => risk.status === status).length
  }));

  const chartGrid = document.createElement("div");
  chartGrid.className = "grid-2";
  chartGrid.append(
    renderBarChart("Cost exposure by category", byCategory, (v) => fmtNumber(v, true)),
    renderBarChart("Risk count by status", byStatus, (v) => String(v))
  );

  wrapper.append(tiles, chartGrid);
  pageContent.appendChild(wrapper);
}

function renderProjectData() {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h3>Project Data / Inputs</h3>
    <form id="project-form" class="form-grid">
      <label>Name <input name="name" value="${state.data.project.name}" required /></label>
      <label>Client <input name="client" value="${state.data.project.client}" required /></label>
      <label>Currency <input name="currency" value="${state.data.project.currency}" required /></label>
      <label>Baseline Cost <input name="baseline_cost" type="number" min="0" step="1" value="${state.data.project.baseline_cost}" required /></label>
      <label>Contingency <input name="contingency" type="number" min="0" step="1" value="${state.data.project.contingency}" required /></label>
      <div class="actions">
        <button type="submit">Save Project</button>
      </div>
    </form>
    <p class="tile-label">Last updated: ${fmtDate(state.data.project.updated_at)}</p>
  `;

  card.querySelector("#project-form").onsubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    state.data.project = {
      ...state.data.project,
      name: form.get("name"),
      client: form.get("client"),
      currency: form.get("currency"),
      baseline_cost: Number(form.get("baseline_cost")),
      contingency: Number(form.get("contingency")),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    render();
  };

  pageContent.appendChild(card);
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
  const metrics = calcMetrics();
  const section = document.createElement("div");
  section.className = "grid-2";

  const ranked = state.data.risks
    .slice()
    .sort((a, b) => b.probability * b.impact_cost_mid - a.probability * a.impact_cost_mid)
    .slice(0, 10);

  const listCard = document.createElement("div");
  listCard.className = "card";
  listCard.innerHTML = `
    <h3>Top Risks by Expected Cost</h3>
    <ol>
      ${ranked
        .map(
          (risk) =>
            `<li>${risk.title} — ${fmtNumber(risk.probability * risk.impact_cost_mid, true)} expected</li>`
        )
        .join("")}
    </ol>
    <p class="note">Monte Carlo simulation module coming next.</p>
  `;

  const summaryCard = document.createElement("div");
  summaryCard.className = "card";
  summaryCard.innerHTML = `
    <h3>Exposure Summary</h3>
    <p>Total expected cost exposure: <strong>${fmtNumber(metrics.expectedCost, true)}</strong></p>
    <p>Total expected schedule exposure: <strong>${metrics.expectedDays.toFixed(1)} days</strong></p>
  `;

  const categoryData = categories.map((category) => ({
    label: category,
    value: getActiveRisks().reduce(
      (sum, risk) => (risk.category === category ? sum + risk.probability * risk.impact_cost_mid : sum),
      0
    )
  }));

  section.append(listCard, summaryCard, renderBarChart("Category breakdown", categoryData, (v) => fmtNumber(v, true)));
  pageContent.appendChild(section);
}

function render() {
  projectTitle.textContent = state.data.project.name;
  lastUpdated.textContent = `Project updated: ${fmtDate(state.data.project.updated_at)}`;
  pageContent.innerHTML = "";
  renderNav();

  if (state.page === "Dashboard") {
    renderDashboard();
  } else if (state.page === "Project Data / Inputs") {
    renderProjectData();
  } else if (state.page === "Risk Register") {
    renderRiskRegister();
  } else if (state.page === "Outputs") {
    renderOutputs();
  }
}

closeModalBtn.onclick = closeRiskModal;
modalBackdrop.onclick = (event) => {
  if (event.target === modalBackdrop) {
    closeRiskModal();
  }
};

render();
