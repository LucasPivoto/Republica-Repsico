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
     3. UTILITÁRIOS (funções puras)
     ====================================================================== */

  const COLECOES = ['slides', 'diferenciais', 'galeria', 'mascotes', 'moradores', 'eventos', 'contatos', 'faq'];
  const CATEGORIAS = { morador: 'Morador', agregado: 'Agregado', ex: 'Ex-Morador' };
  const ORDEM_CATEGORIA = { morador: 0, agregado: 1, ex: 2 };
  const ICONE_EMOJI = {
    pin: '📍', casa: '🏠', game: '🎮', wifi: '📶', chef: '👩‍🍳', talheres: '🍽️', pessoas: '👥', pata: '🐾',
    chama: '🔥', tv: '📺', cama: '🛏️', chuveiro: '🚿', escudo: '🛡️', estrela: '⭐', coracao: '❤️', musica: '🎵'
  };
  const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function escapeHtml(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/[&<>"']/g, function (c) { return ESCAPES[c]; });
  }

  function gerarId() {
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return Date.now().toString(36) + a[0].toString(36) + a[1].toString(36).slice(0, 3);
  }

  function clonar(v) { return JSON.parse(JSON.stringify(v)); }
  function ehObjeto(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }

  function formatarMoeda(n) { return MOEDA.format(Number(n) || 0); }

  function digitosTelefone(t) { return String(t || '').replace(/\D/g, ''); }

  function semDDI(d) { return (d.length === 12 || d.length === 13) && d.startsWith('55') ? d.slice(2) : d; }

  function formatarTelefone(t) {
    const d = semDDI(digitosTelefone(t));
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return String(t || '').trim();
  }

  // Número nacional (até 11 dígitos) ganha o DDI 55; um número que já vem com 55 + DDD é mantido.
  function waLink(telefone, mensagem) {
    let d = digitosTelefone(telefone);
    if (d.length < 10) return null;
    if (!(d.startsWith('55') && d.length >= 12)) d = '55' + d;
    return 'https://wa.me/' + d + (mensagem ? '?text=' + encodeURIComponent(mensagem) : '');
  }

  function mensagemWhatsApp(contato) {
    const c = contato || {};
    const nome = String(c.apelido || '').trim() || String(c.nome || '').trim() || 'galera';
    return 'Fala ' + nome + '! Vi o site da REPSICO e gostaria de tirar dúvidas / marcar uma visita.';
  }

  function normalizarInstagram(v) {
    let s = String(v || '').trim();
    s = s.replace(/^https?:\/\//i, '').replace(/^(www\.)?instagram\.com\//i, '');
    s = s.split(/[/?#]/)[0].replace(/^@+/, '');
    return s.replace(/[^A-Za-z0-9._]/g, '');
  }

  // Só deixa passar âncoras internas, http(s) e domínios sem esquema (ganham https://).
  function linkSeguro(v) {
    const s = String(v || '').trim();
    if (!s) return '';
    if (s.charAt(0) === '#') return /^#[\w-]*$/.test(s) ? s : null;
    if (/^https?:\/\/\S+$/i.test(s)) return s;
    if (!/[\s:]/.test(s) && /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s)) return 'https://' + s;
    return null;
  }

  async function sha256Hex(texto) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(texto)));
    return Array.from(new Uint8Array(hash), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function iniciais(apelido) {
    const partes = String(apelido || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return '?';
    const s = partes.length > 1
      ? Array.from(partes[0])[0] + Array.from(partes[1])[0]
      : Array.from(partes[0]).slice(0, 2).join('');
    return s.toLocaleUpperCase('pt-BR');
  }

  function juntarNomes(nomes) {
    const l = (nomes || []).filter(Boolean);
    if (l.length <= 1) return l.join('');
    return l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1];
  }

  function chaveTime(nome) {
    return String(nome || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // [fundo, texto] dos clubes mais populares; outros times usam o estilo neutro.
  const TIMES = {
    flamengo: ['#C3281E', '#FFFFFF'], corinthians: ['#111111', '#FFFFFF'], palmeiras: ['#006437', '#FFFFFF'],
    'sao paulo': ['#D7141A', '#FFFFFF'], santos: ['#FFFFFF', '#111111'], vasco: ['#111111', '#FFFFFF'],
    fluminense: ['#7A0E2B', '#FFFFFF'], botafogo: ['#111111', '#FFFFFF'], cruzeiro: ['#0033A0', '#FFFFFF'],
    'atletico mineiro': ['#111111', '#FFFFFF'], 'america mineiro': ['#00843D', '#FFFFFF'],
    gremio: ['#0D80BF', '#FFFFFF'], internacional: ['#E30613', '#FFFFFF'],
    'athletico paranaense': ['#C8102E', '#111111'], coritiba: ['#00544D', '#FFFFFF'], bahia: ['#0057A8', '#FFFFFF'],
    vitoria: ['#E30613', '#111111'], sport: ['#D71920', '#111111'], fortaleza: ['#0F4C9A', '#FFFFFF'],
    ceara: ['#111111', '#FFFFFF'], goias: ['#00703C', '#FFFFFF'], 'red bull bragantino': ['#E30613', '#FFFFFF'],
    'ponte preta': ['#111111', '#FFFFFF'], guarani: ['#00843D', '#FFFFFF'], juventude: ['#00843D', '#FFFFFF']
  };
  const APELIDOS_TIMES = {
    'atletico mg': 'atletico mineiro', atletico: 'atletico mineiro', galo: 'atletico mineiro',
    'america mg': 'america mineiro', america: 'america mineiro', 'athletico pr': 'athletico paranaense',
    athletico: 'athletico paranaense', 'atletico pr': 'athletico paranaense', 'atletico paranaense': 'athletico paranaense',
    inter: 'internacional', colorado: 'internacional', spfc: 'sao paulo', 'sao paulo fc': 'sao paulo',
    bragantino: 'red bull bragantino', 'rb bragantino': 'red bull bragantino', timao: 'corinthians',
    mengao: 'flamengo', verdao: 'palmeiras', 'vasco da gama': 'vasco', fogao: 'botafogo', raposa: 'cruzeiro',
    peixe: 'santos', tricolor: 'sao paulo', 'gremio fbpa': 'gremio'
  };
  function coresTime(nome) {
    const k = chaveTime(nome);
    const cores = TIMES[APELIDOS_TIMES[k] || k];
    return cores ? cores.slice() : null;
  }

  const MENSAGENS_ERRO = {
    'senha-incorreta': 'Senha incorreta.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'Senha incorreta.',
    'auth/invalid-login-credentials': 'Senha incorreta.',
    'auth/user-not-found': 'Senha incorreta.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
    'permission-denied': 'Sua sessão expirou — entre de novo.',
    unauthenticated: 'Sua sessão expirou — entre de novo.',
    offline: 'Sem conexão com o Firebase. Tente de novo.',
    unavailable: 'Sem conexão com o Firebase. Tente de novo.',
    'deadline-exceeded': 'Sem conexão com o Firebase. Tente de novo.',
    'auth/network-request-failed': 'Sem conexão com o Firebase. Tente de novo.',
    cota: 'Espaço local cheio — conecte o Firebase para salvar mais fotos.',
    QuotaExceededError: 'Espaço local cheio — conecte o Firebase para salvar mais fotos.',
    'resource-exhausted': 'Limite diário gratuito do Firebase atingido. Tente de novo amanhã.',
    'senha-fraca': 'A senha precisa ter no mínimo 6 caracteres.',
    'auth/weak-password': 'A senha precisa ter no mínimo 6 caracteres.',
    'auth/requires-recent-login': 'Por segurança, saia e entre de novo antes de trocar a senha.',
    'auth/operation-not-allowed': 'Ative o login por e-mail/senha no Firebase (veja o README).',
    'auth/user-disabled': 'O usuário dos moradores está desativado no Firebase.',
    'formato-imagem': 'Formato de imagem não suportado.'
  };
  function mensagemErro(erro) {
    const codigo = erro && (erro.codigo || erro.code || erro.name);
    return (codigo && MENSAGENS_ERRO[codigo]) || 'Algo deu errado. Tente de novo.';
  }

  /* ======================================================================
     4. CONTEÚDO INICIAL (pré-populado; tudo editável no Modo Morador)
     ====================================================================== */

  const CONTEUDO_INICIAL = {
    versao: 1,
    config: {
      vagasAbertas: true,
      valorMensal: 900,
      itensInclusos: [
        'Aluguel e contas da casa (água, luz e gás)',
        'Internet fibra óptica 800MB',
        'Dona Zilda de segunda a sexta',
        'Almoço e janta de segunda a sexta',
        'Todos os streamings'
      ],
      funcionaria: {
        nome: 'Dona Zilda',
        descricao: 'De segunda a sexta: limpa, cozinha, lava e passa roupa.',
        refeicoes: 'Almoço e janta inclusos de segunda a sexta, com cardápio variado.'
      },
      textos: {
        chamada: 'República masculina em Itajubá-MG com mais de 18 anos de história.',
        sobreTitulo: 'Mais que uma casa: uma família',
        sobreTexto: 'República Masculina com mais de 18 anos de tradições, festas, risadas e apoio em Itajubá. ' +
          'Aqui cada morador encontra parceria nos estudos, amizade para a vida toda e uma casa que funciona de verdade, ' +
          'a 2 minutos da UNIFEI.',
        vagasAbertasTitulo: 'VAGAS ABERTAS NA REPSICO!',
        vagasAbertasTexto: 'Venha fazer parte da nossa família',
        casaCompletaTitulo: 'Casa Completa no Momento',
        casaCompletaTexto: 'Acompanhe nossos rolês no Instagram @repsicoitajuba',
        mascotesTitulo: 'Zé e Mingau',
        mascotesSubtitulo: 'Os verdadeiros donos da casa'
      },
      endereco: {
        rua: 'Rua Coronel Francisco Braz, 1256',
        cidade: 'Itajubá - MG',
        distancias: '2 min da UNIFEI • 8 min do Centro'
      },
      instagram: 'repsicoitajuba'
    },
    slides: {
      s1: {
        tag: 'VAGAS', titulo: 'Vagas abertas a 2 min da UNIFEI',
        descricao: 'Casa mobiliada, comida caseira de segunda a sexta e tudo incluso no valor mensal. Vem conhecer a REPSICO!',
        destaque: '2 MIN', botaoTexto: 'Quero uma vaga', botaoLink: '#localizacao', imagem: null, somenteComVagas: true, ordem: 1
      },
      s2: {
        tag: 'TRADIÇÃO', titulo: 'Mais de 18 anos de história e festas',
        descricao: 'Gerações de moradores, rolês que viraram tradição e amizades que duram muito além da formatura.',
        destaque: '18+ ANOS', botaoTexto: 'Ver os rolês', botaoLink: '#eventos', imagem: null, somenteComVagas: false, ordem: 2
      },
      s3: {
        tag: 'A CASA', titulo: 'Infraestrutura completa, lazer e mascotes',
        descricao: 'Churrasqueira, quintal amplo, sinuca, PS3, PS4, streamings e internet fibra 800MB. E o Zé e o Mingau esperando por você.',
        destaque: 'TUDO INCLUSO', botaoTexto: 'Conhecer a casa', botaoLink: '#casa', imagem: null, somenteComVagas: false, ordem: 3
      }
    },
    diferenciais: {
      d1: { icone: 'pin', titulo: 'Localização', texto: '2 min da UNIFEI e 8 min do centro.', ordem: 1 },
      d2: { icone: 'casa', titulo: 'Estrutura', texto: 'Casa mobiliada com 5 quartos (1 suíte) e 3 banheiros.', ordem: 2 },
      d3: { icone: 'game', titulo: 'Lazer', texto: 'Área de churrasco, quintal amplo, mesa de sinuca, PS3, PS4 e todos os streamings.', ordem: 3 },
      d4: { icone: 'wifi', titulo: 'Internet', texto: 'Fibra óptica 800MB com 2 pontos pela casa.', ordem: 4 }
    },
    galeria: {},
    mascotes: {
      z1: { nome: 'Zé', descricao: 'Chefe da segurança e fiscal oficial do churrasco. Nada passa pelo portão sem ele saber.', foto: null, ordem: 1 },
      z2: { nome: 'Mingau', descricao: 'Especialista em sonecas, mestre em ganhar carinho de visita e dono do melhor lugar do sofá.', foto: null, ordem: 2 }
    },
    moradores: {
      pantufa: { apelido: 'Pantufa', nome: 'Thiago', curso: '', anoEntrada: null, time: '', categoria: 'morador', instagram: '', foto: null },
      dodo: { apelido: 'Dodô', nome: 'Lucas', curso: '', anoEntrada: null, time: '', categoria: 'morador', instagram: '', foto: null }
    },
    eventos: {
      e1: {
        titulo: 'Churrasco de Boas-Vindas',
        descricao: 'Todo começo de semestre a casa recebe os bixos com churrasco no quintal, música e sinuca valendo. É o jeito REPSICO de dizer "seja bem-vindo".',
        fotos: [], ordem: 1
      },
      e2: {
        titulo: 'Resenha da REPSICO',
        descricao: 'A clássica resenha da casa: moradores, agregados e ex-moradores reunidos para comemorar o fim das provas com muita risada.',
        fotos: [], ordem: 2
      }
    },
    contatos: {
      c1: { nome: 'Thiago', apelido: 'Pantufa', telefone: '(35) 9191-5374', ordem: 1 },
      c2: { nome: 'Lucas', apelido: 'Dodô', telefone: '(19) 99977-8860', ordem: 2 }
    },
    faq: {
      f1: {
        pergunta: 'Como funciona o período de agregado?',
        resposta: 'Antes de virar morador, você passa um tempo como agregado: mora na casa, participa da rotina e dos rolês e todo mundo se conhece de verdade. No fim, a casa conversa e decide junto — é o jeito de garantir que a convivência funcione para todos.',
        ordem: 1
      },
      f2: {
        pergunta: 'Os quartos são mobiliados?',
        resposta: 'Sim, a casa é mobiliada. Na visita você conhece os quartos disponíveis e combina com a galera o que precisa trazer.',
        ordem: 2
      },
      f3: {
        pergunta: 'Como são divididas as contas?',
        resposta: 'O valor mensal é uma média que já inclui tudo: aluguel, contas da casa, internet, streamings, a funcionária e as refeições de segunda a sexta. Os custos são divididos entre os moradores e o valor pode variar um pouco de um mês para o outro.',
        ordem: 3
      },
      f4: {
        pergunta: 'Como é a rotina da casa?',
        resposta: 'Durante a semana a Dona Zilda cuida da limpeza e das roupas e prepara almoço e janta. Cada morador cuida das suas coisas e segue as regras de convivência combinadas entre todos — com respeito ao horário de estudo de cada um.',
        ordem: 4
      },
      f5: {
        pergunta: 'O que está incluso no valor mensal?',
        resposta: 'Tudo o que aparece no card de valores da seção A Casa: moradia, contas, internet fibra 800MB, streamings, a funcionária de segunda a sexta e almoço e janta nos dias úteis.',
        ordem: 5
      },
      f6: {
        pergunta: 'Como agendo uma visita? Os pais podem vir junto?',
        resposta: 'Claro! É só chamar um dos responsáveis no WhatsApp (na seção Localização) e combinar o melhor horário. Pais e responsáveis são sempre bem-vindos para conhecer a casa.',
        ordem: 6
      }
    }
  };

  const PADROES_ITEM = {
    slides: { tag: '', titulo: '', descricao: '', destaque: '', botaoTexto: '', botaoLink: '', imagem: null, somenteComVagas: false },
    diferenciais: { icone: 'estrela', titulo: '', texto: '' },
    galeria: { imagem: null, legenda: '' },
    mascotes: { nome: '', descricao: '', foto: null },
    moradores: { apelido: '', nome: '', curso: '', anoEntrada: null, time: '', categoria: 'morador', instagram: '', foto: null },
    eventos: { titulo: '', descricao: '', fotos: [] },
    contatos: { nome: '', apelido: '', telefone: '' },
    faq: { pergunta: '', resposta: '' }
  };
  const CAMPOS_IMAGEM = { slides: 'imagem', galeria: 'imagem', mascotes: 'foto', moradores: 'foto' };

  function normalizarItem(colecao, bruto, indice) {
    const item = Object.assign({}, PADROES_ITEM[colecao], bruto);
    const campoImagem = CAMPOS_IMAGEM[colecao];
    if (campoImagem) item[campoImagem] = typeof item[campoImagem] === 'string' && item[campoImagem] ? item[campoImagem] : null;
    if (colecao === 'eventos') {
      item.fotos = Array.isArray(item.fotos) ? item.fotos.filter(function (f) { return typeof f === 'string' && f; }) : [];
    }
    if (colecao === 'moradores') {
      if (!CATEGORIAS[item.categoria]) item.categoria = 'morador';
      const ano = parseInt(item.anoEntrada, 10);
      item.anoEntrada = Number.isFinite(ano) ? ano : null;
      item.instagram = normalizarInstagram(item.instagram);
    } else {
      const ordem = Number(item.ordem);
      item.ordem = Number.isFinite(ordem) && item.ordem !== null && item.ordem !== '' ? ordem : indice + 1;
    }
    if (colecao === 'slides') item.somenteComVagas = item.somenteComVagas === true;
    return item;
  }

  function normalizar(entrada) {
    if (!ehObjeto(entrada)) return clonar(CONTEUDO_INICIAL);
    const e = clonar(entrada);
    const base = CONTEUDO_INICIAL.config;
    const cfg = ehObjeto(e.config) ? e.config : {};
    const config = Object.assign(clonar(base), cfg);
    ['funcionaria', 'textos', 'endereco'].forEach(function (k) {
      config[k] = Object.assign({}, base[k], ehObjeto(cfg[k]) ? cfg[k] : {});
    });
    if (!Array.isArray(config.itensInclusos)) config.itensInclusos = base.itensInclusos.slice();
    config.vagasAbertas = config.vagasAbertas !== false;
    const valor = Number(config.valorMensal);
    config.valorMensal = Number.isFinite(valor) ? valor : base.valorMensal;
    config.instagram = normalizarInstagram(config.instagram);
    const saida = { versao: 1, config: config };
    COLECOES.forEach(function (col) {
      const mapa = ehObjeto(e[col]) ? e[col] : {};
      const itens = {};
      Object.keys(mapa).forEach(function (id, i) {
        if (/^[A-Za-z0-9_-]+$/.test(id) && ehObjeto(mapa[id])) itens[id] = normalizarItem(col, mapa[id], i);
      });
      saida[col] = itens;
    });
    return saida;
  }

  function ordenarMoradores(lista) {
    return lista.slice().sort(function (a, b) {
      const ca = ORDEM_CATEGORIA[a.categoria] !== undefined ? ORDEM_CATEGORIA[a.categoria] : 9;
      const cb = ORDEM_CATEGORIA[b.categoria] !== undefined ? ORDEM_CATEGORIA[b.categoria] : 9;
      if (ca !== cb) return ca - cb;
      const ya = Number(a.anoEntrada) || Infinity;
      const yb = Number(b.anoEntrada) || Infinity;
      if (ya !== yb) return ya - yb;
      return String(a.apelido || '').localeCompare(String(b.apelido || ''), 'pt-BR', { sensitivity: 'base' });
    });
  }

  function listar(conteudo, colecao) {
    const mapa = (conteudo && conteudo[colecao]) || {};
    const lista = Object.keys(mapa).map(function (id) { return Object.assign({ id: id }, mapa[id]); });
    if (colecao === 'moradores') return ordenarMoradores(lista);
    return lista.sort(function (a, b) {
      return ((Number(a.ordem) || 0) - (Number(b.ordem) || 0)) || String(a.id).localeCompare(String(b.id));
    });
  }

  function proximaOrdem(mapa) {
    let maior = 0;
    Object.keys(mapa || {}).forEach(function (id) {
      const o = Number(mapa[id] && mapa[id].ordem);
      if (o > maior) maior = o;
    });
    return maior + 1;
  }

  function coletarIdsImagens(c) {
    const ids = new Set();
    function add(id) { if (typeof id === 'string' && id) ids.add(id); }
    ['slides', 'galeria'].forEach(function (col) {
      Object.values((c && c[col]) || {}).forEach(function (i) { add(i && i.imagem); });
    });
    ['moradores', 'mascotes'].forEach(function (col) {
      Object.values((c && c[col]) || {}).forEach(function (i) { add(i && i.foto); });
    });
    Object.values((c && c.eventos) || {}).forEach(function (e) { ((e && e.fotos) || []).forEach(add); });
    return Array.from(ids).sort();
  }

  function gerarTextoDivulgacao(conteudo, urlSite) {
    const c = normalizar(conteudo);
    const cfg = c.config;
    const f = cfg.funcionaria;
    const linhas = [];
    linhas.push(cfg.vagasAbertas ? '🔴⚫ *VAGAS ABERTAS NA REPSICO!* ⚫🔴' : '*REPSICO — República masculina em Itajubá-MG*');
    if (cfg.textos.chamada) linhas.push(cfg.textos.chamada);
    linhas.push('');
    linhas.push('📍 ' + cfg.endereco.rua + (cfg.endereco.distancias ? ' — ' + cfg.endereco.distancias : ''));
    listar(c, 'diferenciais').forEach(function (d) {
      linhas.push((ICONE_EMOJI[d.icone] || '✅') + ' *' + d.titulo + ':* ' + d.texto);
    });
    if (f.nome) linhas.push('👩‍🍳 *' + f.nome + ':* ' + f.descricao);
    if (f.refeicoes) linhas.push('🍽️ ' + f.refeicoes);
    const mascotes = listar(c, 'mascotes').map(function (m) { return m.nome; }).filter(Boolean);
    if (mascotes.length) linhas.push('🐾 Mascotes: ' + juntarNomes(mascotes));
    linhas.push('');
    linhas.push('💰 *' + formatarMoeda(cfg.valorMensal) + '/mês — tudo incluso*');
    const contatos = listar(c, 'contatos');
    if (contatos.length) {
      linhas.push('');
      linhas.push(cfg.vagasAbertas ? '📲 Agende sua visita:' : '📲 Contato:');
      contatos.forEach(function (ct) {
        const link = waLink(ct.telefone);
        linhas.push('• ' + ct.nome + (ct.apelido ? ' (' + ct.apelido + ')' : '') + ': ' + ct.telefone +
          (link ? ' — ' + link.replace('https://', '') : ''));
      });
    }
    linhas.push('');
    if (urlSite) linhas.push('🌐 ' + urlSite);
    if (cfg.instagram) linhas.push('📸 Instagram: @' + cfg.instagram);
    return linhas.join('\n');
  }

  /* ======================================================================
     6. ARMAZENAMENTO
     Interface comum (store): modo, iniciar(aoMudar), obter(), salvarItem,
     excluirItem, salvarConfig, reordenar, salvarImagem, lerImagem,
     excluirImagem, substituirTudo e auth { entrar, sair, logado, aoMudar,
     trocarSenha }.
     ====================================================================== */

  const CHAVE_CONTEUDO = 'repsico:conteudo';
  const CHAVE_SESSAO = 'repsico:sessao';
  const CHAVE_SENHA = 'repsico:senhaLocal';
  const CHAVE_CACHE = 'repsico:cache';

  function erroCom(codigo, mensagem) {
    const e = new Error(mensagem || codigo);
    e.codigo = codigo;
    return e;
  }

  function ehErroDeCota(e) {
    return !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22);
  }

  function lerLocal(chave) {
    try { return localStorage.getItem(chave); } catch (e) { return null; }
  }

  function gravarLocal(chave, valor) {
    try { localStorage.setItem(chave, valor); } catch (e) { throw ehErroDeCota(e) ? erroCom('cota') : e; }
  }

  function removerLocal(chave) {
    try { localStorage.removeItem(chave); } catch (e) { /* ignora */ }
  }

  function validarAlvo(colecao, id) {
    if (COLECOES.indexOf(colecao) < 0 || !/^[A-Za-z0-9_-]+$/.test(String(id))) throw erroCom('invalido');
  }

  function ehDataUrlImagem(v) {
    return typeof v === 'string' && v.indexOf('data:image/') === 0;
  }

  // Fotos do modo local ficam no IndexedDB (o localStorage só aguenta ~5 MB).
  function criarBancoImagens() {
    let banco = null;
    function abrir() {
      return new Promise(function (ok, falha) {
        if (!window.indexedDB) return falha(erroCom('sem-indexeddb'));
        const req = indexedDB.open('repsico', 1);
        req.onupgradeneeded = function () { req.result.createObjectStore('imagens'); };
        req.onsuccess = function () { ok(req.result); };
        req.onerror = function () { falha(req.error); };
      });
    }
    function usar(modo, operacao) {
      banco = banco || abrir();
      return banco.then(function (db) {
        return new Promise(function (ok, falha) {
          const tx = db.transaction('imagens', modo);
          const req = operacao(tx.objectStore('imagens'));
          tx.oncomplete = function () { ok(req.result); };
          tx.onerror = tx.onabort = function () { falha(ehErroDeCota(tx.error) ? erroCom('cota') : tx.error); };
        });
      });
    }
    return {
      ler: function (id) { return usar('readonly', function (st) { return st.get(id); }).then(function (v) { return v === undefined ? null : v; }); },
      gravar: function (id, valor) { return usar('readwrite', function (st) { return st.put(valor, id); }); },
      excluir: function (id) { return usar('readwrite', function (st) { return st.delete(id); }); }
    };
  }

  function criarStoreLocal() {
    const imagens = criarBancoImagens();
    const ouvintesAuth = [];
    let conteudo = carregar();
    let aoMudar = function () {};

    function carregar() {
      const bruto = lerLocal(CHAVE_CONTEUDO);
      if (!bruto) return normalizar(null);
      try { return normalizar(JSON.parse(bruto)); } catch (e) { return normalizar(null); }
    }

    // Grava primeiro; só troca o conteúdo em memória se a gravação deu certo.
    function persistir(novo) {
      gravarLocal(CHAVE_CONTEUDO, JSON.stringify(novo));
      conteudo = novo;
      aoMudar(conteudo);
    }

    async function alterar(mudanca) {
      const copia = clonar(conteudo);
      mudanca(copia);
      persistir(normalizar(copia));
    }

    function notificarAuth(logado) {
      ouvintesAuth.forEach(function (cb) { cb(logado); });
    }

    const auth = {
      entrar: async function (senha) {
        const hash = await sha256Hex(String(senha || ''));
        if (hash !== (lerLocal(CHAVE_SENHA) || SENHA_LOCAL_HASH)) throw erroCom('senha-incorreta');
        gravarLocal(CHAVE_SESSAO, '1');
        notificarAuth(true);
      },
      sair: async function () {
        removerLocal(CHAVE_SESSAO);
        notificarAuth(false);
      },
      logado: function () { return lerLocal(CHAVE_SESSAO) === '1'; },
      aoMudar: function (cb) { ouvintesAuth.push(cb); },
      trocarSenha: async function (nova) {
        if (String(nova || '').length < 6) throw erroCom('senha-fraca');
        if (!auth.logado()) throw erroCom('permission-denied');
        gravarLocal(CHAVE_SENHA, await sha256Hex(String(nova)));
      }
    };

    return {
      modo: 'local',
      auth: auth,
      iniciar: async function (cb) {
        aoMudar = cb || function () {};
        aoMudar(conteudo);
      },
      obter: function () { return conteudo; },
      salvarItem: async function (colecao, id, dados) {
        validarAlvo(colecao, id);
        await alterar(function (c) { c[colecao][id] = clonar(dados); });
      },
      excluirItem: async function (colecao, id) {
        validarAlvo(colecao, id);
        await alterar(function (c) { delete c[colecao][id]; });
      },
      salvarConfig: async function (parcial) {
        await alterar(function (c) {
          Object.keys(parcial || {}).forEach(function (k) { c.config[k] = clonar(parcial[k]); });
        });
      },
      reordenar: async function (colecao, pares) {
        await alterar(function (c) {
          (pares || []).forEach(function (par) {
            if (c[colecao] && c[colecao][par[0]]) c[colecao][par[0]].ordem = par[1];
          });
        });
      },
      salvarImagem: async function (dataUrl) {
        if (!ehDataUrlImagem(dataUrl)) throw erroCom('formato-imagem');
        const id = gerarId();
        await imagens.gravar(id, dataUrl);
        return id;
      },
      lerImagem: function (id) {
        return imagens.ler(id).catch(function (e) { console.warn('Imagem indisponível:', id, e); return null; });
      },
      excluirImagem: function (id) { return imagens.excluir(id); },
      substituirTudo: async function (novoConteudo, mapaImagens, aoProgresso) {
        const novo = normalizar(novoConteudo);
        const antigas = coletarIdsImagens(conteudo);
        const ids = Object.keys(mapaImagens || {}).filter(function (id) {
          return /^[A-Za-z0-9_-]+$/.test(id) && ehDataUrlImagem(mapaImagens[id]);
        });
        for (let i = 0; i < ids.length; i++) {
          await imagens.gravar(ids[i], mapaImagens[ids[i]]);
          if (aoProgresso) aoProgresso(i + 1, ids.length);
        }
        persistir(novo);
        const usadas = new Set(coletarIdsImagens(novo));
        for (const id of antigas) if (!usadas.has(id)) await imagens.excluir(id);
      }
    };
  }

  /* ======================================================================
     7. RENDERIZAÇÃO
     ====================================================================== */

  const estado = { conteudo: normalizar(null), admin: false, filtroMoradores: 'todos' };
  let store = null;

  function renderizarTudo() {
    if (observadorImagens) observadorImagens.disconnect();
    renderHero();
    renderVagas();
    renderCasa();
    renderMoradores();
    renderEventos();
    hidratarImagens(document);
  }

  /* ---- Fotos sob demanda (lazy) com cache em memória ---- */
  const imagensProntas = new Map();
  const imagensPedidas = new Map();
  let observadorImagens = null;

  function obterImagem(id) {
    if (imagensProntas.has(id)) return Promise.resolve(imagensProntas.get(id));
    if (!imagensPedidas.has(id)) {
      const pedido = Promise.resolve(store ? store.lerImagem(id) : null).then(function (url) {
        imagensPedidas.delete(id);
        if (url) imagensProntas.set(id, url);
        return url;
      }, function () {
        imagensPedidas.delete(id);
        return null;
      });
      imagensPedidas.set(id, pedido);
    }
    return imagensPedidas.get(id);
  }

  function carregarImagem(img) {
    const id = img.dataset.img;
    obterImagem(id).then(function (url) {
      if (img.dataset.img !== id) return;
      if (url) { img.src = url; img.classList.add('carregada'); } else { img.classList.add('sem-imagem'); }
    });
  }

  function hidratarImagens(raiz) {
    (raiz || document).querySelectorAll('img[data-img]').forEach(function (img) {
      if (img.getAttribute('src')) return;
      const pronta = imagensProntas.get(img.dataset.img);
      if (pronta) { img.src = pronta; img.classList.add('carregada'); return; }
      if (!('IntersectionObserver' in window)) { carregarImagem(img); return; }
      observadorImagens = observadorImagens || new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          observadorImagens.unobserve(e.target);
          carregarImagem(e.target);
        });
      }, { rootMargin: '200px' });
      observadorImagens.observe(img);
    });
  }

  function imgTag(id, alt, classe) {
    return '<img data-img="' + escapeHtml(id) + '" alt="' + escapeHtml(alt || '') + '" draggable="false" decoding="async"' +
      (classe ? ' class="' + classe + '"' : '') + '>';
  }

  function placeholderMarca(destaque) {
    return '<div class="placeholder-marca">' + (destaque
      ? '<span class="destaque">' + escapeHtml(destaque) + '</span><img class="selo-logo" src="logo-repsico.png" alt="">'
      : '<img class="logo-grande" src="logo-repsico.png" alt="">') + '</div>';
  }

  /* ---- Carrossel (vitrine estilo Steam) ---- */
  const carrossel = { indice: 0, total: 0, timer: null, mouseDentro: false, focoDentro: false, inicioX: null, inicioY: 0 };
  const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  function slidesVisiveis() {
    const c = estado.conteudo;
    return listar(c, 'slides').filter(function (s) {
      return estado.admin || !(s.somenteComVagas && !c.config.vagasAbertas);
    });
  }

  function htmlSlide(s, i, lista) {
    const oculto = s.somenteComVagas && !estado.conteudo.config.vagasAbertas;
    const link = linkSeguro(s.botaoLink);
    const externo = !!link && /^https?:/i.test(link);
    return '<article class="hero-slide" data-indice="' + i + '" aria-roledescription="slide" aria-label="' +
        (i + 1) + ' de ' + lista.length + '">' +
      '<div class="hero-midia">' + (s.imagem ? imgTag(s.imagem, s.titulo) : placeholderMarca(s.destaque)) + '</div>' +
      '<div class="hero-painel">' +
        (s.tag ? '<span class="tag">' + escapeHtml(s.tag) + '</span>' : '') +
        '<h2 class="hero-titulo">' + escapeHtml(s.titulo) + '</h2>' +
        (s.descricao ? '<p class="hero-descricao">' + escapeHtml(s.descricao) + '</p>' : '') +
        (s.botaoTexto && link ? '<a class="btn btn-primario btn-hero" href="' + escapeHtml(link) + '"' +
          (externo ? ' target="_blank" rel="noopener"' : '') + '>' + escapeHtml(s.botaoTexto) + icone('seta-dir') + '</a>' : '') +
        (estado.admin && oculto ? '<span class="marcador-oculto">oculto: casa completa</span>' : '') +
      '</div>' +
    '</article>';
  }

  function renderHero() {
    const raiz = document.querySelector('#home .hero');
    const slides = slidesVisiveis();
    carrossel.total = slides.length;
    if (carrossel.indice >= slides.length) carrossel.indice = 0;
    if (!slides.length) {
      pararAutoplay();
      raiz.innerHTML = '<div class="hero-vazio"><img src="logo-repsico.png" alt=""><div><strong>República REPSICO</strong><span>' +
        escapeHtml(estado.conteudo.config.textos.chamada) + '</span></div></div>';
      return;
    }
    const varios = slides.length > 1;
    raiz.innerHTML =
      '<div class="hero-palco">' +
        '<div class="hero-trilho">' + slides.map(htmlSlide).join('') + '</div>' +
        (varios ? '<div class="hero-setas">' +
          '<button type="button" class="hero-seta" data-acao="slide-anterior" aria-label="Slide anterior">' + icone('seta-esq') + '</button>' +
          '<button type="button" class="hero-seta" data-acao="slide-proximo" aria-label="Próximo slide">' + icone('seta-dir') + '</button>' +
        '</div>' : '') +
      '</div>' +
      (varios ? '<div class="hero-indicadores" role="group" aria-label="Escolher slide">' + slides.map(function (s, i) {
        return '<button type="button" data-acao="ir-slide" data-indice="' + i + '" aria-label="Slide ' + (i + 1) + ': ' +
          escapeHtml(s.titulo) + '"></button>';
      }).join('') + '</div>' : '');
    mostrarSlide(carrossel.indice);
    agendarAutoplay();
  }

  function mostrarSlide(i) {
    const slides = document.querySelectorAll('#home .hero-slide');
    if (!slides.length) return;
    carrossel.indice = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach(function (el, k) {
      const ativo = k === carrossel.indice;
      el.classList.toggle('ativo', ativo);
      el.setAttribute('aria-hidden', String(!ativo));
      el.inert = !ativo;
    });
    document.querySelectorAll('#home .hero-indicadores button').forEach(function (b, k) {
      if (k === carrossel.indice) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  function irParaSlide(i) {
    mostrarSlide(i);
    agendarAutoplay();
  }

  function pararAutoplay() {
    clearTimeout(carrossel.timer);
    carrossel.timer = null;
  }

  function agendarAutoplay() {
    pararAutoplay();
    if (carrossel.total < 2 || carrossel.mouseDentro || carrossel.focoDentro || document.hidden || prefereMenosMovimento.matches) return;
    carrossel.timer = setTimeout(function () {
      mostrarSlide(carrossel.indice + 1);
      agendarAutoplay();
    }, 6000);
  }

  function ligarCarrossel() {
    const raiz = document.querySelector('#home .hero');
    raiz.addEventListener('mouseenter', function () { carrossel.mouseDentro = true; agendarAutoplay(); });
    raiz.addEventListener('mouseleave', function () { carrossel.mouseDentro = false; agendarAutoplay(); });
    raiz.addEventListener('focusin', function () { carrossel.focoDentro = true; agendarAutoplay(); });
    raiz.addEventListener('focusout', function (ev) {
      if (raiz.contains(ev.relatedTarget)) return;
      carrossel.focoDentro = false;
      agendarAutoplay();
    });
    raiz.addEventListener('pointerdown', function (ev) {
      if (!ev.isPrimary || ev.button !== 0 || ev.target.closest('button, a, input, .controles-item')) return;
      carrossel.inicioX = ev.clientX;
      carrossel.inicioY = ev.clientY;
    });
    raiz.addEventListener('pointerup', function (ev) {
      if (carrossel.inicioX === null) return;
      const dx = ev.clientX - carrossel.inicioX;
      const dy = ev.clientY - carrossel.inicioY;
      carrossel.inicioX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) irParaSlide(carrossel.indice + (dx < 0 ? 1 : -1));
    });
    raiz.addEventListener('pointercancel', function () { carrossel.inicioX = null; });
    raiz.addEventListener('keydown', function (ev) {
      if (ev.target.closest('input, textarea, select')) return;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault();
        irParaSlide(carrossel.indice + (ev.key === 'ArrowRight' ? 1 : -1));
      }
    });
    document.addEventListener('visibilitychange', agendarAutoplay);
  }

  /* ---- Seção A Casa ---- */
  function renderCasa() {
    const c = estado.conteudo;
    const cfg = c.config;
    const t = cfg.textos;
    const f = cfg.funcionaria;

    document.querySelector('#casa .sobre').innerHTML =
      '<h2 class="secao-titulo">' + escapeHtml(t.sobreTitulo) + '</h2>' +
      '<p class="secao-intro">' + escapeHtml(t.sobreTexto) + '</p>';

    document.getElementById('lista-diferenciais').innerHTML = listar(c, 'diferenciais').map(function (d) {
      return '<article class="card-casa card-diferencial">' +
        '<span class="icone-bolha">' + icone(d.icone) + '</span>' +
        '<h3>' + escapeHtml(d.titulo) + '</h3>' +
        (d.texto ? '<p>' + escapeHtml(d.texto) + '</p>' : '') +
      '</article>';
    }).join('') +
      '<article class="card-casa card-equipe">' +
        '<span class="icone-bolha">' + icone('chef') + '</span>' +
        '<span class="card-rotulo">Comodidade &amp; Equipe</span>' +
        '<h3>' + escapeHtml(f.nome) + '</h3>' +
        (f.descricao ? '<p>' + escapeHtml(f.descricao) + '</p>' : '') +
        (f.refeicoes ? '<p class="refeicoes">' + icone('talheres') + '<span>' + escapeHtml(f.refeicoes) + '</span></p>' : '') +
      '</article>';

    document.getElementById('card-financeiro').innerHTML =
      '<div class="financeiro-valor">' +
        '<span class="financeiro-rotulo">Transparência financeira</span>' +
        '<strong class="valor">' + escapeHtml(formatarMoeda(cfg.valorMensal)) + '</strong>' +
        '<span class="financeiro-sub">por mês · valor médio · tudo incluso</span>' +
      '</div>' +
      '<ul class="lista-check">' + cfg.itensInclusos.map(function (item) {
        return '<li>' + icone('check') + '<span>' + escapeHtml(item) + '</span></li>';
      }).join('') + '</ul>';

    renderGaleria();
    renderMascotes();
  }

  function renderGaleria() {
    const fotos = listar(estado.conteudo, 'galeria');
    document.getElementById('galeria').hidden = !fotos.length && !estado.admin;
    document.getElementById('lista-galeria').innerHTML = fotos.length ? fotos.map(function (g, i) {
      return '<figure class="galeria-item">' +
        '<button type="button" class="galeria-abrir" data-acao="abrir-galeria" data-indice="' + i + '" aria-label="Ampliar foto' +
          (g.legenda ? ': ' + escapeHtml(g.legenda) : ' ' + (i + 1)) + '">' + imgTag(g.imagem, g.legenda || 'Foto da casa') + '</button>' +
        (g.legenda ? '<figcaption>' + escapeHtml(g.legenda) + '</figcaption>' : '') +
      '</figure>';
    }).join('') : '<p class="vazio">Nenhuma foto ainda. Use “+ Adicionar fotos” para mostrar os ambientes da casa.</p>';
  }

  function renderMascotes() {
    const t = estado.conteudo.config.textos;
    const lista = listar(estado.conteudo, 'mascotes');
    const el = document.getElementById('mascotes');
    el.hidden = !lista.length && !estado.admin;
    el.innerHTML =
      '<div class="mascotes-card">' +
        '<div class="mascotes-cabecalho">' +
          '<span class="mascotes-selo">' + icone('pata') + 'Mascotes oficiais</span>' +
          '<h3>' + escapeHtml(t.mascotesTitulo) + '</h3>' +
          '<p class="mascotes-subtitulo">' + escapeHtml(t.mascotesSubtitulo) + '</p>' +
          '<div class="acoes-secao" data-secao="mascotes"></div>' +
        '</div>' +
        '<div class="mascotes-lista">' + lista.map(function (m) {
          return '<article class="mascote">' +
            '<div class="mascote-foto">' + (m.foto ? imgTag(m.foto, m.nome) : '<div class="placeholder-pata">' + icone('pata') + '</div>') + '</div>' +
            '<div class="mascote-texto"><h4 class="mascote-nome">' + escapeHtml(m.nome) + '</h4>' +
              (m.descricao ? '<p class="mascote-descricao">' + escapeHtml(m.descricao) + '</p>' : '') + '</div>' +
          '</article>';
        }).join('') + '</div>' +
      '</div>';
  }

  /* ---- Moradores ---- */
  const FILTROS_MORADORES = [['todos', 'Todos'], ['morador', 'Moradores Atuais'], ['agregado', 'Agregados'], ['ex', 'Ex-Moradores']];
  const VAZIO_MORADORES = {
    todos: 'Nenhum morador cadastrado ainda.',
    morador: 'Nenhum morador atual cadastrado ainda.',
    agregado: 'Nenhum agregado cadastrado ainda.',
    ex: 'Nenhum ex-morador cadastrado ainda.'
  };

  function renderMoradores() {
    const todos = listar(estado.conteudo, 'moradores');
    const filtro = estado.filtroMoradores;
    const contagem = { todos: todos.length, morador: 0, agregado: 0, ex: 0 };
    todos.forEach(function (m) { contagem[m.categoria] += 1; });
    document.querySelector('#moradores .filtros').innerHTML = FILTROS_MORADORES.map(function (f) {
      return '<button type="button" class="chip" data-acao="filtrar-moradores" data-filtro="' + f[0] + '" aria-pressed="' +
        (f[0] === filtro) + '">' + f[1] + ' <span class="chip-contagem">(' + contagem[f[0]] + ')</span></button>';
    }).join('');
    const lista = filtro === 'todos' ? todos : todos.filter(function (m) { return m.categoria === filtro; });
    const el = document.getElementById('lista-moradores');
    el.innerHTML = lista.length ? lista.map(htmlMorador).join('') : '<p class="vazio">' + VAZIO_MORADORES[filtro] + '</p>';
    hidratarImagens(el);
  }

  function htmlMorador(m) {
    const cores = m.time ? coresTime(m.time) : null;
    const curso = [m.curso, m.anoEntrada ? 'desde ' + m.anoEntrada : ''].filter(Boolean).join(' · ');
    return '<article class="card-morador">' +
      '<div class="morador-foto">' +
        (m.foto ? imgTag(m.foto, 'Foto de ' + m.apelido) : '<div class="placeholder-iniciais" aria-hidden="true">' + escapeHtml(iniciais(m.apelido)) + '</div>') +
        '<span class="badge-categoria categoria-' + m.categoria + '">' + CATEGORIAS[m.categoria] + '</span>' +
      '</div>' +
      '<div class="morador-info">' +
        '<h3 class="morador-apelido">' + escapeHtml(m.apelido) + '</h3>' +
        (m.nome ? '<p class="morador-nome">' + escapeHtml(m.nome) + '</p>' : '') +
        (curso ? '<p class="morador-curso">' + icone('curso') + '<span>' + escapeHtml(curso) + '</span></p>' : '') +
        ((m.time || m.instagram) ? '<div class="morador-rodape">' +
          (m.time ? '<span class="badge-time' + (cores ? '' : ' neutro') + '"' +
            (cores ? ' style="background:' + cores[0] + ';color:' + cores[1] + '"' : '') + '>' + icone('bola') + escapeHtml(m.time) + '</span>' : '') +
          (m.instagram ? '<a class="btn-instagram" href="https://instagram.com/' + escapeHtml(m.instagram) +
            '" target="_blank" rel="noopener">' + icone('instagram') + '@' + escapeHtml(m.instagram) + '</a>' : '') +
        '</div>' : '') +
      '</div>' +
    '</article>';
  }

  /* ---- Eventos & Rolês ---- */
  function renderEventos() {
    const lista = listar(estado.conteudo, 'eventos');
    document.getElementById('lista-eventos').innerHTML = lista.length
      ? lista.map(htmlEvento).join('')
      : '<p class="vazio">Em breve: os rolês da REPSICO.</p>';
  }

  function htmlEvento(e) {
    const fotos = e.fotos;
    const varias = fotos.length > 1;
    let midia;
    if (fotos.length) {
      midia = '<div class="evento-fotos">' + fotos.map(function (id, i) {
        return '<button type="button" class="evento-foto" data-acao="abrir-evento" data-id="' + escapeHtml(e.id) + '" data-indice="' + i +
          '" aria-label="Ampliar foto ' + (i + 1) + ' de ' + fotos.length + '">' + imgTag(id, e.titulo + ' — foto ' + (i + 1)) + '</button>';
      }).join('') + '</div>' +
      (varias ? '<button type="button" class="evento-seta evento-anterior" data-acao="evento-anterior" aria-label="Foto anterior">' + icone('seta-esq') + '</button>' +
        '<button type="button" class="evento-seta evento-proximo" data-acao="evento-proximo" aria-label="Próxima foto">' + icone('seta-dir') + '</button>' +
        '<div class="evento-pontos">' + fotos.map(function (id, i) {
          return '<button type="button" data-acao="evento-ir" data-indice="' + i + '" aria-label="Ver foto ' + (i + 1) + '"' +
            (i === 0 ? ' aria-current="true"' : '') + '></button>';
        }).join('') + '</div>' : '');
    } else {
      midia = placeholderMarca('');
    }
    return '<article class="card-evento" data-id="' + escapeHtml(e.id) + '">' +
      '<div class="evento-midia">' + midia + '</div>' +
      '<div class="evento-corpo">' +
        '<h3 class="evento-titulo">' + escapeHtml(e.titulo) + '</h3>' +
        (e.descricao ? '<p class="evento-descricao">' + escapeHtml(e.descricao) + '</p>' : '') +
      '</div>' +
    '</article>';
  }

  function trilhoDoEvento(alvo) {
    const card = alvo.closest('.card-evento');
    return card ? card.querySelector('.evento-fotos') : null;
  }

  function moverFotoEvento(alvo, passo) {
    const trilho = trilhoDoEvento(alvo);
    if (trilho) trilho.scrollBy({ left: passo * trilho.clientWidth, behavior: prefereMenosMovimento.matches ? 'auto' : 'smooth' });
  }

  function atualizarPontosEvento(trilho) {
    const card = trilho.closest('.card-evento');
    const atual = Math.round(trilho.scrollLeft / Math.max(trilho.clientWidth, 1));
    card.querySelectorAll('.evento-pontos button').forEach(function (b, i) {
      if (i === atual) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  /* ---- Faixa de status de vagas ---- */
  function renderVagas() {
    const el = document.getElementById('faixa-vagas');
    const cfg = estado.conteudo.config;
    const t = cfg.textos;
    el.classList.toggle('aberta', cfg.vagasAbertas);
    el.classList.toggle('completa', !cfg.vagasAbertas);
    let acao;
    if (cfg.vagasAbertas) {
      const contato = listar(estado.conteudo, 'contatos')[0];
      const link = contato ? waLink(contato.telefone, mensagemWhatsApp(contato)) : null;
      acao = '<a class="btn btn-claro btn-whatsapp" href="' + escapeHtml(link || '#localizacao') + '"' +
        (link ? ' target="_blank" rel="noopener"' : '') + '>' + icone('whatsapp') + 'Agendar visita no WhatsApp</a>';
    } else {
      acao = cfg.instagram ? '<a class="btn btn-secundario btn-instagram" href="https://instagram.com/' +
        escapeHtml(cfg.instagram) + '" target="_blank" rel="noopener">' + icone('instagram') + '@' + escapeHtml(cfg.instagram) + '</a>' : '';
    }
    el.innerHTML = '<div class="container faixa-inner">' +
      (cfg.vagasAbertas ? '<span class="pulso" aria-hidden="true"></span>' : '') +
      '<div class="faixa-texto"><strong>' + escapeHtml(cfg.vagasAbertas ? t.vagasAbertasTitulo : t.casaCompletaTitulo) +
      '</strong><span>' + escapeHtml(cfg.vagasAbertas ? t.vagasAbertasTexto : t.casaCompletaTexto) + '</span></div>' +
      acao + '</div>';
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

  /* ---- Lightbox (galeria e rolês) ---- */
  const lightbox = { itens: [], indice: 0, origem: null, inicioX: null };

  function abrirLightbox(itens, indice) {
    if (!itens.length) return;
    lightbox.itens = itens;
    lightbox.indice = indice || 0;
    lightbox.origem = document.activeElement;
    const el = document.getElementById('lightbox');
    const varios = itens.length > 1;
    el.innerHTML =
      '<div class="lightbox-fundo" data-acao="lightbox-fechar"></div>' +
      '<figure class="lightbox-conteudo" role="dialog" aria-modal="true" aria-label="Foto ampliada">' +
        '<img class="lightbox-img" alt="" draggable="false">' +
        '<figcaption><span class="lightbox-legenda"></span><span class="lightbox-contador"></span></figcaption>' +
      '</figure>' +
      '<button type="button" class="lightbox-btn lightbox-fechar" data-acao="lightbox-fechar" aria-label="Fechar foto">' + icone('fechar') + '</button>' +
      (varios ? '<button type="button" class="lightbox-btn lightbox-anterior" data-acao="lightbox-anterior" aria-label="Foto anterior">' + icone('seta-esq') + '</button>' +
        '<button type="button" class="lightbox-btn lightbox-proximo" data-acao="lightbox-proximo" aria-label="Próxima foto">' + icone('seta-dir') + '</button>' : '');
    el.hidden = false;
    document.documentElement.classList.add('sem-rolagem');
    mostrarFotoLightbox();
    el.querySelector('.lightbox-fechar').focus();
  }

  function mostrarFotoLightbox() {
    const total = lightbox.itens.length;
    lightbox.indice = ((lightbox.indice % total) + total) % total;
    const item = lightbox.itens[lightbox.indice];
    const el = document.getElementById('lightbox');
    const img = el.querySelector('.lightbox-img');
    img.removeAttribute('src');
    img.alt = item.legenda || 'Foto ampliada';
    obterImagem(item.img).then(function (url) {
      if (url && lightbox.itens[lightbox.indice] === item) img.src = url;
    });
    el.querySelector('.lightbox-legenda').textContent = item.legenda || '';
    el.querySelector('.lightbox-contador').textContent = (lightbox.indice + 1) + ' / ' + total;
  }

  function navegarLightbox(passo) {
    lightbox.indice += passo;
    mostrarFotoLightbox();
  }

  function fecharLightbox() {
    const el = document.getElementById('lightbox');
    if (el.hidden) return;
    el.hidden = true;
    el.innerHTML = '';
    document.documentElement.classList.remove('sem-rolagem');
    if (lightbox.origem && document.contains(lightbox.origem)) lightbox.origem.focus();
  }

  function ligarLightbox() {
    const el = document.getElementById('lightbox');
    document.addEventListener('keydown', function (ev) {
      if (el.hidden) return;
      if (ev.key === 'Escape') { ev.preventDefault(); fecharLightbox(); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); navegarLightbox(1); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); navegarLightbox(-1); }
      else if (ev.key === 'Tab') prenderFoco(el, ev);
    });
    el.addEventListener('pointerdown', function (ev) { lightbox.inicioX = ev.clientX; });
    el.addEventListener('pointerup', function (ev) {
      if (lightbox.inicioX === null || lightbox.itens.length < 2) return;
      const dx = ev.clientX - lightbox.inicioX;
      lightbox.inicioX = null;
      if (Math.abs(dx) > 50) navegarLightbox(dx < 0 ? 1 : -1);
    });
  }

  // Mantém o Tab circulando entre os elementos focáveis de um diálogo.
  function prenderFoco(container, ev) {
    const focaveis = Array.from(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(function (e) { return e.offsetParent !== null || e === document.activeElement; });
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (!container.contains(document.activeElement)) { ev.preventDefault(); primeiro.focus(); }
    else if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
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
    menu: alternarMenu,
    'slide-anterior': function () { irParaSlide(carrossel.indice - 1); },
    'slide-proximo': function () { irParaSlide(carrossel.indice + 1); },
    'ir-slide': function (alvo) { irParaSlide(Number(alvo.dataset.indice) || 0); },
    'abrir-galeria': function (alvo) {
      const itens = listar(estado.conteudo, 'galeria').map(function (g) { return { img: g.imagem, legenda: g.legenda }; });
      abrirLightbox(itens, Number(alvo.dataset.indice) || 0);
    },
    'filtrar-moradores': function (alvo) {
      estado.filtroMoradores = alvo.dataset.filtro || 'todos';
      renderMoradores();
    },
    'abrir-evento': function (alvo) {
      const evento = estado.conteudo.eventos[alvo.dataset.id];
      if (!evento) return;
      abrirLightbox(evento.fotos.map(function (id) { return { img: id, legenda: evento.titulo }; }), Number(alvo.dataset.indice) || 0);
    },
    'evento-anterior': function (alvo) { moverFotoEvento(alvo, -1); },
    'evento-proximo': function (alvo) { moverFotoEvento(alvo, 1); },
    'evento-ir': function (alvo) {
      const trilho = trilhoDoEvento(alvo);
      if (trilho) trilho.scrollTo({ left: Number(alvo.dataset.indice) * trilho.clientWidth, behavior: 'smooth' });
    },
    'lightbox-fechar': fecharLightbox,
    'lightbox-anterior': function () { navegarLightbox(-1); },
    'lightbox-proximo': function () { navegarLightbox(1); }
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

  window.REPSICO = {
    pronto: pronto,
    utils: {
      escapeHtml: escapeHtml, gerarId: gerarId, formatarMoeda: formatarMoeda, digitosTelefone: digitosTelefone,
      formatarTelefone: formatarTelefone, waLink: waLink, mensagemWhatsApp: mensagemWhatsApp,
      normalizarInstagram: normalizarInstagram, linkSeguro: linkSeguro, sha256Hex: sha256Hex, iniciais: iniciais,
      juntarNomes: juntarNomes, chaveTime: chaveTime, coresTime: coresTime, mensagemErro: mensagemErro,
      normalizar: normalizar, listar: listar, ordenarMoradores: ordenarMoradores, proximaOrdem: proximaOrdem,
      coletarIdsImagens: coletarIdsImagens, gerarTextoDivulgacao: gerarTextoDivulgacao,
      COLECOES: COLECOES, CATEGORIAS: CATEGORIAS, ICONE_EMOJI: ICONE_EMOJI
    },
    get CONTEUDO_INICIAL() { return clonar(CONTEUDO_INICIAL); },
    get store() { return store; },
    get estado() { return estado; }
  };

  function atualizarModoAdmin(logado) {
    estado.admin = !!logado;
  }

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
    ligarCarrossel();
    ligarLightbox();
    document.addEventListener('scroll', function (ev) {
      if (ev.target.classList && ev.target.classList.contains('evento-fotos')) atualizarPontosEvento(ev.target);
    }, true);
    store = criarStoreLocal();
    await store.iniciar(function (c) {
      estado.conteudo = c;
      renderizarTudo();
    });
    store.auth.aoMudar(atualizarModoAdmin);
    atualizarModoAdmin(store.auth.logado());
  }

  iniciar()
    .catch(function (erro) { console.error('Falha ao iniciar o site da REPSICO:', erro); })
    .then(function () { resolverPronto(); });
})();
