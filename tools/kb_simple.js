// Esame del Judge sulle domande semplici: node tools/kb_simple.js [v] [file]  (serve playwright)
const { chromium } = require('playwright'), path = require('path');
const S = require(path.resolve(__dirname, process.argv[3] || 'kb_simple.json'));
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ locale: 'it-IT' })).newPage();
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(800);
  const r = await p.evaluate(S => { const N = s => norm(s); return S.map(([q, re]) => { const s = kbSearch(q, 3); const x = s[0]; const rx = new RegExp(N(re));
    const ok = x && rx.test(N(x.x.qs[0] + " " + x.x.a)); const ok3 = s.some(y => rx.test(N(y.x.qs[0] + " " + y.x.a)));
    return { q, ok, ok3, sc: x ? x.sc : 0, got: x ? x.x.qs[0] : "-" }; }); }, S);
  const ok = r.filter(x => x.ok).length, ok3 = r.filter(x => x.ok3).length, sure = r.filter(x => x.sc >= .45), sureOk = sure.filter(x => x.ok).length;
  if (process.argv[2]) r.filter(x => !x.ok).forEach(x => console.log("✗", x.q, "→", x.got, x.sc.toFixed(2)));
  console.log(`domande ${r.length} · giuste al primo colpo ${ok} (${(100 * ok / r.length).toFixed(1)}%) · tra le prime 3 ${ok3} · sicure ${sure.length} di cui giuste ${sureOk}`);
  await b.close(); })();
