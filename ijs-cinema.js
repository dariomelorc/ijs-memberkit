/* IJS Academy: "modo cinema" para aulas com vídeo vturb no Memberkit (v1)
 *
 * Reproduz o layout que o Memberkit usa com os players parceiros:
 *  - faixa escura no topo, em largura total, com o vídeo à esquerda e a lista de aulas à direita (desktop);
 *  - botões "Alternar layout" (esconde/mostra a lista, lembrado no cookie `wide`) e "Apagar as luzes".
 * Os botões e a lista usam os componentes nativos do Memberkit (Stimulus: toggle, theater, scroll-to-self),
 * por isso têm o mesmo visual e comportamento. Aulas que já usam player parceiro não são alteradas.
 */
(function () {
  'use strict';
  if (window.__ijsCinemaLoaded) return;
  window.__ijsCinemaLoaded = true;

  // Módulos 1 a 7: nas aulas de produto único, a lista mostra todas as aulas do módulo.
  var MODULES = ['67819', '67820', '67821', '67825', '67826', '64403', '67829'];
  // true: apaga as luzes sozinho quando o vídeo começa e acende no pause (o Memberkit nativo só faz pelo botão)
  var AUTO_LIGHTS = false;

  var cache = {};
  function getDoc(url) {
    if (!cache[url]) {
      cache[url] = fetch(url, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (t) { return new DOMParser().parseFromString(t, 'text/html'); })
        .catch(function () { return new DOMParser().parseFromString('', 'text/html'); });
    }
    return cache[url];
  }
  function path(a) { return (a.getAttribute('href') || '').split(/[?#]/)[0]; }
  function uniq(list) { var s = {}, o = []; list.forEach(function (x) { if (x && !s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function catId(url) { var m = (url || '').match(/^\/categories\/(\d+)/); return m ? m[1] : null; }
  function isEs() { return (document.documentElement.lang || '').indexOf('es') === 0; }

  // Aulas de um produto: [{href, title}]
  function lessonsOf(courseId) {
    return getDoc('/' + courseId).then(function (d) {
      var re = new RegExp('^/' + courseId + '(?:-[^/]*)?/\\d+'), seen = {}, out = [];
      [].forEach.call(d.querySelectorAll('a[href]'), function (a) {
        var p = path(a), t = a.textContent.replace(/\s+/g, ' ').trim();
        if (re.test(p) && !seen[p] && t) { seen[p] = 1; out.push({ href: p, title: t }); }
      });
      return out;
    });
  }
  // Produtos de um módulo, na ordem: [{id, img}]
  function coursesOf(catUrl) {
    return getDoc(catUrl).then(function (d) {
      var seen = {}, out = [];
      [].forEach.call(d.querySelectorAll('a[href]'), function (a) {
        var m = path(a).match(/^\/(\d+)-/);
        if (m && !seen[m[1]]) { seen[m[1]] = 1; var img = a.querySelector('img'); out.push({ id: m[1], img: img ? img.getAttribute('src') : '' }); }
      });
      return out;
    });
  }
  // Nome do produto = título da página do produto
  function courseTitle(courseId) {
    return getDoc('/' + courseId).then(function (d) { return (d.title || '').split(' · ')[0].trim(); });
  }
  function courseCover(courseId) {
    return getDoc('/' + courseId).then(function (d) {
      var img = d.querySelector('main img[src*="memberkit"], main img');
      return img ? img.getAttribute('src') : '';
    });
  }

  var ICONS = {
    layout: '<div class="icon flex-none pointer-events-none size-5 "><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg></div>',
    light: '<div class="icon flex-none pointer-events-none size-5 "><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></div>',
    video: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5.14v14l11-7-11-7z"/></svg>'
  };

  function entryHtml(e, active) {
    var thumb = e.img
      ? '<img width="60" height="34" class="rounded" style="width:60px;height:34px;object-fit:cover" src="' + esc(e.img) + '">'
      : '<div class="rounded" style="width:60px;height:34px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3b2a8a,#6d4ae0);color:#fff">' + ICONS.video + '</div>';
    return '<a ' + (active ? 'data-controller="scroll-to-self" ' : '') +
      'class="aside__entry flex items-center px-5 py-3 leading-snug text-white/60 outline-none transition-all hover:bg-white/10 hover:text-white' + (active ? ' active bg-white/10 text-white' : '') +
      '" href="' + esc(e.href) + '"><div class="flex-none">' + thumb + '</div><div class="ml-4 font-medium">' + esc(e.title) + '</div></a>';
  }

  function buildList(listEl, cur, catUrl) {
    lessonsOf(cur.course).then(function (own) {
      if (own.length > 1 || MODULES.indexOf(catId(catUrl)) < 0) {
        // Produto com várias aulas (ex.: Casos): lista as aulas do produto
        return courseCover(cur.course).then(function (img) {
          return own.map(function (l) { return { href: l.href, title: l.title, img: img, active: l.href.match(/\/(\d+)(?:-[^/]*)?$/)[1] === cur.lesson }; });
        });
      }
      // Produto de uma aula só (Módulos 1 a 7): lista as aulas do módulo
      return coursesOf(catUrl).then(function (cs) {
        return Promise.all(cs.map(function (c) {
          return Promise.all([lessonsOf(c.id), courseTitle(c.id)]).then(function (r) {
            return r[0].length ? { href: r[0][0].href, title: r[1] || r[0][0].title, img: c.img, active: c.id === cur.course } : null;
          });
        })).then(function (l) { return l.filter(Boolean); });
      });
    }).then(function (entries) {
      if (!document.body.contains(listEl)) return;
      listEl.innerHTML = entries.map(function (e) { return entryHtml(e, e.active); }).join('');
      var act = listEl.querySelector('.active');
      if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    });
  }

  function wideCookie() { var m = document.cookie.match(/(?:^|;\s*)wide=([^;]*)/); return m && m[1] === 'true'; }

  function run() {
    var cur = location.pathname.match(/^\/(\d+)(?:-[^\/]*)?\/(\d+)/);
    if (!cur) return;
    cur = { course: cur[1], lesson: cur[2] };
    var main = document.getElementById('main');
    if (!main || main.querySelector('.bg-theater')) return; // player parceiro ou já montado
    var video = main.querySelector('.prose [id^="ifr_"][id$="_wrapper"], .prose vturb-smartplayer');
    if (!video) return;
    var bm = document.querySelector('[id^="bookmark_lesson_"]');
    var bar = bm && bm.parentElement;
    var cat = document.querySelector('a[href*="/categories/"][href$="/courses"]');
    var catUrl = cat ? path(cat) : '';
    var prose = video.closest('.prose');

    // 1) Faixa escura com o vídeo e a lista de aulas (mesmas classes do Memberkit)
    var stage = document.createElement('div');
    stage.className = 'bg-theater bg-zinc-950 dark:bg-black';
    stage.setAttribute('data-ijs-cinema', '');
    stage.innerHTML = '<div class="mx-auto max-w-screen-xl px-4 md:px-8"><div class="flex">' +
      '<div class="grow"><div class="relative z-20" data-ijs-video></div></div>' +
      '<div id="aside__entries" class="relative hidden lg:block lg:w-4/12' + (wideCookie() ? ' lg:hidden' : '') + '">' +
      '<div class="scrollbar absolute inset-0 overflow-y-auto" data-ijs-list></div></div></div></div>';
    stage.querySelector('[data-ijs-video]').appendChild(video);
    main.insertBefore(stage, main.firstChild);
    if (prose && !prose.textContent.trim() && !prose.querySelector('img,iframe,video,a,table')) prose.style.display = 'none';
    buildList(stage.querySelector('[data-ijs-list]'), cur, catUrl);

    // 2) Botões "Alternar layout" e "Apagar as luzes" (componentes nativos do Memberkit)
    if (bar && !bar.querySelector('[data-ijs-cinema-btn]')) {
      var es = isEs();
      var t = document.createElement('div');
      t.innerHTML =
        '<button type="button" data-ijs-cinema-btn class="btn btn-outline-secondary btn-md hidden p-2 lg:inline-flex" aria-controls="aside__entries" data-controller="toggle" data-toggle-cookie-value="wide" data-toggle-base-class="lg:hidden" data-tippy-content="' + (es ? 'Cambiar diseño' : 'Alternar layout') + '" data-action="click->toggle#toggle">' + ICONS.layout + '</button>' +
        '<button type="button" data-ijs-cinema-btn class="btn btn-outline-secondary btn-md p-2" data-tippy-content="' + (es ? 'Apagar las luces' : 'Apagar as luzes') + '" data-controller="theater" data-action="click->theater#show">' + ICONS.light + '</button>';
      bar.insertBefore(t.children[1], bar.firstChild);
      bar.insertBefore(t.children[0], bar.firstChild);
    }
  }

  // Opcional: luzes automáticas com os eventos do player vturb (videoPlay / videoPause)
  if (AUTO_LIGHTS) {
    window.addEventListener('message', function (e) {
      if (!/converteai\.net$/.test((e.origin || '').replace(/^https?:\/\//, '').split('/')[0])) return;
      var d = e.data; try { if (typeof d === 'string') d = JSON.parse(d); } catch (x) { return; }
      if (!d || !d.type) return;
      var th = document.querySelector('.theater');
      if (!th || !document.querySelector('[data-ijs-cinema]')) return;
      if (d.type === 'videoPlay') { th.dataset.state = 'idle'; requestAnimationFrame(function () { th.dataset.state = 'open'; }); }
      if (d.type === 'videoPause' || d.type === 'videoEnded') { delete th.dataset.state; }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  document.addEventListener('turbo:load', run);
  document.addEventListener('turbo:render', run);
})();
