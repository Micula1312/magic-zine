const app = document.querySelector('#app');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const fullscreenBtn = document.querySelector('#fullscreenBtn');
const counter = document.querySelector('#counter');
const connectFolderBtn = document.querySelector('#connectFolderBtn');
const exportBtn = document.querySelector('#exportBtn');
const builderStatus = document.querySelector('#builderStatus');

let current = 0;
let projectDir = null;
const localMedia = new Map();

function pad(n) { return String(n).padStart(2, '0'); }
function safeName(name) { return name.toLowerCase().replace(/[^a-z0-9._-]+/gi, '-'); }

function imageMarkup(slide) {
  const saved = slide.images || [];
  const temp = localMedia.get(slide.id) || [];
  const all = [...saved.map(src => ({src, persisted:true})), ...temp];
  if (!all.length) {
    return `<div class="image-placeholder drop-zone" data-drop-zone>
      <span>DROP YOUR IMAGE HERE</span>
      <small>trascina JPG / PNG / WEBP. Se colleghi la cartella del progetto, il file viene salvato davvero in /images/${slide.id}/</small>
    </div>`;
  }
  return `<div class="media-grid drop-zone" data-drop-zone>${all.map((item, i) => `
    <figure class="media" draggable="true" data-media-index="${i}">
      <img src="${item.src}" alt="" />
      <button class="media-remove" data-remove="${i}" aria-label="Rimuovi immagine">×</button>
      <span class="media-handle">DRAG</span>
    </figure>`).join('')}</div>`;
}

function refsMarkup(refs = []) {
  if (!refs.length) return '';
  return `<div class="slide-refs">${refs.map(ref => `<a href="${ref.url}" target="_blank" rel="noreferrer">${ref.label} ↗</a>`).join('')}</div>`;
}

function render() {
  const slide = window.SLIDES[current];
  document.body.dataset.layout = slide.layout;
  app.innerHTML = `
    <section class="slide slide-${slide.layout}" data-id="${slide.id}">
      <header class="slide-meta">
        <span>${slide.kicker || ''}${slide.author ? ` · ${slide.author}` : ''}</span>
        <span>${slide.year || ''}</span>
      </header>
      <div class="slide-copy">
        <h1>${slide.title}</h1>
        ${slide.text ? `<p>${slide.text}</p>` : ''}
        ${slide.quote ? `<blockquote>${slide.quote}</blockquote>` : ''}
        ${refsMarkup(slide.refs)}
      </div>
      <div class="slide-media">${imageMarkup(slide)}</div>
    </section>`;
  counter.textContent = `${pad(current + 1)} / ${pad(window.SLIDES.length)}`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === window.SLIDES.length - 1;
  location.hash = `slide-${current + 1}`;
  bindMediaUI();
}

async function connectProjectFolder() {
  if (!window.showDirectoryPicker) {
    builderStatus.textContent = 'browser senza accesso cartella: usa EXPORT SLIDES.JS';
    return;
  }
  try {
    projectDir = await window.showDirectoryPicker({mode:'readwrite'});
    builderStatus.textContent = `collegata: ${projectDir.name}`;
    connectFolderBtn.textContent = 'CARTELLA COLLEGATA ✓';
  } catch (_) {
    builderStatus.textContent = 'collegamento annullato';
  }
}

async function persistFile(slide, file) {
  if (!projectDir) return null;
  const imagesDir = await projectDir.getDirectoryHandle('images', {create:true});
  const slideDir = await imagesDir.getDirectoryHandle(slide.id, {create:true});
  let filename = safeName(file.name || `image-${Date.now()}.jpg`);
  if (!/\.[a-z0-9]+$/i.test(filename)) filename += '.jpg';
  const handle = await slideDir.getFileHandle(filename, {create:true});
  const writable = await handle.createWritable();
  await writable.write(file);
  await writable.close();
  return `images/${slide.id}/${filename}`;
}

async function writeSlidesFile() {
  if (!projectDir) return;
  const handle = await projectDir.getFileHandle('slides.js', {create:true});
  const writable = await handle.createWritable();
  await writable.write(serializeSlides());
  await writable.close();
  builderStatus.textContent = 'salvato: immagini + slides.js';
}

async function addFiles(files) {
  const slide = window.SLIDES[current];
  const valid = [...files].filter(f => f.type.startsWith('image/'));
  if (!valid.length) return;
  for (const file of valid) {
    if (projectDir) {
      const path = await persistFile(slide, file);
      slide.images = [...(slide.images || []), path];
    } else {
      const url = URL.createObjectURL(file);
      const temp = localMedia.get(slide.id) || [];
      temp.push({src:url, file, persisted:false});
      localMedia.set(slide.id, temp);
    }
  }
  if (projectDir) await writeSlidesFile();
  else builderStatus.textContent = 'preview locale: collega la cartella per salvarle davvero';
  render();
}

function bindMediaUI() {
  const zone = document.querySelector('[data-drop-zone]');
  if (!zone) return;
  ['dragenter','dragover'].forEach(type => zone.addEventListener(type, e => {
    e.preventDefault(); zone.classList.add('is-dragging');
  }));
  ['dragleave','drop'].forEach(type => zone.addEventListener(type, e => {
    e.preventDefault(); zone.classList.remove('is-dragging');
  }));
  zone.addEventListener('drop', e => addFiles(e.dataTransfer.files));

  document.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', async e => {
    e.stopPropagation();
    const index = Number(btn.dataset.remove);
    const slide = window.SLIDES[current];
    const persistedCount = (slide.images || []).length;
    if (index < persistedCount) slide.images.splice(index, 1);
    else {
      const temp = localMedia.get(slide.id) || [];
      const tempIndex = index - persistedCount;
      URL.revokeObjectURL(temp[tempIndex]?.src);
      temp.splice(tempIndex, 1);
      localMedia.set(slide.id, temp);
    }
    if (projectDir) await writeSlidesFile();
    render();
  }));

  let draggedIndex = null;
  document.querySelectorAll('[data-media-index]').forEach(el => {
    el.addEventListener('dragstart', () => { draggedIndex = Number(el.dataset.mediaIndex); });
    el.addEventListener('dragover', e => e.preventDefault());
    el.addEventListener('drop', async e => {
      e.preventDefault();
      const targetIndex = Number(el.dataset.mediaIndex);
      const slide = window.SLIDES[current];
      if (draggedIndex === null || draggedIndex === targetIndex) return;
      if (draggedIndex < slide.images.length && targetIndex < slide.images.length) {
        const [moved] = slide.images.splice(draggedIndex, 1);
        slide.images.splice(targetIndex, 0, moved);
        if (projectDir) await writeSlidesFile();
        render();
      }
    });
  });
}

function serializeSlides() {
  const replacer = (key, value) => key === 'author' && !value ? undefined : value;
  return `window.SLIDES = ${JSON.stringify(window.SLIDES, replacer, 2)};\n`;
}

function downloadSlides() {
  const blob = new Blob([serializeSlides()], {type:'text/javascript'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'slides.js';
  a.click();
  URL.revokeObjectURL(a.href);
}

function next() { if (current < window.SLIDES.length - 1) { current++; render(); } }
function prev() { if (current > 0) { current--; render(); } }
prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
connectFolderBtn.addEventListener('click', connectProjectFolder);
exportBtn.addEventListener('click', downloadSlides);
fullscreenBtn.addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
});

document.addEventListener('keydown', event => {
  if (['ArrowRight','PageDown',' '].includes(event.key)) { event.preventDefault(); next(); }
  if (['ArrowLeft','PageUp'].includes(event.key)) { event.preventDefault(); prev(); }
  if (event.key.toLowerCase() === 'f') fullscreenBtn.click();
});
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, {passive:true});
document.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) >= 50) delta < 0 ? next() : prev();
}, {passive:true});
const match = location.hash.match(/slide-(\d+)/);
if (match) current = Math.max(0, Math.min(window.SLIDES.length - 1, Number(match[1]) - 1));
render();
