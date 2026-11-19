/* Prep List — UI layer. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  const C = window.Core, Seed = window.SeedData, IO = window.StoreIO;
  const $ = (s, r) => (r || document).querySelector(s);
  const h = s => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const fmtDate = ts => ts ? new Date(ts).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: new Date(ts).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined }) : '';
  const money = x => x === null || x === undefined ? '' : '$' + Number(x).toFixed(2);
  const sel = (a, b) => a === b ? 'selected' : '';
  const pressed = b => 'aria-pressed="' + (b ? 'true' : 'false') + '"';

  /* ---------------- Icons (Material-style paths) ---------------- */
  const P = {
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
    recipes: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
    pantry: 'M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z',
    settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    minus: 'M19 13H5v-2h14v2z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    del: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
    copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
    place: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
    store: 'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z',
    restart: 'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
    open: 'M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
    chev: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    expand: 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
    up: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
    download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    upload: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
    camera: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z',
    flag: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z',
    history: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
    more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    snow: 'M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z',
    info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    sort: 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z',
    leaf: 'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z'
  };
  const ic = (n, cls) => '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + P[n] + '"/></svg>';

  /* ---------------- State ---------------- */
  const loaded = IO.load(window.localStorage);
  let S = loaded.state;
  const ui = { tab: 'home', q: '', recipeTab: 'recipes', ingQ: '', ingFilter: 'all', pantryAll: false, shopOrder: 'aisle', eraseArm: 0, lastTab: '' };
  try { const t = sessionStorage.getItem('preplist.tab'); if (t) ui.tab = t; } catch (_) { }

  let saveT = null;
  function save() { clearTimeout(saveT); saveT = setTimeout(flush, 150); }
  function flush() {
    clearTimeout(saveT); saveT = null;
    try { IO.save(localStorage, S); } catch (e) { snack('Could not save on this device (' + e.name + '). Export a backup in Settings.'); }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);

  function withUndo(msg, fn) {
    const prev = JSON.stringify(S);
    fn(); save(); render(); refreshSheets();
    snack(msg, { label: 'Undo', fn: () => { S = JSON.parse(prev); save(); render(); refreshSheets(); snack('Undone'); } });
  }

  /* ---------------- Helpers ---------------- */
  const SLOTS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snack', 'Snack'], ['other', 'Other']];
  const slotName = id => (SLOTS.find(s => s[0] === id) || [0, 'Other'])[1];
  const catName = id => (C.CATEGORIES.find(c => c.id === id) || { name: 'Other' }).name;
  const storeById = id => S.stores.find(s => s.id === id);
  const tripStore = () => S.trip ? storeById(S.trip.storeId) : null;
  const prodKey = it => it.custom ? 'c:' + C.slug(it.name) : it.ingId;
  const prodsOf = id => (S.products[id] = S.products[id] || {});
  const STATUS_TEXT = { confirmed: 'Confirmed in store', recent: 'Recently verified (app/website)', saved: 'Previously saved', outdated: 'Marked outdated', unknown: 'Unknown' };
  const chainLetter = ch => ch === 'coles' ? 'C' : ch === 'woolworths' ? 'W' : '?';
  const chainName = ch => ch === 'coles' ? 'Coles' : ch === 'woolworths' ? 'Woolworths' : '';
  const pickerQ = { q: '' };

  function setPath(obj, path, val) {
    const ks = path.split('.');
    let o = obj;
    for (let i = 0; i < ks.length - 1; i++) { if (!o[ks[i]] || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = val;
  }
  function getPath(obj, path) { return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : ''), obj); }

  function unitOptions(selU, ing) {
    const pc = ing && ing.countName ? (ing.countPlural || ing.countName) : 'pieces';
    return [['g', 'g'], ['kg', 'kg'], ['ml', 'ml'], ['l', 'L'], ['tsp', 'tsp'], ['tbsp', 'tbsp'], ['cup', 'cup'], ['pc', pc], ['taste', 'to taste']]
      .map(([v, l]) => '<option value="' + v + '" ' + sel(v, selU) + '>' + h(l) + '</option>').join('');
  }
  const catOptions = c => C.CATEGORIES.map(x => '<option value="' + x.id + '" ' + sel(x.id, c) + '>' + h(x.name) + '</option>').join('');
  const priceUnitOptions = u => [['pack', 'per pack'], ['kg', 'per kg'], ['each', 'each'], ['item', 'total for line']].map(([v, l]) => '<option value="' + v + '" ' + sel(v, u) + '>' + l + '</option>').join('');

  /* ---------------- List model ---------------- */
  function listModel() {
    const st = tripStore();
    const prods = st ? (S.products[st.id] || {}) : {};
    const gen = C.buildList(S, { opts: S.settings, products: prods });
    const L = S.list;
    const active = [], athome = [], hidden = [];
    for (const it of gen) {
      it.checked = !!L.checks[it.key]; it.checkedAt = L.checks[it.key] || 0;
      it.qtyLine = L.qtyOverride[it.key] || it.needText || it.requiredText;
      const pd = prods[it.ingId];
      if (pd && pd.department) it.category = pd.department;
      if (L.removed[it.key]) hidden.push(it);
      else if (it.status === 'buy' || it.status === 'restock') active.push(it);
      else athome.push(it);
    }
    for (const c of L.custom) {
      const key = 'c:' + c.id;
      const pd = prods['c:' + C.slug(c.name)];
      const pprice = pd ? C.num(pd.price) : null;
      active.push({
        key, id: c.id, custom: true, name: c.name, category: (pd && pd.department) || c.category || 'household',
        qtyLine: c.qty || '', requiredText: c.qty || '', buyText: '', brand: (pd && pd.brand) || c.brand || '', notes: c.notes || '',
        product: pd && pd.name ? pd.name : '', cost: pprice !== null ? pprice : C.num(c.price), status: 'buy', repeat: !!c.repeat,
        checked: !!L.checks[key], checkedAt: L.checks[key] || 0, cold: C.COLD_CATS.has(c.category), sources: []
      });
    }
    const done = active.filter(i => i.checked).length;
    const priced = active.filter(i => i.cost !== null && i.cost !== undefined);
    return { active, athome, hidden, done, total: active.length, cost: priced.reduce((s, i) => s + i.cost, 0), priced: priced.length, store: st };
  }
  function sortIn(arr) {
    return arr.sort((a, b) => (a.checked - b.checked) || (a.checked ? a.checkedAt - b.checkedAt : 0) || a.name.localeCompare(b.name));
  }
  function groupItems(items, st) {
    if (st && ui.shopOrder !== 'category') {
      const prods = S.products[st.id] || {};
      const g = C.storeGroups(items, it => (prods[prodKey(it)] || {}).loc, { layout: st.layout, coldLast: S.settings.coldLast, aisleDir: st.aisleDir });
      g.forEach(x => sortIn(x.items));
      return g;
    }
    return C.CATEGORIES.map(c => ({ key: c.id, label: c.name, items: sortIn(items.filter(i => i.category === c.id)) })).filter(g => g.items.length);
  }

  /* ---------------- Rendering ---------------- */
  const VIEWS = {};
  let renderQ = null;
  function renderSoon() { if (renderQ) return; renderQ = setTimeout(() => { renderQ = null; render(); refreshSheets(); }, 0); }

  function keepFocus(container, fn) {
    const ae = document.activeElement;
    const fid = ae && ae.id && container.contains(ae) ? ae.id : null;
    let s0 = null, s1 = null;
    try { if (fid) { s0 = ae.selectionStart; s1 = ae.selectionEnd; } } catch (_) { }
    fn();
    if (fid) {
      const n = document.getElementById(fid);
      if (n) { n.focus({ preventScroll: true }); try { if (s0 !== null) n.setSelectionRange(s0, s1); } catch (_) { } }
    }
  }

  function render() {
    const v = VIEWS[ui.tab] || VIEWS.home;
    const main = $('#main');
    const changed = ui.lastTab !== ui.tab;
    keepFocus(main, () => {
      $('#title').textContent = v.title();
      $('#topActions').innerHTML = v.actions ? v.actions() : '';
      main.innerHTML = '<div class="' + (changed ? 'view' : '') + '">' + v.html() + '</div>';
      $('#fab').innerHTML = v.fab ? v.fab() : '';
    });
    if (changed) { window.scrollTo(0, 0); ui.lastTab = ui.tab; try { sessionStorage.setItem('preplist.tab', ui.tab); } catch (_) { } }
    renderNav();
  }

  function renderNav() {
    const m = listModel();
    const left = m.total - m.done;
    const tabs = [['home', 'Home', 'home'], ['shop', 'Shopping', 'cart'], ['recipes', 'Recipes', 'recipes'], ['pantry', 'Pantry', 'pantry'], ['settings', 'Settings', 'settings']];
    $('#nav').innerHTML = tabs.map(([id, label, icon]) =>
      '<button data-act="tab" data-tab="' + id + '" ' + (ui.tab === id ? 'aria-current="page"' : '') + '><span class="pill">' + ic(icon) +
      (id === 'shop' && left > 0 ? '<span class="dot">' + left + '</span>' : '') + '</span>' + label + '</button>').join('');
  }

  /* ---------- Home ---------- */
  VIEWS.home = {
    title: () => 'Prep List',
    actions: () => '',
    html() {
      const m = listModel();
      const last = storeById(S.settings.lastStoreId);
      const st = tripStore();
      let out = '<section class="hero"><div class="muted small">' + new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div>' +
        '<p class="big">' + (m.total ? (m.total - m.done) + ' item' + (m.total - m.done === 1 ? '' : 's') + ' to buy' : 'Plan your week') + '</p></section>';
      out += '<button class="btn lg" data-act="startShopping">' + ic('cart') + (st ? 'Continue shopping' : 'Start Shopping') + '</button>';
      out += '<div class="muted small center" style="margin:8px 0 4px">' + (st ? 'At ' + h(st.name) + ' · tap to change store' : last ? 'Last visit: ' + h(last.name) : 'Choose Coles, Woolworths or another store') + '</div>';

      out += '<div class="kpis" style="margin-top:14px">' +
        '<div class="kpi"><b>' + m.total + '</b><span>Items on list</span></div>' +
        '<div class="kpi"><b>' + m.done + '</b><span>Purchased</span></div>' +
        '<div class="kpi"><b>' + (m.priced ? money(m.cost) : '—') + '</b><span>' + (m.priced ? 'Est. (' + m.priced + '/' + m.total + ' priced)' : 'Add prices') + '</span></div></div>';

      out += '<h3 class="section-title">Meal prep days</h3>' + homeMeals();
      out += '<div class="center"><button class="btn text" data-act="tab" data-tab="recipes">' + ic('recipes', 'sm') + 'Manage recipes</button></div>';
      out += homeNutrition();
      out += '<h3 class="section-title">This week\'s list</h3><div class="quick">' +
        '<button data-act="newList">' + ic('restart') + 'New week</button>' +
        '<button data-act="resetChecks">' + ic('check') + 'Reset ticks</button>' +
        '<button data-act="copyList">' + ic('copy') + 'Copy</button>' +
        '<button data-act="shareList">' + ic('share') + 'Share</button></div>';
      if (S.history.length) out += '<div class="center"><button class="btn text" data-act="openHistory">' + ic('history', 'sm') + 'Previous lists (' + S.history.length + ')</button></div>';
      if (loaded.error) out += '<div class="card warn small">' + h(loaded.error) + '</div>';
      const days = S.settings.lastBackupAt ? Math.floor((Date.now() - S.settings.lastBackupAt) / 864e5) : null;
      if (days === null || days > 30) out += '<div class="card small row">' + ic('info') + '<div class="grow">' + (days === null ? 'No backup yet.' : 'Last backup ' + days + ' days ago.') + ' A backup protects your recipes and aisle data if browser data is cleared.</div><button class="btn tonal" data-act="exportData">Back up</button></div>';
      return out;
    }
  };

  function homeMeals() {
    const order = SLOTS.map(s => s[0]);
    const rs = [...S.recipes].sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
    const done = new Set();
    let out = '';
    for (const r of rs) {
      if (done.has(r.id)) continue;
      if (r.variantGroup) {
        const grp = rs.filter(x => x.variantGroup === r.variantGroup);
        grp.forEach(x => done.add(x.id));
        out += mealCard(grp.find(x => x.enabled) || grp[0], grp);
      } else { done.add(r.id); if (r.enabled) out += mealCard(r, null); }
    }
    return out || '<div class="empty">No meals enabled. Turn some on in Recipes.</div>';
  }
  function mealCard(r, grp) {
    const active = r.enabled && C.num(r.days) > 0;
    let seg = '';
    if (grp && grp.length > 1) seg = '<div class="seg" style="margin-top:12px">' + grp.map(x => '<button data-act="variant" data-id="' + x.id + '" ' + pressed(x.enabled) + '>' + (x.enabled ? ic('check', 'sm') : '') + h(x.variantLabel || x.name) + '</button>').join('') + '</div>';
    return '<div class="meal ' + (active ? '' : 'off') + '"><div class="row"><div class="grow"><div class="slot">' + slotName(r.slot) + '</div><div class="rname">' + h(r.name) + '</div></div>' +
      '<div class="stepper"><button data-act="days" data-id="' + r.id + '" data-d="-1" aria-label="Fewer days">' + ic('minus') + '</button>' +
      '<div class="v">' + (C.num(r.days) || 0) + '<small>days</small></div>' +
      '<button data-act="days" data-id="' + r.id + '" data-d="1" aria-label="More days">' + ic('add') + '</button></div></div>' + seg + '</div>';
  }
  function homeNutrition() {
    const dn = C.dailyNutrition(S.recipes, S.ingredients, S.settings);
    if (!dn.slotCount) return '';
    const anyData = C.NUTRIENTS.some(n => dn.totals[n.id] > 0);
    const missing = new Set(); C.NUTRIENTS.forEach(n => dn.missing[n.id].forEach(x => missing.add(x)));
    let out = '<h3 class="section-title">Typical day · nutrition</h3><div class="card">';
    if (!anyData) {
      out += '<div class="row">' + ic('info') + '<div class="grow small">Nutrition is optional. Enter values from your product labels (per 100 g or per serving) and daily totals appear here. Nothing is estimated for you.</div></div>' +
        '<div class="actions"><button class="btn tonal" data-act="ingMissing">Add label data</button></div></div>';
      return out;
    }
    for (const n of C.NUTRIENTS) {
      const v = dn.totals[n.id], t = C.num(S.settings.targets[n.id]), comp = dn.complete[n.id];
      const val = (comp ? '' : '≥ ') + Math.round(v) + (n.unit === 'kcal' ? ' kcal' : ' g');
      out += '<div class="nbar"><div class="l"><span>' + n.name + '</span><span><b>' + val + '</b>' + (t ? ' <span class="muted">/ ' + t + (n.unit === 'kcal' ? '' : ' g') + '</span>' : '') + '</span></div>' +
        (t ? '<div class="progress"><i class="' + (v > t * 1.05 ? 'over' : '') + '" style="width:' + Math.min(100, v / t * 100) + '%"></i></div>' : '') + '</div>';
    }
    if (missing.size) out += '<div class="small muted" style="margin-top:8px">“≥” = incomplete. No data yet for: ' + h([...missing].slice(0, 6).join(', ')) + (missing.size > 6 ? ' +' + (missing.size - 6) + ' more' : '') + '. <a href="#" data-act="ingMissing">Add</a></div>';
    return out + '</div>';
  }

  /* ---------- Shopping ---------- */
  VIEWS.shop = {
    title: () => 'Shopping',
    actions: () => '<button class="icon-btn" data-act="copyList" aria-label="Copy list">' + ic('copy') + '</button><button class="icon-btn" data-act="shareList" aria-label="Share list">' + ic('share') + '</button>',
    fab: () => '<button class="fab" data-act="addCustom">' + ic('add') + 'Add item</button>',
    html() {
      const m = listModel();
      const st = m.store;
      let out = '';
      if (st) {
        const prods = S.products[st.id] || {};
        const known = m.active.filter(i => (prods[prodKey(i)] || {}).loc && prods[prodKey(i)].loc.aisle).length;
        out += '<div class="trip-bar"><span class="logo ' + st.chain + '">' + chainLetter(st.chain) + '</span><div class="grow"><div style="font-weight:600">' + h(st.name) + '</div><div class="small">' + known + ' of ' + m.total + ' locations known</div></div>' +
          '<button class="icon-btn" data-act="shopOrder" aria-label="Change order">' + ic('sort') + '</button><button class="btn tonal" data-act="finishTrip">Finish</button></div>';
      } else {
        out += '<div class="row" style="margin-bottom:8px"><span class="muted small grow">Grouped by department</span><button class="btn tonal" data-act="startShopping">' + ic('store', 'sm') + 'Start Shopping</button></div>';
      }
      out += '<div class="shop-head"><div class="stat"><span id="progText"><b>' + m.done + ' of ' + m.total + '</b> items purchased</span><span class="muted" id="progCost">' + (m.priced ? '≈ ' + money(m.cost) : '') + '</span></div>' +
        '<div class="progress"><i id="progBar" style="width:' + (m.total ? m.done / m.total * 100 : 0) + '%"></i></div>' +
        '<div class="search" style="margin-top:10px">' + ic('search') + '<input class="input" id="shopQ" data-in="q" type="search" placeholder="Search list" value="' + h(ui.q) + '" autocomplete="off">' +
        (ui.q ? '<button class="icon-btn clear" data-act="clearQ" aria-label="Clear search">' + ic('close') + '</button>' : '') + '</div></div>';
      out += '<div id="shopList">' + shopListHtml(m) + '</div>';
      return out;
    }
  };

  function shopListHtml(m) {
    const q = ui.q.trim().toLowerCase();
    const match = i => !q || (i.name + ' ' + (i.brand || '') + ' ' + (i.notes || '') + ' ' + (i.product || '')).toLowerCase().includes(q);
    const items = m.active.filter(match);
    let out = '';
    if (!m.total) out += '<div class="empty">' + ic('cart') + '<p>Your list is empty.<br>Set meal days on Home, or add an item.</p></div>';
    else if (!items.length) out += '<div class="empty">No items match “' + h(ui.q) + '”.</div>';
    const st = m.store;
    const prods = st ? (S.products[st.id] || {}) : {};
    for (const g of groupItems(items, st)) {
      const left = g.items.filter(i => !i.checked).length;
      out += '<div class="group-h ' + (g.cold ? 'cold' : '') + '">' + (g.cold ? ic('snow', 'sm') : '') + h(g.label) + '<span class="n">' + (left ? left + ' left' : 'done') + '</span></div>';
      if (g.unknown) out += '<div class="small muted" style="margin:-2px 4px 6px">Tap the dashed chip to record where you found each item. It\'s saved for next time.</div>';
      out += '<div class="items">' + g.items.map(i => itemHtml(i, st, prods)).join('') + '</div>';
    }
    if (m.athome.filter(match).length) {
      out += '<details class="more"><summary>' + ic('pantry') + 'At home / staples (' + m.athome.length + ')' + ic('expand') + '</summary><div class="list">' +
        m.athome.filter(match).map(i => '<div class="lrow"><div class="grow"><div class="t">' + h(i.name) + '</div><div class="s">' + h(i.status === 'staple' ? 'Staple — buy only when needed' : (i.pantryNote || 'At home')) + (i.requiredText ? ' · need ' + h(i.requiredText) : '') + '</div></div><button class="btn tonal" data-act="needIt" data-id="' + i.ingId + '">Add</button></div>').join('') + '</div></details>';
    }
    if (m.hidden.length) {
      out += '<details class="more"><summary>' + ic('del') + 'Removed this week (' + m.hidden.length + ')' + ic('expand') + '</summary><div class="list">' +
        m.hidden.map(i => '<div class="lrow"><div class="grow"><div class="t">' + h(i.name) + '</div><div class="s">' + h(i.requiredText) + '</div></div><button class="btn tonal" data-act="restoreItem" data-key="' + h(i.key) + '">Restore</button></div>').join('') + '</div></details>';
    }
    return out;
  }

  function locChip(it, st, prods) {
    const loc = (prods[prodKey(it)] || {}).loc;
    const status = C.locStatus(loc, Date.now(), S.settings.recentDays);
    const label = status === 'unknown' ? 'Aisle?' : C.aisleLabel(loc.aisle) + (loc.bay ? ' · ' + loc.bay : '');
    return '<button class="loc ' + status + '" data-act="aisle" data-key="' + h(it.key) + '" title="' + STATUS_TEXT[status] + '" aria-label="Aisle: ' + h(label) + ', ' + STATUS_TEXT[status] + '">' + (status === 'unknown' ? ic('place', 'sm') : '<span class="d"></span>') + h(label) + '</button>';
  }
  function itemHtml(i, st, prods) {
    const sub = [i.product, i.brand, i.notes, i.pantryNote, i.needText ? 'total ' + i.requiredText : '', i.status === 'restock' ? 'Restock staple' : ''].filter(Boolean).map(h).join(' · ');
    return '<div class="item ' + (i.checked ? 'done' : '') + '" data-row="' + h(i.key) + '">' +
      '<button class="cb" data-act="check" data-key="' + h(i.key) + '" aria-label="' + (i.checked ? 'Untick ' : 'Tick ') + h(i.name) + '" aria-pressed="' + i.checked + '"><i>' + ic('check') + '</i></button>' +
      '<div class="body" data-act="check" data-key="' + h(i.key) + '"><span class="name">' + h(i.name) + '</span>' +
      ((i.qtyLine || i.buyText) ? '<div class="meta"><b>' + h(i.qtyLine) + '</b>' + (i.buyText ? (i.qtyLine ? ' · ' : '') + h(i.buyText) : '') + '</div>' : '') +
      (sub ? '<div class="sub">' + sub + '</div>' : '') + (i.warn ? '<div class="warn">' + h(i.warn) + '</div>' : '') +
      (i.cost !== null && i.cost !== undefined ? '<div class="cost">' + money(i.cost) + '</div>' : '') + '</div>' +
      '<div class="side">' + (st ? locChip(i, st, prods) : '') +
      '<button class="icon-btn" data-act="editItem" data-key="' + h(i.key) + '" aria-label="Edit ' + h(i.name) + '">' + ic('more') + '</button></div></div>';
  }
  function renderShopList() {
    if (ui.tab !== 'shop') return;
    const el = $('#shopList'); if (!el) return render();
    el.innerHTML = shopListHtml(listModel());
    updateProgress();
  }
  function updateProgress() {
    const m = listModel();
    const t = $('#progText'), b = $('#progBar'), c = $('#progCost');
    if (t) t.innerHTML = '<b>' + m.done + ' of ' + m.total + '</b> items purchased';
    if (b) b.style.width = (m.total ? m.done / m.total * 100 : 0) + '%';
    if (c) c.textContent = m.priced ? '≈ ' + money(m.cost) : '';
    renderNav();
    if (m.total && m.done === m.total && !ui.celebrated) { ui.celebrated = true; snack('All done! Everything is ticked off.'); }
    if (m.done < m.total) ui.celebrated = false;
  }

  /* ---------- Recipes ---------- */
  VIEWS.recipes = {
    title: () => 'Recipes',
    fab: () => ui.recipeTab === 'recipes' ? '<button class="fab" data-act="newRecipe">' + ic('add') + 'New recipe</button>' : '<button class="fab" data-act="newIngredient">' + ic('add') + 'New ingredient</button>',
    html() {
      let out = '<div class="seg" style="margin:4px 0 12px"><button data-act="recipeTab" data-v="recipes" ' + pressed(ui.recipeTab === 'recipes') + '>Recipes</button><button data-act="recipeTab" data-v="ingredients" ' + pressed(ui.recipeTab === 'ingredients') + '>Ingredients</button></div>';
      if (ui.recipeTab === 'ingredients') return out + ingredientsHtml();
      for (const [slot, name] of SLOTS) {
        const rs = S.recipes.filter(r => (r.slot || 'other') === slot);
        if (!rs.length) continue;
        out += '<h3 class="section-title">' + name + '</h3><div class="list">';
        for (const r of rs) {
          const n = C.recipeNutrition(r, S.ingredients, S.settings);
          const hasN = C.NUTRIENTS.some(x => n.totals[x.id] > 0);
          const nText = hasN ? (n.complete.kcal ? '' : '≥ ') + Math.round(n.totals.kcal) + ' kcal · ' + (n.complete.protein ? '' : '≥ ') + Math.round(n.totals.protein) + ' g protein' : 'Nutrition not entered';
          out += '<div class="lrow"><div class="grow" data-act="openRecipe" data-id="' + r.id + '" style="cursor:pointer"><div class="t">' + h(r.name) + '</div><div class="s">' + (r.items || []).length + ' ingredients · ' + (r.enabled ? (C.num(r.days) || 0) + ' days' : 'Off') + ' · ' + nText + '</div></div>' +
            '<label class="switch" aria-label="Enable ' + h(r.name) + '"><input type="checkbox" data-in="rEnabled" data-id="' + r.id + '" ' + (r.enabled ? 'checked' : '') + '><i></i></label></div>';
        }
        out += '</div>';
      }
      return out;
    }
  };
  function usedIngIds() {
    const s = new Set();
    S.recipes.forEach(r => r.enabled && C.num(r.days) > 0 && (r.items || []).forEach(i => { if (i.unit !== 'taste') s.add(C.itemIngId(i)); }));
    return s;
  }
  function ingredientsHtml() {
    const used = usedIngIds();
    const q = ui.ingQ.toLowerCase();
    let list = Object.values(S.ingredients).sort((a, b) => a.name.localeCompare(b.name));
    if (q) list = list.filter(i => i.name.toLowerCase().includes(q));
    if (ui.ingFilter === 'nutrition') list = list.filter(i => used.has(i.id) && !(i.nutrition && i.nutrition.basis));
    if (ui.ingFilter === 'pkg') list = list.filter(i => !C.packYield(i.pkg, S.settings));
    let out = '<div class="search">' + ic('search') + '<input class="input" id="ingQ" data-in="ingQ" type="search" placeholder="Search ingredients" value="' + h(ui.ingQ) + '"></div>' +
      '<div class="chips" style="margin:10px 0">' + [['all', 'All'], ['nutrition', 'Missing nutrition'], ['pkg', 'No package size']].map(([v, l]) => '<button class="chip" data-act="ingFilter" data-v="' + v + '" ' + pressed(ui.ingFilter === v) + '>' + l + '</button>').join('') + '</div>';
    out += '<div class="list">' + (list.map(i => '<button class="lrow" data-act="openIng" data-id="' + i.id + '"><div class="grow"><div class="t">' + h(i.name) + (i.form ? ' <span class="badge form">' + h(i.form) + '</span>' : '') + '</div><div class="s">' + h(catName(i.category)) +
      (C.packYield(i.pkg, S.settings) ? ' · ' + h(C.fmtPkg(i.pkg, i, S.settings)) : '') + (i.nutrition && i.nutrition.basis ? ' · nutrition ✓' : '') + '</div></div>' + ic('chev') + '</button>').join('') || '<div class="empty">Nothing here.</div>') + '</div>';
    return out;
  }

  /* ---------- Pantry ---------- */
  VIEWS.pantry = {
    title: () => 'Pantry',
    html() {
      const items = C.buildList(S, { opts: S.settings });
      const byId = {}; items.forEach(i => byId[i.ingId] = i);
      let ings = Object.values(S.ingredients);
      if (!ui.pantryAll) ings = ings.filter(i => byId[i.id] || (i.pantry && i.pantry.mode !== 'buy'));
      let out = '<div class="card small row">' + ic('info') + '<div class="grow">Optional. <b>Have</b> deducts what\'s at home (leave the amount blank if you have plenty). <b>Staple</b> = buy only when needed — switch on “Running low” to add it to the list.</div></div>' +
        '<div class="chips" style="margin:6px 0 4px"><button class="chip" data-act="pantryAll" data-v="0" ' + pressed(!ui.pantryAll) + '>This week\'s meals</button><button class="chip" data-act="pantryAll" data-v="1" ' + pressed(ui.pantryAll) + '>All ingredients</button></div>';
      for (const c of C.CATEGORIES) {
        const group = ings.filter(i => i.category === c.id).sort((a, b) => a.name.localeCompare(b.name));
        if (!group.length) continue;
        out += '<h3 class="section-title">' + c.name + '</h3><div class="list">';
        for (const ing of group) {
          const p = ing.pantry || { mode: 'buy' }, li = byId[ing.id];
          let status = li ? (li.status === 'covered' ? 'Covered — not on list' : li.status === 'staple' ? 'Staple at home' : li.status === 'restock' ? 'On list (restock)' : 'On list: ' + (li.needText || li.requiredText)) : '';
          out += '<div class="prow"><div class="row"><div class="grow"><div style="font-weight:500">' + h(ing.name) + '</div><div class="small muted">' + (li && li.requiredText ? 'Week needs ' + h(li.requiredText) + ' · ' : '') + h(status) + '</div></div></div>' +
            '<div class="seg" style="margin-top:8px">' + [['buy', 'Buy'], ['have', 'Have some'], ['staple', 'Staple']].map(([v, l]) => '<button data-act="pantryMode" data-id="' + ing.id + '" data-v="' + v + '" ' + pressed(p.mode === v) + '>' + l + '</button>').join('') + '</div>';
          if (p.mode === 'have') out += '<div class="row" style="margin-top:8px"><input class="input sm grow" id="ph-' + ing.id + '" data-in="pantryQty" data-id="' + ing.id + '" inputmode="decimal" placeholder="Amount (blank = plenty)" value="' + h(p.haveQty) + '"><select class="input sm" style="width:120px" id="phu-' + ing.id + '" data-in="pantryUnit" data-id="' + ing.id + '">' + unitOptions(p.haveUnit || 'g', ing).replace(/<option value="taste"[^>]*>[^<]*<\/option>/, '') + '</select></div>';
          if (p.mode === 'staple') out += '<div class="row" style="margin-top:10px"><span class="grow small">Running low — add to shopping list</span><label class="switch"><input type="checkbox" data-in="pantryLow" data-id="' + ing.id + '" ' + (p.low ? 'checked' : '') + '><i></i></label></div>';
          out += '</div>';
        }
        out += '</div>';
      }
      return out;
    }
  };

  /* ---------- Settings ---------- */
  VIEWS.settings = {
    title: () => 'Settings',
    html() {
      const t = S.settings.targets;
      let out = '<h3 class="section-title">Appearance</h3><div class="seg">' + [['auto', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => '<button data-act="theme" data-v="' + v + '" ' + pressed(S.settings.theme === v) + '>' + l + '</button>').join('') + '</div>';
      out += '<h3 class="section-title">Daily targets</h3><div class="card"><div class="grid2">' +
        C.NUTRIENTS.map(n => '<label class="field"><span>' + n.name + ' (' + n.unit + ')</span><input class="input" id="tg-' + n.id + '" data-in="target" data-f="' + n.id + '" inputmode="decimal" value="' + h(t[n.id]) + '" placeholder="optional"></label>').join('') + '</div></div>';
      out += '<h3 class="section-title">Measurements</h3><div class="card"><div class="small muted" style="margin-bottom:8px">Tablespoon size used for spoon quantities</div><div class="seg">' +
        [[20, '20 ml (Australian)'], [15, '15 ml (US/UK)']].map(([v, l]) => '<button data-act="tbsp" data-v="' + v + '" ' + pressed(C.num(S.settings.tbspMl) === v) + '>' + l + '</button>').join('') + '</div></div>';
      out += '<h3 class="section-title">Stores & aisles</h3><div class="list">' + S.stores.map(s => {
        const n = Object.values(S.products[s.id] || {}).filter(p => p.loc && p.loc.aisle).length;
        return '<button class="lrow" data-act="openStore" data-id="' + s.id + '"><span class="logo ' + s.chain + '" style="width:36px;height:36px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:800">' + chainLetter(s.chain) + '</span><div class="grow"><div class="t">' + h(s.name) + '</div><div class="s">' + n + ' aisle location' + (n === 1 ? '' : 's') + ' saved</div></div>' + ic('chev') + '</button>';
      }).join('') + '<button class="lrow" data-act="addStore">' + ic('add') + '<div class="grow t">Add a store</div></button></div>';
      out += '<div class="card"><div class="row"><div class="grow"><div style="font-weight:500">Cold items last</div><div class="small muted">Fridge & frozen products are placed at the end of the walk</div></div><label class="switch"><input type="checkbox" data-in="coldLast" ' + (S.settings.coldLast ? 'checked' : '') + '><i></i></label></div>' +
        '<label class="field"><span>Treat app/website look-ups as “recently verified” for (days)</span><input class="input" id="recentDays" data-in="recentDays" inputmode="numeric" value="' + h(S.settings.recentDays) + '"></label>' +
        '<button class="btn text" data-act="aisleHelp">' + ic('info', 'sm') + 'How aisle data works</button></div>';
      out += '<h3 class="section-title">Shopping lists</h3><div class="list">' +
        '<button class="lrow" data-act="newList">' + ic('restart') + '<div class="grow"><div class="t">Start a new weekly list</div><div class="s">Archives this list and clears ticks</div></div></button>' +
        '<button class="lrow" data-act="resetChecks">' + ic('check') + '<div class="grow"><div class="t">Reset all ticks</div></div></button>' +
        '<button class="lrow" data-act="openHistory">' + ic('history') + '<div class="grow"><div class="t">Previous lists</div><div class="s">' + S.history.length + ' saved — reuse any of them</div></div>' + ic('chev') + '</button></div>';
      out += '<h3 class="section-title">Backup</h3><div class="card"><div class="small muted">Everything is stored only on this phone. ' + (S.settings.lastBackupAt ? 'Last backup: ' + fmtDate(S.settings.lastBackupAt) + '.' : 'No backup yet.') + ' <span id="persistNote"></span></div>' +
        '<div class="actions" style="justify-content:flex-start"><button class="btn" data-act="exportData">' + ic('download', 'sm') + 'Export backup</button>' +
        (navigator.canShare ? '<button class="btn tonal" data-act="shareBackup">' + ic('share', 'sm') + 'Save to Drive…</button>' : '') +
        '<button class="btn outline" data-act="importData">' + ic('upload', 'sm') + 'Import</button></div>' +
        '<input type="file" id="importFile" accept="application/json,.json" hidden></div>';
      out += '<h3 class="section-title">About</h3><div class="card small">Prep List v1.0 · works offline · no account, ads or tracking.<div class="actions" style="justify-content:flex-start"><a class="btn text" href="tests/index.html" target="_blank" rel="noopener">Run self-tests</a>' +
        '<button class="btn danger" data-act="eraseAll">' + (ui.eraseArm > Date.now() ? 'Tap again to erase everything' : 'Erase all data') + '</button></div></div>';
      setTimeout(updatePersistNote, 0);
      return out;
    }
  };
  function updatePersistNote() {
    const el = $('#persistNote');
    if (!el || !navigator.storage || !navigator.storage.persisted) return;
    navigator.storage.persisted().then(p => { if ($('#persistNote')) $('#persistNote').textContent = p ? 'Storage is marked persistent.' : 'Install to home screen so Android keeps the data persistent.'; });
  }

  /* ---------------- Sheets ---------------- */
  const sheets = [];
  function openSheet(renderFn, opts) {
    opts = opts || {};
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const el = document.createElement('div'); el.className = 'sheet' + (opts.full ? ' full' : ''); el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    const sh = { el, scrim, opts, data: opts.data || {} };
    sh.refresh = () => {
      const st = el.scrollTop;
      keepFocus(el, () => { const html = renderFn(sh); if (html === null) { closeSheet(); return; } el.innerHTML = (opts.full ? '' : '<div class="handle"></div>') + html; });
      el.scrollTop = st;
      if (opts.after) opts.after(sh);
    };
    sh.refresh();
    document.getElementById('sheets').append(scrim, el);
    requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('on'); el.classList.add('on'); }));
    scrim.addEventListener('click', closeSheet);
    sheets.push(sh);
    history.pushState({ sheet: sheets.length }, '');
    if (opts.focus) setTimeout(() => { const f = el.querySelector(opts.focus); if (f) f.focus(); }, 320);
    return sh;
  }
  function popSheet() {
    const sh = sheets.pop(); if (!sh) return;
    if (document.activeElement && sh.el.contains(document.activeElement)) document.activeElement.blur();
    sh.el.classList.remove('on'); sh.scrim.classList.remove('on');
    setTimeout(() => { sh.el.remove(); sh.scrim.remove(); }, 300);
    flush(); render(); refreshSheets();
  }
  function closeSheet() { if (sheets.length) history.back(); }
  function closeAllSheets() { const n = sheets.length; if (n) history.go(-n); }
  window.addEventListener('popstate', () => { while (sheets.length > (history.state && history.state.sheet || 0)) popSheet(); });
  function refreshSheets() { sheets.forEach(s => s.refresh()); }
  const sheetHead = (title, extra, full) => '<div class="sh">' + (full ? '<button class="icon-btn" data-act="closeSheet" aria-label="Back">' + ic('back') + '</button>' : '') + '<h2>' + h(title) + '</h2>' + (extra || '') + (full ? '' : '<button class="icon-btn" data-act="closeSheet" aria-label="Close">' + ic('close') + '</button>') + '</div>';

  /* ---------- Store picker ---------- */
  function storePicker() {
    openSheet(() => {
      const last = S.settings.lastStoreId;
      const stores = [...S.stores].sort((a, b) => (b.id === last) - (a.id === last));
      return sheetHead('Where are you shopping?') +
        stores.map(s => {
          const n = Object.values(S.products[s.id] || {}).filter(p => p.loc && p.loc.aisle).length;
          return '<button class="store-opt ' + (s.id === last ? 'last' : '') + '" data-act="pickStore" data-id="' + s.id + '"><span class="logo ' + s.chain + '">' + chainLetter(s.chain) + '</span><div class="grow"><div style="font-weight:600;font-size:17px">' + h(s.name) + '</div><div class="small muted">' + h(s.address || '') + (s.address ? ' · ' : '') + n + ' aisle' + (n === 1 ? '' : 's') + ' saved</div></div>' + (s.id === last ? '<span class="badge">Last visit</span>' : '') + '</button>';
        }).join('') +
        '<button class="btn text block" data-act="noStore">Shop without a store (department order)</button>';
    });
  }

  /* ---------- Aisle quick-set ---------- */
  function aisleSheet(key) {
    const sh = openSheet(s => {
      const st = tripStore(); if (!st) return null;
      const m = listModel();
      const it = m.active.concat(m.hidden).find(i => i.key === key); if (!it) return null;
      const pk = prodKey(it), prod = (S.products[st.id] || {})[pk] || {};
      const loc = prod.loc;
      const status = C.locStatus(loc, Date.now(), S.settings.recentDays);
      const src = s.data.src || 'manual';
      const query = prod.name || ((prod.brand ? prod.brand + ' ' : '') + it.name.replace(/\(.*?\)/g, '')).trim();
      const url = C.searchUrl(st.chain, query);
      let out = sheetHead(it.name, '', false);
      out += '<div class="row" style="margin-bottom:10px"><span class="loc ' + status + '">' + (status === 'unknown' ? ic('place', 'sm') : '<span class="d"></span>') + h(status === 'unknown' ? 'Location unknown' : C.aisleLabel(loc.aisle) + (loc.bay ? ' · ' + loc.bay : '')) + '</span><span class="small muted grow">' + STATUS_TEXT[status] + (loc && loc.verifiedAt ? ' · ' + fmtDate(loc.verifiedAt) : '') + ' · ' + h(st.name) + '</span></div>';
      if (loc && loc.suggestion) out += '<div class="card warn small">App/website look-up suggested <b>' + h(C.aisleLabel(loc.suggestion.aisle)) + '</b> (' + fmtDate(loc.suggestion.at) + '), but your in-store confirmation was kept.<div class="actions"><button class="btn tonal" data-act="useSuggestion" data-key="' + h(key) + '">Use suggestion</button></div></div>';
      out += '<div class="seg" style="margin:4px 0 12px"><button data-act="aisleSrc" data-v="manual" ' + pressed(src === 'manual') + '>' + ic('check', 'sm') + 'Found it here</button><button data-act="aisleSrc" data-v="web" ' + pressed(src === 'web') + '>From ' + h(chainName(st.chain) || 'store') + ' app/site</button></div>';
      out += '<div class="small muted" style="margin:0 4px 6px">One tap saves:</div><div class="numgrid">' + Array.from({ length: 24 }, (_, i) => i + 1).map(n => '<button class="chip num" data-act="setAisle" data-key="' + h(key) + '" data-v="' + n + '" ' + pressed(loc && C.parseAisle(loc.aisle) && C.parseAisle(loc.aisle).n === n) + '>' + n + '</button>').join('') + '</div>';
      out += '<div class="chips wrap" style="margin:10px 0">' + C.ZONES.filter(z => z.id !== 'aisles' && z.id !== 'other').map(z => '<button class="chip" data-act="setAisle" data-key="' + h(key) + '" data-v="' + h(z.name) + '">' + h(z.name) + '</button>').join('') + '</div>';
      out += '<form data-submit="setAisleCustom" data-key="' + h(key) + '" class="row"><input class="input grow" id="aisleText" name="aisle" placeholder="Other, e.g. 14B or End of 3" value=""><input class="input" style="width:96px" name="bay" placeholder="Bay"><button class="btn" type="submit">Save</button></form>';
      out += '<div class="actions" style="justify-content:flex-start">' +
        (url ? '<a class="btn tonal" href="' + h(url) + '" target="_blank" rel="noopener">' + ic('open', 'sm') + 'Look up on ' + h(chainName(st.chain)) + '</a>' : '') +
        '<button class="btn outline" data-act="openProduct" data-store="' + st.id + '" data-key="' + h(pk) + '" data-name="' + h(it.name) + '">Product details</button>' +
        (loc && loc.aisle && !loc.outdated ? '<button class="btn text" data-act="markOutdated" data-key="' + h(key) + '">' + ic('flag', 'sm') + 'Mark incorrect</button>' : '') + '</div>';
      if (url) out += '<p class="small muted">' + h(chainName(st.chain)) + '\'s own app/website shows aisle numbers once ' + h(st.name.replace(/^\S+\s/, '')) + ' is selected as your store. Copy the aisle here with “From app/site”.</p>';
      return out;
    }, { data: { src: S.trip ? 'manual' : 'web' } });
    return sh;
  }
  function saveLocation(key, aisle, bay, src) {
    const st = tripStore(); if (!st) return;
    const m = listModel();
    const it = m.active.concat(m.hidden).find(i => i.key === key); if (!it) return;
    const pk = prodKey(it);
    const prods = prodsOf(st.id);
    const prod = prods[pk] = prods[pk] || { name: '', ingredient: it.name };
    const r = C.applyLocation(prod.loc, { aisle, bay, source: src }, Date.now());
    prod.loc = r.loc;
    save();
    closeSheet();
    snack(r.accepted ? C.aisleLabel(aisle) + ' saved for ' + st.name : r.reason);
  }

  /* ---------- Product (store-specific) ---------- */
  function productSheet(storeId, key, name) {
    const st = storeById(storeId);
    const existing = (S.products[storeId] || {})[key] || {};
    const draft = JSON.parse(JSON.stringify(existing));
    draft.pkg = draft.pkg || { size: '', unit: 'g', label: '', yieldQty: '', yieldUnit: 'g' };
    const ing = S.ingredients[key];
    const aisleInit = existing.loc ? existing.loc.aisle : '';
    openSheet(sh => {
      const d = sh.data.draft;
      const loc = existing.loc;
      const status = C.locStatus(loc, Date.now(), S.settings.recentDays);
      let out = sheetHead(name || (ing && ing.name) || 'Product', '', true);
      out += '<div class="small muted" style="margin:-4px 4px 10px">' + h(st.name) + ' · your preferred product is remembered for every trip</div>';
      out += '<div class="row" style="align-items:flex-start;gap:14px">' + (d.photo ? '<img class="photo lg" src="' + h(d.photo) + '" alt="">' : '<div class="photo lg" style="display:grid;place-items:center;color:var(--on-surface-var)">' + ic('camera') + '</div>') +
        '<div class="grow"><label class="btn tonal" style="margin-bottom:8px">' + ic('camera', 'sm') + 'Photo<input type="file" accept="image/*" capture="environment" data-in="pdPhoto" hidden></label>' + (d.photo ? ' <button class="btn text" data-act="pdPhotoClear">Remove</button>' : '') + '<div class="tiny muted">Stored small on this phone only.</div></div></div>';
      const f = (label, path, ph, attrs) => '<label class="field"><span>' + label + '</span><input class="input" id="pd-' + path.replace(/\./g, '-') + '" data-in="pd" data-f="' + path + '" value="' + h(getPath(d, path)) + '" placeholder="' + h(ph || '') + '" ' + (attrs || '') + '></label>';
      out += f('Preferred product', 'name', 'e.g. Extra Firm Tofu 450g') + '<div class="grid2">' + f('Brand', 'brand', '') +
        '<label class="field"><span>Department</span><select class="input" data-in="pd" data-f="department"><option value="">Same as ingredient</option>' + catOptions(d.department) + '</select></label></div>';
      out += '<div class="grid3">' + f('Pack size', 'pkg.size', 'e.g. 450', 'inputmode="decimal"') + '<label class="field"><span>Unit</span><select class="input" data-in="pd" data-f="pkg.unit">' + unitOptions(d.pkg.unit || 'g', ing).replace(/<option value="taste"[^>]*>[^<]*<\/option>/, '') + '</select></label>' + f('Pack name', 'pkg.label', 'packet') + '</div>';
      out += '<div class="grid2">' + f('Drained / usable weight', 'pkg.yieldQty', 'optional', 'inputmode="decimal"') + '<label class="field"><span>Unit</span><select class="input" data-in="pd" data-f="pkg.yieldUnit">' + unitOptions(d.pkg.yieldUnit || 'g', ing).replace(/<option value="taste"[^>]*>[^<]*<\/option>/, '') + '</select></label></div>';
      out += '<div class="grid2">' + f('Price ($)', 'price', '', 'inputmode="decimal"') + '<label class="field"><span>Price is</span><select class="input" data-in="pd" data-f="priceUnit">' + priceUnitOptions(d.priceUnit || 'pack') + '</select></label></div>';
      out += f('Product URL', 'url', 'https://…', 'type="url" inputmode="url"') + (d.url ? '<a class="btn text" href="' + h(d.url) + '" target="_blank" rel="noopener">' + ic('open', 'sm') + 'Open product page</a>' : '');
      out += '<h3 class="section-title">Aisle at ' + h(st.name) + '</h3><div class="card"><div class="row"><span class="loc ' + status + '"><span class="d"></span>' + h(status === 'unknown' ? 'Unknown' : C.aisleLabel(loc.aisle)) + '</span><span class="small muted">' + STATUS_TEXT[status] + (loc && loc.verifiedAt ? ' · ' + fmtDate(loc.verifiedAt) : '') + '</span></div>' +
        '<div class="grid2"><label class="field"><span>Aisle</span><input class="input" id="pd-aisle" data-in="pdAisle" value="' + h(sh.data.aisle) + '" placeholder="e.g. 7 or Dairy"></label><label class="field"><span>Bay / note</span><input class="input" id="pd-bay" data-in="pdBay" value="' + h(sh.data.bay) + '" placeholder="optional"></label></div>' +
        '<div class="seg"><button data-act="pdSrc" data-v="manual" ' + pressed(sh.data.src === 'manual') + '>Confirmed in store</button><button data-act="pdSrc" data-v="web" ' + pressed(sh.data.src === 'web') + '>From app/website</button></div>' +
        (loc && loc.history && loc.history.length ? '<div class="tiny muted" style="margin-top:8px">History: ' + loc.history.slice(-4).map(x => h(C.aisleLabel(x.aisle)) + ' (' + fmtDate(x.at) + ')').join(', ') + '</div>' : '') + '</div>';
      out += '<div class="small muted">Product info last verified: ' + (existing.verifiedAt ? fmtDate(existing.verifiedAt) : 'never') + '</div>';
      out += '<div class="actions">' + (Object.keys(existing).length ? '<button class="btn danger" data-act="pdDelete" data-store="' + storeId + '" data-key="' + h(key) + '">Delete</button>' : '') + '<button class="btn" data-act="pdSave" data-store="' + storeId + '" data-key="' + h(key) + '">Save</button></div>';
      return out;
    }, { full: true, data: { draft, aisle: aisleInit, bay: existing.loc ? existing.loc.bay || '' : '', src: existing.loc && existing.loc.source === 'web' ? 'web' : 'manual', aisleInit } });
  }

  function productsSheet(storeId) {
    openSheet(() => {
      const st = storeById(storeId); if (!st) return null;
      const prods = S.products[storeId] || {};
      const m = listModel();
      const keys = new Set(Object.keys(prods));
      m.active.forEach(i => keys.add(prodKey(i)));
      const rows = [...keys].map(k => {
        const p = prods[k] || {};
        const name = (S.ingredients[k] && S.ingredients[k].name) || p.ingredient || k.replace(/^c:/, '').replace(/-/g, ' ');
        return { k, p, name };
      }).sort((a, b) => a.name.localeCompare(b.name));
      return sheetHead(st.name + ' products', '', true) + '<p class="small muted">Preferred products, prices, photos and aisle locations for this store. Tap to edit.</p><div class="list">' + rows.map(r => {
        const status = C.locStatus(r.p.loc, Date.now(), S.settings.recentDays);
        return '<button class="lrow" data-act="openProduct" data-store="' + storeId + '" data-key="' + h(r.k) + '" data-name="' + h(r.name) + '">' + (r.p.photo ? '<img class="photo" style="width:44px;height:44px;border-radius:10px" src="' + h(r.p.photo) + '" alt="">' : '') +
          '<div class="grow"><div class="t">' + h(r.name) + '</div><div class="s">' + h([r.p.name, r.p.brand, r.p.price ? money(C.num(r.p.price)) : ''].filter(Boolean).join(' · ') || 'No product chosen') + '</div></div><span class="loc ' + status + '">' + (status === 'unknown' ? '?' : h(C.aisleLabel(r.p.loc.aisle))) + '</span></button>';
      }).join('') + '</div>';
    }, { full: true });
  }

  /* ---------- Store editor ---------- */
  function storeSheet(id) {
    openSheet(() => {
      const st = storeById(id); if (!st) return null;
      const layout = (st.layout && st.layout.length ? st.layout : C.DEFAULT_LAYOUT).slice();
      C.DEFAULT_LAYOUT.forEach(z => { if (!layout.includes(z)) layout.push(z); });
      let out = sheetHead(st.name, '', true);
      out += '<label class="field"><span>Name</span><input class="input" id="st-name" data-in="store" data-id="' + id + '" data-f="name" value="' + h(st.name) + '"></label>' +
        '<div class="grid2"><label class="field"><span>Chain</span><select class="input" data-in="store" data-id="' + id + '" data-f="chain"><option value="coles" ' + sel(st.chain, 'coles') + '>Coles</option><option value="woolworths" ' + sel(st.chain, 'woolworths') + '>Woolworths</option><option value="other" ' + sel(st.chain, 'other') + '>Other</option></select></label>' +
        '<label class="field"><span>Suburb / address</span><input class="input" id="st-addr" data-in="store" data-id="' + id + '" data-f="address" value="' + h(st.address) + '"></label></div>';
      out += '<h3 class="section-title">Walking order</h3><div class="small muted" style="margin:0 4px 8px">Order the store areas the way you walk them. Numbered aisles are sorted within their slot.</div>' +
        '<div class="seg" style="margin-bottom:10px"><button data-act="aisleDir" data-id="' + id + '" data-v="asc" ' + pressed(st.aisleDir !== 'desc') + '>Aisle 1 → high</button><button data-act="aisleDir" data-id="' + id + '" data-v="desc" ' + pressed(st.aisleDir === 'desc') + '>High → aisle 1</button></div>' +
        '<div class="list">' + layout.map((z, i) => '<div class="lrow"><div class="grow t">' + (i + 1) + '. ' + h(C.ZONES.find(x => x.id === z).name) + '</div><button class="icon-btn" data-act="zoneMove" data-id="' + id + '" data-i="' + i + '" data-d="-1" aria-label="Move up" ' + (i === 0 ? 'disabled' : '') + '>' + ic('up') + '</button><button class="icon-btn" data-act="zoneMove" data-id="' + id + '" data-i="' + i + '" data-d="1" aria-label="Move down" ' + (i === layout.length - 1 ? 'disabled' : '') + '>' + ic('expand') + '</button></div>').join('') + '</div>' +
        '<div class="actions"><button class="btn text" data-act="zoneReset" data-id="' + id + '">Reset order</button></div>';
      out += '<div class="list"><button class="lrow" data-act="openProducts" data-id="' + id + '">' + ic('store') + '<div class="grow t">Product & aisle database</div>' + ic('chev') + '</button></div>';
      if (!st.builtIn) out += '<div class="actions"><button class="btn danger" data-act="deleteStore" data-id="' + id + '">Delete store</button></div>';
      return out;
    }, { full: true });
  }

  /* ---------- Shopping item editor ---------- */
  function itemSheet(key) {
    openSheet(() => {
      const m = listModel();
      const it = m.active.concat(m.hidden).find(i => i.key === key); if (!it) return null;
      const st = tripStore();
      let out = sheetHead(it.name);
      if (it.custom) {
        const c = S.list.custom.find(x => x.id === it.id);
        const f = (label, fld, ph, attrs) => '<label class="field"><span>' + label + '</span><input class="input" id="ci-' + fld + '" data-in="custom" data-id="' + c.id + '" data-f="' + fld + '" value="' + h(c[fld]) + '" placeholder="' + (ph || '') + '" ' + (attrs || '') + '></label>';
        out += f('Name', 'name') + '<div class="grid2">' + f('Quantity', 'qty', 'e.g. 2 packs') + '<label class="field"><span>Category</span><select class="input" data-in="custom" data-id="' + c.id + '" data-f="category">' + catOptions(c.category) + '</select></label></div>' +
          '<div class="grid2">' + f('Brand preference', 'brand') + f('Price ($)', 'price', '', 'inputmode="decimal"') + '</div>' + f('Notes', 'notes') +
          '<div class="row" style="margin:8px 0"><span class="grow">Add every week</span><label class="switch"><input type="checkbox" data-in="custom" data-id="' + c.id + '" data-f="repeat" ' + (c.repeat ? 'checked' : '') + '><i></i></label></div>';
      } else {
        const ing = S.ingredients[it.ingId];
        out += '<div class="card small"><div><b>Required:</b> ' + h(it.requiredText) + '</div>' + (it.needText ? '<div><b>After pantry:</b> ' + h(it.needText) + '</div>' : '') + (it.buyText ? '<div><b>Recommended purchase:</b> ' + h(it.buyText) + '</div>' : '') +
          (it.pack && it.pack.spare > 0 ? '<div class="muted">Leaves about ' + h(C.fmtAmount({ dim: it.pack.dim, amt: it.pack.spare }, ing, S.settings)) + ' spare</div>' : '') +
          (it.sources.length ? '<div class="muted">From: ' + h(it.sources.join(', ')) + '</div>' : '') + (ing.pkg && ing.pkg.source ? '<div class="muted tiny">Package size: ' + h(ing.pkg.source) + '</div>' : '') + '</div>';
        const f = (label, fld, ph, attrs) => '<label class="field"><span>' + label + '</span><input class="input" id="ii-' + fld + '" data-in="ing" data-id="' + ing.id + '" data-f="' + fld + '" value="' + h(ing[fld]) + '" placeholder="' + (ph || '') + '" ' + (attrs || '') + '></label>';
        out += '<div class="grid2">' + f('Brand preference', 'brand') + '<label class="field"><span>Category</span><select class="input" data-in="ing" data-id="' + ing.id + '" data-f="category">' + catOptions(ing.category) + '</select></label></div>' + f('Notes', 'notes') +
          '<div class="grid2">' + f('Price ($)', 'price', '', 'inputmode="decimal"') + '<label class="field"><span>Price is</span><select class="input" data-in="ing" data-id="' + ing.id + '" data-f="priceUnit">' + priceUnitOptions(ing.priceUnit || (ing.pkg ? 'pack' : 'item')) + '</select></label></div>' +
          '<label class="field"><span>This week only: quantity override</span><input class="input" id="qo" data-in="qtyOv" data-key="' + h(key) + '" value="' + h(S.list.qtyOverride[key] || '') + '" placeholder="Leave blank to use calculated amount"></label>';
      }
      out += '<div class="actions" style="justify-content:flex-start">';
      if (!it.custom) out += '<button class="btn tonal" data-act="openIng" data-id="' + it.ingId + '">' + ic('edit', 'sm') + 'Ingredient & package</button><button class="btn tonal" data-act="haveIt" data-id="' + it.ingId + '">' + ic('pantry', 'sm') + 'I have this</button>';
      if (st) out += '<button class="btn tonal" data-act="openProduct" data-store="' + st.id + '" data-key="' + h(prodKey(it)) + '" data-name="' + h(it.name) + '">' + ic('store', 'sm') + 'Product at ' + h(st.name) + '</button>';
      out += '<button class="btn danger" data-act="removeItem" data-key="' + h(key) + '">' + ic('del', 'sm') + (it.custom ? 'Delete' : 'Remove this week') + '</button></div>';
      return out;
    });
  }

  function addCustomSheet() {
    openSheet(sh => {
      const d = sh.data;
      return sheetHead('Add item') + '<form data-submit="addCustomSubmit" autocomplete="off">' +
        '<label class="field"><span>Item</span><input class="input" id="cName" name="name" data-in="cName" placeholder="e.g. Paper towel" required value="' + h(d.name || '') + '"></label>' +
        '<div class="grid2"><label class="field"><span>Quantity</span><input class="input" id="cQty" name="qty" placeholder="optional" value="' + h(d.qty || '') + '"></label>' +
        '<label class="field"><span>Category</span><select class="input" name="category" id="cCat" data-in="cCat">' + catOptions(d.cat || 'household') + '</select></label></div>' +
        '<div class="row" style="margin:6px 0 4px"><span class="grow small">Add every week</span><label class="switch"><input type="checkbox" name="repeat"><i></i></label></div>' +
        '<div class="actions"><button type="button" class="btn text" data-act="closeSheet">Done</button><button class="btn" type="submit">' + ic('add', 'sm') + 'Add</button></div></form>';
    }, { focus: '#cName', data: {} });
  }

  /* ---------- Recipe editor ---------- */
  function recipeSheet(id) {
    openSheet(() => {
      const r = S.recipes.find(x => x.id === id); if (!r) return null;
      let out = sheetHead(r.name, '<button class="icon-btn" data-act="dupRecipe" data-id="' + id + '" aria-label="Duplicate">' + ic('copy') + '</button><button class="icon-btn" data-act="delRecipe" data-id="' + id + '" aria-label="Delete">' + ic('del') + '</button>', true);
      out += '<label class="field"><span>Name</span><input class="input" id="r-name" data-in="recipe" data-id="' + id + '" data-f="name" value="' + h(r.name) + '"></label>' +
        '<div class="grid3"><label class="field"><span>Meal</span><select class="input" data-in="recipe" data-id="' + id + '" data-f="slot">' + SLOTS.map(([v, l]) => '<option value="' + v + '" ' + sel(v, r.slot) + '>' + l + '</option>').join('') + '</select></label>' +
        '<label class="field"><span>Days</span><input class="input" id="r-days" data-in="recipe" data-id="' + id + '" data-f="days" inputmode="numeric" value="' + h(r.days) + '"></label>' +
        '<div class="field"><span>Enabled</span><div class="row" style="height:48px"><label class="switch"><input type="checkbox" data-in="recipe" data-id="' + id + '" data-f="enabled" ' + (r.enabled ? 'checked' : '') + '><i></i></label></div></div></div>';
      if (r.variantGroup) out += '<label class="field"><span>Switch label on Home (variant)</span><input class="input" id="r-vl" data-in="recipe" data-id="' + id + '" data-f="variantLabel" value="' + h(r.variantLabel || '') + '"></label>';
      out += '<h3 class="section-title">Ingredients · per serving</h3><div class="card">';
      out += (r.items || []).map((it, idx) => {
        const ing = S.ingredients[it.ingId];
        const useIng = S.ingredients[C.itemIngId(it)] || ing;
        const opts = [it.ingId].concat(it.alts || []).filter(x => S.ingredients[x]);
        return '<div class="ritem"><div class="top"><div class="nm grow" data-act="openIng" data-id="' + C.itemIngId(it) + '">' + h(useIng ? useIng.name : '(missing)') + (useIng && useIng.form ? ' <span class="badge form">' + h(useIng.form) + '</span>' : '') + '</div>' +
          '<button class="btn text" style="min-height:32px;padding:0 6px;font-size:13px" data-act="riAlt" data-id="' + id + '" data-idx="' + idx + '">+ alternative</button></div>' +
          '<input class="input sm" id="ri-q-' + idx + '" data-in="riQty" data-id="' + id + '" data-idx="' + idx + '" inputmode="decimal" value="' + h(it.unit === 'taste' || C.num(it.qty) === null ? '' : C.fmtNum(C.num(it.qty))) + '" ' + (it.unit === 'taste' ? 'disabled placeholder="—"' : '') + '>' +
          '<select class="input sm" data-in="riUnit" data-id="' + id + '" data-idx="' + idx + '">' + unitOptions(it.unit, useIng) + '</select>' +
          '<button class="icon-btn" data-act="riDel" data-id="' + id + '" data-idx="' + idx + '" aria-label="Remove">' + ic('close', 'sm') + '</button>' +
          (opts.length > 1 ? '<div class="alt"><span class="muted">Use</span><select class="input sm grow" data-in="riUse" data-id="' + id + '" data-idx="' + idx + '">' + opts.map(o => '<option value="' + o + '" ' + sel(o, C.itemIngId(it)) + '>' + h(S.ingredients[o].name) + '</option>').join('') + '</select></div>' : '') + '</div>';
      }).join('') || '<div class="muted small">No ingredients yet.</div>';
      out += '<div class="actions"><button class="btn tonal" data-act="riAdd" data-id="' + id + '">' + ic('add', 'sm') + 'Add ingredient</button></div></div>';
      out += '<h3 class="section-title">Instructions</h3><textarea class="input" id="r-instr" data-in="recipe" data-id="' + id + '" data-f="instructions" rows="8">' + h(r.instructions || '') + '</textarea>';
      out += '<h3 class="section-title">Nutrition · per serving</h3><div class="card" id="rNutr">' + recipeNutrHtml(r) + '</div>';
      return out;
    }, { full: true });
  }
  function recipeNutrHtml(r) {
    const n = C.recipeNutrition(r, S.ingredients, S.settings);
    let out = '<table class="ntable">' + C.NUTRIENTS.map(x => '<tr><td>' + x.name + '</td><td>' + (n.missing[x.id].length && !n.totals[x.id] ? '<span class="muted">—</span>' : (n.complete[x.id] ? '' : '≥ ') + (Math.round(n.totals[x.id] * 10) / 10) + ' ' + x.unit) + '</td></tr>').join('') + '</table>';
    const miss = new Set(); C.NUTRIENTS.forEach(x => n.missing[x.id].forEach(m => miss.add(m)));
    if (miss.size) out += '<div class="small muted" style="margin-top:8px">Missing data (not counted as zero): ' + h([...miss].join(', ')) + '. Tap an ingredient name to add label values.</div>';
    if (n.skipped.length) out += '<div class="tiny muted" style="margin-top:4px">“To taste” items aren\'t counted: ' + h(n.skipped.join(', ')) + '.</div>';
    return out;
  }

  function ingredientPicker(onPick) {
    pickerQ.q = '';
    openSheet(() => sheetHead('Choose ingredient') +
      '<div class="search">' + ic('search') + '<input class="input" id="pickQ" data-in="pickQ" type="search" placeholder="Search or type a new ingredient" autocomplete="off"></div><div id="pickList" style="margin-top:10px">' + pickListHtml() + '</div>',
      { focus: '#pickQ', data: { onPick } });
  }
  function pickListHtml() {
    const q = pickerQ.q.trim().toLowerCase();
    const list = Object.values(S.ingredients).filter(i => !q || i.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 40);
    return (q ? '<button class="btn tonal block" data-act="pickNew" style="margin-bottom:8px">' + ic('add', 'sm') + 'Create “' + h(pickerQ.q.trim()) + '”</button>' : '') +
      '<div class="list">' + list.map(i => '<button class="lrow" data-act="pickIng" data-id="' + i.id + '"><div class="grow"><div class="t">' + h(i.name) + (i.form ? ' <span class="badge form">' + h(i.form) + '</span>' : '') + '</div><div class="s">' + h(catName(i.category)) + '</div></div></button>').join('') + '</div>';
  }

  /* ---------- Ingredient editor ---------- */
  function ingSheet(id) {
    openSheet(() => {
      const ing = S.ingredients[id]; if (!ing) return null;
      const usedIn = S.recipes.filter(r => (r.items || []).some(i => i.ingId === id || i.use === id || (i.alts || []).includes(id)));
      const f = (label, path, ph, attrs) => '<label class="field"><span>' + label + '</span><input class="input" id="ig-' + path.replace(/\./g, '-') + '" data-in="ing" data-id="' + id + '" data-f="' + path + '" value="' + h(getPath(ing, path)) + '" placeholder="' + h(ph || '') + '" ' + (attrs || '') + '></label>';
      const uopt = u => unitOptions(u || 'g', ing).replace(/<option value="taste"[^>]*>[^<]*<\/option>/, '');
      const n = ing.nutrition || {};
      const pkg = ing.pkg || {};
      let out = sheetHead(ing.name, '', true);
      out += f('Name', 'name') + '<div class="grid2"><label class="field"><span>Category</span><select class="input" data-in="ing" data-id="' + id + '" data-f="category">' + catOptions(ing.category) + '</select></label>' +
        '<label class="field"><span>Weight is measured</span><select class="input" data-in="ing" data-id="' + id + '" data-f="form">' + [['', 'As sold'], ['dry', 'Dry (uncooked)'], ['cooked', 'Cooked'], ['drained', 'Drained'], ['raw', 'Raw / fresh'], ['dried', 'Dried'], ['frozen', 'Frozen']].map(([v, l]) => '<option value="' + v + '" ' + sel(v, ing.form) + '>' + l + '</option>').join('') + '</select></label></div>' +
        '<div class="small muted" style="margin:-4px 4px 8px">Dry, cooked and drained forms are separate ingredients and are never added together. Create a separate ingredient for another form.</div>';
      out += '<h3 class="section-title">Pieces & conversions (optional)</h3><div class="card"><div class="grid2">' + f('Piece name', 'countName', 'e.g. banana') + f('Plural', 'countPlural', 'e.g. bananas') + '</div>' +
        '<div class="grid2">' + f('Grams per piece', 'gPerCount', 'your own weighing', 'inputmode="decimal"') + f('Density (g per ml)', 'density', 'for spoons → grams', 'inputmode="decimal"') + '</div>' +
        '<div class="tiny muted">Only needed to combine pieces/spoons with grams, or for per-100 g nutrition of pieces. Nothing is assumed when blank.</div></div>';
      out += '<h3 class="section-title">Package (optional)</h3><div class="card"><div class="grid3">' + f('Size', 'pkg.size', 'e.g. 450', 'inputmode="decimal"') +
        '<label class="field"><span>Unit</span><select class="input" data-in="ing" data-id="' + id + '" data-f="pkg.unit">' + uopt(pkg.unit) + '</select></label>' + f('Name', 'pkg.label', 'packet') + '</div>' +
        '<div class="grid2">' + f('Drained / usable amount', 'pkg.yieldQty', 'e.g. 240 for a can', 'inputmode="decimal"') + '<label class="field"><span>Unit</span><select class="input" data-in="ing" data-id="' + id + '" data-f="pkg.yieldUnit">' + uopt(pkg.yieldUnit) + '</select></label></div>' +
        '<div class="tiny muted">' + (pkg.source ? h(pkg.source) + '. ' : '') + 'Package sizes are whatever you enter — not supermarket specifications.</div></div>';
      out += '<h3 class="section-title">Shopping</h3><div class="card"><div class="grid2">' + f('Brand preference', 'brand') + f('Price ($)', 'price', '', 'inputmode="decimal"') + '</div>' +
        '<label class="field"><span>Price is</span><select class="input" data-in="ing" data-id="' + id + '" data-f="priceUnit">' + priceUnitOptions(ing.priceUnit || (ing.pkg ? 'pack' : 'item')) + '</select></label>' + f('Notes', 'notes') + '</div>';
      out += '<h3 class="section-title">Nutrition (from the label)</h3><div class="card"><label class="field"><span>Values are</span><select class="input" data-in="ing" data-id="' + id + '" data-f="nutrition.basis">' +
        [['', 'Not entered'], ['100g', 'Per 100 g'], ['100ml', 'Per 100 ml'], ['serving', 'Per serving']].map(([v, l]) => '<option value="' + v + '" ' + sel(v, n.basis || '') + '>' + l + '</option>').join('') + '</select></label>';
      if (n.basis === 'serving') out += '<div class="grid2">' + f('Serving size', 'nutrition.servingQty', 'e.g. 1 or 30', 'inputmode="decimal"') + '<label class="field"><span>Unit</span><select class="input" data-in="ing" data-id="' + id + '" data-f="nutrition.servingUnit">' + uopt(n.servingUnit || 'g') + '</select></label></div>';
      if (n.basis) out += '<div class="grid2">' + C.NUTRIENTS.map(x => f(x.name + ' (' + x.unit + ')', 'nutrition.' + x.id, 'unknown', 'inputmode="decimal"')).join('') + '</div><div class="tiny muted">Blank = unknown. Unknown values are flagged, never counted as zero.</div>';
      out += '</div>';
      out += '<div class="small muted">Used in: ' + (usedIn.length ? h(usedIn.map(r => r.name).join(', ')) : 'no recipes') + '</div>';
      out += '<div class="actions">' + (!usedIn.length ? '<button class="btn danger" data-act="delIng" data-id="' + id + '">Delete ingredient</button>' : '') + '<button class="btn" data-act="closeSheet">Done</button></div>';
      return out;
    }, { full: true });
  }

  function historySheet() {
    openSheet(() => sheetHead('Previous lists', '', true) + (S.history.length ? '<div class="list">' + S.history.map(x => '<div class="prow"><div class="row"><div class="grow"><div style="font-weight:500">Week of ' + fmtDate(x.startedAt) + '</div><div class="small muted">' + x.done + ' of ' + x.total + ' purchased' + (x.cost ? ' · ≈ ' + money(x.cost) : '') + ' · ' + h(x.plan.filter(p => p.enabled && p.days > 0).map(p => p.name.split(' ')[0] + ' ×' + p.days).join(', ')) + '</div></div></div>' +
      '<div class="actions" style="justify-content:flex-start;margin-top:8px"><button class="btn" data-act="reuseList" data-id="' + x.id + '">Reuse</button><button class="btn tonal" data-act="viewList" data-id="' + x.id + '">View</button><button class="btn text" data-act="delHistory" data-id="' + x.id + '">Delete</button></div></div>').join('') + '</div>' : '<div class="empty">No previous lists yet. They appear here when you start a new week.</div>'), { full: true });
  }

  function aisleHelpSheet() {
    openSheet(() => sheetHead('How aisle data works') + '<div class="small stack">' +
      '<p><b>Why not automatic?</b> Coles and Woolworths show store-specific aisle numbers inside their own apps and websites, but neither offers a public API. Their internal web services block requests from other websites (CORS), need their own sessions and bot protection, and their terms restrict automated access. A free, maintenance-free app installed on your phone can\'t reliably or legitimately fetch them.</p>' +
      '<p><b>What this app does instead</b></p><ul><li><b>Look up</b> opens the item in the Coles or Woolworths website/app search. Make sure your store (Bayswater / Boronia) is selected there, then tap the aisle number here.</li><li><b>Found it here</b> — tap the aisle number while you stand in it. One tap, saved permanently for that store.</li><li>Each trip the list sorts itself into walking order using everything you\'ve saved, and gets more accurate every week.</li></ul>' +
      '<p><b>Location labels</b></p><ul><li><span class="loc confirmed"><span class="d"></span>Confirmed</span> you found it in-store. Never overwritten by a look-up.</li><li><span class="loc recent"><span class="d"></span>Recent</span> copied from the app/website within ' + h(S.settings.recentDays) + ' days.</li><li><span class="loc saved"><span class="d"></span>Saved</span> an older look-up.</li><li><span class="loc outdated"><span class="d"></span>Outdated</span> you marked it incorrect.</li><li><span class="loc unknown">Aisle?</span> not known yet.</li></ul>' +
      '<p>All of this is stored on your phone and works offline.</p></div>');
  }

  /* ---------------- Actions ---------------- */
  const A = {
    tab(el) { ui.tab = el.dataset.tab; render(); },
    closeSheet() { closeSheet(); },
    startShopping() { storePicker(); },
    pickStore(el) {
      S.trip = { storeId: el.dataset.id, startedAt: Date.now() };
      S.settings.lastStoreId = el.dataset.id; ui.shopOrder = 'aisle'; ui.q = '';
      save(); closeAllSheets(); ui.tab = 'shop'; render();
    },
    noStore() { S.trip = null; save(); closeAllSheets(); ui.tab = 'shop'; render(); },
    finishTrip() { const st = tripStore(); S.trip = null; save(); render(); snack('Trip finished' + (st ? ' — ' + st.name + ' aisles saved for next time' : '')); },
    shopOrder() { ui.shopOrder = ui.shopOrder === 'category' ? 'aisle' : 'category'; render(); snack(ui.shopOrder === 'category' ? 'Sorted by department' : 'Sorted by aisle (walking order)'); },
    days(el) {
      const r = S.recipes.find(x => x.id === el.dataset.id); if (!r) return;
      r.days = Math.max(0, Math.min(14, (C.num(r.days) || 0) + Number(el.dataset.d)));
      if (r.variantGroup && !S.recipes.some(x => x.variantGroup === r.variantGroup && x.enabled)) r.enabled = true;
      save(); render();
    },
    variant(el) {
      const r = S.recipes.find(x => x.id === el.dataset.id); if (!r) return;
      const grp = S.recipes.filter(x => x.variantGroup === r.variantGroup);
      const cur = grp.find(x => x.enabled);
      const d = cur ? cur.days : (C.num(r.days) || 7);
      grp.forEach(x => x.enabled = false);
      r.enabled = true; r.days = d; save(); render();
    },
    check(el) {
      const key = el.dataset.key, L = S.list;
      if (L.checks[key]) delete L.checks[key]; else L.checks[key] = Date.now();
      save();
      const row = document.querySelector('[data-row="' + CSS.escape(key) + '"]');
      if (row) { row.classList.toggle('done', !!L.checks[key]); const cb = row.querySelector('.cb'); if (cb) cb.setAttribute('aria-pressed', !!L.checks[key]); }
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (_) { }
      updateProgress();
      clearTimeout(ui.reorderT); ui.reorderT = setTimeout(renderShopList, 650);
    },
    clearQ() { ui.q = ''; render(); },
    editItem(el) { itemSheet(el.dataset.key); },
    aisle(el) { aisleSheet(el.dataset.key); },
    aisleSrc(el) { const sh = sheets[sheets.length - 1]; sh.data.src = el.dataset.v; sh.refresh(); },
    setAisle(el) { const sh = sheets[sheets.length - 1]; saveLocation(el.dataset.key, el.dataset.v, '', sh.data.src); },
    setAisleCustom(form) { const sh = sheets[sheets.length - 1]; const a = form.aisle.value.trim(); if (!a) return; saveLocation(form.dataset.key, a, form.bay.value.trim(), sh.data.src); },
    markOutdated(el) {
      const st = tripStore(); const m = listModel(); const it = m.active.concat(m.hidden).find(i => i.key === el.dataset.key);
      const p = (S.products[st.id] || {})[prodKey(it)]; if (!p || !p.loc) return;
      p.loc = C.markOutdated(p.loc); save(); refreshSheets(); render(); snack('Marked as incorrect — set the right aisle when you find it');
    },
    useSuggestion(el) {
      const st = tripStore(); const m = listModel(); const it = m.active.find(i => i.key === el.dataset.key);
      const p = S.products[st.id][prodKey(it)]; const sg = p.loc.suggestion;
      p.loc = C.applyLocation(C.markOutdated(p.loc), { aisle: sg.aisle, bay: sg.bay, source: 'web' }).loc;
      save(); refreshSheets(); render();
    },
    openProduct(el) { productSheet(el.dataset.store, el.dataset.key, el.dataset.name); },
    openProducts(el) { productsSheet(el.dataset.id); },
    pdSrc(el) { const sh = sheets[sheets.length - 1]; sh.data.src = el.dataset.v; sh.refresh(); },
    pdPhotoClear() { const sh = sheets[sheets.length - 1]; sh.data.draft.photo = ''; sh.refresh(); },
    pdSave(el) {
      const sh = sheets[sheets.length - 1]; const d = sh.data.draft;
      const storeId = el.dataset.store, key = el.dataset.key;
      const prods = prodsOf(storeId);
      const prev = prods[key] || {};
      const out = Object.assign({}, prev, d, { verifiedAt: Date.now() });
      if (!(C.num(d.pkg && d.pkg.size) > 0)) out.pkg = null;
      if (S.ingredients[key]) out.ingredient = S.ingredients[key].name; else out.ingredient = prev.ingredient || key.replace(/^c:/, '');
      let msg = 'Saved';
      const a = String(sh.data.aisle || '').trim();
      if (a && (a !== sh.data.aisleInit || (prev.loc && sh.data.bay !== (prev.loc.bay || '')) || (prev.loc && (prev.loc.source === 'manual') !== (sh.data.src === 'manual')))) {
        const r = C.applyLocation(prev.loc, { aisle: a, bay: sh.data.bay, source: sh.data.src }); out.loc = r.loc; if (!r.accepted) msg = r.reason;
      } else if (!a) out.loc = null;
      prods[key] = out; save(); closeSheet(); snack(msg);
    },
    pdDelete(el) { const st = el.dataset.store, key = el.dataset.key; withUndo('Product removed', () => { delete prodsOf(st)[key]; }); closeSheet(); },
    removeItem(el) {
      const key = el.dataset.key;
      closeSheet();
      withUndo('Removed from this list', () => {
        if (key.startsWith('c:')) { S.list.custom = S.list.custom.filter(c => 'c:' + c.id !== key); delete S.list.checks[key]; }
        else S.list.removed[key] = 1;
      });
    },
    restoreItem(el) { delete S.list.removed[el.dataset.key]; save(); render(); },
    needIt(el) {
      const ing = S.ingredients[el.dataset.id]; if (!ing) return;
      if (ing.pantry.mode === 'staple') ing.pantry.low = true; else ing.pantry.mode = 'buy';
      save(); render(); snack(ing.name + ' added to the list');
    },
    haveIt(el) {
      const ing = S.ingredients[el.dataset.id];
      closeSheet();
      withUndo(ing.name + ' marked as at home (see Pantry)', () => { ing.pantry.mode = 'have'; ing.pantry.haveQty = ''; });
    },
    addCustom() { addCustomSheet(); },
    addCustomSubmit(form) {
      const name = form.name.value.trim(); if (!name) return;
      S.list.custom.push({ id: uid(), name, qty: form.qty.value.trim(), category: form.category.value, brand: '', notes: '', price: '', repeat: form.repeat.checked });
      save(); render();
      const sh = sheets[sheets.length - 1]; sh.data = {}; sh.data.catTouched = false; sh.refresh();
      setTimeout(() => { const f = $('#cName'); if (f) f.focus(); }, 30);
      snack('Added ' + name);
    },
    newList() {
      withUndo('New weekly list started', () => {
        archiveCurrent();
        const keep = S.list.custom.filter(c => c.repeat).map(c => Object.assign({}, c, { id: uid() }));
        S.list = Seed.newList(); S.list.custom = keep; S.trip = null;
        Object.values(S.ingredients).forEach(i => { if (i.pantry && i.pantry.low) i.pantry.low = false; });
      });
    },
    resetChecks() { withUndo('All ticks cleared', () => { S.list.checks = {}; }); },
    copyList() { const t = listText(); copyText(t).then(ok => snack(ok ? 'List copied' : 'Copy not available')); },
    shareList() {
      const t = listText();
      if (navigator.share) navigator.share({ title: 'Shopping list', text: t }).catch(e => { if (e && e.name !== 'AbortError') copyText(t).then(() => snack('Sharing failed — copied instead')); });
      else copyText(t).then(ok => snack(ok ? 'Sharing isn\'t supported here — list copied' : 'Sharing not available'));
    },
    openHistory() { historySheet(); },
    reuseList(el) {
      const x = S.history.find(h0 => h0.id === el.dataset.id); if (!x) return;
      closeAllSheets();
      withUndo('Reused the list from ' + fmtDate(x.startedAt), () => {
        archiveCurrent();
        x.plan.forEach(p => { const r = S.recipes.find(y => y.id === p.id); if (r) { r.enabled = p.enabled; r.days = p.days; } });
        S.list = Seed.newList();
        S.list.custom = (x.custom || []).map(c => Object.assign({}, c, { id: uid() }));
        S.list.removed = Object.assign({}, x.removed || {});
        S.list.qtyOverride = Object.assign({}, x.qtyOverride || {});
      });
      ui.tab = 'shop'; render();
    },
    viewList(el) { const x = S.history.find(h0 => h0.id === el.dataset.id); openSheet(() => sheetHead('Week of ' + fmtDate(x.startedAt)) + '<pre style="white-space:pre-wrap;font:inherit;font-size:14px">' + h(x.text) + '</pre><div class="actions"><button class="btn tonal" data-act="copyHistory" data-id="' + x.id + '">' + ic('copy', 'sm') + 'Copy</button></div>'); },
    copyHistory(el) { const x = S.history.find(h0 => h0.id === el.dataset.id); copyText(x.text).then(() => snack('Copied')); },
    delHistory(el) { withUndo('Deleted', () => { S.history = S.history.filter(x => x.id !== el.dataset.id); }); },
    recipeTab(el) { ui.recipeTab = el.dataset.v; render(); },
    ingFilter(el) { ui.ingFilter = el.dataset.v; render(); },
    ingMissing() { ui.tab = 'recipes'; ui.recipeTab = 'ingredients'; ui.ingFilter = 'nutrition'; render(); },
    openRecipe(el) { recipeSheet(el.dataset.id); },
    newRecipe() {
      const r = { id: 'r' + uid(), name: 'New recipe', slot: 'snack', enabled: true, days: 7, instructions: '', items: [] };
      S.recipes.push(r); save(); render(); recipeSheet(r.id);
    },
    dupRecipe(el) {
      const r = S.recipes.find(x => x.id === el.dataset.id);
      const c = JSON.parse(JSON.stringify(r)); c.id = 'r' + uid(); c.name = r.name + ' (copy)'; c.enabled = !!r.variantGroup ? false : r.enabled;
      if (c.variantGroup) c.variantLabel = (r.variantLabel || r.name) + ' (copy)';
      S.recipes.splice(S.recipes.indexOf(r) + 1, 0, c); save(); closeSheet();
      setTimeout(() => recipeSheet(c.id), 320); snack('Recipe duplicated');
    },
    delRecipe(el) { const id = el.dataset.id; closeSheet(); withUndo('Recipe deleted', () => { S.recipes = S.recipes.filter(r => r.id !== id); }); },
    riDel(el) { const r = S.recipes.find(x => x.id === el.dataset.id); r.items.splice(Number(el.dataset.idx), 1); save(); refreshSheets(); render(); },
    riAdd(el) {
      const id = el.dataset.id;
      ingredientPicker(ingId => { const r = S.recipes.find(x => x.id === id); const ing = S.ingredients[ingId]; r.items.push({ ingId, qty: '', unit: ing.countName ? 'pc' : 'g', alts: [], use: '' }); save(); });
    },
    riAlt(el) {
      const id = el.dataset.id, idx = Number(el.dataset.idx);
      ingredientPicker(ingId => { const it = S.recipes.find(x => x.id === id).items[idx]; if (ingId !== it.ingId && !it.alts.includes(ingId)) it.alts.push(ingId); save(); });
    },
    pickIng(el) { const sh = sheets[sheets.length - 1]; const fn = sh.data.onPick; closeSheet(); fn(el.dataset.id); },
    pickNew() {
      const name = pickerQ.q.trim(); if (!name) return;
      const id = uniqueIngId(name);
      S.ingredients[id] = blankIngredient(id, name);
      const sh = sheets[sheets.length - 1]; const fn = sh.data.onPick; closeSheet(); fn(id); snack('Created ' + name + ' — tap its name to add details');
    },
    newIngredient() { const name = 'New ingredient'; const id = uniqueIngId(name); S.ingredients[id] = blankIngredient(id, name); save(); render(); ingSheet(id); },
    openIng(el) { ingSheet(el.dataset.id); },
    delIng(el) { const id = el.dataset.id; closeSheet(); withUndo('Ingredient deleted', () => { delete S.ingredients[id]; }); },
    pantryMode(el) { const ing = S.ingredients[el.dataset.id]; ing.pantry.mode = el.dataset.v; if (el.dataset.v !== 'staple') ing.pantry.low = false; if (el.dataset.v === 'have' && !ing.pantry.haveUnit) ing.pantry.haveUnit = 'g'; save(); render(); },
    pantryAll(el) { ui.pantryAll = el.dataset.v === '1'; render(); },
    theme(el) { S.settings.theme = el.dataset.v; applyTheme(); save(); render(); },
    tbsp(el) { S.settings.tbspMl = Number(el.dataset.v); save(); render(); },
    openStore(el) { storeSheet(el.dataset.id); },
    addStore() { const id = 's' + uid(); S.stores.push({ id, name: 'New store', chain: 'other', address: '', layout: null, aisleDir: 'asc' }); save(); render(); storeSheet(id); },
    deleteStore(el) { const id = el.dataset.id; closeSheet(); withUndo('Store deleted', () => { S.stores = S.stores.filter(s => s.id !== id); delete S.products[id]; if (S.trip && S.trip.storeId === id) S.trip = null; }); },
    aisleDir(el) { storeById(el.dataset.id).aisleDir = el.dataset.v; save(); refreshSheets(); },
    zoneMove(el) {
      const st = storeById(el.dataset.id);
      const layout = (st.layout && st.layout.length ? st.layout : C.DEFAULT_LAYOUT).slice();
      C.DEFAULT_LAYOUT.forEach(z => { if (!layout.includes(z)) layout.push(z); });
      const i = Number(el.dataset.i), j = i + Number(el.dataset.d);
      if (j < 0 || j >= layout.length) return;
      [layout[i], layout[j]] = [layout[j], layout[i]]; st.layout = layout; save(); refreshSheets();
    },
    zoneReset(el) { storeById(el.dataset.id).layout = null; save(); refreshSheets(); },
    aisleHelp() { aisleHelpSheet(); },
    exportData() {
      S.settings.lastBackupAt = Date.now(); flush();
      const blob = new Blob([IO.toBackup(S)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = backupName();
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      render(); snack('Backup saved to Downloads');
    },
    shareBackup() {
      const file = new File([IO.toBackup(S)], backupName(), { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'Prep List backup' }).then(() => { S.settings.lastBackupAt = Date.now(); save(); render(); }).catch(() => { });
      } else A.exportData();
    },
    importData() { const f = $('#importFile'); f.value = ''; f.onchange = () => importFile(f.files[0]); f.click(); },
    eraseAll() {
      if (ui.eraseArm > Date.now()) { ui.eraseArm = 0; withUndo('All data erased — defaults restored', () => { S = Seed.freshState(); }); applyTheme(); }
      else { ui.eraseArm = Date.now() + 4000; render(); setTimeout(() => { if (ui.tab === 'settings') render(); }, 4100); }
    }
  };

  function blankIngredient(id, name) {
    return { id, name, category: C.guessCategory(name), form: '', countName: '', countPlural: '', gPerCount: '', density: '', brand: '', notes: '', price: '', priceUnit: '', pkg: null, nutrition: null, pantry: { mode: 'buy', haveQty: '', haveUnit: 'g', low: false } };
  }
  function uniqueIngId(name) { let base = C.slug(name) || 'ingredient', id = base, n = 2; while (S.ingredients[id]) id = base + '-' + n++; return id; }
  function backupName() { return 'prep-list-backup-' + new Date().toISOString().slice(0, 10) + '.json'; }

  function importFile(file) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const restored = IO.fromBackup(String(rd.result));
        withUndo('Backup restored', () => { S = restored; });
        applyTheme();
      } catch (e) { snack('Import failed: ' + e.message); }
    };
    rd.onerror = () => snack('Could not read the file');
    rd.readAsText(file);
  }

  function archiveCurrent() {
    const m = listModel();
    if (!m.total && !S.list.custom.length) return;
    S.history.unshift({
      id: S.list.id, startedAt: S.list.startedAt, endedAt: Date.now(),
      plan: S.recipes.map(r => ({ id: r.id, name: r.name, enabled: r.enabled, days: C.num(r.days) || 0 })),
      custom: S.list.custom.map(c => Object.assign({}, c)), removed: Object.assign({}, S.list.removed), qtyOverride: Object.assign({}, S.list.qtyOverride),
      total: m.total, done: m.done, cost: m.priced ? m.cost : 0,
      text: C.listToText(groupItems(m.active, null), 'Shopping list — week of ' + fmtDate(S.list.startedAt))
    });
    S.history = S.history.slice(0, 30);
  }
  function listText() {
    const m = listModel();
    return C.listToText(groupItems(m.active, m.store), 'Shopping list — ' + fmtDate(Date.now()) + (m.store ? ' · ' + m.store.name : ''));
  }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(() => true, () => fallbackCopy(t));
    return Promise.resolve(fallbackCopy(t));
  }
  function fallbackCopy(t) {
    const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) { } ta.remove(); return ok;
  }

  /* ---------------- Inputs ---------------- */
  const IN = {
    q(el) { ui.q = el.value; const box = $('#shopList'); if (box) box.innerHTML = shopListHtml(listModel()); },
    ingQ(el) { ui.ingQ = el.value; renderSoon(); },
    pickQ(el) { pickerQ.q = el.value; const b = $('#pickList'); if (b) b.innerHTML = pickListHtml(); },
    cName(el) { const sh = sheets[sheets.length - 1]; sh.data.name = el.value; if (!sh.data.catTouched) { const c = $('#cCat'); if (c) c.value = C.guessCategory(el.value); } },
    cCat() { const sh = sheets[sheets.length - 1]; sh.data.catTouched = true; },
    rEnabled(el, e, isChange) { if (!isChange) return; const r = S.recipes.find(x => x.id === el.dataset.id); r.enabled = el.checked; if (r.enabled && !(C.num(r.days) > 0)) r.days = 7; save(); renderSoon(); },
    recipe(el, e, isChange) {
      const r = S.recipes.find(x => x.id === el.dataset.id); if (!r) return;
      const f = el.dataset.f;
      if (el.type === 'checkbox') { if (!isChange) return; r[f] = el.checked; }
      else if (f === 'days') { const n = C.num(el.value); if (n === null && el.value !== '') return; r.days = Math.max(0, Math.min(31, Math.round(n || 0))); }
      else r[f] = el.value;
      save(); if (isChange || f === 'name') renderSoon();
    },
    riQty(el, e, isChange) {
      const r = S.recipes.find(x => x.id === el.dataset.id); const it = r.items[Number(el.dataset.idx)];
      const v = el.value.trim();
      const q = C.parseQty(v);
      if (v === '') it.qty = '';
      else if (q === null) { if (isChange) snack('Enter a number such as 1.5 or 1/2'); return; }
      else it.qty = q;
      save();
      const n = $('#rNutr'); if (n) n.innerHTML = recipeNutrHtml(r);
      if (isChange) render();
    },
    riUnit(el, e, isChange) { if (!isChange) return; const it = S.recipes.find(x => x.id === el.dataset.id).items[Number(el.dataset.idx)]; it.unit = el.value; if (el.value === 'taste') it.qty = ''; save(); renderSoon(); },
    riUse(el, e, isChange) { if (!isChange) return; const it = S.recipes.find(x => x.id === el.dataset.id).items[Number(el.dataset.idx)]; it.use = el.value === it.ingId ? '' : el.value; save(); renderSoon(); },
    ing(el, e, isChange) {
      const ing = S.ingredients[el.dataset.id]; if (!ing) return;
      const f = el.dataset.f;
      if (el.tagName === 'SELECT' && !isChange) return;
      if (f.startsWith('pkg.') && !ing.pkg) ing.pkg = { size: '', unit: 'g', label: '', yieldQty: '', yieldUnit: 'g' };
      if (f.startsWith('nutrition.') && !ing.nutrition) ing.nutrition = {};
      setPath(ing, f, el.value);
      if (f.startsWith('pkg.') && ing.pkg && ing.pkg.source && f !== 'pkg.label') ing.pkg.source = 'Entered by you';
      if (f === 'pkg.size' && el.value === '' && !C.num(ing.pkg.yieldQty)) ing.pkg = null;
      save();
      if (isChange) renderSoon(); else render();
    },
    custom(el, e, isChange) {
      const c = S.list.custom.find(x => x.id === el.dataset.id); if (!c) return;
      if (el.type === 'checkbox') { if (!isChange) return; c[el.dataset.f] = el.checked; }
      else c[el.dataset.f] = el.value;
      save(); render();
    },
    qtyOv(el) { const k = el.dataset.key; if (el.value.trim()) S.list.qtyOverride[k] = el.value; else delete S.list.qtyOverride[k]; save(); render(); },
    pantryQty(el, e, isChange) { S.ingredients[el.dataset.id].pantry.haveQty = el.value.trim(); save(); if (isChange) renderSoon(); },
    pantryUnit(el, e, isChange) { if (!isChange) return; S.ingredients[el.dataset.id].pantry.haveUnit = el.value; save(); renderSoon(); },
    pantryLow(el, e, isChange) { if (!isChange) return; const ing = S.ingredients[el.dataset.id]; ing.pantry.low = el.checked; save(); renderSoon(); if (el.checked) snack(ing.name + ' added to the shopping list'); },
    target(el) { S.settings.targets[el.dataset.f] = el.value.trim(); save(); },
    coldLast(el, e, isChange) { if (!isChange) return; S.settings.coldLast = el.checked; save(); },
    recentDays(el) { const n = C.num(el.value); if (n && n > 0) { S.settings.recentDays = Math.round(n); save(); } },
    store(el, e, isChange) { const st = storeById(el.dataset.id); if (el.tagName === 'SELECT' && !isChange) return; st[el.dataset.f] = el.value; save(); if (isChange) renderSoon(); },
    pd(el, e, isChange) { const sh = sheets[sheets.length - 1]; if (el.tagName === 'SELECT' && !isChange) return; setPath(sh.data.draft, el.dataset.f, el.value); if (isChange && el.dataset.f === 'url') sh.refresh(); },
    pdAisle(el) { sheets[sheets.length - 1].data.aisle = el.value; },
    pdBay(el) { sheets[sheets.length - 1].data.bay = el.value; },
    pdPhoto(el, e, isChange) {
      if (!isChange || !el.files || !el.files[0]) return;
      const sh = sheets[sheets.length - 1];
      readPhoto(el.files[0]).then(url => { sh.data.draft.photo = url; sh.refresh(); }).catch(() => snack('Could not read that photo'));
    }
  };

  function readPhoto(file) {
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        const max = 360, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = rej; img.src = url;
    });
  }

  /* ---------------- Events ---------------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = A[el.dataset.act]; if (!fn) return;
    e.preventDefault(); fn(el, e);
  });
  document.addEventListener('input', e => { const el = e.target.closest('[data-in]'); if (el && IN[el.dataset.in]) IN[el.dataset.in](el, e, false); });
  document.addEventListener('change', e => { const el = e.target.closest('[data-in]'); if (el && IN[el.dataset.in]) IN[el.dataset.in](el, e, true); });
  document.addEventListener('submit', e => { const f = e.target; if (!f.dataset.submit) return; e.preventDefault(); const fn = A[f.dataset.submit]; if (fn) fn(f, e); });
  window.addEventListener('scroll', () => { $('#topbar').classList.toggle('scrolled', window.scrollY > 4); }, { passive: true });

  /* ---------------- Snackbar ---------------- */
  let snackT = null;
  function snack(msg, action) {
    const el = $('#snack');
    el.innerHTML = '<span class="grow">' + h(msg) + '</span>' + (action ? '<button class="btn text" id="snackBtn">' + h(action.label) + '</button>' : '');
    el.classList.add('on');
    clearTimeout(snackT); snackT = setTimeout(() => el.classList.remove('on'), action ? 6000 : 2600);
    if (action) $('#snackBtn').onclick = () => { el.classList.remove('on'); action.fn(); };
  }

  /* ---------------- Theme ---------------- */
  function applyTheme() {
    const t = S.settings.theme || 'auto';
    if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    try { localStorage.setItem('preplist.theme', t); } catch (_) { }
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#0f1511' : '#f6faf4');
  }
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  /* ---------------- Boot ---------------- */
  try { const qp = new URLSearchParams(location.search).get('tab'); if (qp && VIEWS[qp]) ui.tab = qp; } catch (_) { }
  applyTheme();
  render();
  if (loaded.fresh) flush();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) snack('A new version is ready', { label: 'Reload', fn: () => { nw.postMessage('skipWaiting'); } });
        });
      });
    }).catch(() => { });
    let reloaded = false;
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded || !hadController) return; reloaded = true; flush(); location.reload(); });
  }
  window.PrepList = { get state() { return S; }, render, listModel };
})();
