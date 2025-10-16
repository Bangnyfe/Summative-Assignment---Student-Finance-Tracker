/* =========================
   Student Finance Tracker JS
   (functionality.js)
========================= */

// === Selectors ===
const navButtons = document.querySelectorAll("nav button");
const sections = document.querySelectorAll("main section");

// Settings elements
const themeToggle = document.getElementById("theme-toggle");
const currencySelect = document.getElementById("currency-select");
const formatSelect = document.getElementById("format-select");

// Category elements
const categoryForm = document.getElementById("category-form");
const categoryInput = document.getElementById("category-input");
const categoryList = document.getElementById("category-list");
// Record entry form elements (in Categories section)
const recordForm = document.getElementById("record-form");
const recordDateInput = document.getElementById("record-date-input");
const recordDescInput = document.getElementById("record-desc-input");
const recordCategorySelect = document.getElementById("record-category-select");
const recordAmountInput = document.getElementById("record-amount-input");

// Records elements
const recordsTable = document.getElementById("records-table").querySelector("tbody");
const recordRange = document.getElementById("record-range");
const recordDate = document.getElementById("record-date");

// Stats elements
const statsRange = document.getElementById("stats-range");
const statsDate = document.getElementById("stats-date");
const barChartCanvas = document.getElementById("barChart");
const donutChartCanvas = document.getElementById("donutChart");
const totalExpenses = document.getElementById("total-expenses");
const avgExpenses = document.getElementById("avg-expenses");
// Chart.js instances (will be created on first render)
let barChartInstance = null;
let donutChartInstance = null;
// Current category filter (null = no filter)
let currentCategoryFilter = null;
const activeFilterLabel = document.getElementById('active-filter');
const clearFilterBtn = document.getElementById('clear-filter');

// === LocalStorage Keys ===
const LS_KEYS = {
  theme: "sft-theme",
  categories: "sft-categories",
  records: "sft-records",
  settings: "sft-settings",
};

// === Utility Functions ===
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key, fallback) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

// === Navigation Logic ===
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;

    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach((sec) => {
      sec.classList.toggle("active", sec.id === target);
    });
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Alt+1..5 for main sections
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    switch (e.key) {
      case '1': focusSection('about'); break;
      case '2': focusSection('dashboard'); break;
      case '3': focusSection('records'); break;
      case '4': focusSection('categories'); break;
      case '5': focusSection('settings'); break;
    }
  }
});

function focusSection(sectionId) {
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const btn = Array.from(document.querySelectorAll('nav button')).find(b => b.dataset.section === sectionId);
  if (btn) btn.classList.add('active');
  document.querySelectorAll('main section').forEach(sec => sec.classList.toggle('active', sec.id === sectionId));
  const secEl = document.getElementById(sectionId);
  if (secEl) secEl.scrollIntoView({ behavior: 'smooth' });
}

// === Theme Toggle ===
function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
}

function initTheme() {
  const savedTheme = localStorage.getItem(LS_KEYS.theme) || "dark";
  applyTheme(savedTheme);
  themeToggle.value = savedTheme;
}

themeToggle.addEventListener("change", () => {
  const theme = themeToggle.value;
  applyTheme(theme);
  localStorage.setItem(LS_KEYS.theme, theme);
});

// === Settings (Currency & Format) ===
function initSettings() {
  const settings = loadData(LS_KEYS.settings, {
    currency: "RWF",
    format: "us",
  });
  currencySelect.value = settings.currency;
  formatSelect.value = settings.format;
}

function saveSettings() {
  const settings = {
    currency: currencySelect.value,
    format: formatSelect.value,
  };
  saveData(LS_KEYS.settings, settings);
}

currencySelect.addEventListener("change", saveSettings);
formatSelect.addEventListener("change", saveSettings);

// Delete all saved data handler
function deleteAllSavedData() {
  const ok = confirm('This will permanently delete all saved data (records, categories, settings). Continue?');
  if (!ok) return;

  // Remove only known app keys to avoid clearing other localStorage items
  Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));

  // Offer to reseed demo data if records.js provides SEED_RECORDS
  const reseed = confirm('Do you want to re-seed demo records after deleting data? (Choose Cancel to leave empty)');
  if (reseed && typeof window !== 'undefined' && Array.isArray(window.SEED_RECORDS)) {
    saveData(LS_KEYS.records, window.SEED_RECORDS);
  }

  // Reset UI state
  currentCategoryFilter = null;
  if (activeFilterLabel) activeFilterLabel.textContent = 'None';

  // Re-render everything
  renderCategories();
  renderRecords();
  renderCharts();

  alert('Saved data cleared.');
}

// Attach delete button handler if present
document.addEventListener('DOMContentLoaded', () => {
  const delBtn = document.getElementById('delete-data-btn');
  if (delBtn) delBtn.addEventListener('click', deleteAllSavedData);
});

// === Categories ===
function renderCategories() {
  const categories = loadData(LS_KEYS.categories, [
    "Food",
    "Books",
    "Transport",
    "Entertainment",
    "Fees",
    "Other",
  ]);
  categoryList.innerHTML = "";
  categories.forEach((cat, i) => {
    const li = document.createElement("li");
    li.textContent = cat;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      categories.splice(i, 1);
      saveData(LS_KEYS.categories, categories);
      renderCategories();
    });

    li.appendChild(delBtn);
    categoryList.appendChild(li);
  });

  // Populate category select for new record form
  if (recordCategorySelect) {
    recordCategorySelect.innerHTML = "";
    categories.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      recordCategorySelect.appendChild(opt);
    });
  }
}

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newCat = categoryInput.value.trim();
  if (newCat.length === 0) return;
  const categories = loadData(LS_KEYS.categories, []);
  if (!categories.includes(newCat)) {
    categories.push(newCat);
    saveData(LS_KEYS.categories, categories);
    renderCategories();
  }
  categoryInput.value = "";
});

// Handle add-record form submission
if (recordForm) {
  recordForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const date = recordDateInput.value;
    const description = recordDescInput.value.trim();
    const category = recordCategorySelect.value;
    const amount = parseFloat(recordAmountInput.value);

    if (!date || !description || !category || Number.isNaN(amount)) {
      alert('Please fill out all record fields correctly.');
      return;
    }

    const records = loadData(LS_KEYS.records, []);
    const newRec = {
      id: `rec_${Date.now()}`,
      date,
      description,
      category,
      amount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    records.push(newRec);
    saveData(LS_KEYS.records, records);

    // Clear form
    recordDateInput.value = '';
    recordDescInput.value = '';
    recordAmountInput.value = '';

    // Re-render and navigate to Records section
    renderRecords();
    renderCharts();
    // Switch to Records section
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    const recBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.dataset.section === 'records');
    if (recBtn) recBtn.classList.add('active');
    document.querySelectorAll('main section').forEach(sec => sec.classList.toggle('active', sec.id === 'records'));
  });
}

// === Records ===
function renderRecords() {
  const records = loadData(LS_KEYS.records, []);
  const settings = loadData(LS_KEYS.settings, { currency: "RWF", format: "us" });
  const symbol = getCurrencySymbol(settings.currency);

  recordsTable.innerHTML = "";
  records.forEach((rec) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td data-label="Date">${rec.date}</td>
      <td data-label="Description">${rec.description}</td>
      <td data-label="Category">${rec.category}</td>
      <td data-label="Amount">${symbol}${formatAmount(rec.amount, settings.format)}</td>
    `;
    recordsTable.appendChild(row);
  });
}

function getCurrencySymbol(currency) {
  const symbols = {
    RWF: "rwf ",
    USD: "$",
    CAD: "C$",
    GBP: "£",
    CNY: "¥",
    EUR: "€",
    JPY: "¥",
  };
  return symbols[currency] || "";
}

function formatAmount(amount, format) {
  switch (format) {
    case "eu":
      return amount.toLocaleString("de-DE", { minimumFractionDigits: 2 });
    case "uk":
      return amount.toLocaleString("en-GB", { minimumFractionDigits: 2 });
    default:
      return amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
  }
}

// === Example Add Record (for testing) ===
function addDummyRecord() {
  const records = loadData(LS_KEYS.records, []);
  const newRec = {
    id: `rec_${Date.now()}`,
    description: "Lunch at cafeteria",
    amount: Math.floor(Math.random() * 10000) / 100,
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  records.push(newRec);
  saveData(LS_KEYS.records, records);
  renderRecords();
  renderCharts();
}

// Seed records from records.js (if provided) when localStorage has no records.
function seedRecordsIfEmpty() {
  const existing = loadData(LS_KEYS.records, null);
  if (existing && existing.length) return; // already have records

  // Use global SEED_RECORDS (created by records.js) if available.
  if (typeof window !== 'undefined' && Array.isArray(window.SEED_RECORDS) && window.SEED_RECORDS.length) {
    saveData(LS_KEYS.records, window.SEED_RECORDS);
  }
  // otherwise, do not auto-generate dummy records
}

// === Charts (Simple Bar + Donut) ===
function renderCharts() {
  const records = loadData(LS_KEYS.records, []);

  // Aggregate spending by category
  const totals = {};
  records.forEach((r) => {
    totals[r.category] = (totals[r.category] || 0) + r.amount;
  });

  const categories = Object.keys(totals);
  const amounts = Object.values(totals);
  const colors = ["#ff6384", "#36a2eb", "#ffcd56", "#9b59b6", "#3498db", "#2ecc71", "#e67e22", "#95a5a6"];

  const total = amounts.reduce((a, b) => a + b, 0);

  // Prepare datasets
  const barData = {
    labels: categories,
    datasets: [{
      label: 'Spending',
      backgroundColor: categories.map((_, i) => colors[i % colors.length]),
      data: amounts,
    }]
  };

  const donutData = {
    labels: categories,
    datasets: [{
      data: amounts,
      backgroundColor: categories.map((_, i) => colors[i % colors.length]),
    }]
  };

  // Create or update Bar chart
  if (!barChartInstance) {
    barChartInstance = new Chart(barChartCanvas, {
      type: 'bar',
      data: barData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y ?? context.parsed ?? 0;
                const settings = loadData(LS_KEYS.settings, { currency: 'RWF', format: 'us' });
                const symbol = getCurrencySymbol(settings.currency);
                return `${symbol}${formatAmount(Number(value), settings.format)}`;
              }
            }
          }
  },
  onClick: function(evt, elements) {
          if (!elements.length) return;
          const el = elements[0];
          const category = this.data.labels[el.index];
          // set filter
          currentCategoryFilter = category;
          if (activeFilterLabel) activeFilterLabel.textContent = category;
          renderRecords();
        }
      }
    });
  } else {
    barChartInstance.data = barData;
    barChartInstance.update();
  }

  // Create or update Donut chart
  if (!donutChartInstance) {
    donutChartInstance = new Chart(donutChartCanvas, {
      type: 'doughnut',
      data: donutData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const idx = context.dataIndex;
                const val = context.dataset.data[idx] ?? 0;
                const settings = loadData(LS_KEYS.settings, { currency: 'RWF', format: 'us' });
                const symbol = getCurrencySymbol(settings.currency);
                const label = context.label || '';
                return `${label}: ${symbol}${formatAmount(Number(val), settings.format)}`;
              }
            }
          }
  },
  onClick: function(evt, elements) {
          if (!elements.length) return;
          const el = elements[0];
          const category = this.data.labels[el.index];
          currentCategoryFilter = category;
          if (activeFilterLabel) activeFilterLabel.textContent = category;
          renderRecords();
        }
      }
    });
  } else {
    donutChartInstance.data = donutData;
    donutChartInstance.update();
  }

  // Totals
  totalExpenses.textContent = total.toFixed(2);
  avgExpenses.textContent = records.length ? (total / records.length).toFixed(2) : '0.00';
}

// Apply filter when rendering records
const _origRenderRecords = renderRecords;
function renderRecords() {
  const allRecords = loadData(LS_KEYS.records, []);
  const settings = loadData(LS_KEYS.settings, { currency: "RWF", format: "us" });
  const symbol = getCurrencySymbol(settings.currency);

  const toShow = currentCategoryFilter ? allRecords.filter(r => r.category === currentCategoryFilter) : allRecords;

  recordsTable.innerHTML = "";
  toShow.forEach((rec) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Date">${rec.date}</td>
      <td data-label="Description">${rec.description}</td>
      <td data-label="Category">${rec.category}</td>
      <td data-label="Amount">${symbol}${formatAmount(rec.amount, settings.format)}</td>
    `;
    recordsTable.appendChild(row);
  });
}

// Clear filter button behavior
if (clearFilterBtn) {
  clearFilterBtn.addEventListener('click', () => {
    currentCategoryFilter = null;
    if (activeFilterLabel) activeFilterLabel.textContent = 'None';
    renderRecords();
  });
}

// === Initialize Everything ===
function init() {
  initTheme();
  initSettings();
  renderCategories();
  seedRecordsIfEmpty();
  renderRecords();
  renderCharts();
}
init();