// Departures — Scholarship Tracker
// All data lives in localStorage, in the visitor's own browser only.

const STORAGE_KEY = 'departures.entries.v1';
const DAY_MS = 1000 * 60 * 60 * 24;

const els = {
  boardBody: document.getElementById('boardBody'),
  emptyState: document.getElementById('emptyState'),
  statStrip: document.getElementById('statStrip'),
  filters: document.getElementById('filters'),
  overlay: document.getElementById('overlay'),
  form: document.getElementById('entryForm'),
  panelTitle: document.getElementById('panelTitle'),
  addBtn: document.getElementById('addBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  closePanel: document.getElementById('closePanel'),
  deleteBtn: document.getElementById('deleteBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importFile: document.getElementById('importFile'),
  fId: document.getElementById('entryId'),
  fName: document.getElementById('fName'),
  fCountry: document.getElementById('fCountry'),
  fDeadline: document.getElementById('fDeadline'),
  fStatus: document.getElementById('fStatus'),
  fLink: document.getElementById('fLink'),
  fNotes: document.getElementById('fNotes'),
};

let entries = loadEntries();
let activeFilter = 'all';

function loadEntries(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedExample();
  }catch(e){
    console.error('Could not read saved entries', e);
    return [];
  }
}

function saveEntries(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function seedExample(){
  // Friendly first-run example so the board isn't blank on first visit.
  const inDays = n => new Date(Date.now() + n * DAY_MS).toISOString().slice(0,10);
  return [
    {
      id: crypto.randomUUID(),
      name: 'Example — Mastercard Foundation Scholars',
      country: 'Multiple',
      deadline: inDays(21),
      status: 'Researching',
      link: '',
      notes: 'Edit or delete this example, then add your own scholarships.'
    }
  ];
}

function daysUntil(dateStr){
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / DAY_MS);
}

function urgencyClass(days){
  if(days < 0) return 'is-past';
  if(days <= 7) return 'is-urgent';
  if(days <= 30) return 'is-soon';
  return 'is-ok';
}

function render(){
  const filtered = entries
    .filter(e => activeFilter === 'all' ? true : e.status === activeFilter)
    .sort((a,b) => daysUntil(a.deadline) - daysUntil(b.deadline));

  els.boardBody.innerHTML = '';
  els.emptyState.classList.toggle('is-visible', filtered.length === 0);

  filtered.forEach(entry => {
    const days = daysUntil(entry.deadline);
    const uClass = urgencyClass(days);
    const dayLabel = days < 0 ? `${Math.abs(days)} AGO` : days;

    const row = document.createElement('div');
    row.className = 'board__row board__row--entry';
    row.dataset.id = entry.id;

    row.innerHTML = `
      <span class="entry-name">${entry.link ? `<a href="${escapeAttr(entry.link)}" target="_blank" rel="noopener">${escapeHtml(entry.name)}</a>` : escapeHtml(entry.name)}</span>
      <span class="entry-country">${escapeHtml(entry.country)}</span>
      <span class="status-pill" data-status="${entry.status}">${entry.status.toUpperCase()}</span>
      <span class="entry-deadline">${formatDate(entry.deadline)}</span>
      <span class="flap ${uClass} flip-in">${dayLabel}</span>
      <button class="row-menu" title="Edit" aria-label="Edit entry">&#8942;</button>
    `;

    row.addEventListener('click', (ev) => {
      if(ev.target.tagName === 'A') return;
      openPanel(entry);
    });

    els.boardBody.appendChild(row);
  });

  renderStats();
}

function renderStats(){
  const active = entries.filter(e => e.status !== 'Archived');
  const urgent = active.filter(e => {
    const d = daysUntil(e.deadline);
    return d >= 0 && d <= 14;
  });
  const submitted = active.filter(e => ['Submitted','Interview','Decision'].includes(e.status));

  els.statStrip.innerHTML = `
    <div class="stat">
      <span class="stat__num">${active.length}</span>
      <span class="stat__label">TRACKED</span>
    </div>
    <div class="stat">
      <span class="stat__num is-urgent">${urgent.length}</span>
      <span class="stat__label">DUE ≤14D</span>
    </div>
    <div class="stat">
      <span class="stat__num is-ok">${submitted.length}</span>
      <span class="stat__label">SUBMITTED+</span>
    </div>
  `;
}

function formatDate(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str){
  return String(str).replace(/"/g, '&quot;');
}

// ---------- panel (add/edit) ----------

function openPanel(entry){
  els.form.reset();
  if(entry){
    els.panelTitle.textContent = 'Edit scholarship';
    els.fId.value = entry.id;
    els.fName.value = entry.name;
    els.fCountry.value = entry.country;
    els.fDeadline.value = entry.deadline;
    els.fStatus.value = entry.status;
    els.fLink.value = entry.link || '';
    els.fNotes.value = entry.notes || '';
    els.deleteBtn.hidden = false;
  }else{
    els.panelTitle.textContent = 'Add scholarship';
    els.fId.value = '';
    els.deleteBtn.hidden = true;
  }
  els.overlay.classList.add('is-open');
  els.fName.focus();
}

function closePanel(){
  els.overlay.classList.remove('is-open');
}

els.addBtn.addEventListener('click', () => openPanel(null));
els.cancelBtn.addEventListener('click', closePanel);
els.closePanel.addEventListener('click', closePanel);
els.overlay.addEventListener('click', (e) => { if(e.target === els.overlay) closePanel(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closePanel(); });

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = els.fId.value;
  const data = {
    name: els.fName.value.trim(),
    country: els.fCountry.value.trim(),
    deadline: els.fDeadline.value,
    status: els.fStatus.value,
    link: els.fLink.value.trim(),
    notes: els.fNotes.value.trim(),
  };

  if(id){
    const idx = entries.findIndex(e => e.id === id);
    if(idx > -1) entries[idx] = { ...entries[idx], ...data };
  }else{
    entries.push({ id: crypto.randomUUID(), ...data });
  }

  saveEntries();
  closePanel();
  render();
});

els.deleteBtn.addEventListener('click', () => {
  const id = els.fId.value;
  if(!id) return;
  if(!confirm('Delete this entry? This cannot be undone.')) return;
  entries = entries.filter(e => e.id !== id);
  saveEntries();
  closePanel();
  render();
});

// ---------- filters ----------

els.filters.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  activeFilter = btn.dataset.filter;
  [...els.filters.children].forEach(c => c.classList.toggle('is-active', c === btn));
  render();
});

// ---------- export / import ----------

els.exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scholarship-tracker-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

els.importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const imported = JSON.parse(reader.result);
      if(!Array.isArray(imported)) throw new Error('Not an array');
      entries = imported.map(x => ({ ...x, id: x.id || crypto.randomUUID() }));
      saveEntries();
      render();
    }catch(err){
      alert('Could not read that file. Export a fresh backup and check its format.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ---------- init ----------

render();
