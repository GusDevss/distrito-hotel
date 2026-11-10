/* Distrito Hotel — interacciones (todas las páginas) */
(function () {
  'use strict';
  var IMG = 'https://lavenderblush-bison-390947.hostingersite.com/wp-content/uploads/';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  if (!hasGsap) document.documentElement.classList.add('no-gsap');
  else gsap.registerPlugin(ScrollTrigger);

  var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header sticky + botón arriba ---------- */
  var header = $('#header'), toTop = $('#toTop'), ring = $('#toTopRing');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (toTop) {
      toTop.classList.toggle('is-visible', y > 600);
      var max = document.documentElement.scrollHeight - innerHeight;
      ring.style.strokeDashoffset = 302 - (302 * (max > 0 ? y / max : 0));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Menú móvil ---------- */
  var burger = $('#burger'), nav = $('.nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !e.target.closest('.nav') && !e.target.closest('#burger')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false); });
  window.addEventListener('resize', function () { if (innerWidth >= 1200 && nav.classList.contains('is-open')) setMenu(false); });

  /* ---------- Cielo estrellado (canvas) ---------- */
  $$('[data-stars]').forEach(function (cv) {
    var ctx = cv.getContext('2d'), stars = [], shooting = null, w, h, dpr = Math.min(window.devicePixelRatio || 1, 2), visible = true;
    function size() {
      var r = cv.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(520, Math.round(w * h / 2400));
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h * .85, r: Math.random() * 1.3 + .2, a: Math.random(), s: Math.random() * .02 + .004, gold: Math.random() < .12 });
      }
    }
    function draw() {
      if (!visible) { requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        st.a += st.s; var o = .35 + Math.abs(Math.sin(st.a)) * .65;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283);
        ctx.fillStyle = st.gold ? 'rgba(232,200,160,' + o + ')' : 'rgba(255,255,255,' + o + ')';
        ctx.fill();
        if (st.r > 1.25) { ctx.fillStyle = 'rgba(255,255,255,' + o * .12 + ')'; ctx.beginPath(); ctx.arc(st.x, st.y, st.r * 4, 0, 6.283); ctx.fill(); }
      }
      // estrella fugaz ocasional
      if (!reduce && !shooting && Math.random() < .004) shooting = { x: Math.random() * w * .7 + w * .2, y: Math.random() * h * .3, l: 0, v: 9 + Math.random() * 5 };
      if (shooting) {
        var sh = shooting, tx = sh.x - sh.l, ty = sh.y + sh.l * .45;
        var g = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,240,215,.9)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(tx, ty); ctx.stroke();
        sh.l += sh.v; if (sh.l > 260) shooting = null;
      }
      requestAnimationFrame(draw);
    }
    size();
    window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);
    if (reduce) { stars.forEach(function (s) { s.s = 0; }); }
    requestAnimationFrame(draw);
  });

  /* ---------- Loader + entrada ---------- */
  var hotel = $('#heroHotel');
  function splitChars(el) {
    var words = el.textContent.split(' '); el.textContent = '';
    words.forEach(function (wd, wi) {
      var w = document.createElement('span'); w.className = 'word';
      wd.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'char'; s.textContent = ch; w.appendChild(s); });
      el.appendChild(w);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }
  $$('.hero__title .line > span').forEach(splitChars);

  /* Entrada inmediata: sin pantalla de carga. El hotel entra en cuanto su imagen termina de cargar. */
  if (hasGsap && !reduce) {
    if (hotel) {
      gsap.from('.hero__title .char', { yPercent: 110, rotate: 18, opacity: 0, duration: 1, stagger: .025, ease: 'power4.out', delay: .1 });
      gsap.set(hotel, { y: 160, opacity: 0, scale: .94 });
      var showHotel = function () {
        gsap.to(hotel, { y: 0, opacity: 1, scale: 1, duration: 2, ease: 'expo.out' });
        gsap.to('.hero__glow', { opacity: 1, duration: 1.6, delay: .4 });
      };
      if (hotel.complete && hotel.naturalWidth) showHotel();
      else { hotel.addEventListener('load', showHotel, { once: true }); hotel.addEventListener('error', showHotel, { once: true }); }
      gsap.from('.hero__scroll', { opacity: 0, y: 20, duration: .8, delay: 1.2 });
      gsap.to('.hero__title', { yPercent: -50, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    if ($('.page-hero')) {
      gsap.from('.page-hero__title, .page-hero__sub, .crumbs', { y: 50, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' });
      gsap.from('.page-hero__bg', { scale: 1.12, duration: 2.4, ease: 'expo.out' });
    }
  } else { var g = $('.hero__glow'); if (g) g.style.opacity = 1; }

  /* ---------- Reveals (solo desplazamiento + opacidad; sin rotaciones) ---------- */
  if (hasGsap && !reduce) {
    $$('.reveal').forEach(function (el) {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    ScrollTrigger.batch('.room-card', { start: 'top 90%', once: true, onEnter: function (b) { gsap.fromTo(b, { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: .12, duration: 1, ease: 'power3.out', overwrite: true }); } });
  }

  /* ---------- Video popup ---------- */
  var modal = $('#videoModal'), playBtn = $('#playBtn');
  if (modal && playBtn) {
    var holder = $('#videoHolder');
    var openVideo = function () {
      holder.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/ger_L_7KDts?autoplay=1&rel=0" title="Video Distrito Hotel" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      modal.hidden = false; document.body.style.overflow = 'hidden'; $('.modal__close', modal).focus();
    };
    var closeVideo = function () { modal.hidden = true; holder.innerHTML = ''; document.body.style.overflow = ''; playBtn.focus(); };
    playBtn.addEventListener('click', openVideo);
    modal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeVideo(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeVideo(); });
  }

  /* ---------- Carrusel genérico con autoplay ---------- */
  /* Carrusel: autoplay solo cuando está en pantalla y cambia texto+imagen juntos cuando la imagen ya cargó */
  function carousel(opts) {
    var i = 0, n = opts.count, timer, visible = false, token = 0;
    function apply(k, prev) { opts.render(k, prev); }
    function go(k, user) {
      var prev = i, next = (k + n) % n, my = ++token;
      i = next;
      var ready = opts.ready ? opts.ready(next) : null;
      if (ready && ready.then) ready.then(function () { if (my === token) apply(next, prev); }, function () { if (my === token) apply(next, prev); });
      else apply(next, prev);
      if (user !== false) restart();
    }
    function restart() {
      clearTimeout(timer);
      if (!visible) return;
      opts.progress && opts.progress();
      timer = setTimeout(function () { go(i + 1); }, opts.dur);
    }
    if (opts.root && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var v = en[0].isIntersecting;
        if (v && !visible) { visible = true; restart(); }
        else if (!v && visible) { visible = false; clearTimeout(timer); }
      }, { threshold: 0.35 }).observe(opts.root);
    } else { visible = true; restart(); }
    return { go: go, next: function () { go(i + 1); }, prev: function () { go(i - 1); }, get i() { return i; } };
  }
  /* Espera a que una imagen esté descargada y decodificada */
  function imgReady(im) {
    if (!im) return null;
    im.loading = 'eager';
    if (im.complete && im.naturalWidth) return im.decode ? im.decode().catch(function () {}) : null;
    return new Promise(function (res) { im.addEventListener('load', res, { once: true }); im.addEventListener('error', res, { once: true }); });
  }
  function swipe(el, c) {
    var sx = 0;
    el.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) (d < 0 ? c.next : c.prev)(); });
  }

  /* Amenidades: la imagen anterior se queda debajo hasta que la nueva termina de entrar (sin saltos) */
  var amMedia = $('#amMedia');
  if (amMedia) {
    var imgs = $$('img', amMedia), slides = $$('#amSlides .am'), idxEl = $('#amIdx'), bar = $('#amBar'), DUR = 6000;
    // precarga todas las fotos de amenidades en cuanto la sección se acerca
    if ('IntersectionObserver' in window) {
      var pre = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { pre.disconnect(); imgs.forEach(imgReady); } }, { rootMargin: '600px' });
      pre.observe(amMedia);
    }
    var am = carousel({
      count: slides.length, dur: DUR, root: $('#amenidades'),
      ready: function (k) { return imgReady(imgs[k]); },
      render: function (i, prev) {
        imgs.forEach(function (im, j) { im.classList.remove('is-prev'); im.classList.toggle('is-active', j === i); });
        if (prev !== i) imgs[prev].classList.add('is-prev');
        slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
        idxEl.textContent = ('0' + (i + 1)).slice(-2);
      },
      progress: function () { bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth; bar.style.transition = 'width ' + DUR + 'ms linear'; bar.style.width = '100%'; }
    });
    $('#amPrev').addEventListener('click', am.prev);
    $('#amNext').addEventListener('click', am.next);
    swipe($('#amenidades'), am);
  }

  /* Eventos: se ocultan solos los que ya pasaron */
  var evStage = $('#events');
  if (evStage) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var isPast = function (el) { var d = el.dataset.end ? new Date(el.dataset.end + 'T23:59:59') : null; return d && d < today; };
    $$('.ev', evStage).concat($$('.ev-tab')).forEach(function (el) { if (isPast(el)) el.remove(); });
    var evs = $$('.ev', evStage), tabs = $$('.ev-tab');
    if (!evs.length) { $('#eventos').hidden = true; }
    else {
      var ev = carousel({
        count: evs.length, dur: 7000, root: evStage,
        ready: function (k) { return imgReady($('img', evs[k])); },
        render: function (i) {
          evs.forEach(function (e, j) { e.classList.toggle('is-active', j === i); });
          tabs.forEach(function (t, j) { t.classList.toggle('is-active', j === i); t.setAttribute('aria-selected', j === i); });
          var a = tabs[i]; if (a && a.parentNode.scrollWidth > a.parentNode.clientWidth) a.parentNode.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' });
        },
        progress: function () { tabs.forEach(function (t) { t.classList.remove('is-running'); }); void evStage.offsetWidth; var a = $('.ev-tab.is-active'); a && a.classList.add('is-running'); }
      });
      ev.go(0, true);
      tabs.forEach(function (t, j) { t.addEventListener('click', function () { ev.go(j); }); });
      $('[data-ev="prev"]').addEventListener('click', ev.prev);
      $('[data-ev="next"]').addEventListener('click', ev.next);
      swipe(evStage, ev);
    }
  }

  /* ---------- Lightbox reutilizable ---------- */
  function lightbox(getImgs) {
    var lb = $('#lightbox'); if (!lb) return function () {};
    var lbImg = $('#lbImg'), lbCap = $('#lbCap'), cur = 0;
    function show(k) { var v = getImgs(); cur = (k + v.length) % v.length; lbImg.src = v[cur].src; lbImg.alt = v[cur].alt; lbCap.textContent = v[cur].alt; }
    function close() { lb.hidden = true; document.body.style.overflow = ''; }
    lb.addEventListener('click', function (e) {
      var a = e.target.closest('[data-lb]');
      if (a) { if (a.dataset.lb === 'close') close(); else show(cur + (a.dataset.lb === 'next' ? 1 : -1)); }
      else if (e.target === lb) close();
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1);
    });
    return function open(k) { show(k); lb.hidden = false; document.body.style.overflow = 'hidden'; };
  }

  /* ---------- Galería: filtros + lightbox ---------- */
  var grid = $('#gGrid');
  if (grid) {
    var items = $$('.g-item', grid);
    var visibleItems = function () { return items.filter(function (it) { return !it.classList.contains('is-hidden'); }); };
    $$('.g-filter').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.g-filter').forEach(function (x) { x.classList.toggle('is-active', x === b); });
        var f = b.dataset.filter;
        items.forEach(function (it) { it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f); });
        if (hasGsap) gsap.fromTo(visibleItems(), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: .05, duration: .6, ease: 'power3.out' });
      });
    });
    var openG = lightbox(function () { return visibleItems().map(function (it) { var im = $('img', it); return { src: im.dataset.full || im.src, alt: im.alt }; }); });
    items.forEach(function (it) { $('.g-open', it).addEventListener('click', function () { openG(visibleItems().indexOf(it)); }); });
  }

  /* ---------- Galería de cada habitación ----------
     Detecta sola las fotos 1.webp, 2.webp ... (o .jpg) dentro de assets/img/habitaciones/<habitacion>/ */
  var rg = $('[data-room-gallery]');
  if (rg) {
    var base = rg.dataset.roomGallery, thumbs = $('#rgThumbs'), main = $('#rgMain');
    var select = function (btn) {
      $$('.rg__thumb', thumbs).forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      main.style.opacity = 0;
      setTimeout(function () { main.src = btn.dataset.src; main.onload = function () { main.style.opacity = 1; }; }, 180);
    };
    thumbs.addEventListener('click', function (e) { var b = e.target.closest('.rg__thumb'); if (b) select(b); });
    var addThumb = function (src) {
      var b = document.createElement('button'); b.className = 'rg__thumb'; b.dataset.src = src;
      var small = /\/\d+\.webp$/.test(src) ? src.replace(/\.webp$/, '-sm.webp') : src;
      b.innerHTML = '<img src="' + small + '" alt="" width="120" height="80" loading="lazy" onerror="if(this.src!==\'' + src + '\')this.src=\'' + src + '\'">';
      thumbs.appendChild(b);
    };
    var probe = function (n, exts) {
      if (n > 15) return;
      var ext = exts[0], img = new Image();
      img.onload = function () {
        // si existen fotos propias, la primera reemplaza a la imagen provisional
        if (n === 1) { thumbs.innerHTML = ''; addThumb(img.src); select($('.rg__thumb', thumbs)); } else addThumb(img.src);
        probe(n + 1, ['webp', 'jpg']);
      };
      img.onerror = function () { if (exts.length > 1) probe(n, exts.slice(1)); };
      img.src = base + n + '.' + ext;
    };
    probe(1, ['webp', 'jpg']);
    var openR = lightbox(function () { return $$('.rg__thumb img', thumbs).map(function (im) { return { src: im.src, alt: main.alt }; }); });
    $('.rg__main').addEventListener('click', function () {
      var t = $$('.rg__thumb', thumbs); openR(Math.max(0, t.indexOf($('.rg__thumb.is-active', thumbs))));
    });
  }

  /* ---------- Mapa interactivo ---------- */
  var mapEl = $('#map');
  if (!mapEl) return;
  // Coordenadas editables: [lat, lng]. radius = metros del área iluminada.
  // Foto genérica de parque industrial: Omar David Sandoval Sida, CC BY-SA 3.0 (Wikimedia Commons)
  var PARK = 'assets/img/brand/parque-industrial.webp';
  var HOTEL = { id: 'hotel', name: 'Distrito Hotel', dist: 'Tu punto de partida', ll: [20.62756, -100.18299], img: 'assets/img/hotel/fachada-dia-sm.webp', radius: 140 };
  var PLACES = [
    HOTEL,
    { id: 'parking', name: 'Estacionamiento de larga estancia', dist: 'Frente al hotel · 2 min', ll: [20.62384, -100.19156], radius: 130, img: 'assets/img/brand/estacionamiento.webp' },
    { id: 'aiq', name: 'Aeropuerto Internacional de Querétaro', dist: 'Enfrente · 2 min', ll: [20.61790, -100.18627], radius: 1300, img: 'assets/img/brand/aeropuerto.webp' },
    { id: 'unaq', name: 'Universidad Aeronáutica (UNAQ)', dist: 'A 500 m del hotel', ll: [20.62606, -100.18752], radius: 230, img: 'assets/img/brand/universidad-aeronautica.webp' },
    { id: 'aerotech', name: 'Parque Industrial Aerotech', dist: '1.6 km · 3 min', ll: [20.63121, -100.16918], radius: 450, img: PARK },
    { id: 'safran', name: 'Safran Aircraft Engines', dist: '1.7 km · 4 min', ll: [20.61862, -100.16877], radius: 280, img: PARK },
    { id: 'puerta', name: 'Parque Industrial Puerta Querétaro', dist: '4 km · 8 min', ll: [20.62560, -100.22196], radius: 450, img: PARK },
    { id: 'odonnell', name: "Parque Industrial O'Donnell Aeropuerto", dist: '5 km · 10 min', ll: [20.61940, -100.23200], radius: 550, img: PARK },
    { id: 'vynmsa', name: 'Parque Industrial VYNMSA Querétaro', dist: '4.5 km · 10 min', ll: [20.59076, -100.20021], radius: 450, img: PARK }
  ];
  var FACTORY = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 21V10l5 3V10l5 3V7l8 4v10H3zm4-3h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z"/></svg>';

  var list = $('#places');
  PLACES.forEach(function (p) {
    var li = document.createElement('li');
    li.className = 'place' + (p.id === 'hotel' ? ' is-active' : '');
    li.dataset.id = p.id; li.tabIndex = 0;
    li.innerHTML = '<div><h3><span class="place__dot"></span>' + p.name + '</h3><small>' + p.dist + '</small></div>' +
      (p.img ? '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" width="104" height="70">'
             : '<span class="place__ico" aria-hidden="true">' + (p.id === 'parking' ? 'P' : FACTORY) + '</span>');
    list.appendChild(li);
  });

  function initMap() {
    if (typeof L === 'undefined') return;
    var map = L.map('map', { center: [20.6264, -100.1953], zoom: 14, scrollWheelZoom: false });
    // OpenStreetMap: sin API key. Se oscurece y entona en dorado con CSS (.map-wrap .leaflet-tile-pane)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' }).addTo(map);
    var card = $('#mapCard'), areaLayer = L.layerGroup().addTo(map), current = null;

    PLACES.forEach(function (p) {
      var isHotel = p.id === 'hotel';
      var icon = L.divIcon({ className: '', html: '<div class="pin' + (isHotel ? ' pin--hotel' : '') + '" data-pin="' + p.id + '"><span class="pin__pulse"></span><span class="pin__core"></span></div>', iconSize: isHotel ? [30, 30] : [22, 22], iconAnchor: isHotel ? [15, 15] : [11, 11] });
      var m = L.marker(p.ll, { icon: icon, title: p.name, riseOnHover: true }).addTo(map);
      m.bindTooltip(p.name, { className: 'pin-label', direction: 'top', offset: [0, -14], permanent: isHotel });
      m.on('mouseover click', function () { highlight(p.id, false); });
    });

    function highlight(id, pan) {
      if (current === id) return; current = id;
      var p = PLACES.filter(function (x) { return x.id === id; })[0];
      areaLayer.clearLayers();
      L.circle(p.ll, { radius: p.radius * 1.6, stroke: false, fillColor: '#C29F7B', fillOpacity: .08 }).addTo(areaLayer);
      L.circle(p.ll, { radius: p.radius, color: '#C29F7B', weight: 2, fillColor: '#C29F7B', fillOpacity: .28 }).addTo(areaLayer);
      if (id !== 'hotel') {
        var a = HOTEL.ll, b = p.ll, mid = [(a[0] + b[0]) / 2 + (b[1] - a[1]) * .15, (a[1] + b[1]) / 2 - (b[0] - a[0]) * .15], pts = [];
        for (var t = 0; t <= 1.0001; t += .05) pts.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * mid[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * mid[1] + t * t * b[1]]);
        L.polyline(pts, { color: '#ffd9a8', weight: 2.5, opacity: .95, className: 'route' }).addTo(areaLayer);
        L.circle(HOTEL.ll, { radius: 120, color: '#fff', weight: 1, fillOpacity: .15, fillColor: '#fff' }).addTo(areaLayer);
      }
      $$('.pin').forEach(function (el) { el.classList.toggle('is-active', el.dataset.pin === id); });
      $$('.place', list).forEach(function (el) { el.classList.toggle('is-active', el.dataset.id === id); });
      $('.map-card__tag', card).textContent = id === 'hotel' ? 'Distrito Hotel' : 'Desde Distrito Hotel';
      $('.map-card__title', card).textContent = p.name;
      $('.map-card__dist', card).textContent = p.dist;
      if (hasGsap) gsap.fromTo(card, { y: 12, opacity: .4 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
      if (pan) {
        if (id === 'hotel') map.flyTo(HOTEL.ll, 15, { duration: .8 });
        else map.flyToBounds(L.latLngBounds([HOTEL.ll, p.ll]).pad(.45), { duration: .8, maxZoom: 15 });
      }
    }
    list.addEventListener('mouseover', function (e) { var li = e.target.closest('.place'); if (li) highlight(li.dataset.id, true); });
    list.addEventListener('focusin', function (e) { var li = e.target.closest('.place'); if (li) highlight(li.dataset.id, true); });
    list.addEventListener('click', function (e) { var li = e.target.closest('.place'); if (li) { current = null; highlight(li.dataset.id, true); } });
    map.fitBounds(L.latLngBounds(PLACES.map(function (p) { return p.ll; })).pad(0.06));
    highlight('hotel', false);
    setTimeout(function () { map.invalidateSize(); }, 400);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); initMap(); } }, { rootMargin: '400px' });
    io.observe(mapEl);
  } else initMap();
})();
