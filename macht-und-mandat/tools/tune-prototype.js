/* Kalibriert die Offsets HCAP je Partei per Bisektion auf Ziel-Siegquoten bei Zufallsspiel (siehe docs/07-balancing.md). */
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('file://' + path.resolve(__dirname, '../prototype/index.html'));
  const res = await page.evaluate(() => {
    
    window.render = () => {}; window.showResult = () => {};
    const bgs = Object.keys(BACKGROUNDS);
    const TARGET = { CDU: .60, CSU: .60, SPD: .45, GRUENE: .40, FDP: .25, LINKE: .25, BSW: .35, AFD: .20, EIGEN: .15 };
    const winRate = (party, N) => {
      let wins = 0;
      for (let k = 0; k < N; k++) {
        G = newGame(); G.party = party; G.name = 'T P'; G.nn = 'P'; G.anrede = 'div'; G.bg = bgs[k % bgs.length]; G.herk = 'alt'; G.dial = 'hoch';
        if (party === 'EIGEN') { G.own.sl = [60, 50, 50, 70, 40, 60]; G.own.kap = 4; }
        for (let i = 0; i < 12; i++) G.stats[pick(Object.keys(G.stats))] += 2;
        initCharacter(); setupOpponents(); initBund();
        const bud = G.res.bud, each = Math.floor(bud * .7 / 5 * 2) / 2; CHANNELS.forEach(c => G.camp.k[c.id] = each); G.camp.spent = each * 5; G.res.bud = bud - G.camp.spent; G.camp.sl = k % 5;
        buildDeck();
        for (let i = 0; i < TOTAL_CARDS; i++) { const inst = G.deck[G.cardIdx], c = CARDS[inst.id]; const av = c.opts.map((o, j) => j).filter(j => -(optFx(c, inst.v, c.opts[j], 'ok').d || 0) <= G.res.bud + .01); ACT.choose({ dataset: { i: pick(av) } }); }
        const E = makeElection(false), sh = E.res.shares, me = E.cands.findIndex(c => c.me), order = sh.map((_, i) => i).sort((a, b) => sh[b] - sh[a]);
        if (sh[order[0]] > 50) { if (order[0] === me) wins++; }
        else { const top = order.slice(0, 2); if (top.includes(me)) { const E2 = makeElection(true, top.map(i => E.cands[i])); if (E2.res.shares[E2.cands.findIndex(c => c.me)] > 50) wins++; } }
      }
      return wins / N;
    };
    const out = {};
    for (const p of Object.keys(TARGET)) {
      let lo = -1.6, hi = 0.8;
      for (let it = 0; it < 6; it++) { const mid = (lo + hi) / 2; HCAP[p] = mid; const w = winRate(p, 140); if (w < TARGET[p]) lo = mid; else hi = mid; }
      HCAP[p] = Math.round((lo + hi) / 2 * 20) / 20; out[p] = { hcap: HCAP[p], win: winRate(p, 200) };
    }
    return out;
  });
  console.log(JSON.stringify(res));
  await browser.close();
})();
