// Proposal for Forth Gen · Michael Tapia
// Contact details come from assets/js/talk.js (BP_CONTACT). Suites and buildings come from forthgen/js/data.js (FG),
// the same file the website concept uses, so both stay in step.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const C = window.BP_CONTACT || {};
const FG = window.FG;
const money = n => '$' + Math.round(n).toLocaleString('en-CA');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

$$('[data-phone]').forEach(a => { a.href = 'tel:' + C.phone; a.textContent = C.phoneLabel; });
$$('[data-email]').forEach(a => { a.href = 'mailto:' + C.email; a.textContent = C.email; });
const book = $('#book-call');
if (book) {
  book.href = window.BP_bookCallHref;
  if (C.calendly) { book.target = '_blank'; book.rel = 'noopener'; }
}

// ---------- numbers from the shared data ----------
const today = new Date(); today.setHours(0, 0, 0, 0);
const dateOf = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const isNow = s => dateOf(s.available) <= today;
const fmt = (iso, o = { month: 'short', day: 'numeric' }) => dateOf(iso).toLocaleDateString('en-CA', o);
const B = Object.fromEntries(FG.buildings.map(b => [b.slug, b]));
const live = FG.suites.slice().sort((a, b) => (isNow(b) - isNow(a)) || a.available.localeCompare(b.available) || a.rent - b.rent);
const rent = live.reduce((a, s) => a + s.rent, 0);
const nov = live.filter(s => s.available === '2026-11-01').length;
$$('[data-total]').forEach(el => { el.textContent = FG.totalHomes; });
$$('[data-live]').forEach(el => { el.textContent = live.length; });
$$('[data-rent]').forEach(el => { el.textContent = money(rent); });
$$('[data-day]').forEach(el => { el.textContent = `about ${money(rent / 30.4)} a day`; });
$$('[data-nov]').forEach(el => { el.textContent = nov; });
const type = s => `${s.penthouse ? 'Penthouse, ' : ''}${s.beds} bed${s.den ? ' + den' : ''}, ${s.baths} bath`;
const when = s => (isNow(s) ? '<span class="pill now">Now</span>' : `<span class="pill">${fmt(s.available)}</span>`);

// ---------- vacancies infographic: days on market ----------
// Days since each website post went up. Posts older than a year were reused for a new vacancy, so they're left out.
const daysOn = s => Math.round((today - dateOf(s.listed)) / 864e5);
const dated = live.filter(s => daysOn(s) <= 365).sort((a, b) => daysOn(b) - daysOn(a));
const maxDays = Math.max(...dated.map(daysOn));
const level = d => (d > 60 ? 'l3' : d > 30 ? 'l2' : 'l1');
$('#dom').innerHTML = dated.map(s => {
  const d = daysOn(s), pct = Math.max(6, (d / maxDays) * 100);
  return `<div class="dom-row" role="listitem">
    <div class="dom-name"><b>${esc(B[s.building].name)} #${esc(s.suite)}</b><span>${type(s)}${s.viewLabel && s.view === 'full' ? ' · ocean view' : ''}</span></div>
    <div class="dom-bar"><i class="${level(d)}" style="width:${pct}%"></i><em class="${pct < 22 ? 'out' : ''}" style="${pct < 22 ? `left:calc(${pct}% + 8px)` : ''}">${d} days</em></div>
    <div class="dom-meta"><b>${money(s.rent)}</b>${isNow(s) ? 'Available now' : 'Move-in ' + fmt(s.available)}</div>
  </div>`;
}).join('');
$('#k-avg').textContent = Math.round(dated.reduce((a, s) => a + daysOn(s), 0) / dated.length);
$('#k-old').textContent = dated.filter(s => daysOn(s) > 60).length;

// rent waiting, by building
const COLORS = ['#14222E', '#1E5A6B', '#3F7D8C', '#D98E32', '#B8731F', '#7A8B95'];
const byB = FG.buildings.map((b, i) => ({ b, c: COLORS[i], rent: live.filter(s => s.building === b.slug).reduce((a, s) => a + s.rent, 0), n: live.filter(s => s.building === b.slug).length })).filter(x => x.rent);
$('#stack').innerHTML = byB.map(x => `<div style="flex:${x.rent};background:${x.c}" title="${esc(x.b.name)}: ${money(x.rent)} a month">${money(x.rent)}<small>${esc(x.b.name)}</small></div>`).join('');
$('#stack-legend').innerHTML = byB.map(x => `<span><i style="background:${x.c}"></i>${esc(x.b.name)} · ${x.n} ${x.n === 1 ? 'suite' : 'suites'} · ${money(x.rent)}</span>`).join('');

// Monday update: the fixes found in this week's ads
const FIX = {
  'bm-1502': 'Marketplace ad says "1BR/2 Bath" and coin-op laundry. The suite is a 2 bed with its own washer and dryer',
  'bm-801': 'Not on Marketplace yet. Post it',
  'et-1200': 'Confirm the ready date and bathroom count. Replace the "partly AI" photos once renovated',
  'et-703': 'Match the size (625 vs 630 sq ft). "Furnishings" should read "finishes"',
  'et-202': 'Pick one price: $2,195 (website) or $2,285 (Marketplace)',
  'hh-207': 'Ad is fine. Website gallery is filed under #708',
  'hh-903': 'Remove the older "under renovation" Marketplace ad',
  'km-101': 'Rewrite the ad (still says "Now to July 15"). Review the price',
  'km-205': 'Update the dates (says Oct 1 to 15). Not on Marketplace',
  'rw-308': 'Marketplace says 2 bed and "now". The suite is 1 bed + den for Nov 1. Fix postal code',
};
const days = s => Math.round((today - dateOf(s.listed)) / 864e5);
$('#report tbody').innerHTML = live.map(s => {
  const old = s.id !== 'km-205' && days(s) > 60;
  return `<tr><td><b>${esc(B[s.building].name)} #${esc(s.suite)}</b><br><span class="muted">${type(s)}</span></td>
  <td class="num">${money(s.rent)}</td><td>${when(s)}</td>
  <td class="num">${s.id === 'km-205' ? '<span class="pill warn">reused post</span>' : `${fmt(s.listed)}${old ? ` <span class="pill warn">${days(s)} days</span>` : ''}`}</td>
  <td>${esc(FIX[s.id] || 'No changes')}</td></tr>`;
}).join('');
const oldest = live.filter(s => s.id !== 'km-205').sort((a, b) => a.listed.localeCompare(b.listed))[0];
if (oldest) { $('#r-oldest').textContent = `${days(oldest)} days`; $('#r-oldest').nextElementSibling.textContent = `oldest ad (${B[oldest.building].name} #${oldest.suite})`; }

// ---------- value calculator ----------
const L = $('#v-leases'), D = $('#v-days'), R = $('#v-rent');
function calc() {
  const leases = +L.value, d = +D.value, r = +R.value;
  $('#o-leases').textContent = leases; $('#o-days').textContent = d; $('#o-rent').textContent = money(r);
  $('#v-out').textContent = `${money(leases * d * r / 30.4)} a year`;
  $('#v-tp').textContent = money(leases * 300);
}
[L, D, R].forEach(i => i.addEventListener('input', calc));
calc();

// ---------- screenshot viewer ----------
const viewer = $('#viewer');
document.addEventListener('click', e => {
  const t = e.target.closest('[data-full]');
  if (!t) return;
  $('img', viewer).src = t.dataset.full;
  $('img', viewer).alt = t.querySelector('img')?.alt || '';
  viewer.showModal();
});
viewer.addEventListener('click', e => { if (e.target === viewer || e.target.classList.contains('viewer-close')) viewer.close(); });
