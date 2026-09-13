# Magic Zine

Presentazione web sulla storia delle fanzine.

## Avvio
Apri `index.html` nel browser oppure usa un piccolo server locale (es. VS Code Live Server).

## Immagini slide per slide
1. Crea la cartella `images/` nella root del progetto.
2. Inserisci le immagini, per esempio:
   - `images/sniffin-glue-01.jpg`
   - `images/riot-grrrl-01.jpg`
3. Apri `slides.js` e aggiungi i path nell'array `images` della slide:

```js
images: [
  "images/sniffin-glue-01.jpg",
  "images/sniffin-glue-02.jpg"
]
```

Se `images` è vuoto, la slide mostra un placeholder che indica dove andrà l'immagine.

## Comandi
- `→`, `PageDown`, `Spazio`: slide successiva
- `←`, `PageUp`: slide precedente
- swipe su touch
- `F`: fullscreen
- `#slide-N` nell'URL per aprire direttamente una slide

## Struttura
- `index.html` — interfaccia
- `slides.js` — contenuti della lezione
- `app.js` — navigazione/render
- `style.css` — layout e stile
- `images/` — immagini da aggiungere

La presentazione contiene già la traccia in 16 schermate, dall'introduzione alle fanzine contemporanee e al passaggio print ↔ web.
