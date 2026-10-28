// Misura il riconoscimento delle domande del Judge: node tools/kb_eval.js [v] [kb_eval|kb_hold]  (serve playwright)
const { chromium } = require('playwright');
const EV = require(__dirname + '/' + (process.argv[3] || 'kb_eval') + '.json');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  await p.goto('file://' + require('path').resolve(__dirname, '../index.html')); await p.waitForTimeout(800);
  const out = await p.evaluate(EV => { const t0 = performance.now(); const r = EV.map(([q, want]) => { const s = kbSearch(q, 3); return { q, want, got: s.map(x => x.x.i), sc: s.map(x => +x.sc.toFixed(3)), first: s[0] && s[0].x.qs[0] }; }); return { r, ms: (performance.now() - t0) / EV.length, n: KB.length }; }, EV);
  let ok = 0, ok3 = 0; const okSc = [], badSc = [];
  for (const x of out.r) { if ([].concat(x.want).includes(x.got[0])) { ok++; okSc.push(x.sc[0]); } else { badSc.push(x.sc[0]); if (process.argv[2]) console.log("✗", x.q, "→", x.got[0], x.first, x.sc[0], "| atteso", x.want, "pos", x.got.indexOf(x.want)); } if ([].concat(x.want).some(w => x.got.includes(w))) ok3++; }
  okSc.sort(); badSc.sort();
  console.log(`KB ${out.n} · top1 ${ok}/${out.r.length} · top3 ${ok3} · ${out.ms.toFixed(1)} ms/q · ok min ${okSc[0]} p10 ${okSc[Math.floor(okSc.length*.1)]} · bad max ${badSc[badSc.length-1]}`);
  // negative: domande fuori KB
  const neg = await p.evaluate(() => ["quanto costa un booster di magic", "chi ha disegnato le carte di alpha", "Black Lotus vale tanto?", "che mazzo mi consigli per commander"].map(q => { const s = kbSearch(q, 1)[0]; return q + " → " + (s ? s.sc.toFixed(3) + " " + s.x.qs[0] : "-"); }));
  console.log(neg.join("\n"));
  await b.close(); })();
