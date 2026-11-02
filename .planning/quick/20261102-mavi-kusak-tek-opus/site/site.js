/* Mavi Kuşak Çini Atölyesi — site behaviour */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- the workshop seal, drawn once and placed wherever .muhur sits ---- */
  var SEAL = '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="mh-c" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>' +
    '<circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width="1"/>' +
    '<circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" stroke-width=".8"/>' +
    '<g class="muhur-don"><text font-family="Jost,sans-serif" font-size="9" letter-spacing="2.1" fill="currentColor"><textPath href="#mh-c">MAVİ KUŞAK · İZNİK · EL YAPIMI · 1998 ·</textPath></text></g>' +
    '<path d="M60 78 C60 70 60 62 60 56 M60 64 C54 62 50 58 49 52 M60 66 C66 64 70 60 71 54" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
    '<path d="M60 56 C53 54 51 46 53 38 C56 42 58 43 60 40 C62 43 64 42 67 38 C69 46 67 54 60 56 Z" fill="currentColor"/></svg>';
  doc.querySelectorAll('.muhur').forEach(function (el) { el.innerHTML = SEAL; });

  /* ---- header ---- */
  var serit = doc.querySelector('.ust-serit');
  var kahraman = doc.querySelector('.kahraman');
  function seritGuncelle() {
    if (!serit) return;
    var esik = kahraman ? kahraman.offsetHeight - 90 : 40;
    serit.classList.toggle('dolu', window.scrollY > esik);
  }
  if (serit && !kahraman) serit.classList.add('koyu');
  window.addEventListener('scroll', seritGuncelle, { passive: true });
  seritGuncelle();

  var menuDugme = doc.querySelector('.menu-dugme');
  if (menuDugme) {
    menuDugme.addEventListener('click', function () {
      var acik = body.classList.toggle('menu-acik');
      menuDugme.setAttribute('aria-expanded', acik ? 'true' : 'false');
    });
    doc.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () { body.classList.remove('menu-acik'); menuDugme.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---- reveal on entry ---- */
  var gozcu = new IntersectionObserver(function (girisler) {
    girisler.forEach(function (g) { if (g.isIntersecting) { g.target.classList.add('gorundu'); gozcu.unobserve(g.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  doc.querySelectorAll('.gel, .satir, .perde, [data-gel]').forEach(function (el) { gozcu.observe(el); });

  /* ---- the page ground changes as you travel ---- */
  var zeminler = doc.querySelectorAll('[data-zemin]');
  if (zeminler.length) {
    var zg = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        if (!g.isIntersecting) return;
        body.classList.remove('zemin-gece', 'zemin-tas');
        var z = g.target.getAttribute('data-zemin');
        if (z !== 'kirec') body.classList.add('zemin-' + z);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    zeminler.forEach(function (el) { zg.observe(el); });
  }

  /* ---- sticky craft: one frame, the step in view sets the picture ---- */
  var zanaat = doc.querySelector('.zanaat');
  if (zanaat) {
    var resimler = zanaat.querySelectorAll('.cerceve img');
    var sayac = zanaat.querySelector('.sayac');
    var adimlar = zanaat.querySelectorAll('.adim');
    var ag = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        if (!g.isIntersecting) return;
        var i = +g.target.getAttribute('data-i');
        adimlar.forEach(function (a, j) { a.classList.toggle('aktif', i === j); });
        resimler.forEach(function (r, j) { r.classList.toggle('aktif', i === j); });
        if (sayac) sayac.textContent = '0' + (i + 1) + ' / 0' + adimlar.length;
      });
    }, { rootMargin: '-48% 0px -48% 0px' });
    adimlar.forEach(function (a) { ag.observe(a); });
  }

  /* ---- hold it in your hand: the tile follows the pointer, the glaze catches the light ---- */
  var karo = doc.querySelector('.karo3d');
  if (karo) {
    var sahne = karo.parentElement, cevrik = false, rx = 0, ry = 0;
    var parilti = karo.querySelector('.parilti');
    function uygula() {
      karo.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + (ry + (cevrik ? 180 : 0)) + 'deg)';
    }
    function isik(x, y) { if (parilti) { parilti.style.setProperty('--gx', (x * 100) + '%'); parilti.style.setProperty('--gy', (y * 100) + '%'); } }
    sahne.addEventListener('pointermove', function (e) {
      var r = sahne.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      ry = (x - 0.5) * 26; rx = (0.5 - y) * 22;
      karo.style.transition = 'transform .25s ease-out';
      uygula(); isik(cevrik ? 1 - x : x, y);
    });
    sahne.addEventListener('pointerleave', function () { rx = 0; ry = 0; karo.style.transition = ''; uygula(); isik(0.3, 0.2); });
    var cevirDugme = doc.querySelector('.cevir');
    function cevir() {
      cevrik = !cevrik; karo.style.transition = 'transform 1.2s cubic-bezier(.2,.7,.1,1)'; uygula();
      if (cevirDugme) cevirDugme.textContent = cevrik ? 'Desene dön' : 'Arkasını çevir';
    }
    karo.addEventListener('click', cevir);
    if (cevirDugme) cevirDugme.addEventListener('click', cevir);
    /* on a phone, scrolling turns the tile slowly instead */
    if (!window.matchMedia('(hover:hover)').matches && !azHareket) {
      window.addEventListener('scroll', function () {
        var r = sahne.getBoundingClientRect(), vh = window.innerHeight;
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around centre
        rx = Math.max(-18, Math.min(18, p * 30)); ry = Math.max(-14, Math.min(14, -p * 16));
        uygula(); isik(0.5 - p * 0.4, 0.5 + p * 0.5);
      }, { passive: true });
    }
  }

  /* ---- patterns: vertical scroll pans the rail sideways (desktop) ---- */
  var pin = doc.querySelector('.desen-pin');
  if (pin && window.matchMedia('(min-width: 861px)').matches && !azHareket) {
    var ray = pin.querySelector('.ray');
    var yapis = pin.querySelector('.yapis');
    function olc() {
      var fazla = Math.max(0, ray.scrollWidth - window.innerWidth);
      pin.style.height = (yapis.offsetHeight + fazla) + 'px';
      return fazla;
    }
    var fazla = olc();
    window.addEventListener('resize', function () { fazla = olc(); });
    window.addEventListener('scroll', function () {
      var r = pin.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, fazla)));
      ray.style.transform = 'translate3d(' + (-p * fazla) + 'px,0,0)';
    }, { passive: true });
  }

  /* ---- spaces: the middle picture drifts against the scroll ---- */
  var mekan = doc.querySelector('.mekan');
  if (mekan && !azHareket) {
    window.addEventListener('scroll', function () {
      var r = mekan.getBoundingClientRect();
      var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      mekan.style.setProperty('--k', (p * 90).toFixed(1) + 'px');
    }, { passive: true });
  }

  /* ---- collection filter ---- */
  var suzgec = doc.querySelector('.suzgec');
  if (suzgec) {
    var dugmeler = suzgec.querySelectorAll('button');
    var gruplar = doc.querySelectorAll('.grup');
    function sec(g) {
      dugmeler.forEach(function (d) { d.setAttribute('aria-pressed', d.getAttribute('data-g') === g ? 'true' : 'false'); });
      gruplar.forEach(function (gr) { gr.hidden = !(g === 'hepsi' || gr.getAttribute('data-g') === g); });
    }
    dugmeler.forEach(function (d) {
      d.addEventListener('click', function () {
        var g = d.getAttribute('data-g'); sec(g);
        history.replaceState(null, '', g === 'hepsi' ? location.pathname : '#' + g);
        var hedef = doc.getElementById('koleksiyon-liste');
        if (hedef && hedef.getBoundingClientRect().top < 0) hedef.scrollIntoView({ behavior: azHareket ? 'auto' : 'smooth' });
      });
    });
    var h = location.hash.replace('#', '');
    if (h && suzgec.querySelector('[data-g="' + h + '"]')) sec(h);
  }

  /* ---- visiting hours: mark today ---- */
  var saatler = doc.querySelector('.saatler');
  if (saatler) {
    var gun = new Date().getDay(); // 0 = Sunday
    var satir = saatler.querySelector('[data-gun~="' + gun + '"]');
    if (satir) satir.classList.add('bugun');
  }

  /* ---- custom order form ---- */
  var form = doc.getElementById('siparis-formu');
  if (form) {
    var ANAHTAR = 'mavikusak-siparis-taslak';
    var alanlar = ['ad', 'telefon', 'eposta', 'istek', 'olcu', 'adet', 'tarih', 'parca'];
    var taslakYazi = doc.getElementById('taslak');
    var kutu = doc.getElementById('form-kutu');
    var alindi = doc.getElementById('alindi');
    var riza = form.querySelector('#riza');
    var gonder = form.querySelector('.gonder');
    var dosyalar = [];

    function oku() { var o = {}; alanlar.forEach(function (a) { var el = form.elements[a]; if (el) o[a] = el.value; }); o.riza = riza.checked; return o; }
    function kaydet() {
      try { localStorage.setItem(ANAHTAR, JSON.stringify(oku())); if (taslakYazi) { taslakYazi.textContent = 'Yazdıklarınız bu cihazda saklanıyor.'; } } catch (e) {}
    }
    function yukle() {
      try {
        var t = JSON.parse(localStorage.getItem(ANAHTAR) || 'null'); if (!t) return false;
        alanlar.forEach(function (a) { if (t[a] && form.elements[a]) form.elements[a].value = t[a]; });
        riza.checked = !!t.riza; return true;
      } catch (e) { return false; }
    }
    var vardi = yukle();
    if (vardi && taslakYazi) taslakYazi.textContent = 'Yarım kalan talebiniz geri yüklendi.';

    /* arriving from "Bu parçayı sor" */
    var q = new URLSearchParams(location.search);
    var parcaAd = q.get('parca'), parcaKod = q.get('kod');
    if (parcaAd) {
      var etiket = '“' + parcaAd + '”' + (parcaKod ? ' (' + parcaKod + ')' : '');
      form.elements.parca.value = etiket;
      var istek = form.elements.istek;
      if (istek.value.indexOf(parcaAd) === -1) {
        istek.value = etiket + ' hakkında bilgi almak istiyorum.' + (istek.value ? '\n\n' + istek.value : '');
      }
      var cip = doc.getElementById('parca-cip');
      if (cip) { cip.hidden = false; cip.querySelector('b').textContent = etiket; }
      kaydet();
      setTimeout(function () { doc.getElementById('siparis').scrollIntoView({ behavior: azHareket ? 'auto' : 'smooth' }); }, 350);
    }
    var cipKaldir = doc.getElementById('parca-kaldir');
    if (cipKaldir) cipKaldir.addEventListener('click', function () { form.elements.parca.value = ''; doc.getElementById('parca-cip').hidden = true; kaydet(); });

    form.addEventListener('input', function (e) { kaydet(); var a = e.target.closest('.alan'); if (a) a.classList.remove('yanlis'); durum(); });
    form.addEventListener('change', function () { kaydet(); durum(); });

    function durum() { gonder.setAttribute('aria-disabled', riza.checked ? 'false' : 'true'); }
    durum();

    /* example images */
    var dosyaKutu = form.querySelector('.dosya');
    var dosyaGirdi = form.querySelector('#gorsel');
    var onizleme = form.querySelector('.onizleme');
    var dosyaAd = form.querySelector('.dosya .ad');
    function ciz() {
      onizleme.innerHTML = '';
      dosyalar.forEach(function (f, i) {
        var fig = doc.createElement('figure');
        var img = doc.createElement('img'); img.alt = f.name; img.src = URL.createObjectURL(f);
        var x = doc.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', f.name + ' görselini kaldır'); x.textContent = '×';
        x.addEventListener('click', function () { dosyalar.splice(i, 1); ciz(); });
        fig.appendChild(img); fig.appendChild(x); onizleme.appendChild(fig);
      });
      dosyaAd.textContent = dosyalar.length ? dosyalar.length + ' görsel eklendi' : 'JPG, PNG ya da HEIC · en fazla 5 görsel, her biri 10 MB';
    }
    function ekle(liste) {
      Array.prototype.forEach.call(liste, function (f) {
        if (dosyalar.length >= 5) return;
        if (!/^image\//.test(f.type) && !/\.heic$/i.test(f.name)) return;
        if (f.size > 10 * 1024 * 1024) return;
        dosyalar.push(f);
      });
      ciz();
    }
    dosyaGirdi.addEventListener('change', function () { ekle(dosyaGirdi.files); dosyaGirdi.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) { dosyaKutu.addEventListener(t, function (e) { e.preventDefault(); dosyaKutu.classList.add('uzerinde'); }); });
    ['dragleave', 'drop'].forEach(function (t) { dosyaKutu.addEventListener(t, function (e) { e.preventDefault(); dosyaKutu.classList.remove('uzerinde'); }); });
    dosyaKutu.addEventListener('drop', function (e) { ekle(e.dataTransfer.files); });

    function hataGoster(ad, var_) { var a = form.querySelector('[data-alan="' + ad + '"]'); if (a) a.classList.toggle('yanlis', var_); return var_; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = oku(), ilk = null;
      var epostaGecerli = !v.eposta || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.eposta.trim());
      var telGecerli = !v.telefon || v.telefon.replace(/\D/g, '').length >= 10;
      var hatalar = [
        ['ad', !v.ad.trim()],
        ['ulasim', (!v.telefon.trim() && !v.eposta.trim()) || !epostaGecerli || !telGecerli],
        ['istek', !v.istek.trim()],
        ['riza', !v.riza]
      ];
      var ulasimHata = form.querySelector('[data-alan="ulasim"] .hata');
      if (ulasimHata) ulasimHata.textContent = (!v.telefon.trim() && !v.eposta.trim()) ? 'Size dönebilmemiz için telefon ya da e-postadan en az birini yazın.' :
        (!epostaGecerli ? 'E-posta adresi eksik görünüyor; bir daha bakar mısınız?' : 'Telefon numarası en az 10 haneli olmalı.');
      hatalar.forEach(function (h) { if (hataGoster(h[0], h[1]) && !ilk) ilk = h[0]; });
      if (ilk) {
        var el = form.querySelector('[data-alan="' + ilk + '"]');
        el.scrollIntoView({ behavior: azHareket ? 'auto' : 'smooth', block: 'center' });
        var g = el.querySelector('input,textarea'); if (g) setTimeout(function () { g.focus({ preventScroll: true }); }, 400);
        return;
      }
      /* no sending yet: show the request back, keep everything the person wrote */
      var no = 'MK-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 900) + 100);
      var satirlar = [
        ['Talep no', no],
        ['Ad soyad', v.ad],
        ['Telefon', v.telefon || '—'],
        ['E-posta', v.eposta || '—'],
        v.parca ? ['Parça', v.parca] : null,
        ['İsteğiniz', v.istek],
        (v.olcu || v.adet || v.tarih) ? ['Ölçü · adet · tarih', [v.olcu, v.adet, v.tarih].filter(Boolean).join(' · ')] : null,
        dosyalar.length ? ['Örnek görsel', dosyalar.map(function (f) { return f.name; }).join(', ')] : null
      ].filter(Boolean);
      var dl = alindi.querySelector('dl'); dl.innerHTML = '';
      satirlar.forEach(function (s) {
        var dt = doc.createElement('dt'); dt.textContent = s[0];
        var dd = doc.createElement('dd'); dd.textContent = s[1]; if (s[0] === 'Talep no') dd.className = 'talep-no';
        dl.appendChild(dt); dl.appendChild(dd);
      });
      try {
        var gecmis = JSON.parse(localStorage.getItem('mavikusak-talepler') || '[]');
        gecmis.push({ no: no, zaman: new Date().toISOString(), talep: v, gorseller: dosyalar.map(function (f) { return f.name; }) });
        localStorage.setItem('mavikusak-talepler', JSON.stringify(gecmis));
      } catch (err) {}
      kutu.hidden = true; alindi.classList.add('acik');
      alindi.querySelector('h3').focus();
      alindi.scrollIntoView({ behavior: azHareket ? 'auto' : 'smooth', block: 'start' });
    });

    var duzenle = doc.getElementById('duzenle');
    if (duzenle) duzenle.addEventListener('click', function () { alindi.classList.remove('acik'); kutu.hidden = false; form.elements.ad.focus(); });
    var yeni = doc.getElementById('yeni-talep');
    if (yeni) yeni.addEventListener('click', function () {
      try { localStorage.removeItem(ANAHTAR); } catch (e) {}
      form.reset(); dosyalar = []; ciz(); form.elements.parca.value = '';
      var cp = doc.getElementById('parca-cip'); if (cp) cp.hidden = true;
      if (taslakYazi) taslakYazi.textContent = '';
      alindi.classList.remove('acik'); kutu.hidden = false; durum(); form.elements.ad.focus();
    });

    var kvkkAc = doc.querySelectorAll('[data-kvkk]'), kvkk = doc.getElementById('kvkk');
    var kaynakMetin = doc.querySelector('#kvkk-metni .metin'), hedefMetin = kvkk && kvkk.querySelector('.dialog-metin');
    if (kaynakMetin && hedefMetin) hedefMetin.innerHTML = kaynakMetin.innerHTML;
    kvkkAc.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); if (kvkk.showModal) kvkk.showModal(); }); });
  }

  /* footer year */
  doc.querySelectorAll('[data-yil]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
