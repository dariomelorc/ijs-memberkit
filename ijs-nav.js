/* IJS Academy: setas de aula anterior / próxima entre produtos do mesmo módulo (v1)
 *
 * No Memberkit, cada aula dos Módulos 1 a 7 é um produto separado. As setas nativas
 * só navegam dentro do mesmo produto, então somem quando o produto tem uma aula só.
 * Este script recria as setas (mesmo visual das nativas) usando a ordem dos produtos
 * na página do módulo (categoria). Nada precisa ser cadastrado: se a ordem mudar no
 * Memberkit, as setas acompanham.
 */
(function () {
  'use strict';
  if (window.__ijsNavLoaded) return;
  window.__ijsNavLoaded = true;

  // true: na última aula do módulo, a seta → leva à 1ª aula do módulo seguinte
  //       (e na 1ª aula, a seta ← volta para a última aula do módulo anterior)
  var CROSS_MODULE = true;

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
  function uniq(list) { var s = {}, out = []; list.forEach(function (x) { if (x && !s[x]) { s[x] = 1; out.push(x); } }); return out; }

  // Página de aula: /<curso>-slug/<aula>-slug
  function current() {
    var m = location.pathname.match(/^\/(\d+)(?:-[^\/]*)?\/(\d+)/);
    return m ? { course: m[1], lesson: m[2] } : null;
  }

  // IDs dos produtos de um módulo, na ordem de exibição
  function coursesOf(catUrl) {
    return getDoc(catUrl).then(function (d) {
      return uniq([].map.call(d.querySelectorAll('a[href]'), function (a) {
        var m = path(a).match(/^\/(\d+)-/); return m ? m[1] : null;
      }));
    });
  }
  // Links das aulas de um produto, na ordem
  function lessonsOf(courseId) {
    return getDoc('/' + courseId).then(function (d) {
      var re = new RegExp('^/' + courseId + '(?:-[^/]*)?/\\d+');
      return uniq([].map.call(d.querySelectorAll('a[href]'), function (a) {
        var p = path(a); return re.test(p) ? p : null;
      }));
    });
  }
  // Módulos (categorias) na ordem da página inicial
  function categories() {
    return getDoc('/').then(function (d) {
      return uniq([].map.call(d.querySelectorAll('a[href*="/categories/"]'), function (a) {
        var p = path(a); return /^\/categories\/\d+[^\/]*\/courses$/.test(p) ? p : null;
      }));
    });
  }

  function neighbourCourse(catUrl, courseId, dir) {
    return coursesOf(catUrl).then(function (list) {
      var i = list.indexOf(courseId);
      if (i < 0) return null;
      var j = i + dir;
      if (j >= 0 && j < list.length) return list[j];
      if (!CROSS_MODULE) return null;
      return categories().then(function (cats) {
        var k = cats.indexOf(catUrl) + dir;
        if (k < 0 || k >= cats.length || cats.indexOf(catUrl) < 0) return null;
        return coursesOf(cats[k]).then(function (l2) { return l2.length ? (dir > 0 ? l2[0] : l2[l2.length - 1]) : null; });
      });
    });
  }
  function target(catUrl, courseId, dir) {
    return neighbourCourse(catUrl, courseId, dir).then(function (cid) {
      if (!cid) return null;
      return lessonsOf(cid).then(function (ls) { return ls.length ? (dir > 0 ? ls[0] : ls[ls.length - 1]) : '/' + cid; });
    });
  }

  var ICON = {
    prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:20px;height:20px"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/></svg>',
    next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:20px;height:20px"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>'
  };
  function button(href, kind) {
    var el = document.createElement(href ? 'a' : 'span');
    el.className = 'btn btn-outline-secondary btn-md p-2';
    el.setAttribute('title', kind === 'prev' ? 'Anterior' : 'Próximo');
    el.setAttribute('aria-label', kind === 'prev' ? 'Anterior' : 'Próximo');
    el.innerHTML = ICON[kind];
    if (href) el.setAttribute('href', href);
    else { el.style.opacity = '.35'; el.style.pointerEvents = 'none'; el.setAttribute('aria-disabled', 'true'); }
    return el;
  }

  function run() {
    var cur = current();
    if (!cur) return;
    var bm = document.querySelector('[id^="bookmark_lesson_"]');
    var box = bm && bm.parentElement;
    if (!box || box.querySelector('[data-ijs-nav]')) return;

    // Já existem setas nativas (produto com várias aulas)? Então não mexe.
    var reSame = new RegExp('^/' + cur.course + '(?:-[^/]*)?/\\d+');
    var native = [].some.call(box.querySelectorAll('a[href]'), function (a) { return reSame.test(path(a)); });
    if (native) return;

    var cat = document.querySelector('a[href*="/categories/"][href$="/courses"]');
    if (!cat) return;
    var catUrl = path(cat);

    var group = document.createElement('div');
    group.setAttribute('data-ijs-nav', '');
    group.style.cssText = 'display:flex;gap:4px';
    box.appendChild(group);

    Promise.all([target(catUrl, cur.course, -1), target(catUrl, cur.course, 1)]).then(function (t) {
      if (!document.body.contains(group)) return; // usuário já trocou de página
      if (!t[0] && !t[1]) { group.remove(); return; }
      group.appendChild(button(t[0], 'prev'));
      group.appendChild(button(t[1], 'next'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  // Navegação do Memberkit (Turbo) troca a página sem recarregar
  document.addEventListener('turbo:load', run);
  document.addEventListener('turbo:render', run);
})();
