/* IJS Academy: idioma da interface (PT/ES) no Memberkit
 * Arquivo único carregado pelo head do Memberkit (github.com/dariomelorc/ijs-memberkit).
 * 1) dicionário extra  2) seletor de idioma do login  3) tradução da plataforma
 * Fontes originais: dicionario_extra_head.html (v3), seletor_idioma_head.html (v2), memberkit_idioma_es.html (v5).
 */

/* ===== 1. Dicionário extra (lido pela tradução da plataforma) ===== */
window.__ijsX = {"Continue de onde parou":"Continúa donde lo dejaste","Continuar aula":"Continuar clase","Ver todas as aulas":"Ver todas las clases","Seu progresso":"Tu progreso","Treinamento LumiFat":"Entrenamiento LumiFat","Treinamento concluído":"Entrenamiento completado","Parabéns, você concluiu todas as aulas!":"¡Felicitaciones, completaste todas las clases!","Ver certificado":"Ver certificado","Seu certificado é liberado automaticamente ao concluir 100% das aulas.":"Tu certificado se libera automáticamente al completar el 100% de las clases.","Compare seu progresso com outros participantes":"Compara tu progreso con otros participantes","Todas as turmas matriculadas":"Todas las clases matriculadas","Todas as pontuações acumuladas":"Todas las puntuaciones acumuladas","Avaliações":"Evaluaciones","Pontuações":"Puntuaciones","Acompanhamento":"Seguimiento","Progresso nos cursos":"Progreso en los cursos","Nenhum conteúdo em andamento.":"Ningún contenido en curso.","Pontuações avulsas":"Puntuaciones extra","Pontos extras conquistados":"Puntos extra obtenidos","Quizzes respondidos":"Cuestionarios respondidos","Histórico de tentativas":"Historial de intentos","Nenhum quiz respondido até o momento.":"Ningún cuestionario respondido hasta el momento.","Feed de atividades":"Actividad reciente","Histórico de ações recentes":"Historial de acciones recientes","Nenhuma atividade recente.":"Ninguna actividad reciente.","Digite as palavras-chave":"Escribe las palabras clave","Aulas":"Clases","Pesquisa":"Búsqueda","Aula":"Clase","Nenhum conteúdo correspondente.":"Ningún contenido coincide con tu búsqueda.","Verifique sua ortografia ou tente palavras-chave diferentes.":"Revisa la ortografía o prueba con otras palabras clave.","Conquiste mais pontos de experiência postando comentários relevantes, avaliando e concluindo todas as aulas. Se esforce para ir até a linha de chegada e concluir seu curso com máximo de aproveitamento.":"Gana más puntos de experiencia publicando comentarios relevantes, evaluando y completando todas las clases. Esfuérzate por llegar a la meta y terminar tu curso aprovechándolo al máximo."};
window.__ijsP = (function () {
  var M = {janeiro:'enero',fevereiro:'febrero','março':'marzo',abril:'abril',maio:'mayo',junho:'junio',julho:'julio',agosto:'agosto',setembro:'septiembre',outubro:'octubre',novembro:'noviembre',dezembro:'diciembre'};
  return [
    [/^Olá, (.+)$/, 'Hola, $1'],
    [/^Aula (\d+) de (\d+)$/, 'Clase $1 de $2'],
    [/^(\d+) de (\d+) aulas concluídas$/, '$1 de $2 clases completadas'],
    [/^(\d+) avaliações$/, '$1 evaluaciones'],
    [/^(\d+) avaliação$/, '$1 evaluación'],
    [/^(\d+) aulas$/, '$1 clases'],
    [/^(\d+) aula$/, '$1 clase'],
    [/^Mostrando itens (\d+)-(\d+) do total de (\d+)$/, 'Mostrando elementos $1-$2 de un total de $3'],
    [/^Mostrando (\d+) itens?$/, function (m, n) { return 'Mostrando ' + n + (n === '1' ? ' elemento' : ' elementos'); }],
    [/^Última vez visto (\d+) de ([a-zç]+) de (\d+)(.*)$/, function (m, d, mes, a, r) { return 'Visto por última vez el ' + d + ' de ' + (M[mes] || mes) + ' de ' + a + r; }]
  ];
})();

/* ===== 2. Seletor de idioma (login e telas de senha) ===== */
(function () {
  if (document.getElementById('ijs-lang-css')) return;
  var s = document.createElement('style'); s.id = 'ijs-lang-css';
  s.textContent = '.ijs-lang{position:relative;font:500 13px/1 system-ui,-apple-system,sans-serif;z-index:60}\n.ijs-lang--auth{position:fixed;top:16px;right:16px}\n.ijs-lang>button{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:1px solid rgba(127,127,127,.35);background:transparent;color:inherit;cursor:pointer}\n.ijs-lang svg{width:20px;height:14px;border-radius:2px;flex:none}\n.ijs-lang ul{position:absolute;right:0;top:calc(100% + 6px);margin:0;padding:4px;list-style:none;min-width:150px;border-radius:8px;border:1px solid rgba(127,127,127,.35);background:#fff;color:#111;box-shadow:0 8px 24px rgba(0,0,0,.18);display:none}\n.ijs-lang.open ul{display:block}\n.ijs-lang li button{display:flex;width:100%;align-items:center;gap:8px;padding:8px 10px;border:0;border-radius:6px;background:none;color:inherit;cursor:pointer;text-align:left}\n.ijs-lang li button:hover,.ijs-lang li button[aria-current=true]{background:#eef2f7}';
  (document.head || document.documentElement).appendChild(s);
})();
(function () {
  'use strict';
  if (window.__ijsSelLoaded) return;
  window.__ijsSelLoaded = true;

  var FORCE_KEY = 'ijs_ui_lang_force';   // mesma chave do script de tradução (body): a escolha manual vale também dentro da plataforma
  var CACHE_KEY = 'ijs_ui_lang_v1';
  var AUTH = /^\/users\/(sign_in|password|unlock|confirmation)/;

  var FLAGS = {
    pt: '<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#009c3b"/><path d="M10 1.6 18.2 7 10 12.4 1.8 7z" fill="#ffdf00"/><circle cx="10" cy="7" r="3.1" fill="#002776"/></svg>',
    es: '<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#aa151b"/><rect y="3.5" width="20" height="7" fill="#f1bf00"/></svg>'
  };
  var NAMES = { pt: 'Português', es: 'Español' };

  // Textos das telas de login e de senha (a tradução do body não roda nelas).
  // Termos do login conferidos com a tela oficial do Memberkit em espanhol.
  var DICT = {
    'Email': 'Correo Electrónico',
    'Senha': 'Contraseña',
    'Login': 'iniciar sesión',
    'Esqueceu sua senha?': '¿Olvidaste tu contraseña?',
    'Clique aqui': 'Haz clic aquí',
    'Digite seu endereço de email e nós enviaremos um link de recuperação de senha para sua caixa de entrada.': 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
    'Enviar email de redefinição de senha': 'Enviar correo para restablecer la contraseña',
    'Nova senha': 'Nueva contraseña',
    'Confirme sua nova senha': 'Confirma tu nueva contraseña',
    'Alterar minha senha': 'Cambiar mi contraseña',
    'Voltar': 'Volver'
  };
  var PATTERNS = [
    [/^Email ou senha inválid[oa]s?\.?$/i, 'Correo Electrónico o contraseña inválidos.'],
    [/^Você receberá um e-?mail com instruções/i, 'Recibirás un correo electrónico con instrucciones para restablecer tu contraseña en unos minutos.'],
    [/^Se o seu endereço de e-?mail existir/i, 'Si tu correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.'],
    [/^Para continuar, faça login/i, 'Para continuar, inicia sesión o regístrate.'],
    [/^Sua senha foi alterada com sucesso/i, 'Tu contraseña se cambió correctamente.']
  ];

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function current() {
    var f = read(FORCE_KEY);
    if (f === 'es' || f === 'pt') return f;
    try { var c = JSON.parse(read(CACHE_KEY) || 'null'); if (c && c.lang) return c.lang; } catch (e) {}
    return 'pt';
  }
  // Visitante na raiz "/" vê o login sem mudar de endereço: reconhece também pelo formulário
  function isAuth() { return AUTH.test(location.pathname) || !!document.querySelector('form[action*="/users/sign_in"],form[action*="/users/password"]'); }

  function tr(s) {
    var t = s.replace(/\s+/g, ' ').trim();
    if (!t) return null;
    if (Object.prototype.hasOwnProperty.call(DICT, t)) return DICT[t];
    for (var i = 0; i < PATTERNS.length; i++) if (PATTERNS[i][0].test(t)) return PATTERNS[i][1];
    return null;
  }
  function translateAuth() {
    if (!isAuth() || current() !== 'es' || !document.body) return;
    document.documentElement.lang = 'es';
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) {
      if (n.parentElement && n.parentElement.closest('script,style,.ijs-lang')) continue;
      var o = tr(n.nodeValue);
      if (o !== null) n.nodeValue = n.nodeValue.replace(/\S[\s\S]*\S|\S/, o);
    }
    var b = document.querySelectorAll('input[type=submit]');
    for (var i = 0; i < b.length; i++) { var v = tr(b[i].value); if (v !== null) b[i].value = v; }
    var t = document.title.split(' · '), t0 = tr(t[0]);
    if (t0 !== null) { t[0] = t0; document.title = t.join(' · '); }
  }

  function build() {
    // Só nas telas de login e de senha (decisão da IJS: não aparece dentro da plataforma)
    if (!isAuth() || document.querySelector('.ijs-lang') || !document.body) return;
    var auth = true, host = document.body;
    var lang = current();
    var box = document.createElement('div');
    box.className = 'ijs-lang' + (auth ? ' ijs-lang--auth' : '');
    box.setAttribute('data-ijs-notranslate', '');
    var opts = '';
    ['pt', 'es'].forEach(function (l) {
      opts += '<li><button type="button" data-l="' + l + '" aria-current="' + (l === lang) + '">' + FLAGS[l] + NAMES[l] + '</button></li>';
    });
    box.innerHTML = '<button type="button" aria-haspopup="listbox" aria-label="Idioma / Language">' + FLAGS[lang] + lang.toUpperCase() + '</button><ul role="listbox">' + opts + '</ul>';
    box.firstChild.addEventListener('click', function (e) { e.stopPropagation(); box.classList.toggle('open'); });
    box.querySelector('ul').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-l]');
      if (!btn) return;
      write(FORCE_KEY, btn.getAttribute('data-l'));
      location.reload();
    });
    host.appendChild(box);
  }

  document.addEventListener('click', function () {
    var o = document.querySelector('.ijs-lang.open');
    if (o) o.classList.remove('open');
  });

  function run() { translateAuth(); build(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  document.addEventListener('turbo:load', run);
  document.addEventListener('turbo:render', run);
})();

/* ===== 3. Tradução da plataforma (alunos com produto ES) ===== */
(function () {
  'use strict';
  // Instalado antes do </body>: o Memberkit (Turbo) reexecuta este script a cada página; inicializa só uma vez
  if (window.__ijsLangLoaded) return;
  window.__ijsLangLoaded = true;

  /* ===== CONFIGURAÇÃO ===== */
  // IDs dos produtos em espanhol no Memberkit. Quem tiver acesso a algum deles vê a interface em espanhol.
  var ES_PRODUCTS = ['299701', '299354', '299370'];
  var CACHE_KEY = 'ijs_ui_lang_v1';      // idioma detectado (guardado no navegador do aluno)
  var FORCE_KEY = 'ijs_ui_lang_force';   // teste manual: ?ijs_lang=es | pt | auto

  /* ===== DICIONÁRIO PT -> ES (textos oficiais do Memberkit, capturados nos dois idiomas) ===== */
  var EXACT = {"Notificações":"Notificaciones","Minha conta":"Mi cuenta","Alternar tema":"Cambiar tema","Cobrança":"Cobro","Sair":"Salir","Conteúdos":"Contenidos","Comentários":"Comentarios","Início":"Inicio","Ver tudo →":"Ver todo →","Pesquisar":"Buscar","Próximo":"Siguiente","Como você avalia este conteúdo?":"¿Cómo evalúas este contenido?","Marcar como concluído":"Marcar como completado","Mais recentes":"Más recientes","Mais antigos":"Más antiguos","Meus comentários":"Mis comentarios","Muito ruim":"Muy malo","Ruim":"Malo","Razoável":"Razonable","Muito bom":"Muy bien","Escreva seu comentário…":"Escribe tu comentario…","começar agora":"empezar ahora","Minha Conta":"Mi Cuenta","Meu perfil":"Mi perfil","Conte um pouco sobre você para seus colegas de turma. De onde você é? Qual resultado pretende alcançar?":"Cuéntale a tus compañeros de clase un poco sobre ti. ¿De dónde eres? ¿Dónde vives? ¿Qué te gusta hacer?","Nome completo":"Nombre completo","Email":"Correo Electrónico","Biografia":"Biografía","Fuso horário":"Zona horaria","Ajuste a data e hora da plataforma conforme sua região.":"Ajusta la fecha y hora de la plataforma según tu región.","Alterar senha":"Cambiar contraseña","Deixe em branco caso não queira alterá-la.":"Déjalo en blanco si no quieres cambiarla.","Senha atual":"Contraseña actual","Nova senha":"Nueva contraseña","Confirme sua nova senha":"Confirma tu nueva contraseña","Atualizar":"Actualizar","Marcar todos como lidos":"Marcar todos como leídos","Enriqueça seu currículo.":"Enriquece tu currículum.","Complete todas as aulas para receber seu certificado de conclusão de curso.":"Completa todas las clases para recibir tu certificado de finalización del curso.","Nova publicação":"Nueva publicación","Não lidas":"No leídas","Minhas conversas":"Mis conversaciones","Comentários recentes":"Comentarios recientes","Aguardando resposta":"Esperando respuesta","Em aberto":"Abiertas","Resolvidas":"Resueltas","Mais ativas":"Más activas","Não há publicações neste momento":"No hay publicaciones en este momento","Crie o primeiro tópico ou compartilhe algo incrível neste espaço.":"Crea el primer tema o comparte algo increíble en este espacio.",
    /* complementos (formato do Memberkit, conferir no teste) */
    "Materiais complementares":"Materiales complementarios","Concluído":"Completado","Tem certeza?":"¿Está seguro?",
    /* menu do aluno (Atendimento = link personalizado da IJS) */
    "Disponíveis":"Disponibles","Atendimento":"Soporte",
    /* termo de aceite (onboarding) do produto */
    "Concordo":"Estoy de acuerdo","Não concordo":"No estoy de acuerdo",
    /* tela de Suporte (/contact/new) */
    "Conteúdo":"Contenido","Mensagem":"Mensaje"};

  // Padrões com números ou nomes ({n} = número)
  var PATTERNS = [
    ['^(\\d+) comentários$', '$1 comentarios'],
    ['^(\\d+) comentário$', '$1 comentario'],
    ['^(\\d+) conteúdos$', '$1 contenidos'],
    ['^(\\d+) conteúdo$', '$1 contenido'],
    ['^menos de um minuto atrás$', 'Hace menos de un minuto'],
    ['^(\\d+) minutos? atrás$', function (m, n) { return 'Hace ' + n + (n === '1' ? ' minuto' : ' minutos'); }],
    ['^cerca de (\\d+) horas? atrás$', function (m, n) { return 'Hace alrededor de ' + n + (n === '1' ? ' hora' : ' horas'); }],
    ['^(\\d+) dias? atrás$', function (m, n) { return 'Hace ' + n + (n === '1' ? ' día' : ' días'); }],
    ['^cerca de (\\d+) m[eê]s(?:es)? atrás$', function (m, n) { return 'Hace alrededor de ' + n + (n === '1' ? ' mes' : ' meses'); }],
    ['^(\\d+) m[eê]s(?:es)? atrás$', function (m, n) { return 'Hace ' + n + (n === '1' ? ' mes' : ' meses'); }],
    ['^cerca de (\\d+) anos? atrás$', function (m, n) { return 'Hace alrededor de ' + n + (n === '1' ? ' año' : ' años'); }],
    ['^mais de (\\d+) anos? atrás$', function (m, n) { return 'Hace más de ' + n + (n === '1' ? ' año' : ' años'); }],
    ['^quase (\\d+) anos? atrás$', function (m, n) { return 'Hace casi ' + n + (n === '1' ? ' año' : ' años'); }],
    ['^(.+) respondeu ao seu comentário na aula$', '$1 respondió a tu comentario en la clase'],
    ['^Mensagem enviada', 'Mensaje enviado correctamente.']
  ].map(function (p) { return [new RegExp(p[0]), p[1]]; });

  // Textos internos do Memberkit usados por componentes JavaScript (seleções, uploads, confirmações, comunidade)
  var TR_ES = {"choices":{"item_select":"Presione para seleccionar","loading":"Cargando...","no_choices":"No hay opciones para elegir","no_results":"Ningún resultado encontrado"},"communities":{"forum_comments":"Comentarios","forum_posts":"Publicaciones","members_count":{"one":"1 miembro","other":"%{num} miembros"}},"dialog":{"cancel":"Cancelar","confirm":"Confirmar","title":"¿Está seguro?"},"direct_uploads":{"file_count":{"one":"1 archivo","other":"%{count} archivos"},"selected":{"one":"1 archivo seleccionado","other":"%{count} archivos seleccionados"},"submit":"Seleccionar archivos","too_large":"%{filename} supera los %{max_size}"}};

  /* ===== DETECÇÃO DO IDIOMA ===== */
  function store(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  var qs = location.search.match(/[?&]ijs_lang=(es|pt|auto)\b/);
  if (qs) store(FORCE_KEY, qs[1] === 'auto' ? null : qs[1]);
  var forced = read(FORCE_KEY);

  var cached = null;
  try { cached = JSON.parse(read(CACHE_KEY) || 'null'); } catch (e) {}

  function detect() {
    return fetch('/', { credentials: 'same-origin' }).then(function (r) {
      if (/sign_in|login|entrar/i.test(r.url)) return null; // não logado: mantém o que já sabia
      return r.text().then(function (html) {
        var d = new DOMParser().parseFromString(html, 'text/html');
        if (d.querySelector('a[href^="/settings/academy"]')) return 'pt'; // administrador: sempre português
        var has = ES_PRODUCTS.some(function (id) { return d.querySelector('a[href^="/' + id + '-"], a[href="/' + id + '"]'); });
        return has ? 'es' : 'pt';
      });
    }).catch(function () { return null; });
  }

  /* ===== TRADUÇÃO ===== */
  var SKIP = 'script,style,textarea,code,pre,iframe,[contenteditable],trix-editor,.trix-content,[data-ijs-notranslate]';
  var ATTRS = ['placeholder', 'title', 'aria-label', 'data-turbo-confirm', 'data-confirm'];

  function tr(s) {
    var t = s.replace(/\s+/g, ' ').trim();
    if (!t) return null;
    var X = window.__ijsX || {}, P = PATTERNS.concat(window.__ijsP || []); // extra: dicionario_extra_head.html
    if (EXACT.hasOwnProperty(t)) return EXACT[t];
    if (X.hasOwnProperty(t)) return X[t];
    for (var i = 0; i < P.length; i++) if (P[i][0].test(t)) return t.replace(P[i][0], P[i][1]);
    return null;
  }
  function trText(node) {
    var p = node.parentElement;
    if (!p || p.closest(SKIP)) return;
    var out = tr(node.nodeValue);
    if (out !== null) {
      var lead = node.nodeValue.match(/^\s*/)[0], trail = node.nodeValue.match(/\s*$/)[0];
      var v = lead + out + trail;
      if (node.nodeValue !== v) node.nodeValue = v;
    }
  }
  function trEl(el) {
    // traduz placeholder/título do próprio campo, mas nunca o que está dentro de áreas de conteúdo
    if (el.parentElement && el.parentElement.closest(SKIP)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute && el.getAttribute(ATTRS[i]);
      if (v) { var o = tr(v); if (o !== null && o !== v) el.setAttribute(ATTRS[i], o); }
    }
    if (el.tagName === 'INPUT' && /^(submit|button)$/i.test(el.type) && el.value) { var o2 = tr(el.value); if (o2 !== null) el.value = o2; }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { trText(root); return; }
    if (root.nodeType !== 1) return;
    trEl(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) trText(n); else trEl(n); }
  }
  function deepAssign(dst, src) {
    for (var k in src) {
      if (src[k] && typeof src[k] === 'object') { if (!dst[k] || typeof dst[k] !== 'object') dst[k] = {}; deepAssign(dst[k], src[k]); }
      else dst[k] = src[k];
    }
  }
  function patchTranslations() { if (window.translations && typeof window.translations === 'object') deepAssign(window.translations, TR_ES); }

  var observer = null;
  function applyEs() {
    document.documentElement.lang = 'es';
    var tt = document.title.split(' · '), t0 = tr(tt[0]);
    if (t0 !== null) { tt[0] = t0; document.title = tt.join(' · '); }
    patchTranslations();
    walk(document.body);
    if (!observer && document.body) {
      observer = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'characterData') trText(m.target);
          else if (m.type === 'attributes') trEl(m.target);
          else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['value']) });
    }
    document.documentElement.classList.remove('ijs-tr-pending');
  }
  function stopEs() { if (observer) { observer.disconnect(); observer = null; } }

  /* ===== EXECUÇÃO ===== */
  // Dentro de um produto ES (inclusive o termo de aceite na 1ª entrada), espanhol na hora
  var onEsPage = ES_PRODUCTS.some(function (id) { return new RegExp('^/' + id + '(?:[-/]|$)').test(location.pathname); });
  var lang = forced || (onEsPage ? 'es' : null) || (cached && cached.lang) || 'pt';

  // Evita "piscar" em português para quem já sabemos que é espanhol
  if (lang === 'es') {
    var st = document.createElement('style');
    st.textContent = 'html.ijs-tr-pending body{visibility:hidden!important}';
    document.head.appendChild(st);
    document.documentElement.classList.add('ijs-tr-pending');
    setTimeout(function () { document.documentElement.classList.remove('ijs-tr-pending'); }, 1500);
  }

  function run() { if (lang === 'es') applyEs(); else { stopEs(); document.documentElement.classList.remove('ijs-tr-pending'); } }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  // Navegação do Memberkit (Turbo) troca o <body> sem recarregar a página
  document.addEventListener('turbo:load', function () { stopEs(); run(); });
  document.addEventListener('turbo:render', function () { stopEs(); run(); });
  document.addEventListener('turbo:frame-load', function (e) { if (lang === 'es') walk(e.target); });

  // Refaz a detecção a cada carregamento completo (login, troca de conta no mesmo navegador);
  // o último resultado já foi aplicado acima, então não há espera para o aluno
  if (!forced) {
    detect().then(function (d) {
      if (!d) return;
      store(CACHE_KEY, JSON.stringify({ lang: d, t: Date.now() }));
      if (d !== lang) { lang = d; run(); }
    });
  }
})();
