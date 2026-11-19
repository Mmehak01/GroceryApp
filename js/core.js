/*
 * Prep List — core logic.
 * Pure functions only (no DOM, no storage) so they can be unit-tested.
 * Exposed as window.Core in the browser and module.exports in Node.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------------------------------------------------------- */
  /* Reference data                                                     */
  /* ---------------------------------------------------------------- */

  const CATEGORIES = [
    { id: 'fruit', name: 'Fruits' },
    { id: 'veg', name: 'Vegetables' },
    { id: 'dairy', name: 'Dairy & cheese' },
    { id: 'tofu', name: 'Tofu & plant-based protein' },
    { id: 'canned', name: 'Canned food & legumes' },
    { id: 'grains', name: 'Grains' },
    { id: 'nuts', name: 'Nuts & seeds' },
    { id: 'spices', name: 'Herbs & spices' },
    { id: 'oils', name: 'Oils & condiments' },
    { id: 'household', name: 'Household & miscellaneous' }
  ];
  const CAT_IDS = CATEGORIES.map(c => c.id);
  const COLD_CATS = new Set(['dairy', 'tofu']);

  const UNITS = {
    g: { dim: 'mass', f: 1, label: 'g' },
    kg: { dim: 'mass', f: 1000, label: 'kg' },
    ml: { dim: 'vol', f: 1, label: 'ml' },
    l: { dim: 'vol', f: 1000, label: 'L' },
    tsp: { dim: 'vol', f: 5, label: 'tsp' },
    tbsp: { dim: 'vol', f: 'tbsp', label: 'tbsp' }, // size is a setting (AU = 20 ml)
    cup: { dim: 'vol', f: 250, label: 'cup' },
    pc: { dim: 'count', f: 1, label: 'pc' },
    taste: { dim: 'taste', f: 0, label: 'to taste' }
  };
  const SPOONS = new Set(['tsp', 'tbsp', 'cup']);
  const NUTRIENTS = [
    { id: 'kcal', name: 'Calories', unit: 'kcal' },
    { id: 'protein', name: 'Protein', unit: 'g' },
    { id: 'carbs', name: 'Carbs', unit: 'g' },
    { id: 'fat', name: 'Fat', unit: 'g' },
    { id: 'fibre', name: 'Fibre', unit: 'g' }
  ];

  const ZONES = [
    { id: 'produce', name: 'Fruit & veg' },
    { id: 'bakery', name: 'Bakery' },
    { id: 'deli', name: 'Deli' },
    { id: 'health', name: 'Health foods' },
    { id: 'aisles', name: 'Numbered aisles' },
    { id: 'other', name: 'Other area' },
    { id: 'chilled', name: 'Chilled / fridges' },
    { id: 'dairy', name: 'Dairy fridges' },
    { id: 'frozen', name: 'Frozen' }
  ];
  const DEFAULT_LAYOUT = ZONES.map(z => z.id);
  const COLD_ZONES = new Set(['chilled', 'dairy', 'frozen']);

  /* ---------------------------------------------------------------- */
  /* Numbers & formatting                                               */
  /* ---------------------------------------------------------------- */

  const r6 = x => Math.round(x * 1e6) / 1e6;
  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  /** Parse "1/2", "1 1/2", "½", "0.5" → number */
  function parseQty(s) {
    if (typeof s === 'number') return s;
    if (s === null || s === undefined) return null;
    let t = String(s).trim();
    if (!t) return null;
    const vulgar = { '¼': .25, '½': .5, '¾': .75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': .125 };
    let total = 0, matched = false;
    t = t.replace(/[¼½¾⅓⅔⅛]/g, m => { total += vulgar[m]; matched = true; return ' '; }).trim();
    if (!t) return matched ? total : null;
    const parts = t.split(/\s+/);
    for (const p of parts) {
      if (/^\d+\/\d+$/.test(p)) { const [a, b] = p.split('/').map(Number); if (!b) return null; total += a / b; }
      else { const n = num(p); if (n === null) return null; total += n; }
    }
    return r6(total);
  }

  function fmtNum(x) {
    x = r6(x);
    if (Number.isInteger(x)) return String(x);
    const whole = Math.floor(x), frac = x - whole;
    const map = [[.25, '¼'], [.5, '½'], [.75, '¾'], [1 / 3, '⅓'], [2 / 3, '⅔'], [.125, '⅛']];
    for (const [v, s] of map) if (Math.abs(frac - v) < 0.005) return (whole ? whole : '') + s;
    return String(Math.round(x * 100) / 100);
  }

  function trimDec(x, d) { return String(parseFloat(x.toFixed(d))); }

  function fmtMass(g) {
    g = r6(g);
    if (g >= 1000) return trimDec(g / 1000, 3) + ' kg';
    if (g >= 10) return Math.round(g) + ' g';
    return trimDec(g, 1) + ' g';
  }
  function fmtVol(ml, hintUnit, opts) {
    ml = r6(ml);
    if (hintUnit && SPOONS.has(hintUnit)) {
      const f = unitFactor(hintUnit, opts);
      return fmtNum(ml / f) + ' ' + UNITS[hintUnit].label + ' (' + fmtVolMetric(ml) + ')';
    }
    return fmtVolMetric(ml);
  }
  function fmtVolMetric(ml) {
    if (ml >= 1000) return trimDec(ml / 1000, 3) + ' L';
    if (ml >= 10) return Math.round(ml) + ' ml';
    return trimDec(ml, 1) + ' ml';
  }
  function countWord(ing, n) {
    if (!ing || !ing.countName) return '';
    return n > 0 && n <= 1 ? ing.countName : (ing.countPlural || ing.countName);
  }
  function fmtCount(n, ing) {
    const w = countWord(ing, n);
    return fmtNum(n) + (w ? ' ' + w : '');
  }
  function fmtAmount(a, ing, opts) {
    if (!a) return '';
    if (a.dim === 'mass') return fmtMass(a.amt);
    if (a.dim === 'vol') return fmtVol(a.amt, a.hint, opts);
    if (a.dim === 'count') return fmtCount(a.amt, ing);
    return '';
  }
  function fmtMoney(x) { return x === null || x === undefined ? '' : '$' + x.toFixed(2); }

  /* ---------------------------------------------------------------- */
  /* Units                                                              */
  /* ---------------------------------------------------------------- */

  function unitFactor(u, opts) {
    const d = UNITS[u];
    if (!d) return null;
    if (d.f === 'tbsp') return num(opts && opts.tbspMl) || 20;
    return d.f;
  }
  /** qty in unit → {dim, amt} in base units (g / ml / count). */
  function toBase(qty, unit, opts) {
    const d = UNITS[unit];
    if (!d) return null;
    if (d.dim === 'taste') return { dim: 'taste', amt: 0 };
    const q = num(qty);
    if (q === null) return null;
    return { dim: d.dim, amt: r6(q * unitFactor(unit, opts)) };
  }
  /** Convert between base dims using the ingredient's optional density / grams-per-piece. */
  function convert(amt, from, to, ing) {
    if (from === to) return amt;
    const dens = num(ing && ing.density);   // grams per ml
    const gpc = num(ing && ing.gPerCount);  // grams per piece
    let g;
    if (from === 'mass') g = amt;
    else if (from === 'vol') { if (!dens) return null; g = amt * dens; }
    else if (from === 'count') { if (!gpc) return null; g = amt * gpc; }
    else return null;
    if (to === 'mass') return r6(g);
    if (to === 'vol') return dens ? r6(g / dens) : null;
    if (to === 'count') return gpc ? r6(g / gpc) : null;
    return null;
  }

  /* ---------------------------------------------------------------- */
  /* Requirements & consolidation                                       */
  /* ---------------------------------------------------------------- */

  /** The ingredient actually used for a recipe line (respects selected alternative). */
  function itemIngId(item) { return item.use || item.ingId; }

  /**
   * Sum every enabled recipe × days, keyed by ingredient id.
   * Different ingredient ids are never merged, so "chickpeas (cooked, drained)"
   * and "chickpeas (dry)" stay separate by design.
   */
  function computeRequirements(recipes, opts) {
    const map = new Map();
    for (const r of recipes || []) {
      const days = num(r.days) || 0;
      if (!r.enabled || days <= 0) continue;
      for (const it of r.items || []) {
        const id = itemIngId(it);
        if (!id) continue;
        let e = map.get(id);
        if (!e) { e = { ingId: id, parts: { mass: 0, vol: 0, count: 0 }, volUnits: new Set(), taste: false, sources: [] }; map.set(id, e); }
        if (!e.sources.find(s => s.recipeId === r.id)) e.sources.push({ recipeId: r.id, name: r.name, days });
        if (it.unit === 'taste') { e.taste = true; continue; }
        const b = toBase(it.qty, it.unit, opts);
        if (!b || b.amt <= 0) continue;
        e.parts[b.dim] = r6(e.parts[b.dim] + b.amt * days);
        if (b.dim === 'vol') e.volUnits.add(it.unit);
      }
    }
    return map;
  }

  /** Merge mass/vol/count parts into one amount where conversions allow. */
  function consolidate(parts, ing, prefDim, volUnits) {
    const order = ['mass', 'vol', 'count'];
    const present = order.filter(k => parts[k] > 0);
    if (!present.length) return { main: null, extra: [] };
    let target = present[0];
    if (prefDim && present.every(k => k === prefDim || convert(1, k, prefDim, ing) !== null)) target = prefDim;
    let main = 0; const extra = [];
    for (const k of present) {
      if (k === target) { main += parts[k]; continue; }
      const c = convert(parts[k], k, target, ing);
      if (c === null) extra.push({ dim: k, amt: r6(parts[k]) }); else main += c;
    }
    const res = { main: { dim: target, amt: r6(main) }, extra };
    // keep spoon display when every volume contribution used the same spoon unit
    const vu = volUnits ? [...volUnits] : [];
    const hint = vu.length === 1 && SPOONS.has(vu[0]) ? vu[0] : null;
    if (target === 'vol' && hint && present.length === 1) res.main.hint = hint;
    extra.forEach(x => { if (x.dim === 'vol' && hint) x.hint = hint; });
    return res;
  }

  /* ---------------------------------------------------------------- */
  /* Packaging                                                          */
  /* ---------------------------------------------------------------- */

  /** What one package yields, in the same terms recipes use (e.g. drained weight of a can). */
  function packYield(pkg, opts) {
    if (!pkg) return null;
    const useYield = num(pkg.yieldQty) && pkg.yieldUnit;
    const b = useYield ? toBase(pkg.yieldQty, pkg.yieldUnit, opts) : toBase(pkg.size, pkg.unit, opts);
    if (!b || !(b.amt > 0) || b.dim === 'taste') return null;
    return b;
  }
  function fmtPkg(pkg, ing, opts) {
    if (!pkg) return '';
    const s = toBase(pkg.size, pkg.unit, opts);
    let t = s ? fmtAmount(s, ing, opts) : '';
    if (num(pkg.size) && pkg.unit === 'pc') t = fmtNum(num(pkg.size)) + '-pack';
    const label = pkg.label ? ' ' + pkg.label : '';
    let y = '';
    if (num(pkg.yieldQty) && pkg.yieldUnit) {
      const yb = toBase(pkg.yieldQty, pkg.yieldUnit, opts);
      if (yb) y = ' (' + fmtAmount(yb, ing, opts) + ' drained)';
    }
    return (t + label + y).trim();
  }
  /** need {dim, amt} → recommended packs, or {error} if units can't be compared. */
  function packCalc(need, pkg, ing, opts) {
    const per = packYield(pkg, opts);
    if (!per || !need || !(need.amt > 0)) return null;
    const n = convert(need.amt, need.dim, per.dim, ing);
    if (n === null) return { error: 'Package unit can\'t be compared with recipe unit — add grams-per-piece or density to this ingredient.' };
    const packs = Math.ceil(r6(n / per.amt) - 1e-9);
    return { packs, per, total: r6(packs * per.amt), spare: r6(packs * per.amt - n), dim: per.dim };
  }

  /* ---------------------------------------------------------------- */
  /* Shopping list                                                      */
  /* ---------------------------------------------------------------- */

  function estCost(price, priceUnit, pack, need, ing) {
    const p = num(price);
    if (p === null) return null;
    switch (priceUnit) {
      case 'pack': return r6(p * (pack && pack.packs ? pack.packs : 1));
      case 'kg': {
        if (!need) return null;
        const amt = pack && pack.total ? convert(pack.total, pack.dim, 'mass', ing) : convert(need.amt, need.dim, 'mass', ing);
        return amt === null ? null : r6(p * amt / 1000);
      }
      case 'each': {
        if (!need) return null;
        const c = convert(need.amt, need.dim, 'count', ing);
        return c === null ? null : r6(p * Math.ceil(c - 1e-9));
      }
      default: return p; // 'item' — flat price for the line
    }
  }

  /**
   * Build the computed shopping list.
   * ctx: { opts, products: {ingId: product} for the selected store (optional) }
   * Returns items with status: 'buy' | 'restock' | 'covered' | 'staple'
   */
  function buildList(state, ctx) {
    ctx = ctx || {};
    const opts = ctx.opts || state.settings || {};
    const ings = state.ingredients || {};
    const reqs = computeRequirements(state.recipes, opts);
    const items = [];
    const seen = new Set();

    const make = (ingId, req) => {
      const ing = ings[ingId];
      if (!ing) return { key: ingId, ingId, name: '(missing ingredient ' + ingId + ')', category: 'household', status: 'buy', warn: 'Ingredient record missing', requiredText: '', buyText: '' };
      const prod = ctx.products && ctx.products[ingId];
      const pkg = prod && packYield(prod.pkg, opts) ? prod.pkg : ing.pkg;
      const per = packYield(pkg, opts);
      const total = req ? consolidate(req.parts, ing, per && per.dim, req.volUnits) : { main: null, extra: [] };
      const p = ing.pantry || { mode: 'buy' };
      let need = total.main ? Object.assign({}, total.main) : null;
      let status = 'buy', pantryNote = '', haveAmt = null;

      if (p.mode === 'staple') status = p.low ? 'restock' : 'staple';
      else if (p.mode === 'have') {
        const hq = num(p.haveQty);
        if (hq === null) { status = 'covered'; pantryNote = 'Marked as at home'; }
        else {
          const hb = toBase(hq, p.haveUnit || 'g', opts);
          const hc = need && hb ? convert(hb.amt, hb.dim, need.dim, ing) : null;
          if (need && hc !== null) {
            haveAmt = { dim: need.dim, amt: hc, hint: need.hint };
            need.amt = r6(Math.max(0, need.amt - hc));
            if (need.amt <= 0 && !total.extra.length) status = 'covered';
            pantryNote = 'Have ' + fmtAmount(haveAmt, ing, opts) + ' at home';
          } else if (need) pantryNote = 'Pantry amount not deducted (unit doesn\'t match)';
        }
      }
      if (!req && status !== 'restock') return null;

      const requiredText = [total.main ? fmtAmount(total.main, ing, opts) : '', ...total.extra.map(x => fmtAmount(x, ing, opts))]
        .filter(Boolean).join(' + ') + (req && req.taste ? (total.main ? ' + to taste' : 'To taste') : '');
      const needText = need && haveAmt ? fmtAmount(need, ing, opts) : '';

      let pack = null, buyText = '', warn = '';
      if (need && need.amt > 0) {
        pack = packCalc(need, pkg, ing, opts);
        if (pack && pack.error) { warn = pack.error; pack = null; }
      }
      if (pack) buyText = pack.packs + ' × ' + fmtPkg(pkg, ing, opts);
      else if (need && need.dim === 'count' && need.amt > 0 && !Number.isInteger(r6(need.amt))) buyText = 'Buy ' + fmtCount(Math.ceil(need.amt - 1e-9), ing);
      if (status === 'restock' && !buyText) buyText = pkg && per ? '1 × ' + fmtPkg(pkg, ing, opts) : 'Restock';
      if (!req) { /* restock-only staple not in current recipes */ }

      const price = prod && num(prod.price) !== null ? prod.price : ing.price;
      const priceUnit = prod && num(prod.price) !== null ? (prod.priceUnit || 'pack') : (ing.priceUnit || (pkg ? 'pack' : 'item'));
      const cost = (status === 'buy' || status === 'restock') ? estCost(price, priceUnit, pack || (status === 'restock' && per ? { packs: 1, total: per.amt, dim: per.dim } : null), need, ing) : null;

      return {
        key: ingId, ingId, name: ing.name, form: ing.form || '', category: CAT_IDS.includes(ing.category) ? ing.category : 'household',
        status, requiredText, needText, buyText, pantryNote, warn,
        brand: prod && prod.brand ? prod.brand : (ing.brand || ''), notes: ing.notes || '',
        product: prod && prod.name ? prod.name : '',
        cost, price, priceUnit, pack, need, total,
        sources: req ? req.sources.map(s => s.name + ' × ' + s.days) : [],
        cold: COLD_CATS.has(ing.category)
      };
    };

    for (const [id, req] of reqs) { seen.add(id); const it = make(id, req); if (it) items.push(it); }
    for (const id of Object.keys(ings)) {
      if (seen.has(id)) continue;
      const p = ings[id].pantry;
      if (p && p.mode === 'staple' && p.low) { const it = make(id, null); if (it) items.push(it); }
    }
    return items;
  }

  /* ---------------------------------------------------------------- */
  /* Nutrition                                                          */
  /* ---------------------------------------------------------------- */

  /** Nutrition for one recipe line. Missing values stay null — never zero. */
  function itemNutrition(item, ing, opts) {
    const out = { values: {}, missing: [], skipped: false, reason: '' };
    NUTRIENTS.forEach(n => out.values[n.id] = null);
    if (item.unit === 'taste') { out.skipped = true; out.reason = 'to taste — not counted'; return out; }
    const n = ing && ing.nutrition;
    if (!n || !n.basis) { out.missing = NUTRIENTS.map(x => x.id); out.reason = 'no nutrition data'; return out; }
    const a = toBase(item.qty, item.unit, opts);
    if (!a) { out.missing = NUTRIENTS.map(x => x.id); out.reason = 'invalid quantity'; return out; }
    let factor = null;
    if (n.basis === '100g') { const g = convert(a.amt, a.dim, 'mass', ing); if (g !== null) factor = g / 100; else out.reason = 'needs grams per piece / density'; }
    else if (n.basis === '100ml') { const ml = convert(a.amt, a.dim, 'vol', ing); if (ml !== null) factor = ml / 100; else out.reason = 'needs density'; }
    else if (n.basis === 'serving') {
      const s = toBase(n.servingQty, n.servingUnit, opts);
      if (s && s.amt > 0) { const x = convert(a.amt, a.dim, s.dim, ing); if (x !== null) factor = x / s.amt; else out.reason = 'serving unit doesn\'t match'; }
      else out.reason = 'serving size missing';
    }
    for (const nu of NUTRIENTS) {
      const v = num(n[nu.id]);
      if (factor === null || v === null) out.missing.push(nu.id);
      else out.values[nu.id] = r6(v * factor);
    }
    return out;
  }

  /** Per-serving totals for a recipe; reports which ingredients lack data. */
  function recipeNutrition(recipe, ings, opts) {
    const totals = {}, missing = {};
    NUTRIENTS.forEach(n => { totals[n.id] = 0; missing[n.id] = []; });
    const skipped = [];
    for (const it of recipe.items || []) {
      const ing = ings[itemIngId(it)];
      const name = ing ? ing.name : '?';
      const r = itemNutrition(it, ing, opts);
      if (r.skipped) { skipped.push(name); continue; }
      for (const n of NUTRIENTS) {
        if (r.values[n.id] === null) missing[n.id].push(name);
        else totals[n.id] = r6(totals[n.id] + r.values[n.id]);
      }
    }
    const complete = {};
    NUTRIENTS.forEach(n => complete[n.id] = missing[n.id].length === 0);
    return { totals, missing, complete, skipped };
  }

  /** Typical day: per meal slot, days-weighted average of its enabled recipes, then summed. */
  function dailyNutrition(recipes, ings, opts) {
    const slots = {};
    for (const r of recipes || []) {
      const d = num(r.days) || 0;
      if (!r.enabled || d <= 0) continue;
      (slots[r.slot || 'other'] = slots[r.slot || 'other'] || []).push(r);
    }
    const totals = {}, missing = {};
    NUTRIENTS.forEach(n => { totals[n.id] = 0; missing[n.id] = new Set(); });
    for (const list of Object.values(slots)) {
      const sumDays = list.reduce((s, r) => s + num(r.days), 0);
      for (const r of list) {
        const w = num(r.days) / sumDays;
        const rn = recipeNutrition(r, ings, opts);
        for (const n of NUTRIENTS) {
          totals[n.id] = r6(totals[n.id] + rn.totals[n.id] * w);
          rn.missing[n.id].forEach(x => missing[n.id].add(x));
        }
      }
    }
    const out = { totals, missing: {}, complete: {}, slotCount: Object.keys(slots).length };
    NUTRIENTS.forEach(n => { out.missing[n.id] = [...missing[n.id]]; out.complete[n.id] = missing[n.id].size === 0; });
    return out;
  }

  /* ---------------------------------------------------------------- */
  /* Store aisles                                                       */
  /* ---------------------------------------------------------------- */

  function parseAisle(s) {
    if (s === null || s === undefined) return null;
    const t = String(s).trim();
    if (!t) return null;
    const m = t.match(/^(?:aisle\s*)?(\d{1,3})\s*([a-z])?\b/i);
    if (m) return { type: 'num', n: parseInt(m[1], 10), sub: (m[2] || '').toUpperCase() };
    const low = t.toLowerCase();
    const z = ZONES.find(z => z.id === low || z.name.toLowerCase() === low) ||
      (/(fruit|veg|produce)/.test(low) ? ZONES[0] : /bak/.test(low) ? ZONES[1] : /deli/.test(low) ? ZONES[2] :
        /health/.test(low) ? ZONES[3] : /frozen|freez/.test(low) ? ZONES[8] : /dairy|milk|yog/.test(low) ? ZONES[7] :
          /chill|fridge/.test(low) ? ZONES[6] : null);
    if (z && z.id !== 'aisles') return { type: 'zone', zone: z.id };
    return { type: 'text', text: t };
  }

  function aisleLabel(s) {
    const p = parseAisle(s);
    if (!p) return '';
    if (p.type === 'num') return 'Aisle ' + p.n + p.sub;
    if (p.type === 'zone') return ZONES.find(z => z.id === p.zone).name;
    return p.text;
  }

  /** confirmed | recent | saved | outdated | unknown */
  function locStatus(loc, now, recentDays) {
    if (!loc || !loc.aisle) return 'unknown';
    if (loc.outdated) return 'outdated';
    if (loc.source === 'manual') return 'confirmed';
    const age = (now || Date.now()) - (loc.verifiedAt || 0);
    return age <= (recentDays || 30) * 864e5 ? 'recent' : 'saved';
  }

  /**
   * Apply a new aisle location. A location you confirmed in-store is never
   * replaced by an unverified (website/app look-up) location unless you first
   * mark it outdated.
   */
  function applyLocation(existing, incoming, now) {
    now = now || Date.now();
    const fresh = { aisle: String(incoming.aisle || '').trim(), bay: incoming.bay || '', source: incoming.source === 'manual' ? 'manual' : 'web', verifiedAt: now, outdated: false };
    const hist = ((existing && existing.history) || []).slice(-9);
    if (existing && existing.aisle) hist.push({ aisle: existing.aisle, source: existing.source, at: existing.verifiedAt, outdated: !!existing.outdated });
    if (!fresh.aisle) return { loc: existing || null, accepted: false, reason: 'No aisle entered' };
    if (fresh.source !== 'manual' && existing && existing.aisle && existing.source === 'manual' && !existing.outdated) {
      return { loc: Object.assign({}, existing, { suggestion: { aisle: fresh.aisle, bay: fresh.bay, at: now } }), accepted: false, reason: 'Kept your in-store confirmed aisle. The new value was saved as a suggestion.' };
    }
    fresh.history = hist;
    return { loc: fresh, accepted: true, reason: '' };
  }
  function markOutdated(loc) { return loc ? Object.assign({}, loc, { outdated: true }) : loc; }

  function fallbackZone(category) {
    if (category === 'fruit' || category === 'veg') return 'produce';
    if (category === 'dairy') return 'dairy';
    if (category === 'tofu') return 'chilled';
    return null;
  }

  /**
   * Group & order items for a store walk.
   * getLoc(item) → location or null. opts: { layout, coldLast, aisleDir: 'asc'|'desc' }
   */
  function storeGroups(items, getLoc, opts) {
    opts = opts || {};
    const layout = (opts.layout && opts.layout.length ? opts.layout : DEFAULT_LAYOUT).filter(z => ZONES.some(x => x.id === z));
    DEFAULT_LAYOUT.forEach(z => { if (!layout.includes(z)) layout.push(z); });
    const coldLast = opts.coldLast !== false;
    const groups = new Map();
    for (const it of items) {
      const loc = getLoc(it);
      const p = loc && loc.aisle ? parseAisle(loc.aisle) : null;
      let zone, n = 0, key, label, guessed = false;
      if (p && p.type === 'num') { zone = 'aisles'; n = p.n + (p.sub ? (p.sub.charCodeAt(0) - 64) / 100 : 0); key = 'a' + n; label = 'Aisle ' + p.n + p.sub; }
      else if (p && p.type === 'zone') { zone = p.zone; key = 'z' + zone; label = ZONES.find(z => z.id === zone).name; }
      else if (p && p.type === 'text') { zone = 'other'; key = 't' + p.text.toLowerCase(); label = p.text; }
      else {
        zone = fallbackZone(it.category);
        guessed = true;
        if (zone) { key = 'g' + zone; label = ZONES.find(z => z.id === zone).name + ' · usual area'; }
        else { zone = null; key = 'unknown'; label = 'Aisle not set yet'; }
      }
      const cold = it.cold || (zone && COLD_ZONES.has(zone));
      let base = zone ? layout.indexOf(zone) : layout.length;
      let an = zone === 'aisles' ? (opts.aisleDir === 'desc' ? 999 - n : n) : 0;
      let tier = 0;
      if (coldLast && cold) tier = zone === 'frozen' ? 2 : 1;
      if (zone === 'aisles' && cold && coldLast) { key += 'c'; label += ' · fridge'; }
      const order = tier * 1e6 + base * 1e3 + an + (guessed && zone ? 0.5 : 0);
      if (!groups.has(key)) groups.set(key, { key, label, order, cold: !!cold, unknown: key === 'unknown', guessed, items: [] });
      groups.get(key).items.push(it);
    }
    return [...groups.values()].sort((a, b) => a.order - b.order);
  }

  /* ---------------------------------------------------------------- */
  /* Misc helpers                                                       */
  /* ---------------------------------------------------------------- */

  const CAT_KEYWORDS = [
    ['fruit', /(apple|banana|berr|orange|lemon|lime|mango|grape|kiwi|pear|melon|avocado|peach|plum|cherr(y|ies)$|pineapple|fruit)/i],
    ['veg', /(spinach|lettuce|tomato|onion|garlic(?! powder)|capsicum|cucumber|carrot|broccoli|potato|zucchini|mushroom|kale|cabbage|celery|herbs? fresh|coriander|parsley|veg|corn|pumpkin|beetroot|rocket|salad)/i],
    ['dairy', /(milk|yog|cheese|feta|butter|cream|egg|halloumi|ricotta|cottage)/i],
    ['tofu', /(tofu|tempeh|seitan|edamame|plant.?based|protein powder)/i],
    ['canned', /(can|tin|beans|chickpea|lentil|passata|tomatoes? canned|soup)/i],
    ['grains', /(quinoa|rice|oat|pasta|bread|flour|couscous|barley|cereal|wrap)/i],
    ['nuts', /(almond|walnut|cashew|peanut|seed|chia|pepita|pistachio|nut|flax|hemp)/i],
    ['spices', /(oregano|cumin|paprika|turmeric|pepper|salt|spice|powder|cinnamon|basil dried|chilli flakes|seasoning)/i],
    ['oils', /(oil|vinegar|sauce|mustard|mayo|honey|syrup|ketchup|dressing|tahini|soy)/i],
    ['household', /(paper|towel|soap|detergent|bin|foil|wrap film|cling|sponge|toothpaste|shampoo|tissue)/i]
  ];
  function guessCategory(name) {
    for (const [cat, re] of CAT_KEYWORDS) if (re.test(name || '')) return cat;
    return 'household';
  }
  function slug(s) { return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function searchUrl(chain, query) {
    const q = encodeURIComponent(query || '');
    if (chain === 'coles') return 'https://www.coles.com.au/search/products?q=' + q;
    if (chain === 'woolworths') return 'https://www.woolworths.com.au/shop/search/products?searchTerm=' + q;
    return null;
  }

  /** Plain-text list for copy / share. */
  function listToText(groups, title) {
    const lines = [title || 'Shopping list', ''];
    for (const g of groups) {
      if (!g.items.length) continue;
      lines.push(g.label.toUpperCase());
      for (const it of g.items) {
        let s = (it.checked ? '☑ ' : '☐ ') + it.name;
        const q = it.qtyLine || it.requiredText;
        if (q) s += ' — ' + q;
        if (it.buyText) s += ' (' + (/^buy /i.test(it.buyText) ? it.buyText : 'buy ' + it.buyText) + ')';
        if (it.brand) s += ' [' + it.brand + ']';
        lines.push(s);
      }
      lines.push('');
    }
    return lines.join('\n').trim();
  }

  return {
    CATEGORIES, CAT_IDS, COLD_CATS, UNITS, NUTRIENTS, ZONES, DEFAULT_LAYOUT, COLD_ZONES,
    r6, num, parseQty, fmtNum, fmtMass, fmtVol, fmtCount, fmtAmount, fmtMoney, fmtPkg,
    unitFactor, toBase, convert, itemIngId,
    computeRequirements, consolidate, packYield, packCalc, estCost, buildList,
    itemNutrition, recipeNutrition, dailyNutrition,
    parseAisle, aisleLabel, locStatus, applyLocation, markOutdated, storeGroups, fallbackZone,
    guessCategory, slug, searchUrl, listToText
  };
});
