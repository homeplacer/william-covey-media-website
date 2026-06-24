// ---- year stamp
document.getElementById('year').textContent = new Date().getFullYear();

// ---- header scroll state
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- mobile nav
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', open);
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
  })
);

// ---- scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- film player
const filmFrame = document.getElementById('filmFrame');
const filmVideo = document.getElementById('filmVideo');
const filmPlay = document.getElementById('filmPlay');
function playFilm() {
  filmFrame.classList.add('is-playing');
  filmVideo.setAttribute('controls', '');
  filmVideo.play();
}
filmPlay.addEventListener('click', (e) => { e.stopPropagation(); playFilm(); });
filmFrame.addEventListener('click', () => { if (!filmFrame.classList.contains('is-playing')) playFilm(); });

// ---- gallery
const PORTFOLIO = [
  { cat: 'exteriors',          n: 26, label: 'Exterior' },
  { cat: 'interiors',          n: 22, label: 'Interior' },
  { cat: 'aerials',            n: 26, label: 'Aerial' },
  { cat: 'twilights',          n: 18, label: 'Twilight' },
  { cat: 'short-term-rentals', n: 25, label: 'Short-Term Rental' },
  { cat: 'commercial',         n: 22, label: 'Commercial' },
  { cat: 'renderings',         n: 16, label: '3D Rendering' },
  { cat: 'headshots',          n: 11, label: 'Headshot' },
  { cat: 'virtual-staging',    n: 5,  label: 'Virtual Staging' },
];

const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('loadMore');
const loadMoreWrap = loadMoreBtn.parentElement;
const INITIAL = 15;
const STEP = 12;

// interleave categories for a varied feed
const items = [];
const maxN = Math.max(...PORTFOLIO.map(p => p.n));
for (let i = 0; i < maxN; i++) {
  for (const p of PORTFOLIO) {
    if (i < p.n) items.push({ cat: p.cat, label: p.label, idx: i + 1 });
  }
}

const DIMS = window.WCM_DIMS || {};
items.forEach((item) => {
  const el = document.createElement('div');
  el.className = 'gallery-item';
  el.dataset.cat = item.cat;
  el.dataset.label = item.label;
  const base = `images/portfolio/${item.cat}-${item.idx}`;
  const d = DIMS[`${item.cat}-${item.idx}`] || [1280, 853];
  const alt = `${item.label} real estate ${item.cat === 'headshots' ? 'headshot' : 'photography'} in Myrtle Beach by William Covey Media`;
  el.innerHTML =
    `<picture>` +
      `<source srcset="${base}.webp" type="image/webp">` +
      `<img loading="lazy" decoding="async" width="${d[0]}" height="${d[1]}" src="${base}.jpg" alt="${alt}">` +
    `</picture>`;
  gallery.appendChild(el);
});

const allItems = Array.from(gallery.querySelectorAll('.gallery-item'));
let currentFilter = 'all';
let shown = INITIAL;

function applyView() {
  const matches = allItems.filter(it => currentFilter === 'all' || it.dataset.cat === currentFilter);
  allItems.forEach(it => it.classList.add('is-hidden'));
  matches.slice(0, shown).forEach(it => it.classList.remove('is-hidden'));
  loadMoreWrap.classList.toggle('is-done', shown >= matches.length);
}
applyView();

loadMoreBtn.addEventListener('click', () => { shown += STEP; applyView(); });

// ---- filter
const filterBar = document.getElementById('filterBar');
function setFilter(f) {
  currentFilter = f;
  shown = INITIAL;
  filterBar.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.toggle('is-active', b.dataset.filter === f));
  applyView();
}
filterBar.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (btn) setFilter(btn.dataset.filter);
});

// ---- service tile backgrounds (webp w/ jpg fallback via image-set)
document.querySelectorAll('.svc-tile[data-img]').forEach(tile => {
  const b = `images/portfolio/${tile.dataset.img}`;
  tile.style.backgroundImage = `url('${b}.jpg')`; // fallback first
  tile.style.backgroundImage =
    `image-set(url('${b}.webp') type('image/webp'), url('${b}.jpg') type('image/jpeg'))`;
});

// ---- service tiles jump to portfolio + filter
document.querySelectorAll('.svc-tile[data-go]').forEach(tile => {
  tile.addEventListener('click', (e) => {
    const go = tile.dataset.go;
    if (go === 'film') return; // film tile links to #film, let it scroll
    const known = PORTFOLIO.some(p => p.cat === go);
    if (known) setFilter(go);
  });
});

// ---- lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
let lbList = [];
let lbI = 0;

function openLightbox(visibleIdx) {
  lbList = allItems.filter(it => !it.classList.contains('is-hidden'));
  lbI = visibleIdx;
  show();
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
}
function show() {
  const img = lbList[lbI].querySelector('img');
  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
}
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
function next() { lbI = (lbI + 1) % lbList.length; show(); }
function prev() { lbI = (lbI - 1 + lbList.length) % lbList.length; show(); }

gallery.addEventListener('click', e => {
  const it = e.target.closest('.gallery-item');
  if (!it || it.classList.contains('is-hidden')) return;
  const visible = allItems.filter(g => !g.classList.contains('is-hidden'));
  openLightbox(visible.indexOf(it));
});
lbClose.addEventListener('click', closeLb);
lbNext.addEventListener('click', next);
lbPrev.addEventListener('click', prev);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

// ---- contact form (Formspree + mailto fallback)
const form = document.getElementById('contactForm');
form.addEventListener('submit', async e => {
  if (form.action.includes('REPLACE_WITH_FORMSPREE_ID')) {
    e.preventDefault();
    const fd = new FormData(form);
    const body =
      `Name: ${fd.get('name') || ''}\n` +
      `Brokerage: ${fd.get('brokerage') || ''}\n` +
      `Phone: ${fd.get('phone') || ''}\n` +
      `Email: ${fd.get('email') || ''}\n` +
      `Property: ${fd.get('address') || ''}\n` +
      `Service: ${fd.get('service') || ''}\n\n` +
      `Notes:\n${fd.get('notes') || ''}`;
    const subject = `Shoot request — ${fd.get('name') || 'New lead'}`;
    window.location.href =
      `mailto:Info@WilliamCoveyMedia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return;
  }
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
    });
    if (res.ok) {
      const card = document.createElement('div');
      card.className = 'form-success';
      card.innerHTML = '<strong>Thanks — we got it.</strong><br>We\'ll be in touch within a few hours to confirm the shoot.';
      form.replaceWith(card);
    } else { throw new Error('send failed'); }
  } catch (err) {
    btn.textContent = original;
    btn.disabled = false;
    alert('Hmm — that didn\'t go through. Please call us at 843.957.6915 or email Info@WilliamCoveyMedia.com.');
  }
});
