// "Talk to Michael" widget + form sending, shared by the proposal and the Forth Gen website concept.
//
// ============ EDIT YOUR DETAILS HERE ============
window.BP_CONTACT = {
  name: 'Michael',
  phone: '+16043794504',          // used for Call and Text buttons
  phoneLabel: '(604) 379-4504',
  email: 'migueltapiarosero@gmail.com',
  calendly: '',                    // e.g. 'https://calendly.com/your-name/20min' — leave '' to use email instead
  formEndpoint: '',                // e.g. 'https://formspree.io/f/abcdwxyz' — leave '' and forms open a pre-filled email
  alwaysOnline: true,              // true = always show the green "Online now" dot; false = only during the hours below
  hours: { days: [1, 2, 3, 4, 5, 6], start: 9, end: 18, tz: 'America/Vancouver' }, // Mon–Sat, 9 am–6 pm
};
// ================================================

(function () {
  const C = window.BP_CONTACT;
  const script = document.currentScript;
  const base = script.dataset.base || 'assets/';
  const role = script.dataset.role || 'Leasing · Forth Gen';
  const greeting = script.dataset.greeting || "Hi! I'm Michael. How can I help?";
  const subject = script.dataset.subject || 'Message from the website';

  // ---------- sending (widget + any page form) ----------
  // Sends to formEndpoint when set, otherwise opens a pre-filled email to C.email.
  window.BP_send = async function (subj, fields) {
    if (C.formEndpoint) {
      const res = await fetch(C.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: subj }, fields)),
      });
      if (!res.ok) throw new Error('send failed');
      return 'sent';
    }
    const body = Object.entries(fields)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    location.href = `mailto:${C.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    return 'mail';
  };

  window.BP_bookCallHref = C.calendly || `mailto:${C.email}?subject=${encodeURIComponent('Book a call')}`;

  // ---------- presence ----------
  function isOnline() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: C.hours.tz, weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
    const wd = parts.find(p => p.type === 'weekday').value;
    const hr = parseInt(parts.find(p => p.type === 'hour').value, 10) % 24;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
    return C.hours.days.includes(day) && hr >= C.hours.start && hr < C.hours.end;
  }
  const online = C.alwaysOnline || isOnline();
  window.BP_online = online;
  const status = online ? 'Online now' : `Back at ${C.hours.start} am · leave a message`;

  // ---------- widget ----------
  const photo = base + 'img/team/michael-avatar.webp';
  const root = document.createElement('div');
  root.className = 'talk' + (online ? ' is-online' : '');
  root.innerHTML = `
    <div class="talk-panel" role="dialog" aria-modal="false" aria-labelledby="talk-title" hidden>
      <div class="talk-head">
        <span class="talk-face"><img src="${photo}" alt=""><i aria-hidden="true"></i></span>
        <div><b id="talk-title">${C.name}</b><span>${role}</span><small>${status}</small></div>
        <button class="talk-x" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="talk-body" aria-live="polite">
        <div class="talk-typing" aria-label="${C.name} is typing"><span></span><span></span><span></span></div>
      </div>
      <div class="talk-quick">
        <a href="${window.BP_bookCallHref}" ${C.calendly ? 'target="_blank" rel="noopener"' : ''}>Book a call</a>
        <a href="tel:${C.phone}">Call</a>
        <a href="sms:${C.phone}">Text</a>
        <a href="mailto:${C.email}?subject=${encodeURIComponent(subject)}">Email</a>
      </div>
      <form class="talk-form" novalidate>
        <textarea name="message" rows="2" placeholder="Write a message…" required aria-label="Your message"></textarea>
        <div class="talk-row">
          <input name="name" placeholder="Your name" autocomplete="name" required aria-label="Your name">
          <input name="contact" placeholder="Email or phone" autocomplete="email" required aria-label="Email or phone">
        </div>
        <button type="submit">Send to ${C.name}</button>
      </form>
    </div>
    <button class="talk-btn" type="button" aria-expanded="false">
      <span class="talk-face"><img src="${photo}" alt=""><i aria-hidden="true"></i></span>
      <span class="talk-label">Talk to ${C.name}</span>
    </button>`;
  document.body.appendChild(root);

  const panel = root.querySelector('.talk-panel');
  const btn = root.querySelector('.talk-btn');
  const body = root.querySelector('.talk-body');
  const form = root.querySelector('.talk-form');
  let greeted = false;

  function bubble(text, mine) {
    const b = document.createElement('p');
    b.className = 'talk-msg' + (mine ? ' mine' : '');
    b.textContent = text;
    body.appendChild(b);
    body.scrollTop = body.scrollHeight;
  }
  function typingThen(text, ms) {
    const t = body.querySelector('.talk-typing');
    t.hidden = false;
    body.appendChild(t);
    setTimeout(() => { t.hidden = true; bubble(text); }, ms);
  }
  function open() {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    root.classList.add('open');
    if (!greeted) { greeted = true; typingThen(greeting, 900); }
    setTimeout(() => form.querySelector('textarea').focus(), 50);
  }
  function close() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    root.classList.remove('open');
    btn.focus();
  }
  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
  root.querySelector('.talk-x').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  document.querySelectorAll('[data-talk]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(); }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.message.trim() || !f.name.trim() || !f.contact.trim()) {
      form.querySelector(':invalid, textarea')?.focus();
      form.classList.add('tried');
      return;
    }
    bubble(f.message, true);
    try {
      const how = await window.BP_send(subject, { Name: f.name, Contact: f.contact, Message: f.message, Page: location.href });
      form.reset();
      typingThen(how === 'sent'
        ? `Thanks, ${f.name.split(' ')[0]}! Got it. I'll get back to you shortly.`
        : `Thanks, ${f.name.split(' ')[0]}! Your email app has opened with the message. Press send and it comes straight to me.`, 900);
    } catch {
      typingThen(`Sorry, that didn't go through. Please call or text me at ${C.phoneLabel}.`, 600);
    }
  });
})();
