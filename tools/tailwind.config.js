// Tailwind compilato in anticipo (src/tw.gen.css) e incorporato da build.py: l'app resta un file unico che funziona senza rete.
// Niente preflight: gli strati che non usano Tailwind mantengono il loro stile.
const path = require("path");
module.exports = {
  content: [path.join(__dirname, "../src/app.html")],
  corePlugins: { preflight: false },
  theme: { extend: {} },
};
