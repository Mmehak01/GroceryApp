/*
 * Prep List — persistence, migration, backup/restore.
 * Storage is injected so the logic can be unit-tested.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.StoreIO = factory(root.SeedData);
})(typeof self !== 'undefined' ? self : this, function (Seed) {
  'use strict';
  const KEY = 'preplist.state.v1';
  const APP_ID = 'prep-list';

  const isObj = o => o && typeof o === 'object' && !Array.isArray(o);

  /** Fill in any missing fields so older or partial data never crashes the app. */
  function migrate(raw) {
    if (!isObj(raw)) throw new Error('This file is not a Prep List backup.');
    if (isObj(raw.state) && raw.app === APP_ID) raw = raw.state;
    if (!isObj(raw.ingredients) || !Array.isArray(raw.recipes)) throw new Error('Backup is missing recipes or ingredients.');
    const base = Seed.freshState();
    const s = Object.assign({}, base, raw);
    s.settings = Object.assign({}, base.settings, isObj(raw.settings) ? raw.settings : {});
    s.settings.targets = Object.assign({}, base.settings.targets, isObj(s.settings.targets) ? s.settings.targets : {});
    s.ingredients = {};
    for (const [id, ing] of Object.entries(raw.ingredients)) {
      if (!isObj(ing)) continue;
      const p = isObj(ing.pantry) ? ing.pantry : {};
      s.ingredients[id] = Object.assign({ id, name: id, category: 'household', form: '', countName: '', countPlural: '', gPerCount: '', density: '', brand: '', notes: '', price: '', priceUnit: '', pkg: null, nutrition: null }, ing, {
        id, pantry: Object.assign({ mode: 'buy', haveQty: '', haveUnit: 'g', low: false }, p)
      });
    }
    s.recipes = raw.recipes.filter(isObj).map(r => Object.assign({ name: 'Recipe', slot: 'other', enabled: true, days: 0, instructions: '' }, r, {
      id: r.id || ('r' + Math.random().toString(36).slice(2, 8)),
      items: (Array.isArray(r.items) ? r.items : []).filter(isObj).map(it => Object.assign({ qty: '', unit: 'g', alts: [], use: '' }, it, { alts: Array.isArray(it.alts) ? it.alts : [] }))
    }));
    s.stores = Array.isArray(raw.stores) && raw.stores.length ? raw.stores.filter(isObj) : base.stores;
    base.stores.forEach(bs => { if (!s.stores.some(x => x.id === bs.id)) s.stores.push(bs); });
    s.products = isObj(raw.products) ? raw.products : {};
    s.history = Array.isArray(raw.history) ? raw.history.filter(isObj) : [];
    const L = isObj(raw.list) ? raw.list : {};
    s.list = Object.assign(Seed.newList(), L);
    ['checks', 'removed', 'qtyOverride'].forEach(k => { if (!isObj(s.list[k])) s.list[k] = {}; });
    if (!Array.isArray(s.list.custom)) s.list.custom = [];
    s.trip = isObj(raw.trip) ? raw.trip : null;
    s.schema = 1;
    return s;
  }

  /** Returns { state, error } — on a read error the broken data is kept aside, never silently discarded. */
  function load(storage) {
    let text = null;
    try { text = storage.getItem(KEY); } catch (e) { return { state: Seed.freshState(), error: 'Storage unavailable: ' + e.message, fresh: true }; }
    if (!text) return { state: Seed.freshState(), error: null, fresh: true };
    try { return { state: migrate(JSON.parse(text)), error: null, fresh: false }; }
    catch (e) {
      try { storage.setItem(KEY + '.corrupt.' + Date.now(), text); } catch (_) { /* ignore */ }
      return { state: Seed.freshState(), error: 'Saved data could not be read (' + e.message + '). A copy was kept; restore a backup in Settings.', fresh: true };
    }
  }
  function save(storage, state) { storage.setItem(KEY, JSON.stringify(state)); }

  function toBackup(state) { return JSON.stringify({ app: APP_ID, version: 1, exportedAt: new Date().toISOString(), state }, null, 1); }
  function fromBackup(text) {
    let o;
    try { o = JSON.parse(text); } catch (e) { throw new Error('File is not valid JSON.'); }
    return migrate(o);
  }

  return { KEY, migrate, load, save, toBackup, fromBackup };
});
