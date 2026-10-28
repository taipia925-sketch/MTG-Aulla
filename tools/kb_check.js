// Controlla la base di conoscenza del Judge (src/kb/*.js): ogni regola citata deve esistere nelle Comprehensive Rules
// e il suo testo (o quello della regola madre / del titolo di sezione) deve contenere almeno una delle parole chiave della voce.
// Uso: node tools/kb_check.js
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const txt = fs.readFileSync(path.join(ROOT, "tools/MagicCompRules.txt"), "utf8").replace(/\r/g, "");
const rules = {}, secs = {};
for (const l of txt.split("\n")) {
  let m = /^(\d{3}\.\d+[a-z]{0,2})\.? (.*)$/.exec(l); if (m) { if (!rules[m[1]]) rules[m[1]] = m[2]; continue; }
  m = /^(\d{3})\. (.*)$/.exec(l); if (m && !secs[m[1]]) secs[m[1]] = m[2];
}
const KB = []; global.KB = KB;
for (const f of fs.readdirSync(path.join(ROOT, "src/kb")).sort()) eval(fs.readFileSync(path.join(ROOT, "src/kb", f), "utf8"));
const stem = w => w.toLowerCase().replace(/[^a-z0-9+\/-]/g, "").replace(/(ing|ed|es|s)$/, "");
let bad = 0, n = 0;
KB.forEach((e, i) => {
  const [cat, qs, kw, ids, ans] = e; n++;
  if (!Array.isArray(qs) || !qs.length || typeof ans !== "string" || !Array.isArray(ids)) { console.log("FORMATO", i, cat, qs && qs[0]); bad++; return; }
  const ks = kw.split(/\s+/).map(stem).filter(k => k.length > 1);
  for (const id of ids) {
    const t = rules[id] || (/^\d{3}$/.test(id) && secs[id]);
    if (!t) { console.log("MANCA", id, "←", qs[0]); bad++; continue; }
    const parent = id.replace(/[a-z]+$/, ""), ctx = (t + " " + (rules[parent] || "") + " " + (secs[id.slice(0, 3)] || "")).toLowerCase();
    const words = ctx.split(/[^a-z0-9+\/-]+/).map(stem);
    if (!ks.some(k => words.includes(k))) { console.log("FUORI TEMA", id, "←", qs[0], "|", t.slice(0, 110)); bad++; }
  }
});
console.log(`${n} voci, ${bad} problemi`);
