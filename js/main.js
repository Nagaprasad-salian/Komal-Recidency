/* ==========================================================================
   Komal Residency
   Everything the page knows about rooms and prices lives in the CONFIG block.
   Edit it there and the cards, tariff table, booking form and summary update.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------- CONFIG ---------------------------------- */
  const WHATSAPP_NUMBER = '919483243263';           // country code + number, no "+"
  const BOOKING_EMAIL   = 'komalresidencyhebri@gmail.com';
  const GST_RATE        = 0.05;
  const ADVANCE_SHARE   = 0.5;                      // 50% advance
  const MAX_ROOMS       = 5;
  const MAX_GUESTS      = 12;

  // Extra bed: one per room. "base" is the rate before GST, "total" is what the guest pays.
  const EXTRA_BED = { base: 381, total: 400 };

  const IMG = 'assets/img/';
  const PHOTOS = {
    deluxeWide:  { src: 'deluxe-wide.webp',  cap: 'Deluxe room',            alt: 'Deluxe room with a striped double bed, wooden armchairs and a curtained window' },
    deluxeAngle: { src: 'deluxe-angle.webp', cap: 'Deluxe room, bed view',  alt: 'Double bed under a wooden-framed panel, with armchairs by the window' },
    woodCorner:  { src: 'wood-corner.webp',  w: 851, h: 1280, cap: 'Kettle tray corner',     alt: 'Wood-panelled corner with a kettle tray, cups and drinking water' },
    bedFront:    { src: 'bed-front.webp',    w: 851, h: 1280, cap: 'Double bed',             alt: 'Double bed with striped linen and a framed picture above the headboard' },
    sitting:     { src: 'sitting-area.webp', cap: 'Sitting area and day bed', alt: 'Sitting area with wooden armchairs, a coffee table and a single day bed' },
    twin:        { src: 'twin-beds.webp',    cap: 'Room with two beds',     alt: 'Room with two beds, a wardrobe, dressing mirror and TV' },
    reception:   { src: 'reception.webp',    cap: 'Reception',              alt: 'Reception desk under the Komal Residency sign' },
    bathroom:    { src: 'bathroom.webp',     cap: 'Bathroom',               alt: 'Tiled bathroom with a wash basin and shower' }
  };

  // Photos are matched to room types as a best guess. Swap the keys to change them.
  const ROOMS = [
    {
      id: 'single', name: 'Single bed room', ac: false, base: 600, total: 630,
      blurb: 'One bed and a TV, kept simple. A good fit for a solo traveller or a short stop.',
      features: ['Non-AC', 'TV', '1 bed'],
      photos: ['sitting']
    },
    {
      id: 'double', name: 'Double bed room', ac: false, base: 1000, total: 1050,
      blurb: 'A double bed and a TV at an easy price. No air conditioning.',
      features: ['Non-AC', 'TV', 'Double bed'],
      photos: ['bedFront', 'bathroom']
    },
    {
      id: 'deluxe', name: 'Deluxe double bed room', ac: true, base: 1300, total: 1365,
      blurb: 'A double bed with air conditioning, a TV and seating by the window.',
      features: ['AC', 'TV', 'Double bed'],
      photos: ['deluxeWide', 'deluxeAngle', 'woodCorner']
    },
    {
      id: 'suite', name: 'Deluxe suite', ac: true, base: 1900, total: 1995,
      blurb: 'Three beds with air conditioning and a TV, for families and small groups.',
      features: ['AC', 'TV', '3 beds'],
      photos: ['twin', 'sitting']
    }
  ];

  const GALLERY_ORDER = ['reception', 'deluxeWide', 'bedFront', 'twin', 'bathroom', 'woodCorner', 'sitting', 'deluxeAngle'];

  /* ---------------------------- HELPERS --------------------------------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const photo = key => ({ w: 1280, h: 851, ...PHOTOS[key], src: IMG + PHOTOS[key].src });
  const roomById = id => ROOMS.find(r => r.id === id);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  const pad = n => String(n).padStart(2, '0');
  const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (iso, n) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
  const niceDate = iso => fromISO(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const nightsBetween = (a, b) => {
    if (!a || !b) return 0;
    const diff = Math.round((fromISO(b) - fromISO(a)) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const todayISO = toISO(new Date());

  /* ---------------------------- STATE ----------------------------------- */
  const state = {
    room: 'deluxe',
    rooms: 1,
    guests: 2,
    extra: false
  };

  /* ---------------------------- ROOM CARDS ------------------------------ */
  const roomGrid = $('#room-grid');
  let activeFilter = 'all';

  function renderRooms() {
    const list = ROOMS.filter(r =>
      activeFilter === 'all' || (activeFilter === 'ac' ? r.ac : !r.ac)
    );
    roomGrid.innerHTML = '';

    list.forEach((room, i) => {
      const shape = (i % 4 === 0 || i % 4 === 3) ? 'is-wide' : 'is-narrow';
      const first = photo(room.photos[0]);
      const card = document.createElement('article');
      card.className = `room-card ${shape}`;

      const countLabel = room.photos.length > 1 ? `${room.photos.length} photos` : 'View photo';

      card.innerHTML = `
        <button type="button" class="room-photo" data-gallery-room="${room.id}" aria-label="View photos of ${room.name}">
          <img src="${first.src}" alt="${first.alt}" loading="lazy" width="1280" height="851">
          <span class="room-price">${money(room.total)} <small>a night</small></span>
          <span class="room-count"><svg class="ic" aria-hidden="true"><use href="#i-image"/></svg>${countLabel}</span>
        </button>
        <div class="room-body">
          <h3>${room.name}</h3>
          <p>${room.blurb}</p>
          <ul class="chips">${room.features.map(f => `<li class="${f === 'AC' ? 'is-ac' : ''}">${f}</li>`).join('')}</ul>
          <div class="room-foot">
            <span class="room-rate">${money(room.base)} + 5% GST</span>
            <button type="button" class="btn btn-ink" data-book-room="${room.id}">Book this room</button>
          </div>
        </div>`;
      roomGrid.appendChild(card);
    });
  }

  $$('.seg').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      $$('.seg').forEach(b => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      renderRooms();
    });
  });

  /* ---------------------------- TARIFF TABLE ---------------------------- */
  function renderTariff() {
    const rows = ROOMS.map(r => ({ name: r.name + (r.ac ? ', AC' : ', Non-AC'), base: r.base, total: r.total }));
    rows.push({ name: 'Extra bed', base: EXTRA_BED.base, total: EXTRA_BED.total });
    $('#tariff-body').innerHTML = rows.map(r => `
      <tr>
        <th scope="row">${r.name}</th>
        <td>${money(r.base)}</td>
        <td>${money(r.total - r.base)}</td>
        <td>${money(r.total)}</td>
      </tr>`).join('');
  }

  /* ---------------------------- ROOM PICKER ----------------------------- */
  function renderPicker() {
    $('#room-picker').innerHTML = ROOMS.map(r => `
      <label class="pick">
        <input type="radio" name="room" value="${r.id}" ${r.id === state.room ? 'checked' : ''}>
        <span class="pick-tile">
          <img src="${photo(r.photos[0]).src}" alt="" loading="lazy" width="72" height="72">
          <span class="pick-text">
            <strong>${r.name}</strong>
            <small>${r.features.join(', ')}</small>
          </span>
          <span class="pick-price">${money(r.total)}</span>
        </span>
      </label>`).join('');

    $$('input[name="room"]').forEach(input => {
      input.addEventListener('change', () => { state.room = input.value; update(); });
    });
  }

  function selectRoom(id) {
    if (!roomById(id)) return;
    state.room = id;
    const input = $(`input[name="room"][value="${id}"]`);
    if (input) input.checked = true;
    update();
  }

  /* ---------------------------- DATES ----------------------------------- */
  const fIn  = $('#f-in');
  const fOut = $('#f-out');
  const hsIn  = $('#hs-in');
  const hsOut = $('#hs-out');

  function initDates() {
    const tomorrow = addDays(todayISO, 1);
    [fIn, hsIn].forEach(el => { el.min = todayISO; el.value = todayISO; });
    [fOut, hsOut].forEach(el => { el.min = tomorrow; el.value = tomorrow; });
  }

  function keepOutAfterIn(inEl, outEl) {
    if (!inEl.value) return;
    const min = addDays(inEl.value, 1);
    outEl.min = min;
    if (!outEl.value || outEl.value < min) outEl.value = min;
  }

  fIn.addEventListener('change', () => { keepOutAfterIn(fIn, fOut); update(); });
  fOut.addEventListener('change', update);
  hsIn.addEventListener('change', () => keepOutAfterIn(hsIn, hsOut));

  /* ---------------------------- STEPPERS / SWITCH ----------------------- */
  const limits = { rooms: [1, MAX_ROOMS], guests: [1, MAX_GUESTS] };

  $$('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.step;
      const [min, max] = limits[key];
      state[key] = Math.min(max, Math.max(min, state[key] + Number(btn.dataset.dir)));
      update();
    });
  });

  $('#f-extra').addEventListener('change', e => { state.extra = e.target.checked; update(); });

  /* ---------------------------- PRICING --------------------------------- */
  function quote() {
    const room = roomById(state.room);
    const nights = nightsBetween(fIn.value, fOut.value);
    const roomTotal  = room.total * state.rooms * nights;
    const extraTotal = state.extra ? EXTRA_BED.total * state.rooms * nights : 0;
    const total = roomTotal + extraTotal;

    const roomBase  = room.base * state.rooms * nights;
    const extraBase = state.extra ? EXTRA_BED.base * state.rooms * nights : 0;
    const gst = total - roomBase - extraBase;

    return {
      room, nights, roomTotal, extraTotal, total, gst,
      advance: Math.ceil(total * ADVANCE_SHARE)
    };
  }

  /* ---------------------------- SUMMARY --------------------------------- */
  function update() {
    const q = quote();

    $('#o-rooms').textContent  = state.rooms;
    $('#o-guests').textContent = state.guests;
    $$('[data-step="rooms"]').forEach(b => { b.disabled = (Number(b.dataset.dir) < 0 && state.rooms <= 1) || (Number(b.dataset.dir) > 0 && state.rooms >= MAX_ROOMS); });
    $$('[data-step="guests"]').forEach(b => { b.disabled = (Number(b.dataset.dir) < 0 && state.guests <= 1) || (Number(b.dataset.dir) > 0 && state.guests >= MAX_GUESTS); });

    const img = $('#sum-img');
    img.src = photo(q.room.photos[0]).src;
    $('#sum-name').textContent = q.room.name;
    $('#sum-meta').textContent = q.room.features.join(', ');

    const rows = [];
    rows.push(['Check-in',  fIn.value  ? niceDate(fIn.value)  : 'Pick a date']);
    rows.push(['Check-out', fOut.value ? niceDate(fOut.value) : 'Pick a date']);
    rows.push(['Stay', q.nights ? `${plural(q.nights, 'night')}, ${plural(state.rooms, 'room')}` : 'Check your dates']);
    rows.push(['Guests', String(state.guests)]);
    if (q.nights) {
      rows.push([`Room (${money(q.room.total)} a night)`, money(q.roomTotal)]);
      if (state.extra) rows.push([`Extra bed (${money(EXTRA_BED.total)} a night)`, money(q.extraTotal)]);
      rows.push(['GST 5%, already included', money(q.gst)]);
    }
    $('#sum-rows').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

    $('#sum-total').textContent   = q.nights ? money(q.total)   : '₹0';
    $('#sum-advance').textContent = q.nights ? money(q.advance) : '₹0';
  }

  /* ---------------------------- VALIDATION ------------------------------ */
  const f = {
    name:  $('#f-name'),
    phone: $('#f-phone'),
    email: $('#f-email'),
    notes: $('#f-notes')
  };
  const errs = { in: $('#e-in'), out: $('#e-out'), name: $('#e-name'), phone: $('#e-phone'), email: $('#e-email') };

  function cleanPhone(raw) {
    let d = raw.replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return d;
  }

  function setError(input, errEl, message) {
    errEl.textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !message;
  }

  function validate() {
    const checks = [];

    checks.push([fIn, errs.in,
      !fIn.value ? 'Choose a check-in date.'
      : fIn.value < todayISO ? 'Check-in cannot be in the past.' : '']);

    checks.push([fOut, errs.out,
      !fOut.value ? 'Choose a check-out date.'
      : (fIn.value && fOut.value <= fIn.value) ? 'Check-out must be after check-in.' : '']);

    checks.push([f.name, errs.name,
      f.name.value.trim().length < 2 ? 'Enter your full name.' : '']);

    checks.push([f.phone, errs.phone,
      !/^[6-9]\d{9}$/.test(cleanPhone(f.phone.value)) ? 'Enter a 10-digit mobile number.' : '']);

    checks.push([f.email, errs.email,
      f.email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()) ? 'Enter a valid email address or leave it empty.' : '']);

    let firstBad = null;
    checks.forEach(([input, errEl, msg]) => {
      if (!setError(input, errEl, msg) && !firstBad) firstBad = input;
    });

    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }

  [f.name, f.phone, f.email, fIn, fOut].forEach(el => {
    el.addEventListener('input', () => {
      el.removeAttribute('aria-invalid');
      const errEl = { 'f-in': errs.in, 'f-out': errs.out, 'f-name': errs.name, 'f-phone': errs.phone, 'f-email': errs.email }[el.id];
      if (errEl) errEl.textContent = '';
    });
  });

  /* ---------------------------- MESSAGE --------------------------------- */
  function buildMessage() {
    const q = quote();
    const lines = [
      'Hello Komal Residency, I would like to book a room.',
      '',
      `Room: ${q.room.name} (${q.room.ac ? 'AC' : 'Non-AC'}), ${plural(state.rooms, 'room')}`,
      `Check-in: ${niceDate(fIn.value)}`,
      `Check-out: ${niceDate(fOut.value)} (${plural(q.nights, 'night')})`,
      `Guests: ${state.guests}`,
      `Extra bed: ${state.extra ? `Yes, ${state.rooms}` : 'No'}`,
      `Estimated total: ${money(q.total)} including 5% GST`,
      `Advance (50%): ${money(q.advance)}`,
      '',
      `Name: ${f.name.value.trim()}`,
      `Mobile: ${cleanPhone(f.phone.value)}`
    ];
    if (f.email.value.trim()) lines.push(`Email: ${f.email.value.trim()}`);
    if (f.notes.value.trim()) lines.push(`Notes: ${f.notes.value.trim()}`);
    return lines.join('\n');
  }

  const statusEl = $('#status');
  function say(message, kind) {
    statusEl.textContent = message;
    statusEl.className = 'status' + (kind ? ` is-${kind}` : '');
  }

  /* ---------------------------- SEND ACTIONS ---------------------------- */
  $('#btn-wa').addEventListener('click', () => {
    say('');
    if (!validate()) { say('Fix the highlighted fields and try again.', 'warn'); return; }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
    const win = window.open(url, '_blank');
    if (win) win.opener = null; else window.location.href = url;
    say('WhatsApp is open with your request. Send the message and reception will reply to confirm.', 'ok');
  });

  $('#btn-mail').addEventListener('click', () => {
    say('');
    if (!validate()) { say('Fix the highlighted fields and try again.', 'warn'); return; }
    const q = quote();
    const subject = `Booking request: ${q.room.name}, ${niceDate(fIn.value)}`;
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`;
    say('Your email app should open with the request filled in. Send it to reach reception.', 'ok');
  });

  $('#btn-copy').addEventListener('click', async () => {
    say('');
    if (!validate()) { say('Fix the highlighted fields and try again.', 'warn'); return; }
    const text = buildMessage();
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (__) { /* ignore */ }
      ta.remove();
    }
    say('Copied. Paste it into WhatsApp, SMS or email.', 'ok');
  });

  $('#book-form').addEventListener('submit', e => { e.preventDefault(); });

  /* ---------------------------- HERO SEARCH + QUICK BOOK ---------------- */
  $('#hero-search').addEventListener('submit', e => {
    e.preventDefault();
    keepOutAfterIn(hsIn, hsOut);
    if (hsIn.value)  { fIn.value  = hsIn.value; }
    if (hsOut.value) { fOut.value = hsOut.value; }
    keepOutAfterIn(fIn, fOut);
    update();
    $('#book').scrollIntoView({ block: 'start' });
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-book-room]');
    if (!btn) return;
    selectRoom(btn.dataset.bookRoom);
    $('#book').scrollIntoView({ block: 'start' });
  });

  /* ---------------------------- GALLERY + LIGHTBOX ---------------------- */
  const dialog = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCap = $('#lb-cap');
  let lbList = [];
  let lbIndex = 0;

  function showLightbox() {
    const item = lbList[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCap.textContent = lbList.length > 1 ? `${item.cap} (${lbIndex + 1} of ${lbList.length})` : item.cap;
    const multi = lbList.length > 1;
    $('.lb-prev', dialog).hidden = !multi;
    $('.lb-next', dialog).hidden = !multi;
  }

  function openLightbox(list, index) {
    lbList = list;
    lbIndex = index;
    showLightbox();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function stepLightbox(dir) {
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    showLightbox();
  }

  $('.lb-close', dialog).addEventListener('click', () => dialog.close());
  $('.lb-prev', dialog).addEventListener('click', () => stepLightbox(-1));
  $('.lb-next', dialog).addEventListener('click', () => stepLightbox(1));
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', e => {
    if (lbList.length < 2) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); stepLightbox(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(1); }
  });

  function renderGallery() {
    const items = GALLERY_ORDER.map(photo);
    const wrap = $('#masonry');
    wrap.innerHTML = '';
    items.forEach((item, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Open photo: ${item.cap}`);
      b.innerHTML = `<img src="${item.src}" alt="${item.alt}" width="${item.w}" height="${item.h}" loading="lazy">`;
      b.addEventListener('click', () => openLightbox(items, i));
      wrap.appendChild(b);
    });
  }

  roomGrid.addEventListener('click', e => {
    const btn = e.target.closest('[data-gallery-room]');
    if (!btn) return;
    const room = roomById(btn.dataset.galleryRoom);
    const list = room.photos.map(k => ({ ...photo(k), cap: room.name }));
    openLightbox(list, 0);
  });

  /* ---------------------------- ACTIVE DOCK LINK ------------------------ */
  function watchSections() {
    const links = $$('.dock a');
    const map = new Map(links.map(a => [a.dataset.target, a]));
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        const active = map.get(entry.target.id);
        if (active) { active.classList.add('is-active'); active.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    const first = map.get('home');
    if (first) { first.classList.add('is-active'); first.setAttribute('aria-current', 'true'); }
  }

  /* ---------------------------- INIT ------------------------------------ */
  $('#year').textContent = new Date().getFullYear();
  initDates();
  renderRooms();
  renderTariff();
  renderPicker();
  renderGallery();
  watchSections();
  update();
})();
