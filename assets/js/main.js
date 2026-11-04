/* Distrito Hotel — interacciones */
(function () {
  'use strict';
  var IMG = 'https://lavenderblush-bison-390947.hostingersite.com/wp-content/uploads/';
  var WA = '524426737901';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  if (!hasGsap) document.documentElement.classList.add('no-gsap');
  else gsap.registerPlugin(ScrollTrigger);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Header sticky + menú móvil ---------- */
  var header = document.getElementById('header');
  var toTop = document.getElementById('toTop');
  var ring = document.getElementById('toTopRing');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > 600);
    var max = document.documentElement.scrollHeight - innerHeight;
    ring.style.strokeDashoffset = 302 - (302 * (max > 0 ? y / max : 0));
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('burger');
  var nav = document.querySelector('.nav');
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  });

  /* ---------- Loader + Hero (aparece una sola vez y se queda fijo) ---------- */
  function splitChars(el) {
    var text = el.textContent; el.textContent = '';
    text.split('').forEach(function (ch) {
      var s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(s);
    });
  }
  document.querySelectorAll('.hero__title .line > span').forEach(splitChars);

  var loader = document.querySelector('.loader');
  var hotel = document.getElementById('heroHotel');

  function startHero() {
    if (!hasGsap || reduce) { loader.remove(); return; }
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(loader, { autoAlpha: 0, duration: .6, onComplete: function () { loader.remove(); } })
      .from('.hero__title .char', { yPercent: 110, rotate: 18, opacity: 0, duration: 1, stagger: .025 }, '-=.2')
      .fromTo(hotel,
        { y: 220, opacity: 0, rotationX: 28, scale: .88, filter: 'brightness(0) blur(6px)' },
        { y: 0, opacity: 1, rotationX: 0, scale: 1, filter: 'brightness(1) blur(0px)', duration: 2.2, ease: 'expo.out' }, '-=.6')
      .to('.hero__glow', { opacity: 1, duration: 1.6 }, '-=1.4')
      .from('.hero__scroll', { opacity: 0, y: 20, duration: .8 }, '-=1');

    // Parallax al hacer scroll (el hotel permanece visible y fijo en su lugar)
    gsap.to('.hero__title', { yPercent: -60, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__stage', { y: 80, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Efecto 3D con el mouse
    var stage = document.getElementById('heroStage');
    var qx = gsap.quickTo(stage, 'rotationY', { duration: 1.2, ease: 'power3' });
    var qy = gsap.quickTo(stage, 'rotationX', { duration: 1.2, ease: 'power3' });
    document.querySelector('.hero').addEventListener('mousemove', function (e) {
      qx((e.clientX / innerWidth - .5) * 6);
      qy((e.clientY / innerHeight - .5) * -3);
    });
  }
  if (hotel.complete) setTimeout(startHero, 250);
  else { hotel.addEventListener('load', startHero, { once: true }); setTimeout(function () { if (document.body.contains(loader)) startHero(); }, 3500); }

  /* ---------- Reveals al hacer scroll ---------- */
  if (hasGsap && !reduce) {
    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.utils.toArray('.reveal-3d').forEach(function (el) {
      gsap.from(el, { rotationX: 18, rotationY: -12, y: 100, opacity: 0, transformPerspective: 1200, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    gsap.from('.marquee', { opacity: 0, y: 40, duration: 1, scrollTrigger: { trigger: '.marquee', start: 'top 90%' } });
  }

  /* ---------- Tilt 3D en imagen del video ---------- */
  document.querySelectorAll('[data-tilt]').forEach(function (el) {
    if (reduce) return;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = 'rotateY(' + x * 10 + 'deg) rotateX(' + -y * 10 + 'deg)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  });

  /* ---------- Video popup ---------- */
  var modal = document.getElementById('videoModal');
  var holder = document.getElementById('videoHolder');
  var playBtn = document.getElementById('playBtn');
  function openVideo() {
    holder.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/ger_L_7KDts?autoplay=1&rel=0" title="Video Distrito Hotel" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    modal.hidden = false; document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__close').focus();
  }
  function closeVideo() { modal.hidden = true; holder.innerHTML = ''; document.body.style.overflow = ''; playBtn.focus(); }
  playBtn.addEventListener('click', openVideo);
  modal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeVideo(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeVideo(); });

  /* ---------- Carrusel de amenidades ---------- */
  (function () {
    var imgs = document.querySelectorAll('#amMedia img');
    var slides = document.querySelectorAll('#amSlides .am');
    var idxEl = document.getElementById('amIdx');
    var bar = document.getElementById('amBar');
    var i = 0, n = slides.length, timer, DUR = 6000;
    function go(k) {
      i = (k + n) % n;
      imgs.forEach(function (im, j) { im.classList.toggle('is-active', j === i); });
      slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      idxEl.textContent = ('0' + (i + 1)).slice(-2);
      restart();
    }
    function restart() {
      clearTimeout(timer);
      bar.style.transition = 'none'; bar.style.width = '0';
      void bar.offsetWidth;
      bar.style.transition = 'width ' + DUR + 'ms linear'; bar.style.width = '100%';
      timer = setTimeout(function () { go(i + 1); }, DUR);
    }
    document.getElementById('amPrev').addEventListener('click', function () { go(i - 1); });
    document.getElementById('amNext').addEventListener('click', function () { go(i + 1); });
    // swipe en móvil
    var sx = 0, sec = document.getElementById('amenidades');
    sec.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    sec.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) go(i + (d < 0 ? 1 : -1)); });
    restart();
  })();

  /* ---------- Mapa interactivo ---------- */
  // Coordenadas editables: [lat, lng]. radius = metros del área iluminada.
  var HOTEL = { id: 'hotel', name: 'Distrito Hotel', dist: 'Tu punto de partida', ll: [20.6268, -100.1880], img: IMG + '2026/09/distrito-hotel-aeropuerto-noche.webp', radius: 160 };
  var PLACES = [
    HOTEL,
    { id: 'parking', name: 'Estacionamiento de larga estancia', dist: 'A pasos del hotel', ll: [20.6248, -100.1898], radius: 180, img: null },
    { id: 'aiq', name: 'Aeropuerto Internacional de Querétaro', dist: 'Enfrente · 2 min', ll: [20.6190, -100.1860], radius: 900, img: IMG + '2026/10/aeropuerto-300x225.webp' },
    { id: 'unaq', name: 'Universidad Aeronáutica (UNAQ)', dist: 'A lado del aeropuerto · 4 min', ll: [20.6285, -100.2075], radius: 350, img: IMG + '2026/10/universidad-aeronautica-300x200.webp' },
    { id: 'aerotech', name: 'Parque Industrial Aerotech', dist: '2 km · 4 min', ll: [20.6360, -100.1760], radius: 600, img: null },
    { id: 'safran', name: 'Safran Aircraft Engines', dist: '1.5 km · 3 min', ll: [20.6215, -100.1735], radius: 300, img: null },
    { id: 'puerta', name: 'Parque Industrial Puerta Querétaro', dist: '5.5 km · 8 min', ll: [20.6325, -100.2395], radius: 550, img: null },
    { id: 'odonnell', name: "Parque Industrial O'Donnell Aeropuerto", dist: '6.5 km · 10 min', ll: [20.6185, -100.2470], radius: 650, img: null },
    { id: 'vynmsa', name: 'Parque Industrial VYNMSA Querétaro', dist: '6 km · 10 min', ll: [20.5885, -100.2245], radius: 550, img: null }
  ];

  var list = document.getElementById('places');
  PLACES.forEach(function (p) {
    var li = document.createElement('li');
    li.className = 'place' + (p.id === 'hotel' ? ' is-active' : '');
    li.dataset.id = p.id; li.tabIndex = 0;
    li.innerHTML = '<div><h3><span class="place__dot"></span>' + p.name + '</h3><small>' + p.dist + '</small></div>' + (p.img ? '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" width="104" height="70">' : '<span class="place__ico" aria-hidden="true">' + (p.id === 'parking' ? 'P' : '<svg viewBox="0 0 24 24"><path d="M3 21V10l5 3V10l5 3V7l8 4v10H3zm4-3h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z"/></svg>') + '</span>');
    list.appendChild(li);
  });

  function initMap() {
    if (typeof L === 'undefined') return;
    var map = L.map('map', { center: [20.6264, -100.1953], zoom: 14, scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    var card = document.getElementById('mapCard');
    var areaLayer = L.layerGroup().addTo(map);
    var markers = {};

    PLACES.forEach(function (p) {
      var isHotel = p.id === 'hotel';
      var icon = L.divIcon({ className: '', html: '<div class="pin' + (isHotel ? ' pin--hotel' : '') + '" data-pin="' + p.id + '"><span class="pin__pulse"></span><span class="pin__core"></span></div>', iconSize: isHotel ? [30, 30] : [22, 22], iconAnchor: isHotel ? [15, 15] : [11, 11] });
      var m = L.marker(p.ll, { icon: icon, keyboard: true, title: p.name, riseOnHover: true }).addTo(map);
      m.bindTooltip(p.name, { className: 'pin-label', direction: 'top', offset: [0, -14], permanent: isHotel });
      m.on('mouseover click focus', function () { highlight(p.id, false); });
      markers[p.id] = m;
    });

    var current = null;
    function highlight(id, pan) {
      if (current === id) return;
      current = id;
      var p = PLACES.filter(function (x) { return x.id === id; })[0];
      areaLayer.clearLayers();
      // Área iluminada
      L.circle(p.ll, { radius: p.radius * 1.6, stroke: false, fillColor: '#C29F7B', fillOpacity: .08 }).addTo(areaLayer);
      L.circle(p.ll, { radius: p.radius, color: '#C29F7B', weight: 2, fillColor: '#C29F7B', fillOpacity: .28, className: 'area' }).addTo(areaLayer);
      // Ruta desde el hotel
      if (id !== 'hotel') {
        var a = HOTEL.ll, b = p.ll;
        var mid = [(a[0] + b[0]) / 2 + (b[1] - a[1]) * .15, (a[1] + b[1]) / 2 - (b[0] - a[0]) * .15];
        var pts = [];
        for (var t = 0; t <= 1.0001; t += .05) {
          pts.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * mid[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * mid[1] + t * t * b[1]]);
        }
        L.polyline(pts, { color: '#ffd9a8', weight: 2.5, opacity: .95, className: 'route' }).addTo(areaLayer);
        L.circle(HOTEL.ll, { radius: 120, color: '#fff', weight: 1, fillOpacity: .15, fillColor: '#fff' }).addTo(areaLayer);
      }
      document.querySelectorAll('.pin').forEach(function (el) { el.classList.toggle('is-active', el.dataset.pin === id); });
      list.querySelectorAll('.place').forEach(function (el) { el.classList.toggle('is-active', el.dataset.id === id); });
      card.querySelector('.map-card__tag').textContent = id === 'hotel' ? 'Distrito Hotel' : 'Desde Distrito Hotel';
      card.querySelector('.map-card__title').textContent = p.name;
      card.querySelector('.map-card__dist').textContent = p.dist;
      if (hasGsap) gsap.fromTo(card, { y: 12, opacity: .4 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
      if (pan) {
        if (id === 'hotel') map.flyTo(HOTEL.ll, 15, { duration: .8 });
        else map.flyToBounds(L.latLngBounds([HOTEL.ll, p.ll]).pad(.45), { duration: .8, maxZoom: 15 });
      }
    }

    list.addEventListener('mouseover', function (e) { var li = e.target.closest('.place'); if (li) highlight(li.dataset.id, true); });
    list.addEventListener('focusin', function (e) { var li = e.target.closest('.place'); if (li) highlight(li.dataset.id, true); });
    list.addEventListener('click', function (e) { var li = e.target.closest('.place'); if (li) { current = null; highlight(li.dataset.id, true); } });

    highlight('hotel', false);
    setTimeout(function () { map.invalidateSize(); }, 400);
  }

  // Carga el mapa cuando la sección se acerca (rendimiento)
  var mapEl = document.getElementById('map');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); initMap(); } }, { rootMargin: '400px' });
    io.observe(mapEl);
  } else initMap();
})();
