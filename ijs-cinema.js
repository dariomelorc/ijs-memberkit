/* IJS Academy: "modo cinema" para aulas com vídeo vturb no Memberkit (v4)
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
  // Alguns cursos (ex.: o curso antigo em Treinamentos) não listam as aulas na página do curso,
  // só dentro de cada módulo (/sections/...): nesse caso busca módulo a módulo, na ordem.
  function linksIn(d, courseId, seen, out) {
    var re = new RegExp('^/' + courseId + '(?:-[^/]*)?/\\d+');
    [].forEach.call(d.querySelectorAll('a[href]'), function (a) {
      var p = path(a), t = a.textContent.replace(/\s+/g, ' ').trim();
      if (re.test(p) && !seen[p] && t) { seen[p] = 1; out.push({ href: p, title: t }); }
    });
  }
  function lessonsOf(courseId) {
    return getDoc('/' + courseId).then(function (d) {
      var seen = {}, out = [];
      linksIn(d, courseId, seen, out);
      if (out.length) return out;
      var reSec = new RegExp('^/' + courseId + '(?:-[^/]*)?/sections/\\d+[^/]*$');
      var secs = uniq([].map.call(d.querySelectorAll('a[href]'), function (a) { var p = path(a); return reSec.test(p) ? p : null; }));
      return Promise.all(secs.map(getDoc)).then(function (docs) {
        docs.forEach(function (sd) { linksIn(sd, courseId, seen, out); });
        return out;
      });
    });
  }
  // Módulo (seção) da aula atual: vem do caminho no topo da aula
  //  - cursos novos: link "…/<curso>#<idDaSeção>"
  //  - curso antigo: link "…/<curso>/sections/<idDaSeção>"
  function currentSection(courseId) {
    var re = new RegExp('^/' + courseId + '(?:-[^/]*)?(?:/sections/(\\d+)|[^#]*#(\\d+)$)');
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var m = (links[i].getAttribute('href') || '').match(re);
      if (m && (m[1] || m[2])) return m[1] || m[2];
    }
    return null;
  }
  // Aulas só do módulo atual
  function sectionLessons(courseId, sec) {
    return getDoc('/' + courseId).then(function (d) {
      var seen = {}, out = [];
      var box = d.getElementById('inner_section_' + sec) || d.getElementById(sec);
      if (box) linksIn(box, courseId, seen, out);
      if (out.length) return out;
      return getDoc('/' + courseId + '/sections/' + sec).then(function (sd) {
        var b2 = sd.getElementById('inner_section_' + sec) || sd.getElementById(sec) || sd;
        linksIn(b2, courseId, seen, out);
        return out;
      });
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

  var ICONS = {
    layout: '<div class="icon flex-none pointer-events-none size-5 "><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg></div>',
    light: '<div class="icon flex-none pointer-events-none size-5 "><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></div>',
    // ícone padrão das aulas sem miniatura (mesmo estilo dos itens do player parceiro: quadro roxo com símbolo branco)
    video: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><circle cx="12" cy="12" r="9"/><path d="M10 8.8v6.4l5.2-3.2z" fill="currentColor" stroke="none"/></svg>'
  };

  function entryHtml(e, active) {
    var thumb = e.img
      ? '<img width="60" height="34" class="rounded" style="width:60px;height:34px;object-fit:cover" src="' + esc(e.img) + '">'
      : '<div class="rounded" style="width:60px;height:34px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#4338ca,#7c3aed);color:#fff">' + ICONS.video + '</div>';
    return '<a ' + (active ? 'data-controller="scroll-to-self" ' : '') +
      'class="aside__entry flex items-center px-5 py-3 leading-snug text-white/60 outline-none transition-all hover:bg-white/10 hover:text-white' + (active ? ' active bg-white/10 text-white' : '') +
      '" href="' + esc(e.href) + '"><div class="flex-none">' + thumb + '</div><div class="ml-4 font-medium">' + esc(e.title) + '</div></a>';
  }

  function buildList(listEl, cur, catUrl) {
    lessonsOf(cur.course).then(function (own) {
      if (own.length > 1 || MODULES.indexOf(catId(catUrl)) < 0) {
        // Produto com várias aulas (ex.: Casos, curso ES, Workshops): lista só as aulas do módulo atual,
        // com o ícone padrão (se não achar o módulo, lista as aulas do produto)
        var toEntries = function (ls) { return ls.map(function (l) { return { href: l.href, title: l.title, img: '', active: l.href.match(/\/(\d+)(?:-[^/]*)?$/)[1] === cur.lesson }; }); };
        var sec = currentSection(cur.course);
        if (!sec) return toEntries(own);
        return sectionLessons(cur.course, sec).then(function (ls) { return toEntries(ls.length ? ls : own); });
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
      if (!entries.length) { // sem lista: o vídeo ocupa a largura toda e o botão de layout some
        var aside = listEl.closest('#aside__entries'); if (aside) aside.remove();
        var tb = document.querySelector('[data-ijs-cinema-btn][data-controller="toggle"]'); if (tb) tb.remove();
        return;
      }
      listEl.innerHTML = entries.map(function (e) { return entryHtml(e, e.active); }).join('');
      var act = listEl.querySelector('.active');
      if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    });
  }

  // Formatos de vídeo vturb aceitos:
  //  1) embed completo: <div id="ifr_<id>_wrapper"> (com a caixa de proporção 16:9)
  //  2) formato antigo em JS: <vturb-smartplayer>
  //  3) iframe "limpo" pelo editor do Memberkit (sem id e sem caixa de proporção, dentro de <figure>):
  //     o script cria a caixa 16:9 em volta dele
  function findVideo(main) {
    var v = main.querySelector('.prose [id^="ifr_"][id$="_wrapper"], .prose vturb-smartplayer');
    if (v) return v;
    var f = [].filter.call(main.querySelectorAll('.prose iframe'), function (i) {
      return /converteai\.net|vturb/i.test(i.getAttribute('src') || '');
    })[0];
    if (!f) return null;
    var box = document.createElement('div');
    box.__ijsProse = f.closest('.prose');
    box.style.cssText = 'position:relative;width:100%;padding-top:56.25%';
    var fig = f.closest('figure');
    f.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0';
    f.setAttribute('allowfullscreen', '');
    box.appendChild(f);
    if (fig && !fig.querySelector('iframe,img,video')) fig.remove();
    return box;
  }

  function wideCookie() { var m = document.cookie.match(/(?:^|;\s*)wide=([^;]*)/); return m && m[1] === 'true'; }

  function run() {
    var cur = location.pathname.match(/^\/(\d+)(?:-[^\/]*)?\/(\d+)/);
    if (!cur) return;
    cur = { course: cur[1], lesson: cur[2] };
    var main = document.getElementById('main');
    if (!main || main.querySelector('.bg-theater')) return; // player parceiro ou já montado
    var video = findVideo(main);
    if (!video) return;
    var bm = document.querySelector('[id^="bookmark_lesson_"]');
    var bar = bm && bm.parentElement;
    var cat = document.querySelector('a[href*="/categories/"][href$="/courses"]');
    var catUrl = cat ? path(cat) : '';
    var prose = video.__ijsProse || video.closest('.prose');

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
    if (prose) [].forEach.call(prose.querySelectorAll('.vturb-player-placeholder'), function (p) { p.remove(); });
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
      if (d.type === 'videoPlay') { th.dataset.state = 'idle'; requestAnimationFrame(function () { th.dataset.state = 'show'; }); }
      if (d.type === 'videoPause' || d.type === 'videoEnded') { delete th.dataset.state; }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  document.addEventListener('turbo:load', run);
  document.addEventListener('turbo:render', run);
})();
