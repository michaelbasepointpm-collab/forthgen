// Forth Gen · website concept
// Homes, buildings and places come from js/data.js (window.FG). Contact details come from ../assets/js/talk.js.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const FG = window.FG;
const C = window.BP_CONTACT || {};
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- contact details everywhere ----------
$$('[data-phone]').forEach(a => { a.href = 'tel:' + C.phone; a.textContent = C.phoneLabel; });
$$('[data-email]').forEach(a => { a.href = 'mailto:' + C.email; a.textContent = C.email; });
$$('[data-text]').forEach(a => { a.href = 'sms:' + C.phone; });

// ---------- menu ----------
const toggle = $('.menu-toggle');
if (toggle) toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  $('#menu').classList.toggle('open', open);
});

// ---------- floating "back to the proposal" button ----------
const back = document.createElement('a');
back.className = 'back-prop';
back.href = '../index.html';
back.innerHTML = '<span class="arr" aria-hidden="true">←</span><span class="txt"><small>Concept by Michael</small>Back to the proposal</span>';
back.setAttribute('aria-label', 'Back to the proposal');
document.body.appendChild(back);

// ---------- reveal on scroll ----------
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' }) : null;
const watch = () => $$('.reveal:not(.in)').forEach(el => (io ? io.observe(el) : el.classList.add('in')));
watch();

// ---------- data helpers ----------
const B = Object.fromEntries(FG.buildings.map(b => [b.slug, b]));
const today = new Date(); today.setHours(0, 0, 0, 0);
const money = n => '$' + Number(n).toLocaleString('en-CA');
const dateOf = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const isNow = s => !s.available || dateOf(s.available) <= today;
const fmtDate = (iso, opts = { month: 'short', day: 'numeric' }) => dateOf(iso).toLocaleDateString('en-CA', opts);
const whenLabel = s => (isNow(s) ? 'Available now' : 'Available ' + fmtDate(s.available));
const typeLabel = s => [s.penthouse ? 'Penthouse' : '', s.beds + ' bed' + (s.den ? ' + den' : ''), s.baths + ' bath'].filter(Boolean).join(' · ');
const img = (s, i = 0, t = true) => `img/suites/${s.id}/${s.photos[i].f}${t ? '-t' : ''}.webp`;
const bimg = (b, i = 0, t = true) => `img/buildings/${b.slug}/${b.photos[i].f}${t ? '-t' : ''}.webp`;
const suiteUrl = s => `suite.html?u=${s.id}`;
const kindOf = s => (s.penthouse ? 'penthouse' : s.den ? 'den' : s.beds >= 2 ? 'two' : 'one');
const sortSoonest = (a, b) => (isNow(b) - isNow(a)) || (a.available || '').localeCompare(b.available || '') || a.rent - b.rent;
const live = FG.suites.slice().sort(sortSoonest);

const WAVE = '<svg viewBox="0 0 18 12" aria-hidden="true"><path d="M1 4c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M1 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/></svg>';
const hasView = s => s.view === 'full';
function card(s, reveal = true) {
  const b = B[s.building];
  const badge = s.badge ? `<span class="badge${s.penthouse ? ' badge-sun' : ''}">${esc(s.badge)}</span>` : '';
  const vbadge = hasView(s) ? '<span class="badge badge-view">Ocean view</span>' : '';
  return `<a class="home-card${reveal ? ' reveal' : ''}" href="${suiteUrl(s)}">
    <div class="ph">${badge}${vbadge}<img src="${img(s)}" alt="${esc(s.photos[0].c)}, ${esc(b.name)} suite ${esc(s.suite)}" loading="lazy"></div>
    <div class="bd">
      <span class="bld">${esc(b.name)} · #${esc(s.suite)}</span>
      <h3>${esc(s.title)}</h3>
      <span class="meta">${typeLabel(s)} · ${s.sqft.toLocaleString('en-CA')} sq ft</span>
      ${s.viewLabel ? `<span class="ocean">${WAVE}${esc(s.viewLabel)}</span>` : ''}
      <div class="row"><span class="price">${money(s.rent)}<small> /mo</small></span><span class="when${isNow(s) ? ' now' : ''}">${whenLabel(s)}</span></div>
    </div>
  </a>`;
}
function renderCards(el, list, reveal = true) { el.innerHTML = list.map(s => card(s, reveal)).join(''); watch(); }

// ---------- carousels: arrows, progress bar, disabled ends ----------
function initCarousel(root) {
  const track = $('.car-track', root);
  const prev = $('.car-prev', root), next = $('.car-next', root), bar = $('.car-progress span', root);
  const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 24) : track.clientWidth);
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (prev) prev.disabled = track.scrollLeft <= 4;
    if (next) next.disabled = track.scrollLeft >= max - 4;
    if (bar) {
      const vis = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
      bar.style.width = Math.min(100, vis * 100) + '%';
      bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * (1 / vis - 1) * 100 : 0}%)`;
    }
  };
  // smooth scroll, with an instant fallback where smooth scrolling can't run
  const go = dir => {
    const from = track.scrollLeft, dx = dir * step();
    track.scrollBy({ left: dx, behavior: 'smooth' });
    setTimeout(() => {
      if (Math.abs(track.scrollLeft - from) < 2) {
        track.style.scrollBehavior = 'auto'; track.scrollLeft = from + dx; track.style.scrollBehavior = ''; update();
      }
    }, 450);
  };
  prev && prev.addEventListener('click', () => go(-1));
  next && next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('scrollend', update);
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step(), behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step(), behavior: 'smooth' }); }
  });
  window.addEventListener('resize', update);
  root.carUpdate = () => { track.scrollLeft = 0; update(); };
  update();
}
$$('[data-carousel]').forEach(initCarousel);

// "Ocean views" in the menu points at homes.html?view=ocean
if (page === 'homes' && params.get('view') === 'ocean') {
  $$('.menu a').forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === 'homes.html?view=ocean'));
  $$('.menu a[aria-current]').forEach(a => a.setAttribute('aria-current', 'page'));
}

// counts used on several pages
$$('[data-count="live"]').forEach(el => { el.textContent = live.length; });
$$('[data-from]').forEach(el => { el.textContent = money(Math.min(...live.map(s => s.rent))); });
$$('[data-bcount]').forEach(el => {
  const n = live.filter(s => s.building === el.dataset.bcount).length;
  el.textContent = n ? `${n} available now` : 'Join the waitlist';
  el.classList.toggle('has', n > 0);
});

// ---------- photo viewer (suite and building galleries) ----------
const viewer = $('#viewer');
let vList = [], vIdx = 0;
function showPhoto(i) {
  vIdx = (i + vList.length) % vList.length;
  const p = vList[vIdx];
  $('img', viewer).src = p.src; $('img', viewer).alt = p.cap;
  $('figcaption', viewer).textContent = `${p.cap} · ${vIdx + 1} of ${vList.length}`;
}
function openViewer(list, i) { if (!viewer) return; vList = list; showPhoto(i); viewer.showModal(); }
if (viewer) {
  $('.v-prev', viewer).addEventListener('click', () => showPhoto(vIdx - 1));
  $('.v-next', viewer).addEventListener('click', () => showPhoto(vIdx + 1));
  $('.v-close', viewer).addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', e => { if (e.target === viewer || e.target.tagName === 'FIGURE') viewer.close(); });
  document.addEventListener('keydown', e => {
    if (!viewer.open) return;
    if (e.key === 'ArrowLeft') showPhoto(vIdx - 1);
    if (e.key === 'ArrowRight') showPhoto(vIdx + 1);
  });
  let x0 = null;
  viewer.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) showPhoto(vIdx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}
// static galleries built into the HTML (building pages)
$$('[data-gallery]').forEach(g => {
  const btns = $$('button[data-full]', g);
  const list = btns.map(b => ({ src: b.dataset.full, cap: b.dataset.cap }));
  btns.forEach((b, i) => b.addEventListener('click', () => openViewer(list, i)));
});

// ---------- home ----------
if (page === 'home') {
  const groups = {
    all: live,
    ocean: live.filter(hasView),
    now: live.filter(isNow),
    big: live.filter(s => s.beds >= 2 || s.den),
  };
  const featured = $('#featured');
  const show = key => {
    renderCards(featured, groups[key], false);
    $$('#home-tabs .tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === key)));
    featured.closest('[data-carousel]').carUpdate();
  };
  $$('#home-tabs .tab').forEach(t => {
    $('.n', t).textContent = groups[t.dataset.tab].length;
    t.addEventListener('click', () => show(t.dataset.tab));
  });
  show('all');
  // water views strip
  const vt = $('#views');
  if (vt) {
    vt.innerHTML = live.filter(s => s.viewPhoto).sort((a, b) => b.rent - a.rent).map(s => {
      const b = B[s.building];
      const i = s.photos.findIndex(p => p.f === s.viewPhoto);
      return `<a class="view-tile" href="${suiteUrl(s)}"><img src="img/suites/${s.id}/${s.viewPhoto}.webp" alt="${esc(s.viewLabel)} from ${esc(b.name)} suite ${esc(s.suite)}${i >= 0 ? ', ' + esc(s.photos[i].c) : ''}" loading="lazy">
        <div class="bd"><span><b>${esc(s.viewLabel)}</b><small>${esc(b.name)} #${esc(s.suite)} · ${typeLabel(s)} · ${whenLabel(s)}</small></span><span class="price">${money(s.rent)}</span></div></a>`;
    }).join('');
    vt.closest('[data-carousel]').carUpdate();
  }
  $$('[data-count="views"]').forEach(el => { el.textContent = groups.ocean.length; });
  const f = $('#quick');
  const bsel = $('[name="b"]', f);
  FG.buildings.forEach(b => bsel.insertAdjacentHTML('beforeend', `<option value="${b.slug}">${esc(b.name)}</option>`));
  f.addEventListener('submit', e => {
    e.preventDefault();
    const q = new URLSearchParams([...new FormData(f)].filter(([, v]) => v));
    location.href = 'homes.html' + (q.toString() ? '?' + q : '');
  });
}

// ---------- homes (finder) ----------
if (page === 'homes') {
  const st = { type: params.get('type') || 'all', view: params.get('view') || '', b: params.get('b') || '', max: params.get('max') || '', when: params.get('when') || '', sort: params.get('sort') || 'soon' };
  const vbtn = $('#f-view');
  const bsel = $('#f-b');
  FG.buildings.forEach(b => bsel.insertAdjacentHTML('beforeend', `<option value="${b.slug}">${esc(b.name)}</option>`));
  bsel.value = st.b; $('#f-max').value = st.max; $('#f-when').value = st.when; $('#f-sort').value = st.sort;
  const chips = $$('[data-type]');
  const sorters = {
    soon: sortSoonest,
    low: (a, b) => a.rent - b.rent,
    high: (a, b) => b.rent - a.rent,
    big: (a, b) => b.sqft - a.sqft,
  };
  function apply() {
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.type === st.type)));
    vbtn.setAttribute('aria-pressed', String(st.view === 'ocean'));
    const list = FG.suites.filter(s =>
      (st.type === 'all' || kindOf(s) === st.type || (st.type === 'two' && s.beds >= 2)) &&
      (st.view !== 'ocean' || hasView(s)) &&
      (!st.b || s.building === st.b) &&
      (!st.max || s.rent <= Number(st.max)) &&
      (!st.when || (st.when === 'now' ? isNow(s) : st.when === 'nov' ? (!isNow(s) && s.available <= '2026-11-30') : (!isNow(s) && s.available > '2026-11-30')))
    ).sort(sorters[st.sort]);
    $('#count').textContent = `${list.length} ${list.length === 1 ? 'home' : 'homes'} available`;
    $('#results').innerHTML = list.length ? list.map(card).join('') : '';
    $('#empty').hidden = list.length > 0;
    watch();
    const q = new URLSearchParams(Object.entries(st).filter(([k, v]) => v && !(k === 'type' && v === 'all') && !(k === 'sort' && v === 'soon')));
    history.replaceState(null, '', 'homes.html' + (q.toString() ? '?' + q : ''));
  }
  chips.forEach(c => c.addEventListener('click', () => { st.type = c.dataset.type; apply(); }));
  vbtn.addEventListener('click', () => { st.view = st.view === 'ocean' ? '' : 'ocean'; apply(); });
  bsel.addEventListener('change', () => { st.b = bsel.value; apply(); });
  $('#f-max').addEventListener('change', e => { st.max = e.target.value; apply(); });
  $('#f-when').addEventListener('change', e => { st.when = e.target.value; apply(); });
  $('#f-sort').addEventListener('change', e => { st.sort = e.target.value; apply(); });
  $('#reset').addEventListener('click', () => { Object.assign(st, { type: 'all', view: '', b: '', max: '', when: '', sort: 'soon' }); bsel.value = ''; $('#f-max').value = ''; $('#f-when').value = ''; $('#f-sort').value = 'soon'; apply(); });
  apply();
}

// ---------- one home ----------
if (page === 'suite') {
  const s = FG.suites.find(x => x.id === params.get('u')) || live[0];
  const b = B[s.building];
  document.title = `${b.name} #${s.suite} · ${typeLabel(s)} · ${money(s.rent)}/mo · Forth Gen`;
  const photos = s.photos.map((p, i) => ({ src: img(s, i, false), cap: p.c }));
  $('#crumb-b').textContent = b.name; $('#crumb-b').href = `${b.slug}.html`;
  $('#crumb-s').textContent = `#${s.suite}`;
  $('#gal').innerHTML = s.photos.slice(0, 5).map((p, i) => `<button type="button" data-i="${i}" aria-label="Open photo: ${esc(p.c)}"><img src="${img(s, i, i !== 0)}" alt="${esc(p.c)}"${i ? ' loading="lazy"' : ''}></button>`).join('') +
    `<button type="button" class="all" data-i="0">See all ${s.photos.length} photos</button>`;
  $$('#gal [data-i]').forEach(btn => btn.addEventListener('click', () => openViewer(photos, Number(btn.dataset.i))));
  $('#s-bld').textContent = `${b.name} · Suite ${s.suite}`;
  $('#s-title').textContent = s.title;
  $('#s-type').textContent = `${typeLabel(s)} · ${s.sqft.toLocaleString('en-CA')} sq ft · ${b.address}`;
  $('#s-facts').innerHTML = [
    ['Available', isNow(s) ? 'Now' : fmtDate(s.available, { month: 'long', day: 'numeric' })],
    ['Size', s.sqft.toLocaleString('en-CA') + ' sq ft'],
    ['Floor', s.floor],
    ...(s.viewLabel ? [['View', s.viewLabel]] : []),
    ['Laundry', s.laundry],
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#s-desc').innerHTML = s.description.map(p => `<p>${esc(p)}</p>`).join('');
  $('#s-feat').innerHTML = s.features.map(f => `<li>${esc(f)}</li>`).join('');
  $('#s-incl').innerHTML = FG.included.map(f => `<li>${esc(f)}</li>`).join('');
  $('#s-terms').innerHTML = FG.terms.map(f => `<li>${esc(f)}</li>`).join('');
  if (s.note) { $('#s-note').textContent = s.note; $('#s-note').hidden = false; }
  $('#s-bmini').href = `${b.slug}.html`;
  $('#s-bmini').innerHTML = `<img src="${bimg(b)}" alt="${esc(b.name)}"><span><b>${esc(b.name)}</b><span class="muted">${esc(b.address)} · ${b.homes} homes · resident manager on site</span></span>`;
  $('#a-price').innerHTML = `${money(s.rent)}<small> /month</small>`;
  $('#a-when').textContent = whenLabel(s);
  $('#a-when').classList.toggle('now', isNow(s));
  $('#a-type').textContent = `${typeLabel(s)} · ${s.sqft.toLocaleString('en-CA')} sq ft`;
  $('#a-book').href = `book-a-viewing.html?u=${s.id}`;
  const more = live.filter(x => x.id !== s.id && x.building === s.building).concat(live.filter(x => x.building !== s.building)).slice(0, 3);
  renderCards($('#more'), more);
}

// ---------- building pages ----------
if (page === 'building') {
  const slug = document.body.dataset.building;
  const list = live.filter(s => s.building === slug);
  const el = $('#b-homes');
  if (list.length) renderCards(el, list);
  else $('#b-none').hidden = false;
}

// ---------- book a viewing ----------
function pickedCard(s) {
  const b = B[s.building];
  return `<img src="${img(s)}" alt=""><span><b>${esc(b.name)} · #${esc(s.suite)}</b><br><span class="muted">${typeLabel(s)} · ${money(s.rent)}/mo · ${whenLabel(s)}</span></span>`;
}
async function sendForm(form, subject, fields, key) {
  const btn = $('button[type="submit"]', form);
  btn.disabled = true; const label = btn.textContent; btn.textContent = 'Sending…';
  try {
    const how = await window.BP_send(subject, fields);
    sessionStorage.setItem('fg-sent', JSON.stringify({ how, fields, key }));
    setTimeout(() => { location.href = 'thank-you.html'; }, how === 'mail' ? 900 : 0);
  } catch {
    btn.disabled = false; btn.textContent = label;
    $('.form-msg', form).hidden = false;
  }
}
function valid(form) {
  if (form.checkValidity()) return true;
  form.classList.add('tried');
  form.querySelector(':invalid')?.focus();
  return false;
}
if (page === 'book') {
  const form = $('#book');
  const sel = $('[name="home"]', form);
  live.forEach(s => sel.insertAdjacentHTML('beforeend', `<option value="${s.id}">${esc(B[s.building].name)} #${esc(s.suite)} · ${typeLabel(s)} · ${money(s.rent)}</option>`));
  sel.insertAdjacentHTML('beforeend', '<option value="any">Not sure yet, show me what fits</option>');
  const pre = params.get('u');
  if (pre && FG.suites.some(s => s.id === pre)) sel.value = pre;
  const showPicked = () => {
    const s = FG.suites.find(x => x.id === sel.value);
    $('#picked').hidden = !s;
    if (s) $('#picked').innerHTML = pickedCard(s);
  };
  sel.addEventListener('change', showPicked); showPicked();
  const d = $('[name="day"]', form);
  const t0 = new Date(); t0.setDate(t0.getDate() + 1);
  d.min = t0.toISOString().slice(0, 10);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!valid(form)) return;
    const f = Object.fromEntries(new FormData(form));
    const s = FG.suites.find(x => x.id === f.home);
    const home = s ? `${B[s.building].name} #${s.suite} (${typeLabel(s)}, ${money(s.rent)})` : 'Not sure yet';
    sendForm(form, `Viewing request · ${s ? B[s.building].name + ' #' + s.suite : 'any home'} · ${f.name}`, {
      Home: home, Day: f.day, Time: f.time, Name: f.name, Email: f.email, Phone: f.phone,
      'Move-in date': f.movein, People: f.people, Message: f.message,
    }, 'viewing');
  });
}

// ---------- waitlist ----------
if (page === 'waitlist') {
  const form = $('#waitlist');
  const box = $('#wl-b');
  FG.buildings.forEach(b => box.insertAdjacentHTML('beforeend', `<label class="chip-btn"><input type="checkbox" name="buildings" value="${esc(b.name)}">${esc(b.name)}</label>`));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!valid(form)) return;
    const fd = new FormData(form);
    const f = Object.fromEntries(fd);
    sendForm(form, `Waitlist · ${f.name}`, {
      Name: f.name, Email: f.email, Phone: f.phone,
      Homes: fd.getAll('types').join(', ') || 'Any', Buildings: fd.getAll('buildings').join(', ') || 'Any',
      'Max rent': f.max || 'Any', 'Move-in date': f.movein, Flexible: f.flex, Notes: f.notes,
    }, 'waitlist');
  });
}

// ---------- contact ----------
if (page === 'contact') {
  const form = $('#contact');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!valid(form)) return;
    const f = Object.fromEntries(new FormData(form));
    sendForm(form, `Forth Gen website · ${f.topic} · ${f.name}`, { Name: f.name, Email: f.email, Phone: f.phone, Topic: f.topic, Message: f.message }, 'contact');
  });
}

// ---------- thank you ----------
if (page === 'thanks') {
  let data = null;
  try { data = JSON.parse(sessionStorage.getItem('fg-sent')); } catch {}
  if (data) {
    const f = data.fields;
    const what = { viewing: 'viewing request', waitlist: 'waitlist sign-up', contact: 'message' }[data.key] || 'message';
    $('#ty-name').textContent = f.Name ? `, ${f.Name.split(' ')[0]}` : '';
    $('#ty-note').textContent = data.how === 'mail'
      ? `Your email app opened with your ${what}. Press send and it comes straight to Michael.`
      : `Michael has your ${what} and will reply by text or email, usually within the hour.`;
    $('#ty-sum').innerHTML = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('#ty-summary').hidden = false;
  }
}

// ---------- maps (Leaflet, free tiles, no API key) ----------
// Tries each tile provider in order and switches to the next if tiles fail to load.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
const ESRI_ATTR = 'Powered by <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors';
const TILES = [
  { url: ESRI + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}', opts: { maxZoom: 19, attribution: ESRI_ATTR } },
  { url: ESRI + 'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', labels: ESRI + 'Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', opts: { maxZoom: 16, attribution: ESRI_ATTR } },
  { url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', opts: { subdomains: 'abc', maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles by <a href="https://www.hotosm.org/">HOT</a>' } },
];
function makeMap(el) {
  const map = L.map(el, { scrollWheelZoom: false });
  let idx = 0, layers = [], errors = 0;
  const use = i => {
    layers.forEach(l => map.removeLayer(l));
    errors = 0;
    const t = TILES[i];
    layers = [L.tileLayer(t.url, t.opts)];
    if (t.labels) layers.push(L.tileLayer(t.labels, { maxZoom: t.opts.maxZoom, pane: 'shadowPane' }));
    layers.forEach(l => l.addTo(map));
    map.setMaxZoom(t.opts.maxZoom);
    layers[0].on('tileerror', () => { if (++errors >= 3 && idx < TILES.length - 1) use(++idx); });
  };
  use(0);
  return map;
}
const pinIcon = (cls, label, size = 30) => L.divIcon({ className: '', html: `<div class="pin ${cls}"><span>${label}</span></div>`, iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size + 4] });
function buildingMarkers(map, only) {
  return FG.buildings.filter(b => !only || b.slug === only).map((b, i) => {
    const n = live.filter(s => s.building === b.slug).length;
    return L.marker([b.lat, b.lng], { icon: pinIcon('home', only ? '★' : FG.buildings.indexOf(b) + 1, 36), zIndexOffset: 1000, title: b.name })
      .addTo(map)
      .bindPopup(`<b>${esc(b.name)}</b><br>${esc(b.address)}<br>${n ? n + ' available now · ' : ''}<a href="${b.slug}.html">See the building</a>`);
  });
}
if (window.L && $('#map')) {
  const map = makeMap($('#map'));
  const only = page === 'building' ? document.body.dataset.building : null;
  const homes = buildingMarkers(map, only);
  const markers = FG.places.map(p => ({
    p,
    m: L.marker([p.lat, p.lng], { icon: pinIcon(p.cat, p.label), title: p.name }).addTo(map).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.note)}`),
  }));
  const fit = list => map.fitBounds(L.featureGroup(list).getBounds(), { padding: [40, 40], maxZoom: 16 });
  const fitAll = () => { map.invalidateSize(); fit(only ? [...homes, ...markers.filter(x => x.p.near?.includes(only)).map(x => x.m)] : [...homes, ...markers.map(x => x.m)]); };
  fitAll();
  window.addEventListener('load', fitAll);
  $$('[data-cat]').forEach(btn => btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    $$('[data-cat]').forEach(x => x.setAttribute('aria-pressed', String(x === btn)));
    markers.forEach(({ p, m }) => (cat === 'all' || p.cat === cat ? m.addTo(map) : map.removeLayer(m)));
    fit([...homes, ...markers.filter(x => cat === 'all' || x.p.cat === cat).map(x => x.m)]);
  }));
  $$('[data-place]').forEach(btn => btn.addEventListener('click', () => {
    const x = markers.find(k => String(k.p.n) === btn.dataset.place) || null;
    const h = homes.find(k => k.options.title === btn.dataset.place);
    const m = x ? x.m : h;
    if (!m) return;
    if (x) m.addTo(map);
    map.flyTo(m.getLatLng(), 17, { duration: .6 });
    m.openPopup();
    $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}
