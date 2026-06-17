# 🎼 ChordLab

App single-page (HTML+JS vanilla, **zero build, zero dipendenze**) che produce
schede accordi in stile *iReal Pro*: elenco accordi a misure, suddiviso per
**sezioni** (Intro / Verse / Chorus / Bridge / Solo / Outro), con
**trasposizione** di tonalità e **diagrammi/tablatura semplificata** per
**chitarra, ukulele e piano**. Apri `index.html` in qualsiasi browser
(funziona anche da `file://`).

## Funzioni
- 🔎 **Ricerca** brano per titolo / artista / tag nella sidebar.
- 🎚 **Trasposizione** ± semitoni con spelling intelligente (sceglie # o ♭ in
  base alla tonalità di arrivo). La label tonalità si aggiorna in tempo reale.
- 🎸 **Switch strumento**: chitarra · ukulele · piano. I diagrammi si
  ricalcolano per ogni accordo.
- 👆 **Click su un accordo** → popover con diagramma + note che lo compongono.
- 🖨 **Stampa** ottimizzata (nasconde UI, sfondo chiaro).
- 📱 Layout responsive con menu a scomparsa.

## Architettura (sviluppata con un team di agenti)

| File | Modulo | Ruolo |
|---|---|---|
| `engine.js` | `window.ChordEngine` | parsing accordi, scale, **trasposizione** |
| `instruments.js` | `window.Instruments` | diagrammi SVG chitarra/ukulele/piano |
| `songs.js` | `window.SONGS` + `window.SETLISTS` | libreria brani a sezioni + scalette (dati aperti) |
| `index.html` | UI | ricerca, scalette, griglia misure, controlli, integrazione |

Il contratto delle API condivise è in [`CONTRACT.md`](./CONTRACT.md).

## Aggiungere un brano
Aggiungi un oggetto a `window.SONGS` in `songs.js`:

```js
{
  id: 'let-it-be', title: 'Let It Be', artist: 'The Beatles',
  year: '1970', key: 'C', capo: 0, tags: ['beatles'],
  sections: [
    { name: 'Verse',  bars: ['C', 'G', 'Am', 'F'] },
    { name: 'Chorus', bars: ['C', 'G', 'F', 'C'] }
  ]
}
```
Ogni elemento di `bars` è **una misura**; più accordi nella stessa misura si
separano con uno spazio (es. `'Dm/C Bbmaj7 C7'`). I simboli devono essere nel
formato di `ChordEngine.parse` (`F`, `Em7`, `A7`, `Dm/C`, `Bbmaj7`, `A7sus4`…).

## Scalette (setlist)
Puoi raggruppare i brani in **scalette** ordinate e sceglierle dal menu a tendina
nella sidebar (l'opzione *Tutta la libreria* mostra tutto). Una scaletta è solo un
elenco di `id` presenti in `window.SONGS`:

```js
window.SETLISTS = [
  { id: 'rock-set', name: 'Rock Set', songs: ['white-room', 'heroes', /* … */] },
  { id: 'scaletta-italiana', name: 'Scaletta Italiana', songs: ['la-flaca', /* … */] }
];
```
Lo stesso brano può comparire in più scalette (es. *One*, *Wish You Were Here*).

## Notazione note in italiano (Do Re Mi)
Il pulsante **C D E / Do Re Mi** nei controlli commuta la visualizzazione delle note
tra notazione anglosassone (C, D, E…) e **italiana** (Do, Re, Mi…). È solo
*visualizzazione*: il motore lavora sempre internamente in notazione inglese, quindi
trasposizione e diagrammi restano corretti. La conversione tocca griglia accordi,
tonalità, chip della sidebar, popover e titoli dei diagrammi.

## Annotazioni (colori, note, pentagramma)
Il pulsante **🖍 Annota** attiva la modalità annotazioni:
- **tocca una battuta** → pannello per assegnarle un **colore** (per evidenziare es. quando
  entra uno strumento) e/o una **nota di testo** (es. *“entra chitarra”*, *“solo basso”*);
- accanto al nome di ogni sezione compaiono **🎼** (allega un **estratto di pentagramma**/immagine)
  e **📝** (nota di sezione); **✕🎼** rimuove l'immagine.

Colori e note vengono mostrati anche in **modalità Live**. Le annotazioni sono salvate
insieme al brano (localStorage) e incluse nell'**export JSON**, quindi seguono il brano
quando lo reincorpori in `songs.js`. Nel dato sono in `song.anno`:

```js
anno: {
  bars: { '1:4': { c: '#2f4f7a', n: 'entra batteria' } },   // chiave "indiceSezione:indiceBattuta"
  sections: { '2': { note: 'raddoppio chitarre', img: 'data:image/png;base64,…' } }
}
```
Le immagini sono incorporate come data URL: usale per **estratti brevi** (lo spazio locale del
browser è limitato, ~5 MB).

## Modalità Live (tablet sul leggìo)
Il pulsante **🎤 Live** apre una vista da palco, pensata per tablet:
- **menu a scomparsa** a qualsiasi larghezza (anche su tablet), con overlay;
- **accordi molto grandi** e ad alto contrasto, con **A− / A+** per regolare la dimensione;
- **navigazione scaletta** con **◀ / ▶** (scorre i brani della scaletta selezionata, o dell'intera libreria, in modo ciclico);
- trasposizione **− / +** e toggle notazione **C / Do** sempre a portata di pollice;
- i **diagrammi sono nascosti** per massima leggibilità;
- lo **schermo resta acceso** durante il live (Wake Lock, dove supportato dal browser).

Si esce con **✕**. Su tablet/mobile la sidebar è comunque a scomparsa (soglia ≤1024px) anche fuori dalla modalità Live.

## Modificare accordi e creare brani (in-app)
Dalla scheda di un brano, **✏️ Modifica** apre l'editor: puoi correggere gli accordi
(ogni riga = una misura, più accordi separati da spazio), rinominare/riordinare/aggiungere
sezioni, e cambiare titolo/artista/tonalità/capo/tag. I simboli non riconosciuti sono
segnalati in tempo reale. **➕ Nuovo** (sidebar) crea un brano da zero.

Le modifiche si salvano nel browser (**localStorage**, chiave `chordlab.userSongs.v1`) e
sono applicate *sopra* i dati di `songs.js` senza toccarlo: i brani modificati hanno un
puntino • nell'elenco. **↩︎ Ripristina originale** annulla le modifiche a un brano di
libreria; **🗑 Elimina** rimuove un brano creato da te.

Poiché localStorage è per-browser, usa **⬇︎ Esporta / ⬆︎ Importa** (sidebar) per salvare le
modifiche in un file JSON, spostarle su un altro dispositivo o reincorporarle in `songs.js`.

## File unico (standalone) e build
`chordlab-standalone.html` è la versione **tutto-in-uno** (engine + strumenti + brani
in un solo file), comoda da scaricare e aprire senza altri file. Si **rigenera** dai
sorgenti con:

```sh
node build.js
```
Lo script inlinea `engine.js`, `instruments.js` e `songs.js` dentro `index.html`. La
sorgente di verità resta `index.html` + i tre `.js`: dopo ogni modifica, rilancia il
build per aggiornare lo standalone.

## Nota sulla "ricerca sul web"
La richiesta originale prevedeva un agente che recupera la sequenza accordi da
internet. Lo **scraping di siti come Ultimate Guitar è contro i loro ToS** e
riguarda contenuti protetti da copyright, quindi *non* è implementato. La
ricerca attuale opera sulla **libreria locale aperta** (`songs.js`). Per
estendere a fonti legali (es. dataset open / API autorizzate) basta implementare
un adapter che restituisce un oggetto nello schema di `SONGS` e farne il push
nell'array — l'intera UI continua a funzionare senza modifiche.
