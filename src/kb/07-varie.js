/* Base di conoscenza del Judge (7/7): voci aggiunte dalle vecchie «situazioni tipiche». */
KB.push(
["parole chiave", ["Aizzare: cosa deve fare la creatura aizzata?", "Come funziona goad?", "Una creatura aizzata può attaccare chi l'ha aizzata?", "Goad: per quanto tempo dura?"], "goad goaded attacks each combat player other",
  ["701.15a", "701.15b", "701.15c"],
  "Una creatura aizzata deve attaccare in ogni combattimento, se può, e deve attaccare un giocatore diverso da chi l'ha aizzata, se può. Dura fino al prossimo turno di chi l'ha aizzata. Se nessun altro giocatore è attaccabile può attaccare anche chi l'ha aizzata; se è aizzata da più giocatori deve, se possibile, attaccare qualcuno che non l'ha aizzata."],
["zone", ["Cosa vuol dire che una creatura muore?", "Esiliare una creatura conta come farla morire?", "Una creatura rimbalzata in mano muore?", "Significato di muore"], "dies put into graveyard from battlefield",
  ["700.4"],
  "«Muore» significa «viene messa in un cimitero dal campo di battaglia». Una creatura esiliata, rimessa in mano o nel grimorio non muore, quindi le abilità «quando muore» non si innescano. Va invece bene qualsiasi modo di arrivare al cimitero: distruzione, sacrificio, danno letale, costituzione 0."],
["zone", ["Se cerco una carta nel grimorio devo per forza trovarla?", "Posso dire di non aver trovato la carta anche se c'è?", "Cercare una terra base e non trovarla"], "searching hidden zone stated quality isn't required to find",
  ["701.23b"],
  "Se cerchi in una zona nascosta (come il grimorio) una carta con una certa qualità («una carta terra base», «una creatura»), puoi dire di non averla trovata anche se c'è. Se invece l'effetto chiede semplicemente «una carta» senza qualità, devi prenderla se il grimorio non è vuoto."],
["zone", ["Se la creatura equipaggiata muore cosa succede all'equipaggiamento?", "L'equipaggiamento resta sul campo quando la creatura lascia il gioco?", "Cosa succede all'aura se la creatura incantata muore?", "Equipaggiamento e aura quando la creatura esce dal campo"], "equipment unattached remains battlefield aura graveyard",
  ["704.5n", "704.5m"],
  "L'Equipaggiamento resta sul campo di battaglia, non assegnato: puoi riequipaggiarlo pagando di nuovo il costo. L'Aura invece, non essendo più attaccata a nulla, va nel cimitero del proprietario come azione generata dallo stato."],
);
