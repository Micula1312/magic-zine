const app = document.querySelector('#app');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const fullscreenBtn = document.querySelector('#fullscreenBtn');
const counter = document.querySelector('#counter');

let current = 0;

function pad(n) {
  return String(n).padStart(2, '0');
}

function imageMarkup(images = []) {
  if (!images.length) {
    return `<div class="image-placeholder"><span>DROP YOUR IMAGE HERE</span><small>aggiungi il file in /images e il path in slides.js</small></div>`;
  }

  return `<div class="media-grid">${images.map((src, i) => `
    <figure class="media media-${i + 1}">
      <img src="${src}" alt="" />
    </figure>`).join('')}</div>`;
}

function render() {
  const slide = window.SLIDES[current];
  document.body.dataset.layout = slide.layout;

  app.innerHTML = `
    <section class="slide slide-${slide.layout}" data-id="${slide.id}">
      <header class="slide-meta">
        <span>${slide.kicker || ''}</span>
        <span>${slide.year || ''}</span>
      </header>

      <div class="slide-copy">
        <h1>${slide.title}</h1>
        ${slide.text ? `<p>${slide.text}</p>` : ''}
        ${slide.quote ? `<blockquote>${slide.quote}</blockquote>` : ''}
      </div>

      <div class="slide-media">
        ${imageMarkup(slide.images)}
      </div>
    </section>
  `;

  counter.textContent = `${pad(current + 1)} / ${pad(window.SLIDES.length)}`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === window.SLIDES.length - 1;
  location.hash = `slide-${current + 1}`;
}

function next() {
  if (current < window.SLIDES.length - 1) {
    current += 1;
    render();
  }
}

function prev() {
  if (current > 0) {
    current -= 1;
    render();
  }
}

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
fullscreenBtn.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

document.addEventListener('keydown', (event) => {
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    next();
  }
  if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    prev();
  }
  if (event.key.toLowerCase() === 'f') {
    fullscreenBtn.click();
  }
});

let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
document.addEventListener('touchend', (e) => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 50) return;
  delta < 0 ? next() : prev();
}, { passive: true });

const match = location.hash.match(/slide-(\d+)/);
if (match) {
  current = Math.max(0, Math.min(window.SLIDES.length - 1, Number(match[1]) - 1));
}
render();
