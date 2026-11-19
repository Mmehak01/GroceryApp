/* Prep List — logic test suite. Open tests/index.html in a browser (served over http). */
(function () {
  'use strict';
  const C = window.Core, Seed = window.SeedData, IO = window.StoreIO;
  const results = [];
  const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((msg || '') + ' expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a)); };
  const ok = (v, msg) => { if (!v) throw new Error(msg || 'assertion failed'); };
  const test = (group, name, fn) => { try { fn(); results.push({ group, name, pass: true }); } catch (e) { results.push({ group, name, pass: false, err: e.message }); } };

  const fresh = () => Seed.freshState();
  const days = (s, b, l, d) => { s.recipes.find(r => r.id === 'breakfast-powder').days = b; s.recipes.find(r => r.id === 'lunch').days = l; s.recipes.find(r => r.id === 'dinner').days = d; return s; };
  const byId = (list, id) => list.find(i => i.ingId === id);

  /* ---------- Quantities & consolidation ---------- */
  test('Quantities', 'All meals × 7 days match the brief', () => {
    const L = C.buildList(days(fresh(), 7, 7, 7), {});
    eq(byId(L, 'quinoa').requiredText, '490 g');
    eq(byId(L, 'tofu').requiredText, '2.45 kg');
    eq(byId(L, 'spinach').requiredText, '1.05 kg');
    eq(byId(L, 'chickpeas-drained').requiredText, '875 g');
    eq(byId(L, 'black-beans-drained').requiredText, '1.75 kg');
    eq(byId(L, 'yoghurt').requiredText, '1.19 kg');
  });
  test('Quantities', 'Breakfast 7 / Lunch 5 / Dinner 7', () => {
    const L = C.buildList(days(fresh(), 7, 5, 7), {});
    eq(byId(L, 'quinoa').requiredText, '430 g');
    eq(byId(L, 'tofu').requiredText, '2.15 kg');
    eq(byId(L, 'chickpeas-drained').requiredText, '625 g');
    eq(byId(L, 'spinach').requiredText, '990 g');
  });
  test('Quantities', 'Ingredients shared by meals appear once', () => {
    const L = C.buildList(days(fresh(), 7, 7, 7), {});
    const keys = L.map(i => i.key);
    eq(keys.length, new Set(keys).size, 'duplicate keys');
    eq(L.filter(i => i.ingId === 'tofu').length, 1);
    eq(byId(L, 'tofu').sources.length, 2);
  });
  test('Quantities', 'Zero days removes a meal\'s ingredients', () => {
    const L = C.buildList(days(fresh(), 0, 7, 0), {});
    ok(!byId(L, 'yoghurt'), 'yoghurt should be absent');
    ok(!byId(L, 'black-beans-drained'), 'black beans should be absent');
    eq(byId(L, 'tofu').requiredText, '1.05 kg');
  });
  test('Quantities', 'Fractional pieces (½ banana, ¼ onion)', () => {
    const L = C.buildList(days(fresh(), 7, 7, 7), {});
    eq(byId(L, 'banana').requiredText, '3½ bananas');
    eq(byId(L, 'banana').buyText, 'Buy 4 bananas');
    eq(byId(L, 'red-onion').requiredText, '1¾ onions');
    eq(byId(L, 'avocado').requiredText, '1¾ avocados');
    eq(byId(L, 'cucumber').requiredText, '3½ cucumbers');
    eq(byId(L, 'cherry-tomatoes').requiredText, '70 tomatoes');
    eq(byId(L, 'walnuts').requiredText, '14 halves');
    eq(byId(L, 'protein-powder').requiredText, '7 scoops');
  });
  test('Quantities', 'Quantity plus "to taste" (lemon)', () => {
    const L = C.buildList(days(fresh(), 7, 7, 7), {});
    eq(byId(L, 'lemon').requiredText, '3½ lemons + to taste');
  });
  test('Quantities', 'Alternative ingredient (lime instead of lemon)', () => {
    const s = days(fresh(), 7, 7, 7);
    s.recipes.find(r => r.id === 'dinner').items.find(i => i.ingId === 'lemon').use = 'lime';
    const L = C.buildList(s, {});
    eq(byId(L, 'lemon').requiredText, '3½ lemons');
    eq(byId(L, 'lime').requiredText, 'To taste');
  });
  test('Quantities', 'Spoons use the Australian 20 ml tablespoon by default', () => {
    const L = C.buildList(days(fresh(), 7, 7, 7), {});
    eq(byId(L, 'chia').requiredText, '7 tbsp (140 ml)');
    eq(byId(L, 'pepitas').requiredText, '7 tsp (35 ml)');
    const s = days(fresh(), 7, 7, 7); s.settings.tbspMl = 15;
    eq(byId(C.buildList(s, {}), 'chia').requiredText, '7 tbsp (105 ml)');
  });
  test('Quantities', 'g + kg in different recipes are summed', () => {
    const s = days(fresh(), 7, 7, 7);
    s.recipes.push({ id: 'x', name: 'X', slot: 'snack', enabled: true, days: 2, items: [{ ingId: 'spinach', qty: 0.1, unit: 'kg' }] });
    eq(byId(C.buildList(s, {}), 'spinach').requiredText, '1.25 kg');
  });
  test('Quantities', 'Pieces + grams without a conversion stay separate (no guessing)', () => {
    const s = days(fresh(), 0, 0, 0);
    s.recipes.push({ id: 'x', name: 'X', enabled: true, days: 1, items: [{ ingId: 'banana', qty: 1, unit: 'pc' }, { ingId: 'banana', qty: 50, unit: 'g' }] });
    eq(byId(C.buildList(s, {}), 'banana').requiredText, '50 g + 1 banana');
    s.ingredients.banana.gPerCount = 120;
    eq(byId(C.buildList(s, {}), 'banana').requiredText, '170 g');
  });
  test('Quantities', 'Dry, cooked and drained forms are never merged', () => {
    const s = days(fresh(), 0, 7, 0);
    s.ingredients['chickpeas-dry'] = Object.assign({}, s.ingredients['chickpeas-drained'], { id: 'chickpeas-dry', name: 'Chickpeas (dry)', form: 'dry', pkg: null });
    s.recipes.push({ id: 'x', name: 'Hummus', enabled: true, days: 1, items: [{ ingId: 'chickpeas-dry', qty: 100, unit: 'g' }] });
    const L = C.buildList(s, {});
    eq(byId(L, 'chickpeas-drained').requiredText, '875 g');
    eq(byId(L, 'chickpeas-dry').requiredText, '100 g');
    eq(byId(L, 'quinoa').form, 'dry');
  });
  test('Quantities', 'Fraction parser', () => {
    eq(C.parseQty('1 1/2'), 1.5); eq(C.parseQty('½'), 0.5); eq(C.parseQty('1½'), 1.5); eq(C.parseQty('0,25'), 0.25); eq(C.parseQty('abc'), null);
  });
  test('Quantities', 'Unit formatting (g→kg, ml→L)', () => {
    eq(C.fmtMass(999), '999 g'); eq(C.fmtMass(1000), '1 kg'); eq(C.fmtMass(1234), '1.234 kg'); eq(C.fmtMass(2.5), '2.5 g');
    eq(C.fmtVol(1500), '1.5 L'); eq(C.fmtVol(250), '250 ml');
  });

  /* ---------- Packaging ---------- */
  test('Packaging', 'Tofu 2.45 kg ÷ 450 g packets → 6', () => {
    const t = byId(C.buildList(days(fresh(), 7, 7, 7), {}), 'tofu');
    eq(t.pack.packs, 6); eq(t.buyText, '6 × 450 g packet');
  });
  test('Packaging', 'Black beans use drained weight (240 g per 400 g can)', () => {
    const b = byId(C.buildList(days(fresh(), 7, 7, 7), {}), 'black-beans-drained');
    eq(b.pack.packs, 8); eq(b.buyText, '8 × 400 g can (240 g drained)');
  });
  test('Packaging', 'Quinoa 490 g → 1 × 500 g; yoghurt 1.19 kg → 2 tubs', () => {
    const L = C.buildList(days(fresh(), 7, 7, 7), {});
    eq(byId(L, 'quinoa').pack.packs, 1);
    eq(byId(L, 'yoghurt').pack.packs, 2);
  });
  test('Packaging', 'Exact multiple does not round up (900 g → 2 × 450 g)', () => {
    const r = C.packCalc({ dim: 'mass', amt: 900 }, { size: 450, unit: 'g' }, {}, {});
    eq(r.packs, 2); eq(r.spare, 0);
  });
  test('Packaging', 'Incompatible package unit reports a warning instead of guessing', () => {
    const r = C.packCalc({ dim: 'count', amt: 4 }, { size: 1, unit: 'kg' }, {}, {});
    ok(r.error, 'expected error');
  });
  test('Packaging', 'Store-specific package overrides the default', () => {
    const s = days(fresh(), 7, 7, 7);
    const t = byId(C.buildList(s, { products: { tofu: { pkg: { size: 300, unit: 'g', label: 'block' } } } }), 'tofu');
    eq(t.pack.packs, 9);
  });

  /* ---------- Pantry ---------- */
  test('Pantry', 'Partial stock is deducted (quinoa: have 300 g)', () => {
    const s = days(fresh(), 7, 7, 7);
    s.ingredients.quinoa.pantry = { mode: 'have', haveQty: 300, haveUnit: 'g' };
    const q = byId(C.buildList(s, {}), 'quinoa');
    eq(q.status, 'buy'); eq(q.needText, '190 g'); eq(q.pack.packs, 1);
  });
  test('Pantry', 'Enough stock → covered', () => {
    const s = days(fresh(), 7, 7, 7);
    s.ingredients.quinoa.pantry = { mode: 'have', haveQty: 0.6, haveUnit: 'kg' };
    eq(byId(C.buildList(s, {}), 'quinoa').status, 'covered');
  });
  test('Pantry', '"Have" without a quantity → covered', () => {
    const s = days(fresh(), 7, 7, 7);
    s.ingredients.chia.pantry = { mode: 'have', haveQty: '' };
    eq(byId(C.buildList(s, {}), 'chia').status, 'covered');
  });
  test('Pantry', 'Staples are skipped until marked running low', () => {
    const s = days(fresh(), 7, 7, 7);
    eq(byId(C.buildList(s, {}), 'olive-oil').status, 'staple');
    s.ingredients['olive-oil'].pantry.low = true;
    eq(byId(C.buildList(s, {}), 'olive-oil').status, 'restock');
  });
  test('Pantry', 'Running-low staple not used by any meal still appears', () => {
    const s = days(fresh(), 0, 0, 0);
    s.ingredients.cumin.pantry.low = true;
    eq(byId(C.buildList(s, {}), 'cumin').status, 'restock');
  });
  test('Pantry', 'Mismatched pantry unit is not deducted', () => {
    const s = days(fresh(), 7, 7, 7);
    s.ingredients.quinoa.pantry = { mode: 'have', haveQty: 2, haveUnit: 'pc' };
    const q = byId(C.buildList(s, {}), 'quinoa');
    eq(q.status, 'buy'); ok(/not deducted/.test(q.pantryNote));
  });

  /* ---------- Cost ---------- */
  test('Cost', 'Price per pack × packs; per kg; flat', () => {
    const s = days(fresh(), 7, 7, 7);
    s.ingredients.tofu.price = 3.5; s.ingredients.tofu.priceUnit = 'pack';
    s.ingredients.spinach.price = 20; s.ingredients.spinach.priceUnit = 'kg';
    s.ingredients.feta.price = 5; s.ingredients.feta.priceUnit = 'item';
    const L = C.buildList(s, {});
    eq(byId(L, 'tofu').cost, 21); eq(byId(L, 'spinach').cost, 21); eq(byId(L, 'feta').cost, 5);
    eq(byId(L, 'quinoa').cost, null);
  });

  /* ---------- Nutrition ---------- */
  test('Nutrition', 'Per 100 g scaling', () => {
    const r = C.itemNutrition({ ingId: 'y', qty: 170, unit: 'g' }, { nutrition: { basis: '100g', kcal: 60, protein: 10, carbs: 4, fat: 0.2, fibre: 0 } }, {});
    eq(r.values.kcal, 102); eq(r.values.protein, 17); eq(r.values.fibre, 0); eq(r.missing, []);
  });
  test('Nutrition', 'Per serving scaling (2 scoops of a 1-scoop serving)', () => {
    const r = C.itemNutrition({ qty: 2, unit: 'pc' }, { nutrition: { basis: 'serving', servingQty: 1, servingUnit: 'pc', kcal: 120, protein: 24 } }, {});
    eq(r.values.kcal, 240); eq(r.values.protein, 48); ok(r.missing.includes('carbs'), 'blank carbs must be missing, not 0');
  });
  test('Nutrition', 'Pieces need grams-per-piece for a per-100 g basis', () => {
    const ing = { nutrition: { basis: '100g', kcal: 89 } };
    eq(C.itemNutrition({ qty: 1, unit: 'pc' }, ing, {}).values.kcal, null);
    ing.gPerCount = 120;
    eq(C.itemNutrition({ qty: 0.5, unit: 'pc' }, ing, {}).values.kcal, 53.4);
  });
  test('Nutrition', 'Recipe totals flag missing data instead of treating it as zero', () => {
    const s = fresh();
    s.ingredients.yoghurt.nutrition = { basis: '100g', kcal: 60, protein: 10 };
    const r = C.recipeNutrition(s.recipes[0], s.ingredients, s.settings);
    eq(r.totals.kcal, 102); eq(r.complete.kcal, false);
    ok(r.missing.kcal.includes('Banana'), 'banana listed as missing');
  });
  test('Nutrition', '"To taste" lines are skipped, not counted as missing', () => {
    const s = fresh();
    const r = C.recipeNutrition(s.recipes.find(x => x.id === 'dinner'), s.ingredients, s.settings);
    ok(r.skipped.includes('Salt')); ok(!r.missing.kcal.includes('Salt'));
  });
  test('Nutrition', 'Daily totals: one recipe per meal slot, weighted by days', () => {
    const ings = { a: { nutrition: { basis: '100g', kcal: 100, protein: 10, carbs: 0, fat: 0, fibre: 0 } } };
    const rs = [
      { slot: 'breakfast', enabled: true, days: 4, items: [{ ingId: 'a', qty: 100, unit: 'g' }] },
      { slot: 'breakfast', enabled: true, days: 3, items: [{ ingId: 'a', qty: 200, unit: 'g' }] },
      { slot: 'lunch', enabled: true, days: 7, items: [{ ingId: 'a', qty: 300, unit: 'g' }] }
    ];
    const d = C.dailyNutrition(rs, ings, {});
    eq(Math.round(d.totals.kcal * 1000) / 1000, Math.round((100 * 4 / 7 + 200 * 3 / 7 + 300) * 1000) / 1000);
    eq(d.complete.kcal, true);
  });

  /* ---------- Aisles ---------- */
  test('Aisles', 'Parse aisle text', () => {
    eq(C.parseAisle('Aisle 5'), { type: 'num', n: 5, sub: '' });
    eq(C.parseAisle('12b'), { type: 'num', n: 12, sub: 'B' });
    eq(C.parseAisle('Dairy'), { type: 'zone', zone: 'dairy' });
    eq(C.parseAisle('fruit and veg').zone, 'produce');
    eq(C.parseAisle('Near checkout').type, 'text');
  });
  test('Aisles', 'Status: confirmed / recent / saved / outdated / unknown', () => {
    const now = Date.now();
    eq(C.locStatus(null), 'unknown');
    eq(C.locStatus({ aisle: '3', source: 'manual', verifiedAt: now - 400 * 864e5 }, now), 'confirmed');
    eq(C.locStatus({ aisle: '3', source: 'web', verifiedAt: now - 5 * 864e5 }, now, 30), 'recent');
    eq(C.locStatus({ aisle: '3', source: 'web', verifiedAt: now - 50 * 864e5 }, now, 30), 'saved');
    eq(C.locStatus({ aisle: '3', source: 'manual', outdated: true }, now), 'outdated');
  });
  test('Aisles', 'Confirmed location is never overwritten by an unverified one', () => {
    const conf = C.applyLocation(null, { aisle: '7', source: 'manual' }).loc;
    const r = C.applyLocation(conf, { aisle: '9', source: 'web' });
    eq(r.accepted, false); eq(r.loc.aisle, '7'); eq(r.loc.source, 'manual'); eq(r.loc.suggestion.aisle, '9');
  });
  test('Aisles', 'After marking outdated, a website value is accepted', () => {
    const conf = C.markOutdated(C.applyLocation(null, { aisle: '7', source: 'manual' }).loc);
    const r = C.applyLocation(conf, { aisle: '9', source: 'web' });
    eq(r.accepted, true); eq(r.loc.aisle, '9'); eq(r.loc.history.length, 1);
  });
  test('Aisles', 'A new in-store confirmation replaces an old one', () => {
    const a = C.applyLocation(null, { aisle: '7', source: 'manual' }).loc;
    const b = C.applyLocation(a, { aisle: '8', source: 'manual' });
    eq(b.accepted, true); eq(b.loc.aisle, '8');
  });
  test('Aisles', 'Walk order: produce → aisles ascending → unknown → cold → frozen', () => {
    const items = [
      { key: 'frz', category: 'household', cold: false }, { key: 'yog', category: 'dairy', cold: true },
      { key: 'a9', category: 'grains' }, { key: 'a2', category: 'canned' }, { key: 'ban', category: 'fruit' },
      { key: 'unk', category: 'household' }, { key: 'tofuA3', category: 'tofu', cold: true }
    ];
    const locs = { frz: { aisle: 'Frozen' }, a9: { aisle: '9' }, a2: { aisle: 'Aisle 2' }, tofuA3: { aisle: '3' } };
    const g = C.storeGroups(items, it => locs[it.key], { coldLast: true });
    eq(g.map(x => x.items[0].key), ['ban', 'a2', 'a9', 'unk', 'tofuA3', 'yog', 'frz']);
    const g2 = C.storeGroups(items, it => locs[it.key], { coldLast: false });
    eq(g2[1].items[0].key, 'a2'); eq(g2[2].items[0].key, 'tofuA3');
  });
  test('Aisles', 'Same aisle is grouped; descending direction supported', () => {
    const items = [{ key: 'a', category: 'nuts' }, { key: 'b', category: 'grains' }, { key: 'c', category: 'canned' }];
    const locs = { a: { aisle: '4' }, b: { aisle: '4' }, c: { aisle: '10' } };
    const g = C.storeGroups(items, it => locs[it.key], { aisleDir: 'desc' });
    eq(g.length, 2); eq(g[0].label, 'Aisle 10'); eq(g[1].items.length, 2);
  });
  test('Aisles', 'Search links for each chain', () => {
    eq(C.searchUrl('coles', 'tofu firm'), 'https://www.coles.com.au/search/products?q=tofu%20firm');
    ok(C.searchUrl('woolworths', 'x').indexOf('woolworths.com.au') > 0); eq(C.searchUrl('other', 'x'), null);
  });

  /* ---------- Data safety ---------- */
  test('Data', 'Backup → restore round-trip keeps everything', () => {
    const s = days(fresh(), 6, 5, 4);
    s.list.checks.tofu = 123; s.products['coles-bayswater'] = { tofu: { brand: 'X', loc: { aisle: '3', source: 'manual' } } };
    const r = IO.fromBackup(IO.toBackup(s));
    eq(r.list.checks.tofu, 123); eq(r.products['coles-bayswater'].tofu.loc.aisle, '3');
    eq(C.buildList(r, {}).map(i => i.requiredText), C.buildList(s, {}).map(i => i.requiredText));
  });
  test('Data', 'Invalid backup is rejected', () => {
    let threw = false; try { IO.fromBackup('{"foo":1}'); } catch (e) { threw = true; } ok(threw);
    threw = false; try { IO.fromBackup('not json'); } catch (e) { threw = true; } ok(threw);
  });
  test('Data', 'Old/partial data is upgraded without loss', () => {
    const s = fresh(); delete s.settings.targets; delete s.list.removed; delete s.ingredients.tofu.pantry; s.stores = [];
    const m = IO.migrate(JSON.parse(JSON.stringify(s)));
    ok(m.settings.targets.kcal === 1600); ok(m.list.removed); eq(m.ingredients.tofu.pantry.mode, 'buy'); eq(m.stores.length, 3);
  });
  test('Data', 'Editing a recipe updates totals and keeps check-marks (keyed by ingredient)', () => {
    const s = days(fresh(), 7, 7, 7);
    s.list.checks.tofu = 1;
    s.recipes.find(r => r.id === 'dinner').items.find(i => i.ingId === 'tofu').qty = 100;
    const t = byId(C.buildList(s, {}), 'tofu');
    eq(t.requiredText, '1.75 kg'); eq(t.key, 'tofu'); ok(s.list.checks[t.key]);
  });
  test('Data', 'Corrupt saved data is kept aside, not discarded', () => {
    const mem = { d: { 'preplist.state.v1': '{broken' }, getItem(k) { return this.d[k] || null; }, setItem(k, v) { this.d[k] = v; } };
    const r = IO.load(mem);
    ok(r.error); ok(Object.keys(mem.d).some(k => k.indexOf('.corrupt.') > 0));
  });
  test('Data', 'Plain-text export', () => {
    const t = C.listToText([{ label: 'Fruits', items: [{ name: 'Banana', requiredText: '3½ bananas', buyText: 'Buy 4 bananas', checked: true }] }], 'List');
    ok(t.indexOf('☑ Banana — 3½ bananas (Buy 4 bananas)') > 0, 'count line: ' + t);
    ok(t.indexOf('FRUITS') > 0);
    const t2 = C.listToText([{ label: 'Tofu', items: [{ name: 'Tofu', requiredText: '2.45 kg', buyText: '6 × 450 g packet' }] }]);
    ok(t2.indexOf('☐ Tofu — 2.45 kg (buy 6 × 450 g packet)') > 0, 'pack line: ' + t2);
  });

  /* ---------- Render ---------- */
  window.TEST_RESULTS = results;
  const pass = results.filter(r => r.pass).length;
  const el = document.getElementById('out');
  if (el) {
    let html = '<h1>' + pass + ' / ' + results.length + ' tests passed</h1>';
    let g = '';
    for (const r of results) {
      if (r.group !== g) { g = r.group; html += '<h2>' + g + '</h2>'; }
      html += '<div class="' + (r.pass ? 'p' : 'f') + '">' + (r.pass ? '✔ ' : '✘ ') + r.name + (r.err ? '<br><small>' + r.err.replace(/</g, '&lt;') + '</small>' : '') + '</div>';
    }
    el.innerHTML = html;
  }
})();
