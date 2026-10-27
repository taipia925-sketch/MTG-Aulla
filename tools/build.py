"""Costruisce index.html da src/app.html + regolamento ufficiale (tools/MagicCompRules.txt)
+ traduzione italiana (tools/it/*.txt).   Uso: python3 tools/build.py [--artifact out.html]

Formato dei file di traduzione:
  @702.19b          regola (il testo segue nelle righe successive; "Esempio: ..." per gli esempi)
  @702              titolo di sezione        @#7   titolo di capitolo
  @@Trample         voce di glossario: riga 1 = termine italiano, poi la definizione
Ogni regola tradotta porta l'impronta del testo inglese: se Wizards cambia la regola,
l'app mostra l'originale finché la traduzione non viene aggiornata."""
import json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

def parse_cr(text):
    lines = text.replace("\r", "").split("\n")
    st = [i for i, l in enumerate(lines) if l.strip() == "1. Game Concepts"][1]
    gs = [i for i, l in enumerate(lines) if l.strip() == "Glossary"][1]
    ge = next(i for i in range(gs + 1, len(lines)) if lines[i].strip() == "Credits")
    rules, last = {}, None
    for l in lines[st:gs]:
        l = l.strip()
        if not l or re.match(r"^\d\. .+$", l) or re.match(r"^\d{3}\. .+$", l): continue
        m = re.match(r"^(\d{3}\.\d+[a-z]?)\.?\s+(.*)$", l)
        if m: last = {"t": m[2], "ex": []}; rules[m[1]] = last; continue
        m = re.match(r"^Example:\s*(.*)$", l)
        if m:
            if last: last["ex"].append(m[1])
            continue
        if last:
            if last["ex"]: last["ex"][-1] += "\n" + l
            else: last["t"] += "\n" + l
    gloss, block = {}, []
    for l in lines[gs + 1:ge] + [""]:
        l = l.strip()
        if not l:
            if len(block) >= 2: gloss[block[0]] = "\n".join(block[1:])
            block = []
        else: block.append(l)
    return rules, gloss

def b36(n):
    s = "0123456789abcdefghijklmnopqrstuvwxyz"; o = ""
    while True:
        n, r = divmod(n, 36); o = s[r] + o
        if n == 0: return o

def fnv(s):
    h = 0x811c9dc5
    for ch in s: h ^= ord(ch); h = (h * 0x01000193) & 0xffffffff
    return b36(h)

def load_translation(rules, gloss):
    tr = {"r": {}, "s": {}, "c": {}, "g": {}}
    for f in sorted((ROOT / "tools/it").glob("*.txt")):
        recs, cur = [], None
        for line in f.read_text(encoding="utf-8").replace("\r", "").split("\n"):
            if line.startswith("@"): cur = [line[1:].strip(), []]; recs.append(cur)
            elif cur is not None and line.strip(): cur[1].append(line.strip())
        for key, body in recs:
            if not body: continue
            if key.startswith("@"):
                term = key[1:].strip()
                if term in gloss and len(body) >= 2: tr["g"][term] = [body[0], "\n".join(body[1:])]
            elif key.startswith("#"): tr["c"][key[1:]] = body[0]
            elif re.fullmatch(r"\d{3}", key): tr["s"][key] = body[0]
            elif key in rules:
                t, ex = [], []
                for b in body:
                    m = re.match(r"^Esempio:\s*(.*)$", b)
                    if m: ex.append(m[1])
                    elif ex: ex[-1] += "\n" + b
                    else: t.append(b)
                r = rules[key]
                h = fnv(r["t"] + "\u0001" + "\u0001".join(r["ex"]))
                tr["r"][key] = ["\n".join(t), ex, h]
    return tr

ICONS = {
    "%%X%%": '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    "%%BACK%%": '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    "%%BACKS%%": '<svg class="i s" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    "%%SEARCH%%": '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
}

def main():
    text = (ROOT / "tools/MagicCompRules.txt").read_text(encoding="utf-8")
    assert "</script" not in text.lower()
    rules, gloss = parse_cr(text)
    tr = load_translation(rules, gloss)
    # Tailwind: rigenero src/tw.gen.css se npx c'è, altrimenti uso quello già nel repository
    try:
        subprocess.run(["npx", "-y", "tailwindcss@3.4.17", "-c", str(ROOT / "tools/tailwind.config.js"), "-i", str(ROOT / "src/tw.css"), "-o", str(ROOT / "src/tw.gen.css"), "--minify"],
                       check=True, capture_output=True, timeout=180)
    except Exception as e:
        print("tailwind non rigenerato:", e)
    page = (ROOT / "src/app.html").read_text(encoding="utf-8")
    page = page.replace("/*@@TW@@*/", (ROOT / "src/tw.gen.css").read_text(encoding="utf-8"))
    for k, v in ICONS.items(): page = page.replace(k, v)
    js = json.dumps(tr, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    page = page.replace("@@RULES@@", text).replace("@@TRANSLATION@@", js)
    page = page.replace("/*@@CASES@@*/", (ROOT / "src/cases.js").read_text(encoding="utf-8"))
    print(f"regole tradotte: {len(tr['r'])}/{len(rules)} · glossario: {len(tr['g'])}/{len(gloss)} · sezioni: {len(tr['s'])}")
    if "--artifact" in sys.argv:
        out = pathlib.Path(sys.argv[sys.argv.index("--artifact") + 1]); out.write_text(page, encoding="utf-8"); print("artifact:", out)
    head = """<!doctype html>
<html lang="it" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
"""
    j = page.index("</style>") + len("</style>")
    sw = '<script>if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});</script>'
    out = head + page[:j] + "\n</head>\n<body>\n" + page[j:] + "\n" + sw + "\n</body>\n</html>\n"
    (ROOT / "index.html").write_text(out, encoding="utf-8")
    print("index.html", len(out.encode()), "byte")

main()
