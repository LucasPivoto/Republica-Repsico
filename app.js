/* ==========================================================================
   REPSICO — app.js
   Site estático (GitHub Pages). Funciona sem Firebase (MODO LOCAL) e com
   Firebase (Firestore + Authentication) quando o firebaseConfig é preenchido.
   Seções: 1 Configuração · 2 Ícones · 3 Utilitários · 4 Conteúdo inicial ·
           5 Imagens · 6 Armazenamento · 7 Renderização · 8 Componentes ·
           9 Modo Morador · 10 Inicialização
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     1. CONFIGURAÇÃO
     ====================================================================== */

  // 1) Cole aqui o firebaseConfig do seu projeto:
  //    Console do Firebase → ⚙ Configurações do projeto → Seus apps → app Web.
  //    Enquanto estiver vazio, o site roda no MODO LOCAL: tudo funciona, mas as
  //    alterações ficam salvas só no navegador de quem editou.
  const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  // 2) E-mail do usuário único dos moradores (Firebase → Authentication → Users).
  //    Precisa ser o MESMO e-mail escrito nas regras do Firestore (veja o README).
  //    Recomendado: um e-mail que a casa controla (ex.: o Gmail da república).
  const EMAIL_MORADORES = 'moradores@repsico.com';

  // 3) Senha do MODO LOCAL (só vale enquanto o Firebase não estiver configurado).
  //    Padrão: "repsico". Guardada como hash SHA-256 — não use aqui a senha real da casa.
  const SENHA_LOCAL_HASH = '007beb0902f16501d75471e69a92bda5f08302033543a5fb4e28f0bfab4f47fb';

  // Versão fixa do Firebase JS SDK carregado do CDN oficial (www.gstatic.com).
  const FIREBASE_VERSAO = '12.19.0';

  /* ======================================================================
     2. ÍCONES (SVG inline, traço, currentColor)
     ====================================================================== */

  const ICONES = {
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    game: '<path d="M6 11h4M8 9v4"/><path d="M15 10h.01M18 12h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-3.95 3.37l-1.2 7.6A2.5 2.5 0 0 0 4 19c.94 0 1.8-.53 2.24-1.36L7.5 15h9l1.26 2.64A2.5 2.5 0 0 0 20 19a2.5 2.5 0 0 0 2.46-3.03l-1.2-7.6A4 4 0 0 0 17.3 5Z"/>',
    wifi: '<path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><path d="M12 20h.01"/>',
    chef: '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M6 17h12"/>',
    talheres: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    pessoas: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    pata: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
    chama: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/>',
    tv: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="m17 2-5 5-5-5"/>',
    cama: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
    chuveiro: '<path d="m4 4 2.5 2.5"/><path d="M13.5 6.5a4.95 4.95 0 0 0-7 7"/><path d="M15 5 5 15"/><path d="M14 17v.01M10 16v.01M13 13v.01M16 10v.01M11 20v.01M17 14v.01M20 11v.01"/>',
    escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    estrela: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>',
    coracao: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    musica: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    cadeado: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'cadeado-aberto': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    lua: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    fechar: '<path d="M18 6 6 18M6 6l12 12"/>',
    'seta-esq': '<path d="m15 18-6-6 6-6"/>',
    'seta-dir': '<path d="m9 18 6-6-6-6"/>',
    'seta-cima': '<path d="m18 15-6-6-6 6"/>',
    'seta-baixo': '<path d="m6 9 6 6 6-6"/>',
    editar: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    lixeira: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    copiar: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    whatsapp: '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    mapa: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    engrenagem: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    chave: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    sair: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    imagem: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    curso: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    bola: '<circle cx="12" cy="12" r="10"/><path d="m12 7 4 3-1.5 4.5h-5L8 10Z"/><path d="M12 2v5M16 10l5-2M14.5 14.5l3 4.5M9.5 14.5l-3 4.5M8 10 3 8"/>',
    olho: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
  };
  const ICONES_PREENCHIDOS = new Set(['whatsapp']);

  function icone(nome, classe) {
    const corpo = ICONES[nome] || ICONES.estrela;
    const estilo = ICONES_PREENCHIDOS.has(nome)
      ? 'fill="currentColor" stroke="none"'
      : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    return '<svg class="icone' + (classe ? ' ' + classe : '') + '" viewBox="0 0 24 24" ' + estilo +
      ' aria-hidden="true" focusable="false">' + corpo + '</svg>';
  }

  function preencherIcones(raiz) {
    (raiz || document).querySelectorAll('[data-icone]').forEach(function (el) {
      el.innerHTML = icone(el.dataset.icone);
    });
  }

  /* ======================================================================
     8. COMPONENTES — tema e menu
     ====================================================================== */

  function alternarTema() {
    const html = document.documentElement;
    const novo = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = novo;
    try { localStorage.setItem('repsico:tema', novo); } catch (e) { /* armazenamento indisponível */ }
  }

  function definirMenu(aberto) {
    const navbar = document.querySelector('.navbar');
    const botao = document.querySelector('[data-acao="menu"]');
    navbar.classList.toggle('menu-aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    botao.innerHTML = icone(aberto ? 'fechar' : 'menu');
  }

  function alternarMenu() {
    definirMenu(!document.querySelector('.navbar').classList.contains('menu-aberto'));
  }

  /* ======================================================================
     10. INICIALIZAÇÃO
     ====================================================================== */

  const ACOES = {
    'alternar-tema': alternarTema,
    menu: alternarMenu
  };

  document.addEventListener('click', function (ev) {
    const alvo = ev.target.closest('[data-acao]');
    if (!alvo) return;
    const acao = ACOES[alvo.dataset.acao];
    if (!acao) return;
    if (alvo.tagName === 'A' && alvo.getAttribute('href') === '#') ev.preventDefault();
    acao(alvo, ev);
  });

  let resolverPronto;
  const pronto = new Promise(function (resolver) { resolverPronto = resolver; });

  window.REPSICO = { pronto: pronto, utils: {} };

  function ligarNavegacao() {
    document.querySelector('.nav-links').addEventListener('click', function (ev) {
      if (ev.target.closest('a')) definirMenu(false);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && document.querySelector('.navbar.menu-aberto')) definirMenu(false);
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
      if (mq.matches) definirMenu(false);
    });
  }

  async function iniciar() {
    preencherIcones();
    ligarNavegacao();
  }

  iniciar()
    .catch(function (erro) { console.error('Falha ao iniciar o site da REPSICO:', erro); })
    .then(function () { resolverPronto(); });
})();
