/*
 * Prep List — default seed data.
 * Nutrition values are intentionally EMPTY: enter them from your product labels.
 * The only package sizes pre-filled are the four you specified in your brief.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SeedData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ing = (id, name, category, extra) => Object.assign({ id, name, category, form: '', countName: '', countPlural: '', gPerCount: '', density: '', brand: '', notes: '', price: '', priceUnit: '', pkg: null, nutrition: null, pantry: { mode: 'buy', haveQty: '', haveUnit: 'g', low: false } }, extra || {});
  const staple = { mode: 'staple', haveQty: '', haveUnit: 'g', low: false };
  const userPkg = (size, unit, label, yieldQty, yieldUnit) => ({ size, unit, label, yieldQty: yieldQty || '', yieldUnit: yieldUnit || '', source: 'Entered by you (setup brief)' });

  function ingredients() {
    const list = [
      ing('yoghurt', 'High-protein Greek yoghurt', 'dairy', { pkg: userPkg(1, 'kg', 'tub') }),
      ing('protein-powder', 'Protein powder', 'tofu', { countName: 'scoop', countPlural: 'scoops' }),
      ing('banana', 'Banana', 'fruit', { countName: 'banana', countPlural: 'bananas' }),
      ing('blueberries', 'Blueberries', 'fruit'),
      ing('strawberries', 'Strawberries', 'fruit'),
      ing('almonds', 'Almonds', 'nuts', { countName: 'almond', countPlural: 'almonds' }),
      ing('walnuts', 'Walnuts', 'nuts', { countName: 'half', countPlural: 'halves' }),
      ing('pepitas', 'Pepita kernels', 'nuts'),
      ing('chia', 'Chia seeds', 'nuts'),
      ing('sunflower', 'Sunflower seeds', 'nuts'),
      ing('chickpeas-drained', 'Chickpeas (cooked, drained)', 'canned', { form: 'drained' }),
      ing('quinoa', 'White quinoa (dry)', 'grains', { form: 'dry', pkg: userPkg(500, 'g', 'packet') }),
      ing('tofu', 'Extra-firm tofu', 'tofu', { pkg: userPkg(450, 'g', 'packet') }),
      ing('feta', 'Reduced-fat feta cheese', 'dairy'),
      ing('capsicum', 'Capsicum (small)', 'veg', { countName: 'capsicum', countPlural: 'capsicums' }),
      ing('cucumber', 'Cucumber', 'veg', { countName: 'cucumber', countPlural: 'cucumbers' }),
      ing('cherry-tomatoes', 'Cherry tomatoes', 'veg', { countName: 'tomato', countPlural: 'tomatoes' }),
      ing('red-onion', 'Red onion', 'veg', { countName: 'onion', countPlural: 'onions' }),
      ing('spinach', 'Baby spinach', 'veg'),
      ing('olive-oil', 'Extra virgin olive oil', 'oils', { pantry: Object.assign({}, staple, { haveUnit: 'ml' }) }),
      ing('lemon', 'Lemon', 'fruit', { countName: 'lemon', countPlural: 'lemons' }),
      ing('lime', 'Lime', 'fruit', { countName: 'lime', countPlural: 'limes' }),
      ing('oregano', 'Dried oregano', 'spices', { form: 'dried', pantry: Object.assign({}, staple) }),
      ing('garlic-powder', 'Garlic powder', 'spices', { pantry: Object.assign({}, staple) }),
      ing('salt', 'Salt', 'spices', { pantry: Object.assign({}, staple) }),
      ing('pepper', 'Black pepper', 'spices', { pantry: Object.assign({}, staple) }),
      ing('black-beans-drained', 'Black beans (drained)', 'canned', { form: 'drained', pkg: userPkg(400, 'g', 'can', 240, 'g') }),
      ing('tomato', 'Tomato (medium)', 'veg', { countName: 'tomato', countPlural: 'tomatoes' }),
      ing('avocado', 'Avocado', 'fruit', { countName: 'avocado', countPlural: 'avocados' }),
      ing('cumin', 'Ground cumin', 'spices', { pantry: Object.assign({}, staple) }),
      ing('paprika', 'Paprika', 'spices', { pantry: Object.assign({}, staple) })
    ];
    const o = {};
    list.forEach(i => o[i.id] = i);
    return o;
  }

  const it = (ingId, qty, unit, extra) => Object.assign({ ingId, qty, unit, alts: [], use: '' }, extra || {});

  function recipes() {
    const smoothieBase = [
      it('banana', 0.5, 'pc'),
      it('blueberries', 60, 'g'),
      it('strawberries', 100, 'g'),
      it('almonds', 5, 'pc'),
      it('walnuts', 2, 'pc'),
      it('pepitas', 1, 'tsp'),
      it('chia', 1, 'tbsp'),
      it('sunflower', 1, 'tsp')
    ];
    const smoothieSteps = '1. Add yoghurt' + ' and protein powder (if using) to the blender.\n2. Add banana, berries, nuts and seeds.\n3. Add a splash of water or ice for a thinner smoothie.\n4. Blend 45–60 seconds until smooth. Tip: freeze pre-portioned bags of fruit, nuts and seeds for the week.';
    return [
      {
        id: 'breakfast-powder', name: 'High-Protein Smoothie', slot: 'breakfast', enabled: true, days: 7,
        variantGroup: 'smoothie', variantLabel: 'With powder',
        instructions: smoothieSteps,
        items: [it('yoghurt', 170, 'g'), it('protein-powder', 1, 'pc')].concat(smoothieBase.map(x => Object.assign({}, x)))
      },
      {
        id: 'breakfast-nopowder', name: 'High-Protein Smoothie (no powder)', slot: 'breakfast', enabled: false, days: 7,
        variantGroup: 'smoothie', variantLabel: 'No powder',
        instructions: smoothieSteps.replace(' and protein powder (if using)', ''),
        items: [it('yoghurt', 400, 'g')].concat(smoothieBase.map(x => Object.assign({}, x)))
      },
      {
        id: 'lunch', name: 'Mediterranean Chickpea & Feta Protein Salad', slot: 'lunch', enabled: true, days: 7,
        instructions: '1. Rinse 30 g dry quinoa and simmer in ~60 ml water for 12–15 min, then cool.\n2. Press the tofu for 10 min, cube, and pan-fry or air-fry until golden (season with oregano and garlic powder).\n3. Chop capsicum, cucumber, cherry tomatoes and red onion.\n4. Combine spinach, chickpeas, quinoa, vegetables and tofu.\n5. Crumble feta on top. Dress with olive oil, lemon juice, oregano, garlic powder, salt and pepper.\nMeal prep: store dressing separately; keeps 3–4 days refrigerated.',
        items: [
          it('chickpeas-drained', 125, 'g'), it('quinoa', 30, 'g'), it('tofu', 150, 'g'), it('feta', 40, 'g'),
          it('capsicum', 1, 'pc'), it('cucumber', 0.5, 'pc'), it('cherry-tomatoes', 10, 'pc'), it('red-onion', 0.25, 'pc'),
          it('spinach', 30, 'g'), it('olive-oil', 1, 'tsp'), it('lemon', 0.5, 'pc'), it('oregano', 0.5, 'tsp'),
          it('garlic-powder', 0.5, 'tsp'), it('salt', '', 'taste'), it('pepper', '', 'taste')
        ]
      },
      {
        id: 'dinner', name: 'Quinoa, Black Bean & Tofu Protein Bowl', slot: 'dinner', enabled: true, days: 7,
        instructions: '1. Rinse 40 g dry quinoa and simmer in ~80 ml water for 12–15 min.\n2. Press and cube the tofu; toss with cumin, paprika, garlic powder, salt and pepper; pan-fry, bake or air-fry until crisp.\n3. Warm the drained black beans with a pinch of cumin.\n4. Wilt the spinach briefly in the pan (or serve fresh).\n5. Assemble quinoa, beans, spinach, tofu and diced tomato; top with sliced avocado and squeeze over lemon or lime juice.',
        items: [
          it('quinoa', 40, 'g'), it('black-beans-drained', 250, 'g'), it('spinach', 120, 'g'), it('tomato', 1, 'pc'),
          it('avocado', 0.25, 'pc'), it('tofu', 200, 'g'), it('lemon', '', 'taste', { alts: ['lime'] }),
          it('garlic-powder', '', 'taste'), it('cumin', '', 'taste'), it('paprika', '', 'taste'),
          it('salt', '', 'taste'), it('pepper', '', 'taste')
        ]
      }
    ];
  }

  function stores() {
    return [
      { id: 'coles-bayswater', name: 'Coles Bayswater', chain: 'coles', address: 'Bayswater VIC 3153', layout: null, aisleDir: 'asc', builtIn: true },
      { id: 'woolworths-boronia', name: 'Woolworths Boronia', chain: 'woolworths', address: 'Boronia VIC 3155', layout: null, aisleDir: 'asc', builtIn: true },
      { id: 'other', name: 'Other supermarket', chain: 'other', address: '', layout: null, aisleDir: 'asc', builtIn: true }
    ];
  }

  function freshState() {
    return {
      schema: 1,
      createdAt: Date.now(),
      settings: {
        theme: 'auto', tbspMl: 20, coldLast: true, recentDays: 30, lastStoreId: '',
        targets: { kcal: 1600, protein: '', carbs: '', fat: '', fibre: '' },
        lastBackupAt: 0
      },
      ingredients: ingredients(),
      recipes: recipes(),
      stores: stores(),
      products: {},          // products[storeId][key] = { name, brand, pkg, photo, url, price, priceUnit, department, loc, verifiedAt }
      list: newList(),
      history: [],
      trip: null
    };
  }
  function newList() {
    return { id: 'L' + Date.now().toString(36), startedAt: Date.now(), checks: {}, removed: {}, qtyOverride: {}, custom: [] };
  }

  return { freshState, newList, ingredients, recipes, stores };
});
