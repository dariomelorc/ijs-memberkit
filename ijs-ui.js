/* IJS Academy: ajustes de interface no Memberkit (github.com/dariomelorc/ijs-memberkit)
 *
 * 1) Atalho para a aula: ao clicar num produto que tem só 1 módulo e 1 aula
 *    (ex.: "Aula 5 — Processamento da gordura"), abre direto a aula, pulando a
 *    página do produto. Vale para os cartões do início, para o caminho no topo
 *    da aula e para qualquer outro link de produto. Ctrl/Cmd/clique do meio
 *    continuam abrindo a página do produto normalmente.
 * 2) Caminho no topo da aula sem repetição: esconde o item que repete um nome
 *    já mostrado antes (ex.: o módulo aparecendo duas vezes). O link continua
 *    na página, só invisível, porque o modo cinema usa ele.
 */
(function () {
  if (window.__ijsUi) return;
  window.__ijsUi = true;

  /* ---------- 1. Atalho para a aula ---------- */
  var KEY = 'ijs_ui_single_v1';
  var TTL_HIT = 24 * 3600 * 1000;   // produto de 1 aula: guarda por 24 h
  var TTL_MISS = 6 * 3600 * 1000;   // produto com várias aulas (ou sem acesso): 6 h
  var pending = {};

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }

  function cached(pid) {
    var e = load()[pid];
    if (!e) return undefined;
    if (Date.now() - e.t > (e.u ? TTL_HIT : TTL_MISS)) return undefined;
    return e.u; // '' = não é produto de 1 aula
  }
  function remember(pid, url) {
    var c = load(); c[pid] = { u: url || '', t: Date.now() }; save(c);
  }

  // "/295663-aula-5-processamento-da-gordura" -> "295663"
  function productId(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    if (a.origin !== location.origin || a.hash) return null;
    var m = a.pathname.match(/^\/(\d+)-[^\/]+\/?$/);
    return m ? m[1] : null;
  }

  function lookup(pid, path) {
    var c = cached(pid);
    if (c !== undefined) return Promise.resolve(c);
    if (pending[pid]) return pending[pid];
    pending[pid] = fetch(path, { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (html) {
        var url = '';
        if (html) {
          var d = new DOMParser().parseFromString(html, 'text/html');
          var re = new RegExp('^/' + pid + '-[^/]+/\\d+-[^/?#]*$');
          var lessons = {};
          d.querySelectorAll('a[href]').forEach(function (a) {
            var h = a.getAttribute('href').replace(location.origin, '');
            if (re.test(h)) lessons[h] = 1;
          });
          var list = Object.keys(lessons);
          var sections = d.querySelectorAll('[id^="inner_section_"]').length;
          if (list.length === 1 && sections <= 1) url = list[0];
        }
        remember(pid, url);
        delete pending[pid];
        return url;
      })
      .catch(function () { delete pending[pid]; return ''; });
    return pending[pid];
  }

  function go(url) {
    if (window.Turbo && Turbo.visit) Turbo.visit(url); else location.href = url;
  }

  // Clique: se já sabemos a aula, troca o link antes do Turbo navegar.
  // Se ainda não sabemos, segura o clique, descobre e então navega.
  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target.closest && ev.target.closest('a[href]');
    var pid = productId(a);
    if (!pid) return;
    var c = cached(pid);
    if (c === '') return;              // produto normal: segue o fluxo nativo
    if (c) { a.setAttribute('href', c); return; }
    ev.preventDefault();
    ev.stopImmediatePropagation();
    var path = a.pathname;
    a.style.cursor = 'progress';
    lookup(pid, path).then(function (url) {
      a.style.cursor = '';
      if (url) a.setAttribute('href', url);
      go(url || path);
    });
  }, true);

  // Ao passar o mouse / tocar / focar, já descobre (o clique fica instantâneo).
  function warm(ev) {
    var a = ev.target.closest && ev.target.closest('a[href]');
    var pid = productId(a);
    if (!pid) return;
    lookup(pid, a.pathname).then(function (url) { if (url) a.setAttribute('href', url); });
  }
  document.addEventListener('mouseover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
  document.addEventListener('focusin', warm);

  /* ---------- 2. Caminho no topo da aula sem repetição ---------- */
  function dedupeBreadcrumb() {
    var book = document.querySelector('svg path[d^="M12 6.253"]');
    var bar = book && book.closest('div.flex.items-center.gap-1');
    if (!bar) return;
    var seen = {};
    bar.querySelectorAll(':scope > a').forEach(function (a) {
      var t = a.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!t) return;
      if (seen[t]) {
        a.style.display = 'none';
        var prev = a.previousElementSibling; // a setinha ">" antes do item
        if (prev && prev.tagName !== 'A') prev.style.display = 'none';
      } else seen[t] = 1;
    });
  }

  function run() { dedupeBreadcrumb(); }
  document.addEventListener('turbo:load', run);
  document.addEventListener('turbo:render', run);
  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
