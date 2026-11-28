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
  var KEY = 'ijs_ui_single_v2';
  var TTL_HIT = 24 * 3600 * 1000;   // produto de 1 aula: guarda por 24 h
  var TTL_MISS = 6 * 3600 * 1000;   // produto com várias aulas (ou sem acesso): 6 h
  var pending = {};

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }

  // Entrada guardada por produto: u = aula única ('' se não for), n = nome, c = nº de aulas
  function entry(pid) {
    var e = load()[pid];
    if (!e) return undefined;
    if (Date.now() - e.t > (e.u ? TTL_HIT : TTL_MISS)) return undefined;
    return e;
  }
  function cached(pid) { var e = entry(pid); return e ? e.u : undefined; }

  // "/295663-aula-5-processamento-da-gordura" -> "295663"
  function productId(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    if (a.origin !== location.origin || a.hash) return null;
    var m = a.pathname.match(/^\/(\d+)-[^\/]+\/?$/);
    return m ? m[1] : null;
  }

  // Lê a página do produto: nome, nº de aulas e (se tiver 1 módulo e 1 aula) o link da aula
  function probe(pid, path) {
    var e = entry(pid);
    if (e) return Promise.resolve(e);
    if (pending[pid]) return pending[pid];
    pending[pid] = fetch(path, { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (html) {
        var out = { u: '', n: '', c: 0, t: Date.now() };
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
          out.c = list.length;
          out.n = (d.title || '').split(' · ')[0].trim();
          if (list.length === 1 && sections <= 1) out.u = list[0];
        }
        var c = load(); c[pid] = out; save(c);
        delete pending[pid];
        return out;
      })
      .catch(function () { delete pending[pid]; return { u: '', n: '', c: 0 }; });
    return pending[pid];
  }
  function lookup(pid, path) { return probe(pid, path).then(function (e) { return e.u; }); }

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

  /* ---------- 3. Início: "continue de onde parou" + "seu progresso" ----------
   * Textos em português; para alunos ES a tradução (ijs-idioma.js) troca pelo
   * dicionário. Cada texto fica num <span> próprio para casar com o dicionário.
   *  - Treinamento PT: cartões das categorias Módulos 1 a 7 do início
   *    (cada cartão tem a barra de % do aluno). Próxima aula = primeira não
   *    concluída depois da última concluída, na ordem da trilha.
   *  - Curso ES: % do cartão do curso + página do curso (módulos e aulas) +
   *    endereço nativo /continue (próxima aula do aluno).
   */
  var PT_CATS = ['67819', '67820', '67821', '67825', '67826', '64403', '67829'];
  var ES_COURSE = '299701';
  var PT_NAME = 'Treinamento LumiFat';
  var PT_FINAL = '/295691-encerramento-do-treinamento-e-certificacao-final';
  var heroSeq = 0, nameCache = null;

  function uiLang() {
    try {
      var f = localStorage.getItem('ijs_ui_lang_force'); if (f) return f;
      var c = JSON.parse(localStorage.getItem('ijs_ui_lang_v1') || 'null'); if (c && c.lang) return c.lang;
    } catch (e) {}
    return document.documentElement.lang === 'es' ? 'es' : 'pt';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function getDoc(url) {
    return fetch(url, { credentials: 'same-origin' }).then(function (r) {
      return r.text().then(function (h) { return { url: r.url.replace(location.origin, ''), doc: new DOMParser().parseFromString(h, 'text/html') }; });
    });
  }
  function pctOf(poster) {
    var b = poster && poster.querySelector('.bg-brand[style*="width"]');
    return b ? (parseFloat(b.style.width) || 0) : 0;
  }
  function splitTitle(t) { // "Aula 3 — Passo a passo…" -> ["Aula 3", "Passo a passo…"]
    t = (t || '').split(' · ')[0].trim();
    var m = t.match(/^(.{1,30}?)\s+[—–-]\s+(.+)$/);
    return m ? [m[1], m[2]] : ['', t];
  }
  function lessonTitle(doc) { // título da aula na página da aula (o <title> é o nome do produto)
    var h = doc.querySelector('.content__title');
    return (h ? h.textContent : doc.title.split(' · ')[0]).replace(/\s+/g, ' ').trim();
  }
  function firstName() {
    if (nameCache !== null) return Promise.resolve(nameCache);
    return getDoc('/users/edit').then(function (r) {
      var i = r.doc.querySelector('input[name="user[full_name]"]');
      var parts = ((i && i.value) || '').trim().split(/\s+/);
      var n = parts[0] || '';
      if (/^dra?\.?$/i.test(n) && parts[1]) n = n + ' ' + parts[1];
      return (nameCache = n);
    }).catch(function () { return (nameCache = ''); });
  }

  // Treinamento PT a partir dos cartões do início
  function ptData() {
    var items = [];
    document.querySelectorAll('h3').forEach(function (h) {
      var box = h.parentElement && h.parentElement.parentElement;
      var cat = box && box.querySelector('a[href*="/categories/"]');
      var m = cat && cat.getAttribute('href').match(/\/categories\/(\d+)/);
      if (!m || PT_CATS.indexOf(m[1]) < 0) return;
      var name = h.childNodes[0] ? h.childNodes[0].textContent.trim() : h.textContent.trim();
      var mod = splitTitle(name);
      var posters = box.querySelectorAll('.poster');
      posters.forEach(function (p, i) {
        var a = p.querySelector('a[href]');
        if (!a) return;
        items.push({ href: a.getAttribute('href').split('/').slice(0, 2).join('/'), pct: pctOf(p),
          img: (p.querySelector('img') || {}).src || '', modLabel: mod[0], modName: mod[1],
          modUrl: cat.getAttribute('href'), idx: i + 1, modTotal: posters.length, cat: m[1] });
      });
    });
    if (!items.length) return null;
    var done = items.filter(function (x) { return x.pct >= 100; }).length;
    var last = -1;
    items.forEach(function (x, i) { if (x.pct >= 100) last = i; });
    var next = null;
    for (var i = last + 1; i < items.length; i++) if (items[i].pct < 100) { next = items[i]; break; }
    if (!next) for (var j = 0; j < items.length; j++) if (items[j].pct < 100) { next = items[j]; break; }
    var data = { pt: true, course: PT_NAME, done: done, total: items.length, finished: !next, finalUrl: PT_FINAL };
    if (!next) return Promise.resolve(data);
    var modItems = items.filter(function (x) { return x.cat === next.cat; });
    data.modDone = modItems.filter(function (x) { return x.pct >= 100; }).length;
    data.modTotal = modItems.length;
    // /continue leva à próxima aula do produto (nos Casos, à aula certa dentro do caso)
    var pid = next.href.match(/^\/(\d+)/)[1];
    return Promise.all([getDoc(next.href + '/continue'), lookup(pid, next.href)]).then(function (rs) {
      var r = rs[0], single = !!rs[1];
      var product = r.doc.title.split(' · ')[0].trim();
      data.url = /\/\d+-[^/]+\/\d+-/.test(r.url) ? r.url : next.href;
      data.modLabel = next.modLabel; data.modName = next.modName; data.modUrl = next.modUrl;
      data.img = next.img;
      if (single) {
        // produto de 1 aula: o nome padronizado do produto ("Aula 3 — Passo a passo…")
        data.title = splitTitle(product)[1]; data.idx = next.idx; data.idxTotal = next.modTotal;
      } else {
        // produto de várias aulas (ex.: Caso 1): título da aula + nome do produto
        data.title = splitTitle(lessonTitle(r.doc))[1]; data.extra = product;
      }
      return data;
    });
  }

  // Qualquer curso (curso ES, Aulão, Workshops…): % do cartão, módulos da página do curso e /continue
  function courseData(pid) {
    var a = document.querySelector('a[href^="/' + pid + '-"]');
    var poster = a && a.closest('.poster');
    if (!poster) return null;
    var base = a.getAttribute('href').split('/').slice(0, 2).join('/');
    var pct = pctOf(poster);
    return Promise.all([getDoc(base), getDoc(base + '/continue')]).then(function (rs) {
      var cd = rs[0].doc, ld = rs[1].doc, url = rs[1].url;
      var lis = cd.querySelectorAll('[id^="inner_section_"] li[data-id]');
      var total = lis.length || 1;
      var done = Math.round(pct * total / 100);
      var h1 = cd.querySelector('h1');
      var data = { course: (h1 ? h1.textContent : cd.title.split(' · ')[0]).trim(), done: done, total: total,
        finished: pct >= 100, finalUrl: base, img: (poster.querySelector('img') || {}).src || '' };
      var lm = url.match(/\/(\d+)-[^/]*$/);
      if (!lm || data.finished) return data;
      var li = cd.querySelector('[id^="inner_section_"] li[data-id="' + lm[1] + '"]');
      var sec = li && li.closest('[id^="inner_section_"]');
      var secLis = sec ? sec.querySelectorAll('li[data-id]') : [];
      var secId = sec ? sec.id.replace('inner_section_', '') : '';
      var crumb = secId && ld.querySelector('a[href$="#' + secId + '"]');
      var t = splitTitle(lessonTitle(ld));
      data.url = url; data.chip = t[0]; data.title = t[1];
      var secName = crumb ? crumb.textContent.trim() : '';
      data.modLabel = ''; data.modName = (secName && secName !== data.course) ? secName : '';
      data.modUrl = base + (secId ? '#' + secId : '');
      data.idx = Array.prototype.indexOf.call(secLis, li) + 1; data.idxTotal = secLis.length;
      data.modTotal = secLis.length; data.modDone = Math.round(data.idx - 1);
      return data;
    });
  }

  var HERO_CSS = '#ijs-home{display:grid;gap:20px;margin:8px 0 28px;grid-template-columns:minmax(0,1fr)}' +
    '@media(min-width:1024px){#ijs-home{grid-template-columns:minmax(0,1fr) 340px}}' +
    '#ijs-home .ijs-hero{background:#14284f;color:#fff;border-radius:20px;padding:28px;display:flex;gap:24px;align-items:center;justify-content:space-between}' +
    '#ijs-home .ijs-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;margin:0 0 10px}' +
    '#ijs-home .ijs-title{font-family:Georgia,"Times New Roman",serif;font-size:clamp(26px,3vw,38px);line-height:1.12;margin:0 0 12px;font-weight:500}' +
    '#ijs-home .ijs-meta{font-size:15px;opacity:.85;margin:0 0 22px}' +
    '#ijs-home .ijs-actions{display:flex;flex-wrap:wrap;gap:10px}' +
    '#ijs-home .ijs-btn{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:11px 22px;font-weight:600;font-size:15px;text-decoration:none}' +
    '#ijs-home .ijs-btn--light{background:#fff;color:#14284f}' +
    '#ijs-home .ijs-btn--ghost{border:1px solid rgba(255,255,255,.45);color:#fff}' +
    '#ijs-home .ijs-btn:hover{opacity:.9}' +
    '#ijs-home .ijs-cover{flex:none;width:170px;border-radius:14px;overflow:hidden;background:#22396b;display:block;position:relative}' +
    '#ijs-home .ijs-cover img{display:block;width:100%;aspect-ratio:600/840;object-fit:cover}' +
    '#ijs-home .ijs-cover .ijs-bar{position:absolute;left:10px;right:10px;bottom:10px;height:4px;border-radius:4px;background:rgba(255,255,255,.3)}' +
    '#ijs-home .ijs-cover .ijs-bar i{display:block;height:100%;border-radius:4px;background:#fff}' +
    '@media(max-width:639px){#ijs-home .ijs-hero{padding:22px}#ijs-home .ijs-cover{display:none}}' +
    '#ijs-home .ijs-prog{border-radius:20px;padding:24px;border-width:1px;border-style:solid}' +
    '#ijs-home .ijs-prog .ijs-eyebrow{opacity:.7}' +
    '#ijs-home .ijs-ring-row{display:flex;align-items:center;gap:18px;margin:6px 0 18px}' +
    '#ijs-home .ijs-ring{position:relative;width:92px;height:92px;flex:none}' +
    '#ijs-home .ijs-ring svg{width:92px;height:92px;transform:rotate(-90deg)}' +
    '#ijs-home .ijs-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px}' +
    '#ijs-home .ijs-ring-txt strong{display:block;font-size:16px}' +
    '#ijs-home .ijs-ring-txt span{font-size:14px;opacity:.75}' +
    '#ijs-home .ijs-pick{display:block;margin:0 0 10px;font-size:12px;opacity:.85}' +
    '#ijs-home .ijs-pick[hidden]{display:none}' +
    '#ijs-home .ijs-pick span{display:block;margin-bottom:4px}' +
    '#ijs-home .ijs-hero,#ijs-home .ijs-prog{min-width:0}' +
    '#ijs-home .ijs-pick select{display:block;width:100%;min-width:0;max-width:100%;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;font-size:14px;padding:7px 10px;border-radius:10px;border:1px solid rgba(127,127,127,.35);background:transparent;color:inherit}' +
    '#ijs-home .ijs-pick option{color:#111;background:#fff}' +
    '#ijs-home .ijs-cert{border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.45;background:rgba(127,127,127,.1)}';

  function heroHtml(d, name) {
    var pct = d.total ? Math.round(d.done / d.total * 100) : 0;
    var C = 2 * Math.PI * 40, off = C * (1 - pct / 100);
    var hello = name ? '<span>Olá, ' + esc(name) + '</span> · ' : '';
    var left;
    if (d.finished) {
      left = '<div><p class="ijs-eyebrow">' + hello + '<span>' + (d.pt ? 'Treinamento concluído' : 'Curso concluído') + '</span></p>' +
        '<h2 class="ijs-title"><span>Parabéns, você concluiu todas as aulas!</span></h2>' +
        '<div class="ijs-actions"><a class="ijs-btn ijs-btn--light" href="' + esc(d.finalUrl) + '"><span>Ver certificado</span></a></div></div>';
    } else {
      var meta = [];
      if (d.modLabel) meta.push('<span>' + esc(d.modLabel) + '</span>');
      if (d.modName) meta.push('<span>' + esc(d.modName) + '</span>');
      if (d.extra) meta.push('<span>' + esc(d.extra) + '</span>');
      else if (d.idx > 0) meta.push('<span>Aula ' + d.idx + ' de ' + d.idxTotal + '</span>');
      var bar = d.modTotal ? Math.round((d.modDone || 0) / d.modTotal * 100) : 0;
      left = '<div><p class="ijs-eyebrow">' + hello + '<span>Continue de onde parou</span></p>' +
        '<h2 class="ijs-title">' + esc(d.title) + '</h2>' +
        '<p class="ijs-meta">' + meta.join(' · ') + '</p>' +
        '<div class="ijs-actions"><a class="ijs-btn ijs-btn--light" href="' + esc(d.url) + '">▶ <span>Continuar aula</span></a>' +
        '<a class="ijs-btn ijs-btn--ghost" href="' + esc(d.modUrl) + '"><span>Ver todas as aulas</span></a></div></div>' +
        (d.img ? '<a class="ijs-cover" href="' + esc(d.url) + '" aria-label="' + esc(d.title) + '"><img src="' + esc(d.img) + '" alt="">' +
          '<span class="ijs-bar"><i style="width:' + bar + '%"></i></span></a>' : '');
    }
    return '<div class="ijs-hero">' + left + '</div>' +
      '<div class="ijs-prog bg-card text-foreground border-border">' +
        '<p class="ijs-eyebrow"><span>Seu progresso</span></p>' +
        '<label class="ijs-pick" hidden><span>Ver progresso de</span><select></select></label>' +
        '<div class="ijs-ring-row"><div class="ijs-ring"><svg viewBox="0 0 92 92">' +
          '<circle cx="46" cy="46" r="40" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="9"/>' +
          '<circle cx="46" cy="46" r="40" fill="none" stroke="#2a52a8" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
          '</svg><b>' + pct + '%</b></div>' +
          '<div class="ijs-ring-txt"><strong>' + esc(d.course) + '</strong><span>' + d.done + ' de ' + d.total + ' aulas concluídas</span></div></div>' +
        '<div class="ijs-cert">🎓 <span>Seu certificado é liberado automaticamente ao concluir 100% das aulas.</span></div>' +
      '</div>';
  }

  /* Seletor de curso: "auto", "pt" (Treinamento, Módulos 1 a 7) ou o ID do produto.
   * A escolha fica no navegador; se o curso escolhido não estiver no início, volta ao automático. */
  var PICK_KEY = 'ijs_ui_progress_course';
  function getPick() { try { return localStorage.getItem(PICK_KEY) || 'auto'; } catch (e) { return 'auto'; } }
  function setPick(v) { try { if (v === 'auto') localStorage.removeItem(PICK_KEY); else localStorage.setItem(PICK_KEY, v); } catch (e) {} }

  function hasPoster(pid) { return !!document.querySelector('a[href^="/' + pid + '-"]'); }
  function chooseJob() {
    var pick = getPick();
    if (pick === 'pt') { var p = ptData(); if (p) return { key: 'pt', job: p }; }
    else if (pick !== 'auto' && hasPoster(pick)) return { key: pick, job: courseData(pick) };
    var hasEs = hasPoster(ES_COURSE);
    if (uiLang() === 'es' && hasEs) return { key: 'auto', job: courseData(ES_COURSE) };
    var pt = ptData();
    if (pt) return { key: 'auto', job: pt };
    if (hasEs) return { key: 'auto', job: courseData(ES_COURSE) };
    return null;
  }

  // Cursos do início que o aluno pode escolher: o Treinamento (um item) + produtos com 2 ou mais aulas
  function courseOptions() {
    var groups = [], hasPt = false;
    document.querySelectorAll('h3').forEach(function (h) {
      var box = h.parentElement && h.parentElement.parentElement;
      var cat = box && box.querySelector('a[href*="/categories/"]');
      var m = cat && cat.getAttribute('href').match(/\/categories\/(\d+)/);
      if (!m) return;
      if (PT_CATS.indexOf(m[1]) >= 0) { hasPt = true; return; }
      var name = (h.childNodes[0] ? h.childNodes[0].textContent : h.textContent).trim();
      var items = [];
      box.querySelectorAll('.poster a[href]').forEach(function (a) {
        var pid = productId(a);
        if (pid && items.indexOf(pid) < 0) items.push(pid);
      });
      if (items.length) groups.push({ name: name, items: items, paths: items.map(function (pid) {
        var a = box.querySelector('a[href^="/' + pid + '-"]'); return a.pathname; }) });
    });
    // lê as páginas dos produtos (3 por vez; o resultado fica guardado no navegador)
    var jobs = [];
    groups.forEach(function (g) { g.items.forEach(function (pid, i) { jobs.push([pid, g.paths[i]]); }); });
    var info = {}, k = 0;
    function worker() {
      if (k >= jobs.length) return Promise.resolve();
      var j = jobs[k++];
      return probe(j[0], j[1]).then(function (e) { info[j[0]] = e; return worker(); });
    }
    return Promise.all([worker(), worker(), worker()]).then(function () {
      var out = [];
      groups.forEach(function (g) {
        var opts = g.items.filter(function (pid) { return info[pid] && info[pid].c >= 2; })
          .map(function (pid) { return { v: pid, t: info[pid].n || pid }; });
        if (opts.length) out.push({ name: g.name, opts: opts });
      });
      return { hasPt: hasPt, groups: out };
    });
  }

  function fillPicker(box, key) {
    courseOptions().then(function (o) {
      var label = box.querySelector('.ijs-pick'), sel = label && label.querySelector('select');
      if (!sel || !document.body.contains(box)) return;
      var count = (o.hasPt ? 1 : 0) + o.groups.reduce(function (n, g) { return n + g.opts.length; }, 0);
      if (count < 2) return; // um curso só: sem seletor
      var html = '<option value="auto">Automático</option>';
      if (o.hasPt) html += '<option value="pt">Treinamento LumiFat (Módulos 1 a 7)</option>';
      o.groups.forEach(function (g) {
        html += '<optgroup label="' + esc(g.name) + '">' + g.opts.map(function (x) {
          return '<option value="' + x.v + '">' + esc(x.t) + '</option>'; }).join('') + '</optgroup>';
      });
      sel.innerHTML = html;
      sel.value = key;
      if (sel.value !== key) sel.value = 'auto';
      label.hidden = false;
      sel.addEventListener('change', function () {
        setPick(sel.value);
        var old = document.getElementById('ijs-home');
        if (old) old.style.opacity = '.55';
        renderHero(true);
      });
    }).catch(function (e) { if (window.console) console.warn('[ijs-ui] seletor', e); });
  }

  function renderHero(replace) {
    if (location.pathname !== '/') return;
    var rows = document.querySelector('main#main > div.overflow-x-clip');
    if (!rows || (!replace && document.getElementById('ijs-home'))) return;
    var seq = ++heroSeq;
    var choice = chooseJob();
    if (!choice || !choice.job) {
      if (getPick() !== 'auto') { setPick('auto'); if (replace) renderHero(true); }
      return;
    }
    Promise.all([choice.job, firstName()]).then(function (res) {
      if (seq !== heroSeq) return;
      var old = document.getElementById('ijs-home');
      if (old && !replace) return;
      var d = res[0]; if (!d) return;
      var target = document.querySelector('main#main > div.overflow-x-clip');
      if (!target) return;
      if (!document.getElementById('ijs-home-css')) {
        var st = document.createElement('style'); st.id = 'ijs-home-css'; st.textContent = HERO_CSS;
        document.head.appendChild(st);
      }
      var box = document.createElement('section');
      box.id = 'ijs-home';
      box.innerHTML = heroHtml(d, res[1]);
      if (old) old.replaceWith(box); else target.insertBefore(box, target.firstChild);
      fillPicker(box, choice.key);
    }).catch(function (e) { if (window.console) console.warn('[ijs-ui] início', e); });
  }

  function run() { dedupeBreadcrumb(); renderHero(); }
  document.addEventListener('turbo:load', run);
  document.addEventListener('turbo:render', run);
  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
