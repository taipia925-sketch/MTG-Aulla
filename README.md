# MTG Aulla

Segnavita e arbitro di **Magic: The Gathering** in una sola web app, pensata per il telefono.

- **Segnavita (schermata principale)** – tavolo scuro e opaco; ogni giocatore (da 1 a 6, girato verso il proprio posto) ha un pannello col filo e la filigrana del suo simbolo di mana, il nome in stile carta e i punti vita grandi in Inter. Tocca per ±1, tieni premuto per ±10, trascina su/giù per scorrere. Il pulsante con i cursori apre segnalini (veleno phyrexiano, energia, esperienza, radiazioni, tassa), danni da comandante, colore e nome. Formati Standard, Commander, Brawl, Two-Headed Giant o personalizzato; dadi 3D, moneta, chi inizia, gettoni (Monarca, Iniziativa, giorno/notte), storico con annullamento.
- **Chiedi al Judge** – il pulsante con la bilancia al centro apre un riquadro rapido sopra la partita. Funziona per tutti, senza account e senza rete (tranne la ricerca delle carte su Scryfall): risponde da una base di 282 casi risolti (`src/kb/`, ognuno con più modi di porre la domanda e le regole che lo decidono, controllati con `node tools/kb_check.js`) e mostra sempre a quale caso sta rispondendo. Se non trova un caso abbastanza simile lo dice («Nessun caso certo») invece di tirare a indovinare, e propone domande simili e le regole sull'argomento. I casi si sfogliano anche per argomento; scheda «Carta» per cercare una carta al volo. Precisione su domande riformulate mai viste (`node tools/kb_eval.js "" kb_hold`): 86% del caso giusto al primo colpo, 95% tra i primi tre; con la soglia di sicurezza, le risposte mostrate sono giuste in circa il 95% dei casi.
- **Arbitro** – scrivi la situazione in italiano o in inglese («travolgere contro una creatura con protezione», «pesco da un grimorio vuoto») e l'app trova le regole ufficiali che la decidono, con il numero di paragrafo. Indice completo, glossario, argomenti rapidi (abilità chiave, fasi del turno, pila, livelli, Commander…) e regole salvate.
- **Tutto in italiano** – le 3165 regole, le 147 sezioni e le 741 voci del glossario sono tradotte; con un tocco si vede l'originale inglese. In Impostazioni si sceglie italiano o English.

Funziona senza rete e si installa sul telefono («Aggiungi a schermata Home»).

## Regolamento incorporato

*Comprehensive Rules* in vigore dal **25 settembre 2026** (testo ufficiale in inglese di Wizards of the Coast).

Per aggiornarlo: sostituisci `tools/MagicCompRules.txt` con il nuovo TXT ufficiale ed esegui `python3 tools/build.py`, che ricostruisce `index.html` da `src/app.html` e dalle traduzioni in `tools/it/`. Le regole cambiate restano in inglese finché la traduzione non viene aggiornata (ogni traduzione è legata al testo inglese da cui è stata fatta). Dall'app si può anche caricare un TXT più recente: Impostazioni → «Carica file .txt».

## Note

La traduzione italiana non è ufficiale: in caso di dubbio fa fede il testo inglese. L'app cerca e cita le regole, non le interpreta: in torneo decide l'arbitro.
Magic: The Gathering e le Comprehensive Rules sono © Wizards of the Coast. Progetto amatoriale non affiliato a Wizards of the Coast.

## Sviluppo

Lo stile del tavolo usa Tailwind CSS compilato in anticipo (`src/tw.gen.css`, configurazione in `tools/tailwind.config.js`): `python3 tools/build.py` lo rigenera se `npx` è disponibile e lo incorpora in `index.html`, che resta un file unico utilizzabile senza rete.
