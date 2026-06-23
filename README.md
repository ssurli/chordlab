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
| `chordpro.js` | `window.ChordPro` | import/export formato ChordPro |
| `crd.js` | `window.CrdImport` | import fogli accordi `.crd` / testo "accordi sopra liriche" |
| `player.js` | `window.ChordPlayer` | player audio Web Audio (riproduzione accordi) |
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

## Suddivisione delle battute (lead-sheet)
Quando una misura contiene **più accordi** (separati da spazio in `bars`), la griglia li
mostra in **celle** all'interno della stessa stanghetta, in stile *iReal Pro*. Per default le
celle hanno **uguale durata** (2 accordi = metà/metà, 4 = quarti), ma ogni accordo può avere una
**durata personalizzata** con il suffisso `*N` (peso intero, default 1):

```js
{ name: 'Verse', bars: ['C*3 G7', 'Am D7', 'F'] }
//  C dura 3/4 e G7 1/4 · Am e D7 metà ciascuno · F intera misura
```

Le celle vengono disegnate **proporzionali al peso** e il bordo esterno è la **stanghetta di
battuta**; i separatori interni (tratteggiati) marcano la suddivisione. Il pulsante **📐 Suddividi**
nei controlli attiva/disattiva questa visualizzazione (di default attiva); spento, gli accordi
tornano affiancati nella battuta. La durata `*N` è riconosciuta anche dall'**editor in-app**, dal
**player audio** e dal generatore di pentagramma; il peso non altera il simbolo dell'accordo
(trasposizione, diagrammi e popover restano corretti). La modalità è rispettata anche in **Live**
e in **stampa**.

## Metriche / time signatures (stile iReal Pro)
Ogni brano ha una **metrica** (campo `meter`, default `4/4`) che ne fissa la **durata della
battuta**: la metrica viene mostrata come **frazione impilata** all'inizio (e solo quando cambia,
come in iReal Pro). La metrica determina i movimenti totali della misura (`4/4`→4, `6/8`→3,
`5/8`→2,5…) e quindi sia la riproduzione audio sia le durate del pentagramma generato.

Per **cambiare metrica a metà brano** basta iniziare una misura con `N/D` (in `bars` o nell'editor):

```js
{ id:'odd', title:'Odd Meters', key:'C', meter:'4/4', sections:[
  { name:'A', bars:['Emaj7', 'G#m7', '6/8 Dbmaj7', 'F#m7', '5/8 Cmaj7 F7'] }
]}
//  parte in 4/4; "6/8 Dbmaj7" passa a 6/8; "5/8 ..." passa a 5/8 (resta in vigore fino al cambio)
```

Il token `N/D` non è confondibile con uno slash-chord (es. `G/B`), che inizia sempre con una nota.
La metrica si conserva nell'**editor**, nell'**export ChordPro** (`{meter: N/D}`) e nell'import
`.crd` (riga `Time:`/`Metrica:`).

## Player audio (ascolto accordi)
Il pannello **🎧 Ascolta** sotto i controlli riproduce la progressione del brano con un piccolo
sintetizzatore **Web Audio** (nessuna dipendenza, nessun file audio): **▶ Play / ⏸ Ferma**,
cursore **Tempo (BPM)** e **🥁 Metro** (click metronomo). Ogni misura dura 4 movimenti suddivisi
tra i suoi accordi (coerente con la suddivisione grafica), gli accordi suonano **trasposti** come
a schermo, e la **battuta in esecuzione viene evidenziata** e portata in vista. Cambiando brano la
riproduzione si ferma.

## Interoperabilità e librerie integrate
- **ChordPro** (`chordpro.js`, nativo): importa/esporta brani nel formato standard ChordPro
  (pulsanti *📄 Importa accordi* nella sidebar e *⤓ ChordPro* nella scheda brano). Supporta sia il
  nostro stile a battute (`| C | G |`) sia il classico `[C]testo`.
- **Fogli accordi `.crd` / testo** (`crd.js`, nativo): lo stesso pulsante *📄 Importa accordi*
  riconosce i file **`.crd`** e i fogli "accordi sopra le liriche" (righe di soli accordi alternate
  a righe di testo). Le righe-accordo diventano misure (le liriche sono ignorate, ChordLab è a sole
  battute); intestazioni `[Verse]`, `Chorus:`, ecc. diventano sezioni, e `Key:`/`Capo:` sono lette
  come metadati. Il formato giusto è scelto **automaticamente** in base al contenuto/estensione.
- **Diagrammi accurati**: i diagrammi di chitarra/ukulele usano le diteggiature reali del
  database aperto [`chords-db`](https://github.com/tombatossals/chords-db) (vendorizzato in
  `vendor/chords-db.js`), con fallback all'euristica interna per accordi non presenti.
- **Pentagramma**: gli estratti in notazione ABC sono renderizzati con
  [`abcjs`](https://github.com/paulrosen/abcjs) (`vendor/abcjs-basic-min.js`). L'editor (in modalità
  **🖍 Annota → 🎼 Spartito → Scrivi**) ha una **barra di inserimento rapido** (note, pause, durate,
  alterazioni, stanghette) e un pulsante **🎼 Genera dagli accordi** che crea uno scheletro di
  pentagramma dalle fondamentali della sezione, con durate proporzionali alla suddivisione.

I file in `vendor/` sono librerie di terze parti (licenza **MIT**) incluse per funzionare
offline; `build.js` le inlinea nello standalone. Per questo `chordlab-standalone.html` pesa
~1,2 MB (include database accordi + motore di notazione).

## Nota sulla "ricerca sul web"
La richiesta originale prevedeva un agente che recupera la sequenza accordi da
internet. Lo **scraping di siti come Ultimate Guitar è contro i loro ToS** e
riguarda contenuti protetti da copyright, quindi *non* è implementato. La
ricerca attuale opera sulla **libreria locale aperta** (`songs.js`). Per
estendere a fonti legali (es. dataset open / API autorizzate) basta implementare
un adapter che restituisce un oggetto nello schema di `SONGS` e farne il push
nell'array — l'intera UI continua a funzionare senza modifiche.
