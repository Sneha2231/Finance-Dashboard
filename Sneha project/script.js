'use strict';

const STATE = {
  role: 'viewer',      // 'viewer' | 'admin'
  filter: 'all',       // 'all' | 'income' | 'expense'
  search: '',
  transactions: [],
};


const CATEGORY_CONFIG = {
  Salary:        { emoji: '💼', color: '#7c5cfc', cls: 'cat-salary' },
  Food:          { emoji: '🍕', color: '#f59e0b', cls: 'cat-food' },
  Transport:     { emoji: '🚌', color: '#3b82f6', cls: 'cat-transport' },
  Shopping:      { emoji: '🛍️', color: '#ec4899', cls: 'cat-shopping' },
  Bills:         { emoji: '💡', color: '#f43f5e', cls: 'cat-bills' },
  Entertainment: { emoji: '🎬', color: '#06b6d4', cls: 'cat-entertainment' },
  Health:        { emoji: '❤️', color: '#10b981', cls: 'cat-health' },
  Investment:    { emoji: '📈', color: '#10b981', cls: 'cat-investment' },
  Other:         { emoji: '📦', color: '#94a3b8', cls: 'cat-other' },
};


const DEFAULT_TRANSACTIONS = [
  { id: 1, desc: 'Monthly Salary',        amount: 85000, type: 'income',  category: 'Salary',        date: '2024-06-30' },
  { id: 2, desc: 'Freelance Project',     amount: 22000, type: 'income',  category: 'Salary',        date: '2024-06-25' },
  { id: 3, desc: 'Zomato / Swiggy',       amount: 3200,  type: 'expense', category: 'Food',          date: '2024-06-24' },
  { id: 4, desc: 'Metro Card Recharge',   amount: 500,   type: 'expense', category: 'Transport',     date: '2024-06-22' },
  { id: 5, desc: 'Amazon Shopping',       amount: 8500,  type: 'expense', category: 'Shopping',      date: '2024-06-20' },
  { id: 6, desc: 'Electricity Bill',      amount: 2100,  type: 'expense', category: 'Bills',         date: '2024-06-18' },
  { id: 7, desc: 'Netflix Subscription',  amount: 649,   type: 'expense', category: 'Entertainment', date: '2024-06-15' },
  { id: 8, desc: 'Gym Membership',        amount: 1800,  type: 'expense', category: 'Health',        date: '2024-06-12' },
  { id: 9, desc: 'Mutual Fund SIP',       amount: 10000, type: 'expense', category: 'Investment',    date: '2024-06-10' },
  { id: 10, desc: 'Grocery Store',        amount: 4200,  type: 'expense', category: 'Food',          date: '2024-06-08' },
  { id: 11, desc: 'Petrol',               amount: 2500,  type: 'expense', category: 'Transport',     date: '2024-06-05' },
  { id: 12, desc: 'Bonus',                amount: 15000, type: 'income',  category: 'Salary',        date: '2024-05-30' },
  { id: 13, desc: 'Restaurant Dinner',    amount: 1800,  type: 'expense', category: 'Food',          date: '2024-05-27' },
  { id: 14, desc: 'Internet Bill',        amount: 999,   type: 'expense', category: 'Bills',         date: '2024-05-20' },
  { id: 15, desc: 'Movie Tickets',        amount: 700,   type: 'expense', category: 'Entertainment', date: '2024-05-18' },
  { id: 16, desc: 'Doctor Consultation',  amount: 600,   type: 'expense', category: 'Health',        date: '2024-05-14' },
  { id: 17, desc: 'Monthly Salary',       amount: 85000, type: 'income',  category: 'Salary',        date: '2024-05-31' },
  { id: 18, desc: 'Flipkart Sale',        amount: 5200,  type: 'expense', category: 'Shopping',      date: '2024-05-10' },
  { id: 19, desc: 'Monthly Salary',       amount: 85000, type: 'income',  category: 'Salary',        date: '2024-04-30' },
  { id: 20, desc: 'Medical Bills',        amount: 3500,  type: 'expense', category: 'Health',        date: '2024-04-22' },
  { id: 21, desc: 'Home Internet',        amount: 999,   type: 'expense', category: 'Bills',         date: '2024-04-15' },
  { id: 22, desc: 'Freelance Work',       amount: 18000, type: 'income',  category: 'Salary',        date: '2024-04-10' },
];


let lineChartInstance = null;
let pieChartInstance  = null;


const fmt = (n) => '₹' + Math.abs(n).toLocaleString('en-IN');
const todayStr = () => new Date().toISOString().split('T')[0];

const fmtDate = (str) => {
  const d = new Date(str);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};


function saveState() {
  localStorage.setItem('finflow_txns', JSON.stringify(STATE.transactions));
  localStorage.setItem('finflow_role', STATE.role);
}

function loadState() {
  const saved = localStorage.getItem('finflow_txns');
  STATE.transactions = saved ? JSON.parse(saved) : [...DEFAULT_TRANSACTIONS];
  const savedRole = localStorage.getItem('finflow_role');
  if (savedRole) STATE.role = savedRole;
}


function getSummary() {
  let income = 0, expenses = 0;
  STATE.transactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  });
  return { income, expenses, balance: income - expenses };
}


function updateCards() {
  const { income, expenses, balance } = getSummary();
  animateCount('totalBalance', balance);
  animateCount('totalIncome', income);
  animateCount('totalExpenses', expenses);
}


function animateCount(elId, targetVal) {
  const el = document.getElementById(elId);
  if (!el) return;
  const start = 0;
  const duration = 900;
  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (targetVal - start) * ease);
    el.textContent = fmt(current);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}


function getMonthlyData() {
  const months = {};
  STATE.transactions.forEach(t => {
    const m = t.date.substring(0, 7); // YYYY-MM
    if (!months[m]) months[m] = { income: 0, expenses: 0 };
    if (t.type === 'income') months[m].income += t.amount;
    else months[m].expenses += t.amount;
  });

  const sorted = Object.keys(months).sort();
  const last6 = sorted.slice(-6);
  return last6.map(m => {
    const [y, mo] = m.split('-');
    const label = new Date(y, mo - 1).toLocaleString('default', { month: 'short' });
    return { label, income: months[m].income, expenses: months[m].expenses, key: m };
  });
}


function renderLineChart() {
  const ctx = document.getElementById('lineChart');
  if (!ctx) return;

  const data = getMonthlyData();
  const labels  = data.map(d => d.label);
  const incomes  = data.map(d => d.income);
  const expenses = data.map(d => d.expenses);

  if (lineChartInstance) lineChartInstance.destroy();

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomes,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#080c14',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Expenses',
          data: expenses,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244,63,94,0.1)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f43f5e',
          pointBorderColor: '#080c14',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            color: '#94a3b8',
            font: { family: 'DM Sans', size: 12 },
            boxWidth: 10, boxHeight: 10,
          },
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#475569', font: { family: 'DM Sans', size: 12 } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#475569',
            font: { family: 'DM Sans', size: 12 },
            callback: v => '₹' + (v / 1000).toFixed(0) + 'k',
          },
        },
      },
    },
  });
}


function renderPieChart() {
  const ctx = document.getElementById('pieChart');
  const legendEl = document.getElementById('pieLegend');
  if (!ctx || !legendEl) return;


  const catTotals = {};
  STATE.transactions.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(catTotals);
  const values = labels.map(l => catTotals[l]);
  const colors = labels.map(l => CATEGORY_CONFIG[l]?.color || '#94a3b8');

  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + 'cc'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}`,
          },
        },
      },
    },
  });


  legendEl.innerHTML = labels.map((l, i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${colors[i]}"></span>
      <span>${l}</span>
      <span style="margin-left:auto;color:#f1f5f9;font-weight:600">${fmt(values[i])}</span>
    </div>
  `).join('');
}

function renderTransactions() {
  const list  = document.getElementById('txnList');
  const empty = document.getElementById('emptyState');
  if (!list) return;

  let txns = [...STATE.transactions];


  if (STATE.filter !== 'all') {
    txns = txns.filter(t => t.type === STATE.filter);
  }

 
  if (STATE.search) {
    const q = STATE.search.toLowerCase();
    txns = txns.filter(t =>
      t.desc.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }


  txns.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (txns.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.innerHTML = txns.map((t, i) => {
    const cfg   = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.Other;
    const sign  = t.type === 'income' ? '+' : '−';
    const delBtn = STATE.role === 'admin'
      ? `<button class="txn-del" data-id="${t.id}" title="Delete"><i data-lucide="trash-2"></i></button>`
      : '';

    return `
      <div class="txn-item" style="animation-delay:${i * 0.04}s">
        <div class="txn-cat-icon ${cfg.cls}">${cfg.emoji}</div>
        <div class="txn-info">
          <div class="txn-desc">${t.desc}</div>
          <div class="txn-meta">
            <span class="txn-date">${fmtDate(t.date)}</span>
            <span class="txn-cat-badge">${t.category}</span>
          </div>
        </div>
        <div class="txn-amount ${t.type}">${sign}${fmt(t.amount)}</div>
        ${delBtn}
      </div>
    `;
  }).join('');

  // Re-init lucide icons for delete buttons
  lucide.createIcons();

  // Bind delete buttons
  list.querySelectorAll('.txn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      deleteTransaction(id);
    });
  });
}


function deleteTransaction(id) {
  STATE.transactions = STATE.transactions.filter(t => t.id !== id);
  saveState();
  renderAll();
}


function renderInsights() {
  const { income, expenses } = getSummary();

  // Top category
  const catTotals = {};
  STATE.transactions.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  const topCat = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0];

  const topCatEl  = document.getElementById('topCat');
  const topCatAmt = document.getElementById('topCatAmt');
  if (topCatEl && topCat) {
    topCatEl.textContent  = topCat[0];
    topCatAmt.textContent = fmt(topCat[1]) + ' spent';
  }

  // Savings rate
  const rate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const savEl = document.getElementById('savingsRate');
  if (savEl) savEl.textContent = rate + '%';

  // Transaction count
  const cntEl = document.getElementById('txnCount');
  if (cntEl) cntEl.textContent = STATE.transactions.length;

  // Monthly comparison bars
  const monthData = getMonthlyData();
  const maxExpense = Math.max(...monthData.map(d => d.expenses), 1);
  const barsEl = document.getElementById('compBars');
  if (barsEl) {
    barsEl.innerHTML = monthData.map(d => `
      <div class="comp-month">
        <div class="comp-month-label">
          <span>${d.label}</span>
          <span>${fmt(d.expenses)}</span>
        </div>
        <div class="comp-bar-track">
          <div class="comp-bar-fill" data-w="${Math.round((d.expenses / maxExpense) * 100)}"></div>
        </div>
      </div>
    `).join('');

    // Animate bars with slight delay
    setTimeout(() => {
      barsEl.querySelectorAll('.comp-bar-fill').forEach(el => {
        el.style.width = el.dataset.w + '%';
      });
    }, 200);
  }

  // Insight bubbles
  const bubblesEl = document.getElementById('insightBubbles');
  if (!bubblesEl) return;

  const bubbles = [];

  if (topCat) {
    bubbles.push({
      emoji: '🔥',
      text: `<strong>${topCat[0]}</strong> is your highest spending category at <strong>${fmt(topCat[1])}</strong> total.`
    });
  }

  if (rate >= 20) {
    bubbles.push({ emoji: '🎉', text: `Great job! You saved <strong>${rate}%</strong> of your income — that's above the recommended 20% rule!` });
  } else if (rate > 0) {
    bubbles.push({ emoji: '⚠️', text: `Your savings rate is <strong>${rate}%</strong>. Try to save at least 20% of your income each month.` });
  } else {
    bubbles.push({ emoji: '🚨', text: `Your expenses exceed your income. Consider reviewing your spending habits.` });
  }

  if (monthData.length >= 2) {
    const curr = monthData[monthData.length - 1];
    const prev = monthData[monthData.length - 2];
    const diff = curr.expenses - prev.expenses;
    const pct  = prev.expenses > 0 ? Math.abs(Math.round((diff / prev.expenses) * 100)) : 0;
    if (diff > 0) {
      bubbles.push({ emoji: '📊', text: `You spent <strong>${pct}% more</strong> in ${curr.label} compared to ${prev.label}.` });
    } else if (diff < 0) {
      bubbles.push({ emoji: '📉', text: `You spent <strong>${pct}% less</strong> in ${curr.label} compared to ${prev.label}. Keep it up!` });
    }
  }

  bubbles.push({
    emoji: '💡',
    text: `You have <strong>${STATE.transactions.length} transactions</strong> recorded across ${Object.keys(catTotals).length} categories.`
  });

  bubblesEl.innerHTML = bubbles.map(b => `
    <div class="bubble">
      <span class="bubble-emoji">${b.emoji}</span>
      <span class="bubble-text">${b.text}</span>
    </div>
  `).join('');
}


function renderAll() {
  updateCards();
  renderLineChart();
  renderPieChart();
  renderTransactions();
  renderInsights();
  updateRoleUI();
  lucide.createIcons();
}


function updateRoleUI() {
  const isAdmin = STATE.role === 'admin';
  const badge   = document.getElementById('roleBadge');
  if (badge) {
    badge.textContent = isAdmin ? 'Admin' : 'Viewer';
    badge.style.background = isAdmin ? 'rgba(245,158,11,0.2)' : 'rgba(124,92,252,0.2)';
    badge.style.color       = isAdmin ? '#f59e0b' : '#9b7dff';
    badge.style.borderColor = isAdmin ? 'rgba(245,158,11,0.3)' : 'rgba(124,92,252,0.3)';
  }

  // Show/hide admin-only elements
  document.querySelectorAll('.admin-only').forEach(el => {
    if (isAdmin) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}


function navigateTo(section) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.section === section);
  });

  // Show correct page
  document.querySelectorAll('.page').forEach(p => {
    const active = p.id === section;
    p.classList.toggle('active', active);
    if (active) {
      // Re-trigger animations
      p.style.animation = 'none';
      requestAnimationFrame(() => {
        p.style.animation = '';
      });
    }
  });

  // Close sidebar on mobile
  closeMobileSidebar();
}


function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('active');
}
function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}


function openModal() {
  const modal = document.getElementById('modalBg');
  if (!modal) return;
  modal.classList.remove('hidden');
  // Set today's date as default
  const dateInput = document.getElementById('fDate');
  if (dateInput && !dateInput.value) dateInput.value = todayStr();
  lucide.createIcons();
}
function closeModal() {
  const modal = document.getElementById('modalBg');
  if (!modal) return;
  modal.classList.add('hidden');
  clearForm();
}
function clearForm() {
  const ids = ['fDesc', 'fAmt', 'fDate'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function submitTransaction() {
  const desc = document.getElementById('fDesc')?.value.trim();
  const amt  = parseFloat(document.getElementById('fAmt')?.value);
  const type = document.getElementById('fType')?.value;
  const cat  = document.getElementById('fCat')?.value;
  const date = document.getElementById('fDate')?.value;

  // Validation
  if (!desc || !desc.length) { shakeInput('fDesc'); return; }
  if (!amt || amt <= 0)      { shakeInput('fAmt');  return; }
  if (!date)                  { shakeInput('fDate'); return; }

  const newTxn = {
    id: Date.now(),
    desc, amount: amt, type, category: cat, date,
  };

  STATE.transactions.unshift(newTxn);
  saveState();
  closeModal();
  renderAll();

  // Show success flash
  showToast('Transaction added successfully! ✓');
}

function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#f43f5e';
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => {
    el.style.animation = '';
    el.style.borderColor = '';
  }, { once: true });
}


function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:24px; right:24px;
      background:linear-gradient(135deg,#10b981,#06b6d4);
      color:#fff; padding:12px 20px; border-radius:12px;
      font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
      z-index:1000; box-shadow:0 8px 30px rgba(16,185,129,0.4);
      transform:translateY(80px); opacity:0;
      transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity   = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity   = '0';
  }, 3000);
}

// Shake animation via style injection
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);


document.addEventListener('DOMContentLoaded', () => {

  // Load state from localStorage
  loadState();

  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.section));
  });

  // Role selectors
  const roleSelect   = document.getElementById('roleSelect');
  const mobileRole   = document.getElementById('mobileRole');

  const handleRoleChange = (val) => {
    STATE.role = val;
    if (roleSelect) roleSelect.value = val;
    if (mobileRole) mobileRole.value = val;
    saveState();
    updateRoleUI();
    renderTransactions(); // re-render to show/hide delete buttons
    showToast(`Switched to ${val === 'admin' ? '⚡ Admin' : '👁 Viewer'} mode`);
  };

  if (roleSelect) {
    roleSelect.value = STATE.role;
    roleSelect.addEventListener('change', e => handleRoleChange(e.target.value));
  }
  if (mobileRole) {
    mobileRole.value = STATE.role;
    mobileRole.addEventListener('change', e => handleRoleChange(e.target.value));
  }

  // Mobile sidebar toggle
  document.getElementById('hamburger')?.addEventListener('click', openMobileSidebar);
  document.getElementById('overlay')?.addEventListener('click', closeMobileSidebar);

  // Add Transaction buttons
  ['addBtn1', 'addBtn2'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', openModal);
  });

  // Modal close
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalCancel')?.addEventListener('click', closeModal);
  document.getElementById('txnSubmit')?.addEventListener('click', submitTransaction);

  // Close modal on backdrop click
  document.getElementById('modalBg')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalBg') closeModal();
  });

  // Search input
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    STATE.search = e.target.value;
    renderTransactions();
  });

  // Filter tabs
  document.querySelectorAll('.flt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.flt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.filter = btn.dataset.f;
      renderTransactions();
    });
  });

  // Keyboard: close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Initial render
  renderAll();

  console.log('%c FinFlow 🚀 ', 'background:#7c5cfc;color:#fff;padding:4px 8px;border-radius:4px;font-weight:700');
  console.log('Finance Dashboard loaded. State:', STATE);
});