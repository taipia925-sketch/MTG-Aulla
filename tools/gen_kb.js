// Genera src/kb/20-griglia.js: situazioni ottenute incrociando in modo sistematico effetti, protezioni,
// momenti del turno, azioni di gioco e cambi di zona. Le risposte vengono da tabelle di regole verificate
// sul regolamento (gli id citati sono controllati da tools/kb_check.js).   Uso: node tools/gen_kb.js
const fs = require("fs"), path = require("path");
const out = [];
const add = (cat, qs, kw, ids, a) => out.push([cat, [...new Set(qs)], kw, ids, a]);
const cap = s => s[0].toUpperCase() + s.slice(1);

/* ---------- 1. effetti di rimozione × protezioni ---------- */
const EFF = [
  { k: "destroy", t: true, n: "un effetto che distrugge una creatura bersaglio", s: "distruggi creatura bersaglio", col: "nero", ex: ["Murder", "Doom Blade"], ids: ["701.8a"], kw: "destroy" },
  { k: "destroy", t: false, n: "un effetto che distrugge tutte le creature", s: "distruggi tutte le creature (wrath)", col: "bianco", ex: ["Wrath of God", "Damnation"], noRegen: true, ids: ["701.8a"], kw: "destroy" },
  { k: "exile", t: true, n: "un effetto che esilia una creatura bersaglio", s: "esilia creatura bersaglio", col: "bianco", ex: ["Swords to Plowshares", "Path to Exile"], ids: ["701.13a"], kw: "exile" },
  { k: "exile", t: false, n: "un effetto che esilia tutte le creature", s: "esilia tutte le creature", col: "bianco", ex: ["Farewell", "Merciless Eviction"], ids: ["701.13a"], kw: "exile" },
  { k: "damage", t: true, n: "danno letale a una creatura bersaglio", s: "danno a creatura bersaglio", col: "rosso", ex: ["Lightning Bolt", "Fulmine"], ids: ["704.5g"], kw: "damage" },
  { k: "damage", t: false, n: "danno letale a tutte le creature", s: "danno a tutte le creature", col: "rosso", ex: ["Pyroclasm", "Blasphemous Act"], ids: ["704.5g"], kw: "damage" },
  { k: "minus", t: true, n: "un -X/-X letale a una creatura bersaglio", s: "-X/-X a creatura bersaglio", col: "nero", ex: ["Dismember", "Grasp of Darkness"], ids: ["704.5f"], kw: "toughness" },
  { k: "minus", t: false, n: "un -X/-X letale a tutte le creature", s: "-X/-X a tutte le creature", col: "nero", ex: ["Toxic Deluge", "Massacre Wurm"], ids: ["704.5f"], kw: "toughness" },
  { k: "sac", t: false, n: "un effetto che fa sacrificare una creatura al giocatore", s: "sacrificio (edict)", col: "nero", ex: ["Diabolic Edict", "Fleshbag Marauder"], ids: ["701.21a"], kw: "sacrifice" },
  { k: "bounce", t: true, n: "un effetto che rimette in mano una creatura bersaglio", s: "rimettere in mano (bounce)", col: "blu", ex: ["Unsummon", "Cyclonic Rift"], ids: ["400.7"], kw: "object zone" },
  { k: "steal", t: true, n: "un effetto che prende il controllo di una creatura bersaglio", s: "rubare (prendere il controllo)", col: "blu", ex: ["Control Magic", "Threaten"], ids: ["613.1b"], kw: "layer effects applied" },
];
const BASE = { destroy: "viene distrutta e va nel cimitero", exile: "viene esiliata", damage: "subisce danno letale e viene distrutta", minus: "va nel cimitero per costituzione 0 o meno",
  sac: "il giocatore la può scegliere come creatura da sacrificare (e deve farlo se è l'unica)", bounce: "torna in mano al proprietario", steal: "ne prendi il controllo" };
const PRO = [
  { k: "ind", n: "indistruttibile", al: ["indistruttibile", "indestructible"], ids: ["702.12b"], kw: "indestructible" },
  { k: "hex", n: "anti-malocchio", al: ["anti-malocchio", "hexproof"], ids: ["702.11b"], kw: "hexproof" },
  { k: "shr", n: "velo", al: ["velo", "shroud"], ids: ["702.18a"], kw: "shroud" },
  { k: "pro", n: "protezione dal colore della magia", al: ["protezione", "protezione dal colore"], ids: ["702.16b", "702.16e"], kw: "protection" },
  { k: "ward", n: "salvaguardia", al: ["salvaguardia", "ward"], ids: ["702.21a"], kw: "ward" },
  { k: "reg", n: "uno scudo di rigenerazione", al: ["rigenerazione", "rigenerare"], ids: ["701.19a"], kw: "regenerates" },
  { k: "pha", n: "intermittenza (fasata via)", al: ["fasata via", "phasing"], ids: ["702.26b"], kw: "phases" },
  { k: "umb", n: "un'Aura con armatura d'ombra", al: ["armatura d'ombra", "totem armor"], ids: ["702.89a"], kw: "umbra" },
  { k: "shd", n: "un segnalino scudo", al: ["segnalino scudo", "shield counter"], ids: ["122.1c"], kw: "shield" },
];
function verdict(e, p) {
  const base = BASE[e.k], opp = "Se l'effetto è di un avversario";
  switch (p.k) {
    case "ind":
      if (e.k === "destroy") return "Resta: indistruttibile impedisce la distruzione.";
      if (e.k === "damage") return "Resta: il danno viene segnato, ma una creatura indistruttibile non viene distrutta dal danno letale.";
      if (e.k === "exile") return "Viene esiliata: esiliare non è distruggere, indistruttibile non la protegge.";
      if (e.k === "minus") return "Muore: con costituzione 0 o meno va nel cimitero, e non è una distruzione, quindi indistruttibile non la salva.";
      if (e.k === "sac") return "Può essere sacrificata: sacrificare non è distruggere.";
      if (e.k === "bounce") return "Torna in mano: indistruttibile non lo impedisce.";
      return "Ne prendi il controllo: indistruttibile non c'entra.";
    case "hex":
      if (e.k === "sac") return "Funziona: l'effetto bersaglia (o riguarda) il giocatore, non la creatura, e il giocatore può scegliere anche quella con anti-malocchio.";
      if (e.t) return `${opp} non può sceglierla come bersaglio, quindi non funziona su di lei. Se l'effetto è tuo puoi bersagliarla normalmente: ${base}.`;
      return `Funziona: l'effetto non bersaglia, quindi anti-malocchio non protegge. La creatura ${base}.`;
    case "shr":
      if (e.k === "sac") return "Funziona: non viene bersagliata la creatura, quindi il giocatore può sacrificarla.";
      if (e.t) return "Non funziona: nessuno, nemmeno tu, può sceglierla come bersaglio.";
      return `Funziona: l'effetto non bersaglia, quindi velo non protegge. La creatura ${base}.`;
    case "pro":
      if (e.t) return "Non funziona: non può essere bersagliata da magie o abilità di quel colore (e il danno di quel colore verrebbe comunque prevenuto).";
      if (e.k === "damage") return "Non subisce nulla: il danno di fonti di quel colore viene prevenuto.";
      if (e.k === "sac") return "Funziona: la protezione non ferma il sacrificio, che sceglie il giocatore.";
      return `Funziona: la protezione non ferma gli effetti che non bersagliano. La creatura ${base}.`;
    case "ward":
      if (e.t) return `${opp}, salvaguardia si innesca: se chi lo controlla non paga il costo di salvaguardia, l'effetto viene neutralizzato; se paga, si risolve normalmente e la creatura ${base}. Sulle tue magie salvaguardia non si innesca.`;
      return `Funziona: salvaguardia si innesca solo quando la creatura diventa bersaglio. La creatura ${base}.`;
    case "reg":
      if (e.k === "destroy") return e.noRegen ? "Muore: la carta dice che le creature «non possono essere rigenerate»." : "Viene rigenerata: invece di essere distrutta si TAPpa, viene rimossa dal combattimento e perde tutto il danno segnato.";
      if (e.k === "damage") return "Viene rigenerata: la distruzione per danno letale viene sostituita (si TAPpa, esce dal combattimento, perde il danno).";
      if (e.k === "minus") return "Muore: la costituzione 0 non è una distruzione e la rigenerazione non la può sostituire.";
      return `La rigenerazione sostituisce solo la distruzione, quindi non aiuta: la creatura ${base}.`;
    case "pha":
      return e.k === "sac" ? "Non può essere sacrificata: una creatura fasata via per il gioco non esiste finché non fasa di nuovo." : "Non succede nulla: una creatura fasata via per il gioco non esiste, quindi non può essere bersagliata né colpita dagli effetti globali. Torna nella sottofase di STAP del suo controllore.";
    case "umb":
      if (e.k === "destroy") return "Resta: invece di essere distrutta, si rimuove tutto il danno segnato e si distrugge l'Aura con armatura d'ombra (anche contro «non può essere rigenerata», perché non è una rigenerazione).";
      if (e.k === "damage") return "Resta: invece di morire per il danno letale si rimuove il danno e si distrugge l'Aura con armatura d'ombra.";
      return `L'armatura d'ombra sostituisce solo la distruzione, quindi non aiuta: la creatura ${base}.`;
    case "shd":
      if (e.k === "destroy") return "Resta: invece di essere distrutta perde un segnalino scudo.";
      if (e.k === "damage") return "Resta: il danno viene prevenuto e si rimuove un segnalino scudo.";
      return `Il segnalino scudo protegge solo da danno e distruzione, quindi non aiuta: la creatura ${base}.`;
  }
}
for (const e of EFF) for (const p of PRO) {
  const qs = [`${e.ex[0]} su una creatura con ${p.al[0]}`, `${cap(e.s)} contro ${p.al[0]}`, `${e.ex[1]} e ${p.al[1]}`, `Una creatura con ${p.al[0]} sopravvive a ${e.n}?`, `${cap(p.al[0])} contro ${e.s}`];
  if (p.k === "pro") qs.push(`${e.ex[1]} su una creatura con protezione dal ${e.col}`, `${cap(e.s)} su protezione dal ${e.col}`);
  add("griglia: rimozione", qs, `${p.kw} ${e.kw}`, [...p.ids, ...e.ids], `${cap(e.n)} (come ${e.ex.join(" o ")}) contro una creatura con ${p.n}. ${verdict(e, p)}`);
}

/* ---------- 2. quando posso farlo: azioni × momenti del turno ---------- */
const ACT = [
  { v: "lanciare un istantaneo", s: "istantaneo", sp: "inst", ids: ["117.1a"] },
  { v: "lanciare una stregoneria", s: "stregoneria", sp: "sorc", ids: ["307.1"] },
  { v: "lanciare una creatura", s: "creatura", sp: "sorc", ids: ["302.1"] },
  { v: "lanciare una creatura con lampo", s: "creatura con lampo", sp: "inst", ids: ["702.8a"] },
  { v: "lanciare un artefatto o un incantesimo", s: "artefatto o incantesimo", sp: "sorc", ids: ["117.1a"] },
  { v: "lanciare un planeswalker", s: "planeswalker", sp: "sorc", ids: ["117.1a"] },
  { v: "attivare un'abilità di una creatura", s: "abilità attivata", sp: "inst", ids: ["117.1b"] },
  { v: "usare un'abilità di fedeltà di un planeswalker", s: "abilità di fedeltà", sp: "loy", ids: ["606.3"] },
  { v: "equipaggiare", s: "equipaggiare", sp: "sorc", ids: ["702.6a"] },
  { v: "giocare una terra", s: "terra", sp: "land", ids: ["305.1"] },
  { v: "ciclare una carta", s: "ciclo", sp: "inst", ids: ["702.29a"] },
];
const WHEN = [
  { w: "nel mio mantenimento", k: "my", main: false }, { w: "nella mia sottofase di acquisizione", k: "my", main: false },
  { w: "nella mia prima fase principale", k: "my", main: true }, { w: "durante il mio combattimento", k: "my", main: false },
  { w: "nella mia seconda fase principale", k: "my", main: true }, { w: "nella mia sottofase finale", k: "my", main: false },
  { w: "nel turno dell'avversario", k: "opp", main: false }, { w: "in risposta a una magia dell'avversario", k: "resp", main: false },
  { w: "durante la sottofase di STAP", k: "untap", main: false }, { w: "durante la sottofase di cancellazione", k: "cleanup", main: false },
];
for (const a of ACT) for (const w of WHEN) {
  let ok, why, ids = [...a.ids];
  if (w.k === "untap") { ok = false; why = "durante lo STAP nessun giocatore riceve la priorità, quindi non si può lanciare né attivare nulla"; ids.push("502.4"); }
  else if (w.k === "cleanup") { ok = false; why = "normalmente nella cancellazione nessuno riceve la priorità (succede solo se in quel momento si innesca qualcosa)"; ids.push("514.3"); }
  else if (a.sp === "inst") { ok = true; why = "si può fare in qualsiasi momento in cui hai la priorità, anche nel turno avversario e in risposta"; }
  else if (a.sp === "land") { ok = w.main; why = ok ? "nella tua fase principale, con la pila vuota, se in questo turno non hai ancora giocato una terra" : "una terra si gioca solo nella tua fase principale, con la pila vuota (una per turno), e non si può giocare in risposta"; }
  else if (a.sp === "loy") { ok = w.main; why = ok ? "nella tua fase principale, con la pila vuota, una sola abilità per planeswalker per turno" : "le abilità di fedeltà si usano solo nella tua fase principale, con la pila vuota, una per turno per planeswalker"; }
  else { ok = w.main; why = ok ? "nella tua fase principale, con la pila vuota" : "si può fare solo nella tua fase principale con la pila vuota (velocità stregoneria), quindi mai in risposta né nel turno avversario, a meno di un effetto come lampo"; }
  const kwT = "priority instant main phase stack empty land loyalty equip cycling untap cleanup flash activate";
  add("griglia: tempi", [`Posso ${a.v} ${w.w}?`, `${cap(a.s)} ${w.w}`, `Si può ${a.v} ${w.w}?`], kwT, ids, `${ok ? "Sì" : "No"}: ${why}.`);
}

/* ---------- 3. si può rispondere a…? ---------- */
const RESP = [
  ["una magia lanciata", true, "è in pila: puoi rispondere con istantanei e abilità prima che si risolva", ["405.1"], "stack"],
  ["un'abilità attivata", true, "va in pila come una magia (salvo le abilità di mana)", ["602.2"], "stack"],
  ["un'abilità innescata", true, "va in pila la prossima volta che un giocatore riceverebbe la priorità", ["603.3"], "triggered"],
  ["un'abilità di mana", false, "non usa la pila: si risolve subito", ["605.3b"], "mana"],
  ["una terra giocata", false, "giocare una terra è un'azione speciale e non usa la pila; puoi però rispondere alle abilità che si innescano quando entra", ["116.2a"], "special"],
  ["una creatura girata a faccia in su (metamorfosi, travestimento)", false, "girarla è un'azione speciale che non usa la pila; puoi rispondere alle abilità che si innescano quando viene girata", ["116.2b"], "special"],
  ["il pagamento di un costo (es. un sacrificio)", false, "i costi si pagano mentre lanci o attivi: quando puoi rispondere sono già pagati", ["601.2h"], "cost"],
  ["un'azione generata dallo stato (es. una creatura che muore per il danno)", false, "le azioni generate dallo stato non usano la pila e avvengono prima che qualcuno riceva la priorità", ["704.3"], "game checks conditions"],
  ["il danno da combattimento", false, "il danno viene inflitto senza usare la pila; si può agire prima, nella sottofase dei bloccanti, o dopo", ["510.2"], "combat"],
  ["la dichiarazione degli attaccanti", false, "è un'azione del turno; dopo che gli attaccanti sono dichiarati però tutti ricevono la priorità e possono agire", ["508.2"], "priority"],
  ["la pescata del turno", false, "pescare nella sottofase di acquisizione è un'azione del turno; dopo la pescata i giocatori ricevono la priorità", ["504.1"], "draw"],
  ["un'abilità di fedeltà di un planeswalker", true, "è un'abilità attivata e va in pila (il costo in fedeltà però è già pagato)", ["606.3"], "loyalty"],
  ["l'abilità di equipaggiare (all'equipaggiamento)", true, "è un'abilità attivata e va in pila: puoi per esempio eliminare la creatura bersaglio", ["702.6a"], "equip"],
  ["il ciclo di una carta", true, "l'abilità di ciclo va in pila (la carta però è già scartata come costo)", ["702.29a"], "cycling"],
  ["l'esilio di una carta con sospendere o presagio", false, "è un'azione speciale e non usa la pila", ["116.2f"], "special"],
  ["una magia che non può essere neutralizzata", true, "è comunque in pila: puoi rispondere, ma non riuscirai a neutralizzarla", ["405.1"], "stack"],
  ["una magia con frazione di secondo (split second)", false, "finché è in pila nessuno può lanciare magie né attivare abilità non di mana", ["702.61a"], "split"],
];
for (const [what, ok, why, ids, kw] of RESP)
  add("griglia: rispondere", [`Si può rispondere a ${what}?`, `Posso rispondere a ${what}?`, `${cap(what)}: si può rispondere?`], kw, ids, `${ok ? "Sì" : "No"}: ${why}.`);

/* ---------- 4. cambi di zona × cosa resta ---------- */
const prep = n => n.replace(/^(i|le|gli|il|lo|la) /, (m, a) => ({ i: "ai ", le: "alle ", gli: "agli ", il: "al ", lo: "allo ", la: "alla " })[a]).replace(/^l'/, "all'");
const ZA = [
  { k: "die", w: "muore", alt: "morta", ids: ["400.7"] }, { k: "blink", w: "viene esiliata e rimessa sul campo (blink)", alt: "blinkata", ids: ["400.7"] },
  { k: "bounce", w: "torna in mano e viene rilanciata", alt: "rimbalzata in mano", ids: ["400.7"] }, { k: "phase", w: "si fasa via e poi rientra", alt: "fasata via", ids: ["702.26d"] },
  { k: "tf", w: "si trasforma (gira sull'altra faccia)", alt: "trasformata", ids: ["712.18"] },
];
const ZP = [
  { k: "ctr", n: "i segnalini" }, { k: "aura", n: "le Aure attaccate" }, { k: "eq", n: "gli Equipaggiamenti" }, { k: "dmg", n: "il danno segnato" },
  { k: "eot", n: "i bonus «fino alla fine del turno»" }, { k: "tap", n: "lo stato TAPpato" }, { k: "ctl", n: "il controllo (se era rubata)" },
  { k: "sick", n: "la debolezza da evocazione" }, { k: "copy", n: "l'effetto di copia (se era un Clone)" },
];
function zv(a, p) {
  const nw = "Diventa un oggetto nuovo, senza memoria del precedente";
  if (a.k === "tf") return { ctr: "Restano: trasformarsi non crea un oggetto nuovo.", aura: "Restano attaccate (se la nuova faccia è ancora un oggetto legale per l'Aura).", eq: "Restano attaccati se la nuova faccia è ancora una creatura.",
    dmg: "Resta segnato.", eot: "Continuano ad applicarsi: è lo stesso oggetto.", tap: "Resta com'era (TAPpata o STAPpata).", ctl: "Resta a chi la controllava.", sick: "Non cambia nulla: è la stessa creatura.", copy: "Resta: è lo stesso oggetto." }[p.k];
  if (a.k === "phase") return { ctr: "Restano: fasarsi non cambia zona.", aura: "Si fasano via insieme alla creatura e rientrano ancora attaccate.", eq: "Si fasano via insieme alla creatura e rientrano ancora attaccati.",
    dmg: "Il danno viene comunque rimosso nella cancellazione, anche mentre è fasata via.", eot: "Possono scadere mentre è fasata via: in quel caso quando rientra non valgono più.", tap: "Rientra com'era, TAPpata o STAPpata (poi nello STAP si STAPpa normalmente).",
    ctl: "Resta allo stesso controllore.", sick: "Non ottiene debolezza da evocazione: non è entrata, è solo rientrata.", copy: "Resta: è lo stesso oggetto." }[p.k];
  const r = { ctr: `Si perdono. ${nw}.`, aura: "Vanno nel cimitero del proprietario, perché non sono più attaccate a nulla.", eq: "Restano sul campo, non assegnati: puoi riequipaggiarli pagando il costo.",
    dmg: `Sparisce. ${nw}.`, eot: `Finiscono. ${nw}.`, tap: "Rientra STAPpata, a meno che l'effetto dica il contrario.", ctl: "Torna normalmente sotto il controllo del proprietario.",
    sick: "Ce l'ha di nuovo: è appena entrata, quindi non può attaccare né usare {T} in questo turno (salvo rapidità).", copy: "Rientra come Clone e sceglie di nuovo cosa copiare (o niente)." };
  if (a.k === "die" && ["tap", "ctl", "sick", "copy"].includes(p.k)) return null;
  return r[p.k];
}
for (const a of ZA) for (const p of ZP) {
  const v = zv(a, p); if (!v) continue;
  const kw = a.k === "tf" ? "transforms new object" : a.k === "phase" ? "phasing zones control" : "object zone new";
  add("griglia: cambi di zona", [`Cosa succede ${prep(p.n)} se la creatura ${a.w}?`, `${cap(p.n)} restano se la creatura ${a.w}?`, `Creatura che ${a.w}: ${p.n}`, `La creatura ${a.alt} perde ${p.n}?`, `Se la creatura viene ${a.alt} ${p.n} tornano?`], kw, a.ids, `Se la creatura ${a.w}, ${p.n}: ${v}`);
}

/* ---------- 5. evasione: chi può bloccare ---------- */
const EV = [
  ["ombra", "shadow", "Può essere bloccata solo da creature con ombra, e una creatura con ombra può bloccare solo creature con ombra.", ["702.28b"]],
  ["cavalcare", "horsemanship", "Può essere bloccata solo da creature con cavalcare; una creatura con cavalcare può però bloccare chiunque.", ["702.31b"]],
  ["intimidire", "intimidate", "Può essere bloccata solo da creature artefatto e/o da creature che hanno almeno un colore in comune con lei.", ["702.13b"]],
  ["paura", "fear", "Può essere bloccata solo da creature artefatto e/o nere.", ["702.36b"]],
  ["passaterre (es. passa-isole)", "landwalk", "Non può essere bloccata finché il giocatore in difesa controlla almeno una terra del tipo indicato (per esempio un'Isola per passa-isole).", ["702.14c"]],
  ["furtività", "skulk", "Non può essere bloccata da creature con forza maggiore della sua.", ["702.118b"]],
  ["protezione da un colore", "protection", "Non può essere bloccata da creature di quel colore.", ["702.16f"]],
  ["minacciare", "menace", "Non può essere bloccata se non da due o più creature.", ["702.111b"]],
  ["volare", "flying", "Può essere bloccata solo da creature con volare e/o raggiungere.", ["702.9b"]],
];
for (const [it, en, a, ids] of EV)
  add("griglia: evasione", [`Chi può bloccare una creatura con ${it}?`, `Come funziona ${it} in combattimento?`, `${cap(it)}: quali creature possono bloccarla?`, `${en} chi può bloccare`], en, ids, `Una creatura con ${it}: ${a}`);

/* ---------- 6. coppie di parole chiave in combattimento ---------- */
const PAIRS = [
  ["doppio attacco", "travolgere", "Infligge danno in entrambe le sottofasi. Nella prima assegna danno letale al bloccante e il resto al giocatore; nella seconda, se il bloccante è morto, tutto il danno va al giocatore; se è ancora vivo, conta il danno già segnato e il resto passa.", ["702.4b", "702.19b"], "double strike trample"],
  ["doppio attacco", "tocco letale", "Nella prima sottofase uccide il bloccante con anche 1 solo danno (salvo indistruttibile); nella seconda, se non è bloccata da altri e non ha travolgere, non infligge altro danno.", ["702.4b", "702.2b"], "double strike deathtouch"],
  ["attacco improvviso", "travolgere", "Infligge danno nella prima sottofase: se uccide i bloccanti, quelli non le infliggono danno. Assegna danno letale ai bloccanti e il resto al giocatore.", ["702.7b", "702.19b"], "first strike trample"],
  ["legame vitale", "infettare", "Il danno di una creatura con infettare dà segnalini veleno (ai giocatori) o -1/-1 (alle creature), ma è comunque danno: legame vitale fa guadagnare altrettanti punti vita.", ["702.15b", "702.90b"], "lifelink infect damage"],
  ["avvizzire", "indistruttibile", "Avvizzire mette segnalini -1/-1 invece di segnare danno: anche una creatura indistruttibile muore quando la sua costituzione arriva a 0.", ["120.3d", "704.5f"], "wither toughness"],
  ["infettare", "indistruttibile", "Infettare sulle creature mette segnalini -1/-1: una creatura indistruttibile non viene distrutta, ma muore per costituzione 0 quando i segnalini la portano a 0.", ["120.3d", "704.5f"], "infect toughness"],
  ["travolgere", "indistruttibile", "Devi comunque assegnare al bloccante indistruttibile danno pari alla sua costituzione (danno letale) prima di far passare il resto: indistruttibile non cambia quanto danno serve.", ["702.19b", "702.12b"], "trample indestructible lethal"],
  ["tocco letale", "più bloccanti", "Una creatura con tocco letale bloccata da più creature può dividere il danno dando anche solo 1 danno a ciascuna: ognuna muore.", ["702.2c", "510.1c"], "deathtouch blocking"],
  ["tocco letale", "un bloccante che blocca più attaccanti", "Una creatura con tocco letale che blocca più attaccanti (se può) li uccide tutti anche con 1 danno ciascuno.", ["702.2b", "510.1d"], "deathtouch blocking"],
  ["attacco improvviso", "attacco improvviso", "Se entrambe hanno attacco improvviso infliggono danno insieme nella prima sottofase, come in un combattimento normale.", ["702.7b", "510.4"], "first strike"],
  ["cautela", "rapidità", "Con rapidità può attaccare subito e con cautela attaccando non si TAPpa: può attaccare e poi bloccare nel turno avversario.", ["702.10b", "702.20b"], "haste vigilance"],
  ["legame vitale", "doppio attacco contro un bloccante", "Guadagni punti vita per il danno inflitto in ciascuna sottofase: se il bloccante muore nella prima e la creatura non ha travolgere, nella seconda non infligge danno e non guadagni altro.", ["702.15b", "702.4b"], "lifelink double strike"],
];
for (const [a, b, ans, ids, kw] of PAIRS)
  add("griglia: combattimento", [`${cap(a)} e ${b} insieme`, `Creatura con ${a} contro ${b}`, `Come interagiscono ${a} e ${b}?`], kw, ids, ans);

const file = "/* GENERATO da tools/gen_kb.js: non modificare a mano. Situazioni ottenute incrociando effetti, protezioni,\n   momenti del turno, azioni, cambi di zona e parole chiave. */\nKB.push(\n" +
  out.map(e => JSON.stringify(e)).join(",\n") + "\n);\n";
fs.writeFileSync(path.join(__dirname, "../src/kb/20-griglia.js"), file);
console.log("voci generate:", out.length);
