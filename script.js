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

// ---- gallery population (curated order, balanced across categories)
const PORTFOLIO = [
  { cat: 'exteriors',          n: 6, label: 'Exterior' },
  { cat: 'interiors',          n: 6, label: 'Interior' },
  { cat: 'aerials',            n: 6, label: 'Aerial' },
  { cat: 'twilights',          n: 6, label: 'Twilight' },
  { cat: 'short-term-rentals', n: 3, label: 'Short-Term Rental' },
  { cat: 'commercial',         n: 3, label: 'Commercial' },
  { cat: 'renderings',         n: 5, label: '3D Rendering' },
  { cat: 'headshots',          n: 4, label: 'Headshot' },
];

const gallery = document.getElementById('gallery');
const items = [];
// interleave categories for a varied feed
const maxN = Math.max(...PORTFOLIO.map(p => p.n));
for (let i = 0; i < maxN; i++) {
  for (const p of PORTFOLIO) {
    if (i < p.n) items.push({ cat: p.cat, label: p.label, src: `images/portfolio/${p.cat}-${i+1}.jpg` });
  }
}

// add some variety: every 7th item is wide
items.forEach((item, idx) => {
  const el = document.createElement('div');
  el.className = 'gallery-item';
  if (idx % 7 === 3) el.classList.add('is-wide');
  el.dataset.cat = item.cat;
  el.dataset.label = item.label;
  el.dataset.idx = idx;
  el.innerHTML = `<img loading="lazy" src="${item.src}" alt="${item.label} — William Covey Media">`;
  gallery.appendChild(el);
});

// ---- filter
const filterBar = document.getElementById('filterBar');
filterBar.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const f = btn.dataset.filter;
  gallery.querySelectorAll('.gallery-item').forEach(it => {
    it.style.display = (f === 'all' || it.dataset.cat === f) ? '' : 'none';
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
  // gather currently-visible items
  lbList = Array.from(gallery.querySelectorAll('.gallery-item')).filter(it => it.style.display !== 'none');
  lbI = visibleIdx;
  show();
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
}
function show() {
  const it = lbList[lbI];
  const img = it.querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
}
function close() { lb.hidden = true; document.body.style.overflow = ''; }
function next() { lbI = (lbI + 1) % lbList.length; show(); }
function prev() { lbI = (lbI - 1 + lbList.length) % lbList.length; show(); }

gallery.addEventListener('click', e => {
  const it = e.target.closest('.gallery-item');
  if (!it) return;
  const visible = Array.from(gallery.querySelectorAll('.gallery-item')).filter(g => g.style.display !== 'none');
  openLightbox(visible.indexOf(it));
});
lbClose.addEventListener('click', close);
lbNext.addEventListener('click', next);
lbPrev.addEventListener('click', prev);
lb.addEventListener('click', e => { if (e.target === lb) close(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

// ---- contact form (Formspree + mailto fallback)
const form = document.getElementById('contactForm');
form.addEventListener('submit', async e => {
  // If Formspree isn't configured yet, fall back to mailto so leads aren't lost
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
    } else {
      throw new Error('send failed');
    }
  } catch (err) {
    btn.textContent = original;
    btn.disabled = false;
    alert('Hmm — that didn\'t go through. Please call us at 843.957.6915 or email Info@WilliamCoveyMedia.com.');
  }
});
