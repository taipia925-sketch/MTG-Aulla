# MTG Aulla

Segnavita e arbitro di **Magic: The Gathering** in una sola web app, pensata per il telefono.

- **Segnavita (schermata principale)** – da 1 a 6 giocatori, ognuno girato verso il proprio posto al tavolo. Tocca per ±1, tieni premuto per ±10. Formati Standard (20), Commander (40, danno da comandante con partner), Brawl (25/30), Two-Headed Giant (30, veleno 15) o personalizzato. Veleno, energia, esperienza, tassa del comandante, Monarca e Iniziativa, giorno/notte, turni, dadi, moneta, chi inizia e storico della partita con grafico e annullamento.
- **Arbitro** – scrivi la situazione in italiano o in inglese («travolgere contro una creatura con protezione», «pesco da un grimorio vuoto») e l'app trova le regole ufficiali che la decidono, con il numero di paragrafo. Indice completo, glossario, argomenti rapidi (abilità chiave, fasi del turno, pila, livelli, Commander…) e regole salvate.
- **Tutto in italiano** – le 3165 regole, le 147 sezioni e le 741 voci del glossario sono tradotte; con un tocco si vede l'originale inglese. In Impostazioni si sceglie italiano o English.

Funziona senza rete e si installa sul telefono («Aggiungi a schermata Home»).

## Regolamento incorporato

*Comprehensive Rules* in vigore dal **25 settembre 2026** (testo ufficiale in inglese di Wizards of the Coast).

Per aggiornarlo: sostituisci `tools/MagicCompRules.txt` con il nuovo TXT ufficiale ed esegui `python3 tools/build.py`, che ricostruisce `index.html` da `src/app.html` e dalle traduzioni in `tools/it/`. Le regole cambiate restano in inglese finché la traduzione non viene aggiornata (ogni traduzione è legata al testo inglese da cui è stata fatta). Dall'app si può anche caricare un TXT più recente: Impostazioni → «Carica file .txt».

## Note

La traduzione italiana non è ufficiale: in caso di dubbio fa fede il testo inglese. L'app cerca e cita le regole, non le interpreta: in torneo decide l'arbitro.
Magic: The Gathering e le Comprehensive Rules sono © Wizards of the Coast. Progetto amatoriale non affiliato a Wizards of the Coast.
