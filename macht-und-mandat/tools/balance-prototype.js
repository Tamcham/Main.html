/* Balancing gegen den echten Prototyp (Headless-Chromium): Siegquoten je Partei bei Zufallsspiel und „geschicktem“ Spiel.
 * Nutzung:  node tools/balance-prototype.js '{}'          (Zufallsspiel)
 *           node tools/balance-prototype.js '{"skilled":1}' (greedy Vorschau-Policy)
 * Voraussetzung: playwright (global oder lokal) und ein Chromium (PLAYWRIGHT_BROWSERS_PATH). */
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('file://' + path.resolve(__dirname, '../prototype/index.html'));
  const params = JSON.parse(process.argv[2]||'{}');
  const out = await page.evaluate((params) => {
    Object.assign(LM, params.LM||{}); Object.assign(HCAP, params.HCAP||{});
    const R = {};
    const realRender = render; window.render = () => {}; window.showResult = () => {}; window.toast = () => {};
    const bgs = Object.keys(BACKGROUNDS);
    for (const party of PARTY_ORDER) {
      let wins = 0, firstWins = 0, stich = 0, shares = [], rank = [0,0,0,0,0];
      const N = 400;
      for (let k = 0; k < N; k++) {
        G = newGame(); G.party = party; G.name = 'Test Person'; G.nn = 'Person'; G.anrede = 'div'; G.bg = bgs[k % bgs.length]; G.herk = 'alt'; G.dial = 'hoch';
        if (party === 'EIGEN') { G.own.sl = [60, 50, 50, 70, 40, 60]; G.own.kap = 4; }
        Object.keys(G.stats).forEach(s => G.stats[s] = 45 + (k % 3) * 0);
        // 12 freie Punkte zufällig
        for (let i = 0; i < 12; i++) G.stats[pick(Object.keys(G.stats))] += 2;
        initCharacter(); setupOpponents(); initBund();
        // Budget: gleichmäßig
        const bud = G.res.bud; const each = Math.floor(bud * 0.7 / 5 * 2) / 2; CHANNELS.forEach(c => G.camp.k[c.id] = each); G.camp.spent = each * 5; G.res.bud = bud - G.camp.spent; G.camp.sl = k % 5;
        buildDeck();
        for (let i = 0; i < TOTAL_CARDS; i++) {
          const inst = G.deck[G.cardIdx]; const c = CARDS[inst.id];
          const avail = c.opts.map((o, j) => j).filter(j => -(optFx(c, inst.v, c.opts[j], 'ok').d || 0) <= G.res.bud + .01);
          let idx;
          if (params.skilled) { const score = j => { const o = c.opts[j]; const fx = optFx(c, inst.v, o, 'ok'); const p = o.chk ? chkProb(o) : 1; const bad = o.chk ? optFx(c, inst.v, o, 'bad') : fx; const v = f => (f.b || 0) * 1.0 + (f.m || 0) * .6 + (f.p || 0) * .3 + (f.d || 0) * .15; return p * v(fx) + (1 - p) * v(bad) + (o.pf ? 1 : 0) - (o.later ? .4 : 0); }; idx = avail.sort((a, b) => score(b) - score(a))[0]; }
          else idx = pick(avail);
          ACT.choose({ dataset: { i: idx } });
        }
        const E = makeElection(false); const sh = E.res.shares, me = E.cands.findIndex(c => c.me);
        const order = sh.map((_, i) => i).sort((a, b) => sh[b] - sh[a]);
        rank[order.indexOf(me)]++;
        shares.push(sh[me]);
        if (sh[order[0]] > 50) { if (order[0] === me) { wins++; firstWins++; } }
        else { stich++; const top = order.slice(0, 2); if (top.includes(me)) { const E2 = makeElection(true, top.map(i => E.cands[i])); const s2 = E2.res.shares; const mi = E2.cands.findIndex(c => c.me); if (s2[mi] > 50) wins++; } }
      }
      shares.sort((a, b) => a - b);
      R[party] = { win: (wins / N * 100).toFixed(0) + '%', direkt: (firstWins / N * 100).toFixed(0) + '%', stichwahl: (stich / N * 100).toFixed(0) + '%', median: shares[N >> 1].toFixed(1), p10: shares[N * .1 | 0].toFixed(1), p90: shares[N * .9 | 0].toFixed(1), rank: rank.map(x => (x / N * 100).toFixed(0)).join('/') };
    }
    return R;
  }, params);
  console.table(out);
  await browser.close();
})();
