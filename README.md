# MTG Aulla

Segnavita e arbitro di **Magic: The Gathering** in una sola web app, pensata per il telefono.

- **Segnavita (schermata principale)** – tavolo scuro e opaco; ogni giocatore (da 1 a 6, girato verso il proprio posto) ha un pannello col filo e la filigrana del suo simbolo di mana, il nome in stile carta e i punti vita grandi in Inter. Tocca per ±1, tieni premuto per ±10, trascina su/giù per scorrere. Il pulsante con i cursori apre segnalini (veleno phyrexiano, energia, esperienza, radiazioni, tassa), danni da comandante, colore e nome. Formati Standard, Commander, Brawl, Two-Headed Giant o personalizzato; dadi 3D, moneta, chi inizia, gettoni (Monarca, Iniziativa, giorno/notte), storico con annullamento.
- **Danni da comandante sempre a vista** – in Commander ogni pannello mostra un disco per ogni comandante avversario, col colore e il simbolo di quel giocatore; l'anello si riempie verso 21 e da 15 diventa rosa. Tocco = +1 (toglie anche 1 punto vita, se il collegamento è attivo nelle impostazioni), tieni premuto = −1. A 21 il giocatore è eliminato (regola 704.6c). Con 6 giocatori i comandi centrali si spostano sull'incrocio dei pannelli per non coprire i dischi.
- **Chiedi al Judge** – il pulsante con la bilancia al centro apre un riquadro rapido sopra la partita. Funziona per tutti, senza account e senza rete (tranne la ricerca delle carte su Scryfall). Conosce 930 casi: 642 scritti a mano e 288 generati in modo sistematico da `tools/gen_kb.js` (rimozione × protezioni, quando si può fare cosa, a cosa si può rispondere, cambi di zona, evasione, coppie di parole chiave), sempre (compresi bracket, Game Changers, carte bandite, formati e regole di torneo, che non sono nel regolamento) (`src/kb/`, ognuno con più modi di porre la domanda e le regole che lo decidono, controllati con `node tools/kb_check.js`) più, ricavate in automatico dal regolamento tradotto, tutte le parole chiave (701–702), il glossario e le sezioni: circa 1.400 argomenti. Capisce il gergo da tavolo (ETB, counterare, blink, tutor, fetchland, «+3/+3»…), i nomi inglesi delle parole chiave, alcuni nomi italiani di carte famose e gli errori di battitura. Risponde sempre: dice a quale caso sta rispondendo («Caso già risolto», «Dal regolamento ufficiale» o «Rispondo alla situazione più vicina che conosco») e propone le domande simili. Esami (`node tools/kb_simple.js v <file>`): `kb_simple`, `kb_nuove`, `kb_finale`, `kb_cieco`; sull'ultimo set scritto senza averlo mai usato per l'addestramento il caso giusto era il primo nell'82% delle domande e tra i primi tre nel 96%, prima di aggiungere quelle domande ai casi. L'indice si prepara a pezzi in background dopo l'apertura.
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
