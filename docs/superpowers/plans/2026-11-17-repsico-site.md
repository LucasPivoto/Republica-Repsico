# Site da República REPSICO — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site estático de página única da REPSICO (GitHub Pages) que funciona sem Firebase (modo local) e com Firebase (Firestore + Auth), com Modo Morador protegido por senha única, CRUD de todo o conteúdo e backup exportar/importar.

**Architecture:**
- `index.html` traz a estrutura fixa (navbar, seções vazias, rodapé, modais). `style.css` traz os temas por variáveis CSS. `app.js` é um script clássico com toda a lógica, organizado em seções comentadas.
- Uma interface única de armazenamento (`store`) tem três implementações: local (`localStorage` para o texto + IndexedDB para as fotos), Firebase (documento `site/conteudo` + coleção `imagens`) e indisponível (só leitura).
- A renderização é por seção, com templates de string e `escapeHtml`. Os eventos são delegados por `data-acao`.

**Tech Stack:**
- Site: HTML5, CSS3, JavaScript ES2020 sem build, Firebase JS SDK 12.19.0 via `import()` dinâmico de `www.gstatic.com`.
- Testes (fora do repositório): Node 22 `node:test` + Playwright/Chromium já instalados. Firebase Emulator Suite (`firebase-tools@15.34.2`, Java) para o modo Firebase.

**Spec:** `docs/superpowers/specs/2026-11-17-repsico-site-design.md`

## Global Constraints

- **Arquivos do site:** `index.html`, `style.css`, `app.js`, `README.md`, `logo-repsico.png` na raiz. Sem Node, sem build, sem framework, sem biblioteca externa de JS ou ícones.
- **Testes fora do repositório.** Pasta de testes: `T=/tmp/claude-0/-home-user-Republica-Repsico/5e136209-52b1-5753-a776-3f1a68fed94a/scratchpad/tests`. Todos os comandos abaixo usam `$T`.
- **Cores:** vermelho `#D90429` (hover `#EF233C`).
  - Claro: fundo `#FFFFFF`, cards `#F8F9FA`, texto `#121214`.
  - Escuro: fundo `#121214`, cards `#1C1C21`, texto `#F4F4F5`.
  - `--accent-text`: `#D90429` no claro, `#FF4D6D` no escuro.
- **Fontes:** Montserrat 700/800/900 (títulos) e Inter 400/500/600 (texto), Google Fonts com `display=swap`.
- **Logo:** `logo-repsico.png` fixa (navbar, favicon, apple-touch-icon, rodapé, og:image). Nunca editável.
- **Chaves de armazenamento:** `localStorage`: `repsico:tema`, `repsico:conteudo`, `repsico:sessao`, `repsico:senhaLocal`, `repsico:cache`. IndexedDB: banco `repsico`, store `imagens`.
- **Modo local:** senha padrão `repsico`, `SENHA_LOCAL_HASH = "007beb0902f16501d75471e69a92bda5f08302033543a5fb4e28f0bfab4f47fb"`.
- **Login no Firebase:** `EMAIL_MORADORES = "moradores@repsico.com"`. Firebase "ativo" = `apiKey` e `projectId` preenchidos.
- **Compressão de fotos:** lado maior ≤ 800 px, `image/jpeg` qualidade `0.75`, fundo branco, sem ampliar. Máximo de **12 fotos por rolê**.
- **Mensagem do WhatsApp:** `Fala <Apelido>! Vi o site da REPSICO e gostaria de tirar dúvidas / marcar uma visita.` (usa o nome quando não há apelido). Link: `https://wa.me/55<dígitos>?text=<encodeURIComponent>`.
- **Endereço:** `Rua Coronel Francisco Braz, 1256` + `Itajubá - MG`, com distâncias `2 min da UNIFEI • 8 min do Centro`. Instagram `repsicoitajuba`.
- **Mapa:** `https://www.google.com/maps?q=<enc>&output=embed`. Link "Abrir no Google Maps": `https://www.google.com/maps/search/?api=1&query=<enc>`.
- **Todo texto vindo do conteúdo passa por `escapeHtml`.** Links passam por `linkSeguro`.
- **Toasts (texto exato):**
  - `Salvo!`, `Excluído.`, `Endereço copiado!`, `Texto de divulgação copiado!`
  - `Backup exportado!`, `Backup importado!`, `Arquivo de backup inválido.`, `Senha alterada!`
  - `1 foto adicionada` / `<n> fotos adicionadas`
  - `Máximo de 12 fotos por rolê.`, `Formato de imagem não suportado.`
- **Commits:** em inglês, terminando com as duas linhas de atribuição da sessão (`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` e `Claude-Session: https://claude.ai/code/session_01N5xrRT13vnskac38ooDYqJ`).

## Review Focus

1. **Texto com HTML ou aspas digitado por morador** (apelido `<img src=x onerror=...>`, FAQ com aspas): deve aparecer como texto literal, sem executar nada. *Teste: Task 9 `escapa HTML digitado`.*
2. **Fotos de celular:** enormes, em retrato, PNG transparente ou formato que o navegador não decodifica (HEIC). Devem ser comprimidas corretamente ou gerar um erro claro, sem travar o formulário. *Testes: Task 9 `comprimirImagem…` e `arquivo que não é imagem`.*
3. **Textos longos e palavras sem espaço** (descrição grande, @ comprido, URL) no celular: não podem criar rolagem horizontal. *Teste: Task 12 `conteúdo longo não quebra o layout`.*
4. **Coleções vazias** (todos os slides apagados, nenhum contato): a página não quebra. Aparece o banner fixo da marca, e a faixa de vagas cai para `#localizacao`. *Testes: Task 4 `sem slides…` e `sem contatos…`.*
5. **Abrir o `index.html` com dois cliques (`file://`):** o modo local renderiza e o login funciona. *Teste: Task 12 `funciona via file://`.*

---

## Contrato de testes (vale para todas as tasks)

Arquivos em `$T`, executados com `node --test`. Cada arquivo de teste:

```js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./helpers.cjs');
let srv, browser;
before(async () => { srv = await h.iniciarServidor(); browser = await h.abrirNavegador(); });
after(async () => { await browser.close(); await srv.fechar(); });
```

API de `helpers.cjs` (criada na Task 1):

| Função | Comportamento |
|---|---|
| `iniciarServidor(raiz = '/home/user/Republica-Repsico') → Promise<{url, fechar}>` | `http` do Node numa porta livre de `127.0.0.1`. `url` termina com `/`. Tipos MIME por extensão. 404 para arquivo ausente. |
| `abrirNavegador() → Promise<Browser>` | `chromium.launch()`. |
| `novaPagina(browser, url, op = {}) → Promise<{page, context, erros}>` | Contexto novo (armazenamento limpo). Opções: `viewport`, `colorScheme`, `reducedMotion`, `relogio` (chama `page.clock.install()` antes do `goto`), `emulador` (vira `window.__REPSICO_EMULADOR__` via `addInitScript`), `bloquearFirebase` (aborta `gstatic`). Concede `clipboard-read/write`. Aborta Google Fonts e Google Maps. Serve `https://www.gstatic.com/firebasejs/12.19.0/*` a partir de `$T/fbpkg/x/package/`. `erros` junta `pageerror` + `console.error`, exceto "Failed to load resource". Faz `goto(url)` e `pronto(page)`. |
| `pronto(page) → Promise<void>` | Espera `window.REPSICO`, depois `await window.REPSICO.pronto` (timeout 8 s). |
| `entrar(page, senha = 'repsico') → Promise<void>` | Clica em `.navbar [data-acao="abrir-login"]`, preenche `#senha-login`, envia e espera `body.is-admin`. |
| `texto(page, sel)` / `textos(page, sel)` | `innerText` aparado de um elemento / de todos. |
| `fixture(nome) → string` / `dataUrl(nome) → string` | Caminho absoluto em `$T/fixtures` / data URL base64 do arquivo. |
| `dimensoes(page, dataUrl) → Promise<{w, h}>` | Decodifica numa `Image` dentro da página. |

Fixtures (geradas por `$T/fixtures/gerar.py` com PIL):
- `grande.png`: 2000×1500.
- `retrato.jpg`: 1200×1600.
- `pequena.png`: 400×300.
- `transparente.png`: 600×600 RGBA, fundo transparente com um círculo vermelho no centro de raio 100, deixando o canto (10,10) transparente.
- `invalido.jpg`: texto puro "nao sou imagem".

Namespace exposto pelo `app.js` para testes e depuração:

```js
window.REPSICO = {
  pronto: Promise<void>,          // resolve após a 1ª renderização com o store definitivo e o estado de login conhecidos
  utils: { … },                   // funções puras (Task 2) + comprimirImagem (Task 9)
  CONTEUDO_INICIAL,               // objeto do conteúdo inicial (Task 2)
  get store() {…}, get estado() {…}
}
```

---

### Task 1: Base da página — logo, HTML, tema, navbar, rodapé e harness de testes

**Files:**
- Create: `logo-repsico.png`, `index.html`, `style.css`, `app.js`
- Test: `$T/helpers.cjs`, `$T/fixtures/gerar.py` (+ fixtures), `$T/base.test.cjs`

**Interfaces:**
- Produces:
  - **DOM:**
    - `header.navbar` com `a.marca` (`img[src="logo-repsico.png"]` + `span` "REPSICO").
    - `ul.nav-links#nav-links` (6 links).
    - `[data-acao="alternar-tema"]`, `.btn-morador[data-acao="abrir-login"]`, `.btn-menu[data-acao="menu"]` (`aria-expanded`).
    - Seções `#home`, `#casa`, `#moradores`, `#eventos`, `#localizacao`, `#faq`, cada uma com um contêiner `.acoes-secao[data-secao]` para os botões de admin.
    - `footer.rodape` com `img[src="logo-repsico.png"]`.
    - Contêineres vazios: `#faixa-vagas`, `#barra-morador[hidden]`, `#modal-login`, `#modal-form`, `#modal-confirmar`, `#modal-texto`, `#lightbox` (todos `hidden`) e `#toasts[aria-live=polite]`.
  - **`app.js`:**
    - Bloco de configuração (`firebaseConfig`, `EMAIL_MORADORES`, `SENHA_LOCAL_HASH`, `FIREBASE_VERSAO = "12.19.0"`).
    - `ICONES` (mapa nome → SVG) e `icone(nome) → string`.
    - Despachante de cliques `document.addEventListener('click', …)` por `data-acao` (mapa `ACOES`).
    - `window.REPSICO` com `pronto`.
    - Nomes de ícones: `pin, casa, game, wifi, chef, talheres, pessoas, pata, chama, tv, cama, chuveiro, escudo, estrela, coracao, musica, cadeado, cadeado-aberto, sol, lua, menu, fechar, seta-esq, seta-dir, seta-cima, seta-baixo, editar, lixeira, mais, copiar, whatsapp, instagram, mapa, engrenagem, download, upload, chave, sair, imagem, check, curso, bola`.
  - **CSS:**
    - Tokens em `:root[data-theme="light"]` / `:root[data-theme="dark"]`.
    - `.admin-only { display: none }` e `body.is-admin .admin-only { display: revert }`.
    - `scroll-margin-top` nas seções.

- [ ] **Step 1: Criar fixtures e harness de testes**

`$T/fixtures/gerar.py` gera as 5 fixtures acima. Extrair os builds CDN do Firebase:

```bash
mkdir -p $T/fbpkg/x && tar -xzf /tmp/claude-0/-home-user-Republica-Repsico/5e136209-52b1-5753-a776-3f1a68fed94a/scratchpad/fbpkg/firebase-12.19.0.tgz -C $T/fbpkg/x
python3 $T/fixtures/gerar.py && ls $T/fixtures
```

Expected: `grande.png gerar.py invalido.jpg pequena.png retrato.jpg transparente.png`.

`$T/helpers.cjs` implementa a tabela do Contrato de testes.

- [ ] **Step 2: Escrever o teste que falha — `$T/base.test.cjs`**

```js
test('carrega sem erros e mostra a logo fixa', async () => {
  const { page, erros } = await h.novaPagina(browser, srv.url);
  assert.deepEqual(erros, []);
  assert.equal(await page.title(), 'República REPSICO · Itajubá-MG');
  assert.equal(await page.getAttribute('link[rel="icon"]', 'href'), 'logo-repsico.png');
  assert.equal(await page.getAttribute('link[rel="apple-touch-icon"]', 'href'), 'logo-repsico.png');
  assert.equal(await page.locator('.navbar .marca img[src="logo-repsico.png"]').count(), 1);
  assert.equal(await page.locator('footer.rodape img[src="logo-repsico.png"]').count(), 1);
  assert.equal(await h.texto(page, '.navbar .marca'), 'REPSICO');
  const resp = await page.request.get(srv.url + 'logo-repsico.png');
  assert.equal(resp.status(), 200);
});

test('links da navbar apontam para as seções', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const links = await page.$$eval('.nav-links a', as => as.map(a => [a.textContent.trim(), a.getAttribute('href')]));
  assert.deepEqual(links, [['Home', '#home'], ['A Casa', '#casa'], ['Moradores', '#moradores'],
    ['Eventos & Rolês', '#eventos'], ['Localização', '#localizacao'], ['FAQ', '#faq']]);
  for (const id of ['home', 'casa', 'moradores', 'eventos', 'localizacao', 'faq'])
    assert.equal(await page.locator('#' + id).count(), 1, id);
});

test('tema segue o sistema, alterna e persiste', async () => {
  const { page } = await h.novaPagina(browser, srv.url, { colorScheme: 'dark' });
  const fundo = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await fundo(), 'rgb(18, 18, 20)');
  await page.click('[data-acao="alternar-tema"]');
  assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
  assert.equal(await fundo(), 'rgb(255, 255, 255)');
  await page.reload(); await h.pronto(page);
  assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
  assert.equal(await page.evaluate(() => localStorage.getItem('repsico:tema')), 'light');
});

test('menu mobile abre, fecha ao clicar num link e não há rolagem horizontal', async () => {
  const { page } = await h.novaPagina(browser, srv.url, { viewport: { width: 390, height: 844 } });
  assert.equal(await page.isVisible('.nav-links'), false);
  await page.click('[data-acao="menu"]');
  assert.equal(await page.isVisible('.nav-links'), true);
  assert.equal(await page.getAttribute('[data-acao="menu"]', 'aria-expanded'), 'true');
  await page.click('.nav-links a[href="#faq"]');
  assert.equal(await page.isVisible('.nav-links'), false);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
});

test('visitante não vê controles do Modo Morador', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.equal(await page.locator('.admin-only:visible').count(), 0);
  assert.equal(await page.isVisible('#barra-morador'), false);
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `node --test $T/base.test.cjs`
Expected: FAIL. O `pronto()` estoura o tempo, porque `index.html` ainda não existe (404).

- [ ] **Step 4: Gerar a logo**

Abrir `/tmp/claude-0/-home-user-Republica-Repsico/5e136209-52b1-5753-a776-3f1a68fed94a/images/1.png` com PIL, redimensionar para 512×512 com LANCZOS, quantizar para 64 cores e salvar `logo-repsico.png` com `optimize=True`.

Run: `python3 -c "from PIL import Image; im=Image.open('logo-repsico.png'); print(im.size)" && stat -c %s logo-repsico.png`
Expected: `(512, 512)` e um tamanho < 80000 bytes.

- [ ] **Step 5: Implementar `index.html`, `style.css` e a base do `app.js`**

- **`index.html`:**
  - `lang="pt-BR"`, `<title>República REPSICO · Itajubá-MG</title>`.
  - Ícones: `<link rel="icon" href="logo-repsico.png">` + `apple-touch-icon`.
  - Google Fonts com `preconnect`.
  - Script inline no `<head>` que aplica `data-theme` a partir de `localStorage['repsico:tema']` ou de `prefers-color-scheme` (com `try/catch` → `light`).
  - `<script src="app.js" defer>`.
  - Estrutura das Interfaces acima.
  - `<noscript>` com aviso.
- **`style.css`:**
  - Mobile-first. Tokens das Global Constraints. `body { background: var(--bg) }`.
  - Navbar fixa. Em < 900 px, `.nav-links` fica oculto até `.navbar.menu-aberto`.
- **`app.js` (seções 1–2, 10):**
  - Configuração e ícones.
  - Ações `alternar-tema` (salva `repsico:tema`) e `menu` (alterna `.menu-aberto` e `aria-expanded`). Clique em `.nav-links a` fecha o menu.
  - `window.REPSICO.pronto` resolvido ao fim de `iniciar()`.

- [ ] **Step 6: Rodar e ver passar**

Run: `node --test $T/base.test.cjs`
Expected: PASS (5 testes).

- [ ] **Step 7: Commit**

```bash
git add index.html style.css app.js logo-repsico.png
git commit -m "Add page shell: logo, theme toggle, navbar and footer"
```

---

### Task 2: Utilitários puros, conteúdo inicial e normalização

**Files:**
- Modify: `app.js` (seções 3 Utilitários e 4 Conteúdo inicial)
- Test: `$T/unit.test.cjs`

**Interfaces:**
- Consumes: `window.REPSICO` (Task 1).
- Produces (em `REPSICO.utils`):
  - Texto e formatação:
    - `escapeHtml(v) → string` (`null`/`undefined` → `''`)
    - `gerarId() → string` (`/^[a-z0-9]{8,}$/`)
    - `formatarMoeda(n) → string` (`Intl` pt-BR BRL)
    - `digitosTelefone(t) → string`
    - `formatarTelefone(t) → string`
    - `iniciais(apelido) → string`
    - `juntarNomes(nomes) → string`
  - Links e mensagens:
    - `waLink(telefone, mensagem) → string|null`
    - `mensagemWhatsApp({nome, apelido}) → string`
    - `normalizarInstagram(v) → string`
    - `linkSeguro(v) → string|null`
    - `mensagemErro(erro) → string`
  - Times:
    - `chaveTime(nome) → string`
    - `coresTime(nome) → [fundo, texto] | null`
  - `sha256Hex(texto) → Promise<string>`
  - Conteúdo:
    - `normalizar(conteudo) → conteudo`
    - `listar(conteudo, colecao) → Array<{id, …item}>`
    - `ordenarMoradores(lista) → lista`
    - `proximaOrdem(mapa) → number`
    - `coletarIdsImagens(conteudo) → string[]` (únicos, ordenados)
    - `gerarTextoDivulgacao(conteudo, urlSite) → string`
  - Constantes: `COLECOES = ['slides','diferenciais','galeria','mascotes','moradores','eventos','contatos','faq']`, `CATEGORIAS = {morador: 'Morador', agregado: 'Agregado', ex: 'Ex-Morador'}`, `ICONE_EMOJI`.
  - `REPSICO.CONTEUDO_INICIAL` no formato do spec §8.3.

- [ ] **Step 1: Escrever o teste que falha — `$T/unit.test.cjs`**

```js
let page;
before(async () => { ({ page } = await h.novaPagina(browser, srv.url)); });
const u = (fn, ...args) => page.evaluate(([fn, args]) => window.REPSICO.utils[fn](...args), [fn, args]);
const NB = ' ';
const MSG = (a) => `Fala ${a}! Vi o site da REPSICO e gostaria de tirar dúvidas / marcar uma visita.`;

test('escapeHtml', async () => {
  assert.equal(await u('escapeHtml', `<b>"x" & 'y'</b>`), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
  assert.equal(await u('escapeHtml', null), '');
});
test('formatarMoeda', async () => {
  assert.equal(await u('formatarMoeda', 900), `R$${NB}900,00`);
  assert.equal(await u('formatarMoeda', 1000), `R$${NB}1.000,00`);
  assert.equal(await u('formatarMoeda', 950.5), `R$${NB}950,50`);
});
test('formatarTelefone e digitosTelefone', async () => {
  assert.equal(await u('formatarTelefone', '35991915374'), '(35) 99191-5374');
  assert.equal(await u('formatarTelefone', '3591915374'), '(35) 9191-5374');
  assert.equal(await u('formatarTelefone', '+55 35 99191-5374'), '(35) 99191-5374');
  assert.equal(await u('formatarTelefone', '123'), '123');
  assert.equal(await u('digitosTelefone', '(19) 99977-8860'), '19999778860');
});
test('waLink e mensagemWhatsApp', async () => {
  assert.equal(await u('mensagemWhatsApp', { nome: 'Thiago', apelido: 'Pantufa' }), MSG('Pantufa'));
  assert.equal(await u('mensagemWhatsApp', { nome: 'Thiago', apelido: '' }), MSG('Thiago'));
  assert.equal(await u('waLink', '(35) 9191-5374', MSG('Pantufa')),
    'https://wa.me/553591915374?text=' + encodeURIComponent(MSG('Pantufa')));
  assert.equal(await u('waLink', '+55 (19) 99977-8860', 'Oi'), 'https://wa.me/5519999778860?text=Oi');
  assert.equal(await u('waLink', '123', 'Oi'), null);
});
test('normalizarInstagram', async () => {
  assert.equal(await u('normalizarInstagram', '@repsicoitajuba'), 'repsicoitajuba');
  assert.equal(await u('normalizarInstagram', 'https://www.instagram.com/repsico.itajuba/?hl=pt-br'), 'repsico.itajuba');
  assert.equal(await u('normalizarInstagram', '  instagram.com/user_1 '), 'user_1');
  assert.equal(await u('normalizarInstagram', ''), '');
});
test('linkSeguro', async () => {
  assert.equal(await u('linkSeguro', '#eventos'), '#eventos');
  assert.equal(await u('linkSeguro', 'https://repsico.com/x'), 'https://repsico.com/x');
  assert.equal(await u('linkSeguro', 'wa.me/5535'), 'https://wa.me/5535');
  assert.equal(await u('linkSeguro', 'JavaScript:alert(1)'), null);
  assert.equal(await u('linkSeguro', 'data:text/html,oi'), null);
  assert.equal(await u('linkSeguro', 'texto solto'), null);
  assert.equal(await u('linkSeguro', ''), '');
});
test('sha256Hex e gerarId', async () => {
  assert.equal(await u('sha256Hex', 'repsico'), '007beb0902f16501d75471e69a92bda5f08302033543a5fb4e28f0bfab4f47fb');
  const [a, b] = [await u('gerarId'), await u('gerarId')];
  assert.match(a, /^[a-z0-9]{8,}$/); assert.notEqual(a, b);
});
test('iniciais, juntarNomes, coresTime', async () => {
  assert.equal(await u('iniciais', 'Dodô'), 'DO');
  assert.equal(await u('iniciais', 'Zé Pequeno'), 'ZP');
  assert.equal(await u('iniciais', ''), '?');
  assert.equal(await u('juntarNomes', ['Zé']), 'Zé');
  assert.equal(await u('juntarNomes', ['Zé', 'Mingau']), 'Zé e Mingau');
  assert.equal(await u('juntarNomes', ['A', 'B', 'C']), 'A, B e C');
  assert.equal(await u('juntarNomes', []), '');
  assert.deepEqual(await u('coresTime', 'Flamengo'), ['#C3281E', '#FFFFFF']);
  assert.deepEqual(await u('coresTime', 'CRUZEIRO'), ['#0033A0', '#FFFFFF']);
  assert.deepEqual(await u('coresTime', 'Atlético-MG'), await u('coresTime', 'Atlético Mineiro'));
  assert.equal(await u('coresTime', 'Itajubá FC'), null);
});
test('mensagemErro', async () => {
  assert.equal(await u('mensagemErro', { codigo: 'senha-incorreta' }), 'Senha incorreta.');
  assert.equal(await u('mensagemErro', { code: 'auth/invalid-credential' }), 'Senha incorreta.');
  assert.equal(await u('mensagemErro', { code: 'auth/too-many-requests' }), 'Muitas tentativas. Aguarde alguns minutos e tente de novo.');
  assert.equal(await u('mensagemErro', { code: 'permission-denied' }), 'Sua sessão expirou — entre de novo.');
  assert.equal(await u('mensagemErro', { codigo: 'offline' }), 'Sem conexão com o Firebase. Tente de novo.');
  assert.equal(await u('mensagemErro', { codigo: 'cota' }), 'Espaço local cheio — conecte o Firebase para salvar mais fotos.');
  assert.equal(await u('mensagemErro', { codigo: 'senha-fraca' }), 'A senha precisa ter no mínimo 6 caracteres.');
  assert.equal(await u('mensagemErro', { codigo: 'formato-imagem' }), 'Formato de imagem não suportado.');
  assert.equal(await u('mensagemErro', new Error('x')), 'Algo deu errado. Tente de novo.');
});
test('conteúdo inicial tem os dados da especificação', async () => {
  const c = await page.evaluate(() => window.REPSICO.CONTEUDO_INICIAL);
  const L = (col) => page.evaluate(([c, col]) => window.REPSICO.utils.listar(c, col), [c, col]);
  assert.equal(c.versao, 1);
  assert.equal(c.config.vagasAbertas, true);
  assert.equal(c.config.valorMensal, 900);
  assert.deepEqual(c.config.funcionaria, { nome: 'Dona Zilda',
    descricao: 'De segunda a sexta: limpa, cozinha, lava e passa roupa.',
    refeicoes: 'Almoço e janta inclusos de segunda a sexta, com cardápio variado.' });
  assert.deepEqual(c.config.endereco, { rua: 'Rua Coronel Francisco Braz, 1256', cidade: 'Itajubá - MG',
    distancias: '2 min da UNIFEI • 8 min do Centro' });
  assert.equal(c.config.instagram, 'repsicoitajuba');
  const t = c.config.textos;
  assert.equal(t.chamada, 'República masculina em Itajubá-MG com mais de 18 anos de história.');
  assert.match(t.sobreTexto, /^República Masculina com mais de 18 anos de tradições, festas, risadas e apoio em Itajubá\./);
  assert.equal(t.vagasAbertasTitulo, 'VAGAS ABERTAS NA REPSICO!');
  assert.equal(t.vagasAbertasTexto, 'Venha fazer parte da nossa família');
  assert.equal(t.casaCompletaTitulo, 'Casa Completa no Momento');
  assert.equal(t.casaCompletaTexto, 'Acompanhe nossos rolês no Instagram @repsicoitajuba');
  assert.equal(t.mascotesTitulo, 'Zé e Mingau');
  assert.equal(t.mascotesSubtitulo, 'Os verdadeiros donos da casa');
  assert.equal(c.config.itensInclusos.length, 5);
  const slides = await L('slides');
  assert.deepEqual(slides.map(s => s.tag), ['VAGAS', 'TRADIÇÃO', 'A CASA']);
  assert.deepEqual(slides.map(s => s.titulo), ['Vagas abertas a 2 min da UNIFEI',
    'Mais de 18 anos de história e festas', 'Infraestrutura completa, lazer e mascotes']);
  assert.deepEqual(slides.map(s => s.destaque), ['2 MIN', '18+ ANOS', 'TUDO INCLUSO']);
  assert.deepEqual(slides.map(s => s.botaoLink), ['#localizacao', '#eventos', '#casa']);
  assert.deepEqual(slides.map(s => s.somenteComVagas), [true, false, false]);
  assert.ok(slides.every(s => s.imagem === null && !/R\$/.test(s.descricao)));
  assert.deepEqual((await L('diferenciais')).map(d => [d.icone, d.titulo]),
    [['pin', 'Localização'], ['casa', 'Estrutura'], ['game', 'Lazer'], ['wifi', 'Internet']]);
  assert.deepEqual((await L('contatos')).map(x => [x.nome, x.apelido, x.telefone]),
    [['Thiago', 'Pantufa', '(35) 9191-5374'], ['Lucas', 'Dodô', '(19) 99977-8860']]);
  assert.deepEqual((await L('moradores')).map(m => [m.apelido, m.nome, m.categoria]),
    [['Dodô', 'Lucas', 'morador'], ['Pantufa', 'Thiago', 'morador']]);
  assert.deepEqual((await L('mascotes')).map(m => m.nome), ['Zé', 'Mingau']);
  assert.equal((await L('eventos')).length, 2);
  assert.equal((await L('faq')).length, 6);
  assert.equal((await L('galeria')).length, 0);
});
test('normalizar', async () => {
  const ini = await page.evaluate(() => window.REPSICO.CONTEUDO_INICIAL);
  assert.deepEqual(await u('normalizar', null), ini);
  const n = await u('normalizar', { config: { valorMensal: 950, funcionaria: { nome: 'Dona Maria' } },
    moradores: { a1: { apelido: 'X', categoria: 'invalida' } }, eventos: { e1: { titulo: 'E' } } });
  assert.equal(n.config.valorMensal, 950);
  assert.equal(n.config.funcionaria.nome, 'Dona Maria');
  assert.equal(n.config.funcionaria.descricao, ini.config.funcionaria.descricao);
  assert.equal(n.config.vagasAbertas, true);
  assert.deepEqual(n.config.endereco, ini.config.endereco);
  assert.deepEqual(Object.keys(n.slides), []);
  assert.equal(n.moradores.a1.categoria, 'morador');
  assert.deepEqual(n.eventos.e1.fotos, []);
  for (const col of ['slides', 'diferenciais', 'galeria', 'mascotes', 'moradores', 'eventos', 'contatos', 'faq'])
    assert.equal(typeof n[col], 'object', col);
});
test('ordenarMoradores, proximaOrdem, listar', async () => {
  const ord = await u('ordenarMoradores', [
    { apelido: 'B', categoria: 'ex', anoEntrada: 2010 }, { apelido: 'C', categoria: 'morador', anoEntrada: 2024 },
    { apelido: 'A', categoria: 'morador', anoEntrada: 2024 }, { apelido: 'Z', categoria: 'agregado', anoEntrada: 2025 },
    { apelido: 'D', categoria: 'morador', anoEntrada: 2022 }, { apelido: 'E', categoria: 'morador' }]);
  assert.deepEqual(ord.map(m => m.apelido), ['D', 'A', 'C', 'E', 'Z', 'B']);
  assert.equal(await u('proximaOrdem', {}), 1);
  assert.equal(await u('proximaOrdem', { a: { ordem: 3 }, b: { ordem: 7 } }), 8);
  assert.deepEqual(await u('listar', { faq: { x: { pergunta: '2', ordem: 2 }, y: { pergunta: '1', ordem: 1 } } }, 'faq'),
    [{ id: 'y', pergunta: '1', ordem: 1 }, { id: 'x', pergunta: '2', ordem: 2 }]);
});
test('coletarIdsImagens', async () => {
  assert.deepEqual(await u('coletarIdsImagens', {
    slides: { s: { imagem: 'i1' } }, galeria: { g: { imagem: 'i2' } }, moradores: { m: { foto: 'i3' } },
    mascotes: { z: { foto: null } }, eventos: { e: { fotos: ['i5', 'i4', 'i1'] } } }), ['i1', 'i2', 'i3', 'i4', 'i5']);
});
test('gerarTextoDivulgacao — vagas abertas', async () => {
  const ini = await page.evaluate(() => window.REPSICO.CONTEUDO_INICIAL);
  const t = await u('gerarTextoDivulgacao', ini, 'https://lucaspivoto.github.io/Republica-Repsico/');
  assert.ok(t.startsWith('🔴⚫ *VAGAS ABERTAS NA REPSICO!* ⚫🔴\nRepública masculina em Itajubá-MG com mais de 18 anos de história.\n'));
  for (const trecho of [
    '📍 Rua Coronel Francisco Braz, 1256 — 2 min da UNIFEI • 8 min do Centro',
    '📍 *Localização:* 2 min da UNIFEI e 8 min do centro.',
    '📶 *Internet:* Fibra óptica 800MB com 2 pontos pela casa.',
    '👩‍🍳 *Dona Zilda:* De segunda a sexta: limpa, cozinha, lava e passa roupa.',
    '🍽️ Almoço e janta inclusos de segunda a sexta, com cardápio variado.',
    '🐾 Mascotes: Zé e Mingau',
    `💰 *R$${NB}900,00/mês — tudo incluso*`,
    '📲 Agende sua visita:',
    '• Thiago (Pantufa): (35) 9191-5374 — wa.me/553591915374',
    '• Lucas (Dodô): (19) 99977-8860 — wa.me/5519999778860',
    '🌐 https://lucaspivoto.github.io/Republica-Repsico/'])
    assert.ok(t.includes(trecho), trecho);
  assert.ok(t.trimEnd().endsWith('📸 Instagram: @repsicoitajuba'));
});
test('gerarTextoDivulgacao — casa completa e sem URL', async () => {
  const c = await page.evaluate(() => { const c = structuredClone(window.REPSICO.CONTEUDO_INICIAL); c.config.vagasAbertas = false; return c; });
  const t = await u('gerarTextoDivulgacao', c, '');
  assert.ok(t.startsWith('*REPSICO — República masculina em Itajubá-MG*\n'));
  assert.ok(!t.includes('VAGAS ABERTAS'));
  assert.ok(t.includes('📲 Contato:'));
  assert.ok(!t.includes('🌐'));
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/unit.test.cjs`
Expected: FAIL com `Cannot read properties of undefined` (`REPSICO.utils` ainda não existe).

- [ ] **Step 3: Implementar a seção 3 (Utilitários) e a seção 4 (Conteúdo inicial) no `app.js`**

Regras que os testes não fixam sozinhos:

- **`formatarTelefone`:** remove o `55` inicial quando há 12 ou 13 dígitos.
- **`waLink`:** precisa de ≥ 10 dígitos e prefixa `55` só se não começar com `55` e tiver ≤ 11 dígitos.
- **`linkSeguro`:**
  - `#…`, `http(s)://…` → mantém.
  - Sem esquema, com ponto e sem espaço/`:` → prefixa `https://`.
  - Vazio → `''`.
  - Resto → `null`.
- **`chaveTime`:** minúsculas, sem acentos (NFD), não alfanumérico → espaço, espaços colapsados.
- **`coresTime`:** usa um mapa com ~20 clubes, com apelidos (`atletico mg`/`atletico mineiro`/`galo` → mesmo valor).
- **`normalizar`:**
  - `null` → `structuredClone(CONTEUDO_INICIAL)`.
  - Coleções ausentes → `{}`.
  - `config` mesclado em profundidade com o inicial (objetos `funcionaria`, `textos`, `endereco`). `itensInclusos` ausente → o inicial.
  - Morador com categoria inválida → `'morador'`. Evento sem `fotos` → `[]`.
  - Campos de imagem ausentes → `null`. `ordem` ausente → índice + 1.
- **`ordenarMoradores`:** categoria (`morador` < `agregado` < `ex`), depois `anoEntrada` (ausente = depois), depois apelido (`localeCompare` pt-BR).
- **`ICONE_EMOJI`:**
  - `pin`📍 `casa`🏠 `game`🎮 `wifi`📶 `chef`👩‍🍳 `talheres`🍽️ `pessoas`👥 `pata`🐾
  - `chama`🔥 `tv`📺 `cama`🛏️ `chuveiro`🚿 `escudo`🛡️ `estrela`⭐ `coracao`❤️ `musica`🎵
- **`gerarTextoDivulgacao`**, linhas na ordem:
  1. Título:
     - Com vagas: `🔴⚫ *VAGAS ABERTAS NA REPSICO!* ⚫🔴`
     - Sem vagas: `*REPSICO — República masculina em Itajubá-MG*`
  2. `textos.chamada`
  3. Linha vazia.
  4. `📍 <rua> — <distancias>`.
  5. Uma linha por diferencial: `<emoji> *<titulo>:* <texto>`.
  6. Linhas da funcionária: `👩‍🍳 *<nome>:* <descricao>` e `🍽️ <refeicoes>`.
  7. `🐾 Mascotes: <juntarNomes>` (só se houver mascotes).
  8. Linha vazia.
  9. `💰 *<moeda>/mês — tudo incluso*`
  10. Linha vazia.
  11. Contatos:
      - Cabeçalho: `📲 Agende sua visita:` (com vagas) ou `📲 Contato:` (sem vagas).
      - Uma linha por contato: `• <nome> (<apelido>): <telefone> — wa.me/<dígitos com 55>`.
  12. Linha vazia.
  13. `🌐 <url>` (só se `url`).
  14. `📸 Instagram: @<instagram>`.
- **Textos do conteúdo inicial:**
  - Os que os testes fixam vão literais.
  - Os genéricos (descrições dos slides, mascotes, 2 rolês, 6 FAQs e os 5 itens inclusos) usam só fatos do spec §9.
  - As FAQs cobrem: agregado, mobília, contas, rotina, o que está incluso e visita/pais. Nenhuma cita valor em R$.

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/unit.test.cjs`
Expected: PASS (15 testes).

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "Add pure helpers, initial content and content normalization"
```

---

### Task 3: Armazenamento local (localStorage + IndexedDB) e login local

**Files:**
- Modify: `app.js` (seção 6 Armazenamento: `criarStoreLocal`; seção 10: `iniciar` usa o store local quando o Firebase não está ativo)
- Test: `$T/store-local.test.cjs`

**Interfaces:**
- Consumes: `normalizar`, `CONTEUDO_INICIAL`, `gerarId`, `sha256Hex`, `coletarIdsImagens`, `SENHA_LOCAL_HASH`.
- Produces: `criarStoreLocal() → store`. **Interface `store`, comum a todos os stores:**

```
modo: 'local' | 'firebase' | 'offline'
iniciar(aoMudar: (conteudo) => void) → Promise<void>     // chama aoMudar já com o conteúdo atual
obter() → conteudo
salvarItem(colecao, id, dados) → Promise<void>          // substitui o item inteiro
excluirItem(colecao, id) → Promise<void>
salvarConfig(parcial) → Promise<void>                    // config[k] = parcial[k] para cada k
reordenar(colecao, pares: [id, ordem][]) → Promise<void>
salvarImagem(dataUrl) → Promise<id>
lerImagem(id) → Promise<dataUrl | null>
excluirImagem(id) → Promise<void>
substituirTudo(conteudo, imagens: {id: dataUrl}, aoProgresso?: (feitos, total) => void) → Promise<void>
auth: {
  entrar(senha) → Promise<void>       // erro com .codigo 'senha-incorreta'
  sair() → Promise<void>
  logado() → boolean
  aoMudar(cb: (logado) => void)
  trocarSenha(nova) → Promise<void>   // .codigo 'senha-fraca' se < 6
}
```

Toda gravação local chama `aoMudar(conteudo)` em seguida. Erro de cota (`QuotaExceededError`) vira erro com `.codigo = 'cota'`. `substituirTudo`:
1. Grava as imagens.
2. Grava o conteúdo normalizado.
3. Apaga as imagens que o conteúdo anterior usava e o novo não usa.
4. Chama `aoProgresso(i, total)` a cada imagem.

- [ ] **Step 1: Escrever o teste que falha — `$T/store-local.test.cjs`**

```js
const S = (page, fn) => page.evaluate(fn);
test('sem dados salvos usa o conteúdo inicial; modo local', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.equal(await S(page, () => REPSICO.store.modo), 'local');
  assert.equal(await S(page, () => REPSICO.store.obter().config.valorMensal), 900);
  assert.equal(await S(page, () => localStorage.getItem('repsico:conteudo')), null);
});
test('gravações persistem após recarregar', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await S(page, async () => {
    const s = REPSICO.store;
    await s.salvarItem('faq', 'novo', { pergunta: 'P?', resposta: 'R.', ordem: 99 });
    await s.salvarConfig({ valorMensal: 950 });
    await s.excluirItem('slides', Object.keys(s.obter().slides)[0]);
    await s.reordenar('faq', [['novo', 0]]);
  });
  await page.reload(); await h.pronto(page);
  const c = await S(page, () => REPSICO.store.obter());
  assert.deepEqual(c.faq.novo, { pergunta: 'P?', resposta: 'R.', ordem: 0 });
  assert.equal(c.config.valorMensal, 950);
  assert.equal(c.config.funcionaria.nome, 'Dona Zilda');
  assert.equal(Object.keys(c.slides).length, 2);
});
test('aoMudar é chamado a cada gravação', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const n = await S(page, async () => {
    let k = 0; const s = REPSICO.store;
    await s.iniciar(() => k++); const inicial = k;
    await s.salvarConfig({ valorMensal: 901 }); await s.salvarItem('faq', 'a', { pergunta: 'a', resposta: 'b', ordem: 1 });
    return [inicial, k];
  });
  assert.deepEqual(n, [1, 3]);
});
test('imagens ficam no IndexedDB, não no localStorage', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const id = await S(page, () => REPSICO.store.salvarImagem('data:image/jpeg;base64,QUFBQUFB'));
  assert.match(id, /^[a-z0-9]+$/);
  assert.ok(!(await S(page, () => JSON.stringify(localStorage))).includes('QUFBQUFB'));
  await page.reload(); await h.pronto(page);
  assert.equal(await page.evaluate((id) => REPSICO.store.lerImagem(id), id), 'data:image/jpeg;base64,QUFBQUFB');
  await page.evaluate((id) => REPSICO.store.excluirImagem(id), id);
  assert.equal(await page.evaluate((id) => REPSICO.store.lerImagem(id), id), null);
});
test('substituirTudo troca conteúdo e imagens e apaga as antigas', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const r = await S(page, async () => {
    const s = REPSICO.store;
    const velha = await s.salvarImagem('data:image/jpeg;base64,VkVMSEE=');
    await s.salvarItem('moradores', 'm1', { apelido: 'Velho', nome: '', curso: '', anoEntrada: null, time: '', categoria: 'ex', instagram: '', foto: velha });
    const progresso = [];
    const novo = { config: { valorMensal: 777 }, moradores: { m2: { apelido: 'Novo', categoria: 'morador', foto: 'img2' } } };
    await s.substituirTudo(novo, { img2: 'data:image/jpeg;base64,Tk9WQQ==' }, (f, t) => progresso.push([f, t]));
    const c = s.obter();
    return { progresso, velha: await s.lerImagem(velha), nova: await s.lerImagem('img2'),
             moradores: Object.keys(c.moradores), valor: c.config.valorMensal, slides: Object.keys(c.slides).length };
  });
  assert.deepEqual(r, { progresso: [[1, 1]], velha: null, nova: 'data:image/jpeg;base64,Tk9WQQ==',
                        moradores: ['m2'], valor: 777, slides: 0 });
});
test('cota cheia vira erro com codigo "cota"', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const codigo = await S(page, async () => {
    Storage.prototype.setItem = () => { throw new DOMException('cheio', 'QuotaExceededError'); };
    return REPSICO.store.salvarConfig({ valorMensal: 1 }).then(() => 'ok', e => e.codigo);
  });
  assert.equal(codigo, 'cota');
});
test('login local: senha errada, certa, persistência, sair e trocar senha', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const A = (fn, arg) => page.evaluate(fn, arg);
  assert.equal(await A(() => REPSICO.store.auth.entrar('errada').then(() => 'ok', e => e.codigo)), 'senha-incorreta');
  assert.equal(await A(() => REPSICO.store.auth.logado()), false);
  await A(() => REPSICO.store.auth.entrar('repsico'));
  assert.equal(await A(() => REPSICO.store.auth.logado()), true);
  await page.reload(); await h.pronto(page);
  assert.equal(await A(() => REPSICO.store.auth.logado()), true);
  assert.equal(await A(() => REPSICO.store.auth.trocarSenha('123').then(() => 'ok', e => e.codigo)), 'senha-fraca');
  await A(() => REPSICO.store.auth.trocarSenha('nova123'));
  await A(() => REPSICO.store.auth.sair());
  assert.equal(await A(() => REPSICO.store.auth.logado()), false);
  assert.equal(await A(() => REPSICO.store.auth.entrar('repsico').then(() => 'ok', e => e.codigo)), 'senha-incorreta');
  await A(() => REPSICO.store.auth.entrar('nova123'));
  assert.equal(await A(() => REPSICO.store.auth.logado()), true);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/store-local.test.cjs`
Expected: FAIL (`REPSICO.store` é `undefined`).

- [ ] **Step 3: Implementar `criarStoreLocal()` e ligar no `iniciar()`**

- IndexedDB: um helper com promessas, versão 1, `onupgradeneeded` cria o store `imagens`.
- `iniciar()`, quando o Firebase não está ativo:
  1. `store = criarStoreLocal()`.
  2. `await store.iniciar(c => { estado.conteudo = c; renderizarTudo(); })`. Por ora, `renderizarTudo` não faz nada.
  3. `store.auth.aoMudar(atualizarModoAdmin)`. Por ora, `atualizarModoAdmin` só guarda `estado.admin`.
  4. Resolve `pronto`.

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/store-local.test.cjs $T/unit.test.cjs $T/base.test.cjs`
Expected: PASS (todos).

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "Add local store with IndexedDB photos and local password login"
```

---

### Task 4: Carrossel estilo Steam e faixa de vagas

**Files:**
- Modify: `app.js` (seção 7: `renderizarTudo`, `renderHero`, `renderVagas`, `hidratarImagens`; seção 8: controlador do carrossel), `style.css`
- Test: `$T/hero.test.cjs`

**Interfaces:**
- Consumes: `store`, `estado`, `listar`, `waLink`, `mensagemWhatsApp`, `linkSeguro`, `escapeHtml`, `icone`.
- Produces:
  - **`renderizarTudo()`** chama, em ordem: `renderHero`, `renderVagas`, `renderCasa`, `renderMoradores`, `renderEventos`, `renderLocalizacao`, `renderFaq`, `renderRodape`. As que ainda não existem viram funções vazias até a sua task.
  - **`hidratarImagens(raiz = document)`:** observa `img[data-img]` com `IntersectionObserver` (`rootMargin: '200px'`). Ao entrar, faz `src = await store.lerImagem(id)` usando o cache `Map` em memória e adiciona a classe `carregada`.
  - **DOM do carrossel:**
    - `#home .hero` → `.hero-slide` (o ativo tem `.ativo` e `aria-hidden="false"`).
    - Dentro de cada slide: `.hero-midia` (com `img[data-img]` ou `.placeholder-marca` com `.destaque`) e `.hero-painel` (`.tag`, `.hero-titulo`, `.hero-descricao`, `a.btn-hero` só se houver `botaoTexto`).
    - Setas `[data-acao="slide-anterior"]` / `[data-acao="slide-proximo"]`. Indicadores `.hero-indicadores button` (o ativo tem `aria-current="true"`).
    - Sem slides visíveis → `.hero-vazio` (logo + "República REPSICO").
    - Admin vê os slides `somenteComVagas` mesmo com a casa completa, com `.marcador-oculto` "oculto: casa completa".
  - **Faixa:** `#faixa-vagas.aberta` com `a.btn-whatsapp` (WhatsApp do 1º contato, ou `#localizacao` se não houver contatos), ou `#faixa-vagas.completa` com `a[href="https://instagram.com/<instagram>"]`.
  - **Carrossel:**
    - Autoplay a cada **6000 ms**. Pausa com `mouseenter`/`focusin`, com `document.hidden` e com `prefers-reduced-motion: reduce`.
    - Swipe por pointer events (limiar 50 px). Setas do teclado com o foco no carrossel.
    - Re-renderizar mantém o índice atual (limitado ao total).

- [ ] **Step 1: Escrever o teste que falha — `$T/hero.test.cjs`**

```js
const MSG_P = 'Fala Pantufa! Vi o site da REPSICO e gostaria de tirar dúvidas / marcar uma visita.';
const ativo = (page) => h.texto(page, '.hero-slide.ativo .hero-titulo');
test('3 slides iniciais, primeiro ativo, com placeholder e botão', async () => {
  const { page, erros } = await h.novaPagina(browser, srv.url);
  assert.equal(await page.locator('.hero-slide').count(), 3);
  assert.deepEqual(await page.$$eval('.hero-slide .tag', e => e.map(x => x.textContent.trim())), ['VAGAS', 'TRADIÇÃO', 'A CASA']);
  assert.equal(await ativo(page), 'Vagas abertas a 2 min da UNIFEI');
  assert.equal(await page.getAttribute('.hero-slide.ativo .btn-hero', 'href'), '#localizacao');
  assert.equal(await h.texto(page, '.hero-slide.ativo .destaque'), '2 MIN');
  assert.equal(await page.locator('.hero-indicadores button').count(), 3);
  assert.deepEqual(erros, []);
});
test('setas e indicadores trocam o slide (com volta)', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.click('[data-acao="slide-proximo"]'); assert.equal(await ativo(page), 'Mais de 18 anos de história e festas');
  await page.click('[data-acao="slide-anterior"]'); await page.click('[data-acao="slide-anterior"]');
  assert.equal(await ativo(page), 'Infraestrutura completa, lazer e mascotes');
  await page.click('.hero-indicadores button >> nth=0'); assert.equal(await ativo(page), 'Vagas abertas a 2 min da UNIFEI');
  assert.equal(await page.getAttribute('.hero-indicadores button >> nth=0', 'aria-current'), 'true');
});
test('autoplay a cada 6 s, pausa com o mouse em cima', async () => {
  const { page } = await h.novaPagina(browser, srv.url, { relogio: true });
  await page.clock.runFor(6100); assert.equal(await ativo(page), 'Mais de 18 anos de história e festas');
  await page.hover('.hero'); await page.clock.runFor(13000);
  assert.equal(await ativo(page), 'Mais de 18 anos de história e festas');
  await page.mouse.move(5, 5); await page.clock.runFor(6100);
  assert.equal(await ativo(page), 'Infraestrutura completa, lazer e mascotes');
});
test('prefers-reduced-motion desliga o autoplay', async () => {
  const { page } = await h.novaPagina(browser, srv.url, { relogio: true, reducedMotion: 'reduce' });
  await page.clock.runFor(13000); assert.equal(await ativo(page), 'Vagas abertas a 2 min da UNIFEI');
});
test('arrastar troca o slide', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const b = await page.locator('.hero-slide.ativo .hero-midia').boundingBox();
  await page.mouse.move(b.x + b.width * 0.8, b.y + b.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2, { steps: 5 }); await page.mouse.up();
  assert.equal(await ativo(page), 'Mais de 18 anos de história e festas');
});
test('faixa de vagas abertas leva ao WhatsApp do primeiro contato', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const faixa = await h.texto(page, '#faixa-vagas.aberta');
  assert.match(faixa, /VAGAS ABERTAS NA REPSICO!/); assert.match(faixa, /Venha fazer parte da nossa família/);
  assert.equal(await page.getAttribute('#faixa-vagas a.btn-whatsapp', 'href'),
    'https://wa.me/553591915374?text=' + encodeURIComponent(MSG_P));
});
test('casa completa: faixa muda e slide "só com vagas" some', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate(() => REPSICO.store.salvarConfig({ vagasAbertas: false }));
  const faixa = await h.texto(page, '#faixa-vagas.completa');
  assert.match(faixa, /Casa Completa no Momento/); assert.match(faixa, /Acompanhe nossos rolês no Instagram @repsicoitajuba/);
  assert.equal(await page.locator('#faixa-vagas a[href="https://instagram.com/repsicoitajuba"]').count(), 1);
  assert.equal(await page.locator('.hero-slide').count(), 2);
});
test('slide com foto carrega a imagem; sem botaoTexto não há botão', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate(async (d) => {
    const id = await REPSICO.store.salvarImagem(d);
    await REPSICO.store.salvarItem('slides', 's9', { tag: 'NOVO', titulo: 'Com foto', descricao: '', destaque: '',
      botaoTexto: '', botaoLink: '', imagem: id, somenteComVagas: false, ordem: 10 });
  }, h.dataUrl('pequena.png'));
  await page.click('.hero-indicadores button >> nth=3');
  await page.waitForFunction(() => document.querySelector('.hero-slide.ativo img')?.src.startsWith('data:image/'));
  assert.equal(await page.locator('.hero-slide.ativo .btn-hero').count(), 0);
});
test('sem slides aparece o banner da marca; sem contatos a faixa leva a #localizacao', async () => {
  const { page, erros } = await h.novaPagina(browser, srv.url);
  await page.evaluate(async () => {
    const s = REPSICO.store, c = s.obter();
    for (const id of Object.keys(c.slides)) await s.excluirItem('slides', id);
    for (const id of Object.keys(c.contatos)) await s.excluirItem('contatos', id);
  });
  assert.equal(await page.locator('.hero-slide').count(), 0);
  assert.equal(await page.isVisible('.hero-vazio'), true);
  assert.equal(await page.getAttribute('#faixa-vagas a.btn-whatsapp', 'href'), '#localizacao');
  assert.deepEqual(erros, []);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/hero.test.cjs`
Expected: FAIL (`.hero-slide` count 0 ≠ 3).

- [ ] **Step 3: Implementar `renderizarTudo`, `renderHero`, `renderVagas`, `hidratarImagens`, o controlador do carrossel e o CSS**

- **Placeholder da marca** (`.placeholder-marca`): degradê vermelho com anéis concêntricos (`repeating-radial-gradient`) e `.destaque` gigante. Sem `destaque`, mostra a logo.
- **Layout:**
  - ≥ 900 px: duas colunas (mídia ~62%, painel ~38%), com as setas fora da cápsula.
  - < 900 px: mídia 16:10 em cima e painel embaixo.

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/hero.test.cjs`
Expected: PASS (9 testes).

- [ ] **Step 5: Commit**

```bash
git add app.js style.css
git commit -m "Add Steam-style hero carousel and vacancy banner"
```

---

### Task 5: Seção A Casa — história, diferenciais, card Equipe, financeiro, galeria com lightbox, mascotes

**Files:**
- Modify: `app.js` (`renderCasa`, `renderGaleria`, `renderMascotes`, componente lightbox), `index.html` (subcontêineres de `#casa`), `style.css`
- Test: `$T/casa.test.cjs`

**Interfaces:**
- Consumes: `listar`, `formatarMoeda`, `icone`, `hidratarImagens`, `store.lerImagem`.
- Produces:
  - **DOM:**
    - `#casa .sobre` (com `h2` = `sobreTitulo` e `p` = `sobreTexto`).
    - `#lista-diferenciais` com `.card-diferencial` (`svg` + `h3` + `p`) e, por último, `.card-equipe` ("Comodidade & Equipe", nome, descrição, refeições).
    - `#card-financeiro` (`.valor`, `li` por item incluso, texto "tudo incluso").
    - `#galeria` (`hidden` para visitante quando vazia), com `.galeria-item` → `img[data-img]` + `figcaption`.
    - `#mascotes` (`h3` = `mascotesTitulo`, `.mascotes-subtitulo`, `.mascote` → `.mascote-nome`, `.mascote-descricao`, `img[data-img]` ou `.placeholder-pata`).
  - **`abrirLightbox(itens: {img: id, legenda?: string}[], indice: number)`** e `fecharLightbox()`:
    - DOM `#lightbox` com `.lightbox-img`, `.lightbox-contador` ("n / total"), `.lightbox-legenda` e `[data-acao="lightbox-anterior|lightbox-proximo|lightbox-fechar"]`.
    - Responde a Esc, ←/→ e swipe. Adiciona `html.sem-rolagem` enquanto aberto e devolve o foco a quem abriu.

- [ ] **Step 1: Escrever o teste que falha — `$T/casa.test.cjs`**

```js
const NB = ' ';
test('história, diferenciais e card Equipe por último', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.match(await h.texto(page, '#casa .sobre'), /República Masculina com mais de 18 anos de tradições, festas, risadas e apoio em Itajubá/);
  assert.deepEqual(await h.textos(page, '#lista-diferenciais .card-diferencial h3'), ['Localização', 'Estrutura', 'Lazer', 'Internet']);
  assert.equal(await page.locator('#lista-diferenciais .card-diferencial svg').count(), 4);
  const equipe = await h.texto(page, '#lista-diferenciais .card-equipe');
  for (const r of [/Comodidade & Equipe/, /Dona Zilda/, /limpa, cozinha, lava e passa roupa/, /Almoço e janta inclusos/]) assert.match(equipe, r);
  assert.ok(await page.$eval('#lista-diferenciais > :last-child', e => e.classList.contains('card-equipe')));
});
test('card de transparência financeira', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.equal(await page.$eval('#card-financeiro .valor', e => e.textContent.trim()), `R$${NB}900,00`);
  assert.match(await h.texto(page, '#card-financeiro'), /tudo incluso/i);
  assert.equal(await page.locator('#card-financeiro li').count(), 5);
});
test('galeria vazia fica escondida para visitante', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.equal(await page.isVisible('#galeria'), false);
});
test('galeria com fotos, lazy loading e lightbox', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate(async (dados) => {
    for (const [i, d] of dados.entries()) {
      const id = await REPSICO.store.salvarImagem(d);
      await REPSICO.store.salvarItem('galeria', 'g' + i, { imagem: id, legenda: 'Foto ' + (i + 1), ordem: i + 1 });
    }
  }, [h.dataUrl('pequena.png'), h.dataUrl('grande.png'), h.dataUrl('retrato.jpg')]);
  assert.equal(await page.isVisible('#galeria'), true);
  assert.equal(await page.locator('.galeria-item').count(), 3);
  assert.equal(await page.$eval('.galeria-item img', i => i.getAttribute('src')), null); // ainda fora da tela
  await page.locator('#galeria').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.galeria-item img').src.startsWith('data:image/'));
  await page.click('.galeria-item >> nth=1');
  assert.equal(await page.isVisible('#lightbox'), true);
  assert.equal(await h.texto(page, '.lightbox-contador'), '2 / 3');
  assert.equal(await h.texto(page, '.lightbox-legenda'), 'Foto 2');
  await page.keyboard.press('ArrowRight'); assert.equal(await h.texto(page, '.lightbox-contador'), '3 / 3');
  await page.keyboard.press('ArrowRight'); assert.equal(await h.texto(page, '.lightbox-contador'), '1 / 3');
  await page.click('[data-acao="lightbox-anterior"]'); assert.equal(await h.texto(page, '.lightbox-contador'), '3 / 3');
  assert.ok(await page.evaluate(() => document.documentElement.classList.contains('sem-rolagem')));
  await page.keyboard.press('Escape');
  assert.equal(await page.isVisible('#lightbox'), false);
  assert.ok(!(await page.evaluate(() => document.documentElement.classList.contains('sem-rolagem'))));
});
test('mascotes', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const m = await h.texto(page, '#mascotes');
  assert.match(m, /Zé e Mingau/); assert.match(m, /Os verdadeiros donos da casa/);
  assert.deepEqual(await h.textos(page, '.mascote .mascote-nome'), ['Zé', 'Mingau']);
  assert.equal(await page.locator('.mascote .placeholder-pata').count(), 2);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/casa.test.cjs`
Expected: FAIL (`#lista-diferenciais .card-diferencial` vazio).

- [ ] **Step 3: Implementar a seção A Casa, o lightbox e o CSS**

Grid de diferenciais: 1 coluna (celular), 2 (≥ 640 px), 3 (≥ 1024 px). O card Equipe recebe destaque visual (borda vermelha).

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/casa.test.cjs`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add app.js index.html style.css
git commit -m "Add house section: story, features, pricing, gallery lightbox and mascots"
```

---

### Task 6: Moradores (filtros) e Eventos & Rolês (carrossel interno)

**Files:**
- Modify: `app.js` (`renderMoradores`, `renderEventos`), `index.html`, `style.css`
- Test: `$T/moradores-eventos.test.cjs`

**Interfaces:**
- Consumes: `listar`, `ordenarMoradores`, `iniciais`, `coresTime`, `CATEGORIAS`, `abrirLightbox`, `hidratarImagens`.
- Produces:
  - **Filtros dos moradores:** `estado.filtroMoradores` ∈ `todos|morador|agregado|ex`.
    - DOM `#moradores .filtros button[data-filtro]`, com rótulos `Todos (n)`, `Moradores Atuais (n)`, `Agregados (n)`, `Ex-Moradores (n)` e `aria-pressed`.
  - **Card do morador** (`#lista-moradores .card-morador`):
    - `.morador-foto` (`img[data-img]` ou `.placeholder-iniciais`), `.morador-apelido`, `.morador-nome`.
    - `.morador-curso` ("<curso> · desde <ano>", ou só um dos dois).
    - `.badge-time`: estilo inline `background`/`color` de `coresTime`; sem cores, ganha a classe `neutro`.
    - `.badge-categoria`.
    - `a.btn-instagram` (`https://instagram.com/<user>`, `target=_blank`, `rel="noopener"`, texto `@user`).
    - Campos vazios não aparecem.
  - **Filtro vazio:** `#lista-moradores .vazio` com `Nenhum morador atual cadastrado ainda.` / `Nenhum agregado cadastrado ainda.` / `Nenhum ex-morador cadastrado ainda.`
  - **Rolês** (`#lista-eventos .card-evento`):
    - `.evento-fotos` (trilho com `scroll-snap`, `img[data-img]`), `.evento-pontos button`, `[data-acao="evento-anterior|evento-proximo"]`.
    - `.evento-titulo`, `.evento-descricao`.
    - Sem fotos: `.placeholder-marca`.
    - Clicar numa foto chama `abrirLightbox(fotosDoEvento, i)`.

- [ ] **Step 1: Escrever o teste que falha — `$T/moradores-eventos.test.cjs`**

```js
const BIXO = { apelido: 'Bixo', nome: 'João da Silva', curso: 'Engenharia Mecânica', anoEntrada: 2025,
  time: 'Flamengo', categoria: 'agregado', instagram: 'joaosilva', foto: null };
test('cards iniciais: Dodô e Pantufa sem campos vazios', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.deepEqual(await h.textos(page, '.card-morador .morador-apelido'), ['Dodô', 'Pantufa']);
  assert.equal(await page.locator('.card-morador .badge-time').count(), 0);
  assert.equal(await page.locator('.card-morador .btn-instagram').count(), 0);
  assert.deepEqual(await h.textos(page, '.card-morador .placeholder-iniciais'), ['DO', 'PA']);
});
test('card completo: curso, ano, time com cores, categoria e Instagram', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate((m) => REPSICO.store.salvarItem('moradores', 'm1', m), BIXO);
  const card = page.locator('.card-morador', { hasText: 'Bixo' });
  assert.equal(await card.locator('.morador-nome').innerText(), 'João da Silva');
  assert.equal(await card.locator('.morador-curso').innerText(), 'Engenharia Mecânica · desde 2025');
  assert.equal(await card.locator('.badge-time').innerText(), 'Flamengo');
  assert.equal(await card.locator('.badge-time').evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(195, 40, 30)');
  assert.equal(await card.locator('.badge-categoria').innerText(), 'Agregado');
  assert.equal(await card.locator('a.btn-instagram').getAttribute('href'), 'https://instagram.com/joaosilva');
  assert.equal(await card.locator('a.btn-instagram').getAttribute('target'), '_blank');
  assert.equal(await card.locator('a.btn-instagram').innerText(), '@joaosilva');
  await page.evaluate((m) => REPSICO.store.salvarItem('moradores', 'm1', { ...m, time: 'Itajubá FC' }), BIXO);
  assert.ok(await page.locator('.card-morador', { hasText: 'Bixo' }).locator('.badge-time.neutro').count() === 1);
});
test('filtros com contagem e mensagem de vazio', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate((m) => REPSICO.store.salvarItem('moradores', 'm1', m), BIXO);
  assert.deepEqual(await h.textos(page, '#moradores .filtros button'),
    ['Todos (3)', 'Moradores Atuais (2)', 'Agregados (1)', 'Ex-Moradores (0)']);
  assert.deepEqual(await h.textos(page, '.card-morador .morador-apelido'), ['Dodô', 'Pantufa', 'Bixo']);
  await page.click('[data-filtro="agregado"]');
  assert.deepEqual(await h.textos(page, '.card-morador .morador-apelido'), ['Bixo']);
  assert.equal(await page.getAttribute('[data-filtro="agregado"]', 'aria-pressed'), 'true');
  await page.click('[data-filtro="ex"]');
  assert.equal(await h.texto(page, '#lista-moradores .vazio'), 'Nenhum ex-morador cadastrado ainda.');
  await page.click('[data-filtro="todos"]');
  assert.equal(await page.locator('.card-morador').count(), 3);
});
test('rolês iniciais com placeholder', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.equal(await page.locator('.card-evento').count(), 2);
  assert.equal(await page.locator('.card-evento .placeholder-marca').count(), 2);
  for (const t of await h.textos(page, '.card-evento .evento-titulo')) assert.ok(t.length > 3);
});
test('rolê com fotos: carrossel interno e lightbox', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate(async (ds) => {
    const ids = []; for (const d of ds) ids.push(await REPSICO.store.salvarImagem(d));
    await REPSICO.store.salvarItem('eventos', 'e1', { titulo: 'Festa Teste', descricao: 'Desc', fotos: ids, ordem: 99 });
  }, [h.dataUrl('pequena.png'), h.dataUrl('grande.png'), h.dataUrl('retrato.jpg')]);
  const card = page.locator('.card-evento', { hasText: 'Festa Teste' });
  await card.scrollIntoViewIfNeeded();
  assert.equal(await card.locator('.evento-fotos img').count(), 3);
  assert.equal(await card.locator('.evento-pontos button').count(), 3);
  await card.locator('[data-acao="evento-proximo"]').click();
  await page.waitForFunction(() => [...document.querySelectorAll('.card-evento')].find(c => c.textContent.includes('Festa Teste')).querySelector('.evento-fotos').scrollLeft > 0);
  await card.locator('.evento-fotos img >> nth=0').click({ force: true });
  assert.equal(await h.texto(page, '.lightbox-contador'), '1 / 3');
  await page.keyboard.press('ArrowRight'); assert.equal(await h.texto(page, '.lightbox-contador'), '2 / 3');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/moradores-eventos.test.cjs`
Expected: FAIL (nenhum `.card-morador`).

- [ ] **Step 3: Implementar `renderMoradores`, `renderEventos` e o CSS**

- Grade de moradores: 2 colunas no celular, 3 (≥ 640 px), 4 (≥ 1024 px).
- Grade de rolês: 1 coluna, 2 (≥ 768 px).

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/moradores-eventos.test.cjs`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add app.js index.html style.css
git commit -m "Add residents with filters and events with photo carousels"
```

---

### Task 7: Localização, contatos, FAQ e rodapé

**Files:**
- Modify: `app.js` (`renderLocalizacao`, `renderFaq`, `renderRodape`, `toast`, ação `copiar-endereco`, `copiarTexto`), `index.html`, `style.css`
- Test: `$T/localizacao-faq.test.cjs`

**Interfaces:**
- Consumes: `waLink`, `mensagemWhatsApp`, `listar`.
- Produces:
  - **`toast(mensagem, tipo = 'ok' | 'erro')`:** `.toast` dentro de `#toasts`, some após 3,5 s.
  - **`copiarTexto(texto) → Promise<boolean>`:** `navigator.clipboard.writeText` → fallback `textarea` + `execCommand('copy')`.
  - **DOM da localização:**
    - `#localizacao .endereco` ("<rua>, <cidade>"), `.selo-distancias`, `[data-acao="copiar-endereco"]`.
    - `a.link-maps` e `iframe.mapa[loading=lazy]`.
    - `#lista-contatos .card-contato` com `.contato-apelido`, `.contato-nome`, `.contato-telefone` e `a.btn-whatsapp[target=_blank]`.
  - **FAQ:** `#lista-faq details.faq-item > summary` + `.faq-resposta`.
  - **Rodapé:**
    - `a.rodape-instagram`, `.rodape-endereco`.
    - `[data-acao="abrir-login"]` "Área do Morador" (classe `admin-oculto`, escondido quando logado).
    - `.copyright` = `© <ano> República REPSICO · Itajubá-MG`.
  - **Destaque na navbar:** o link da seção que cruza a faixa central da tela recebe `aria-current="true"` e a classe `ativo`, via `IntersectionObserver` com `rootMargin: '-45% 0px -50% 0px'`.

- [ ] **Step 1: Escrever o teste que falha — `$T/localizacao-faq.test.cjs`**

```js
const END = 'Rua Coronel Francisco Braz, 1256, Itajubá - MG';
const MSG = (a) => `Fala ${a}! Vi o site da REPSICO e gostaria de tirar dúvidas / marcar uma visita.`;
test('endereço, selo, mapa e copiar endereço', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const q = encodeURIComponent(END);
  assert.equal(await h.texto(page, '#localizacao .endereco'), END);
  assert.equal(await h.texto(page, '#localizacao .selo-distancias'), '2 min da UNIFEI • 8 min do Centro');
  assert.equal(await page.getAttribute('#localizacao iframe.mapa', 'src'), `https://www.google.com/maps?q=${q}&output=embed`);
  assert.equal(await page.getAttribute('#localizacao iframe.mapa', 'loading'), 'lazy');
  assert.equal(await page.getAttribute('#localizacao a.link-maps', 'href'), `https://www.google.com/maps/search/?api=1&query=${q}`);
  await page.click('[data-acao="copiar-endereco"]');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), END);
  assert.equal(await h.texto(page, '#toasts .toast'), 'Endereço copiado!');
});
test('contatos com WhatsApp e mensagem automática', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.deepEqual(await h.textos(page, '.card-contato .contato-apelido'), ['Pantufa', 'Dodô']);
  assert.deepEqual(await h.textos(page, '.card-contato .contato-telefone'), ['(35) 9191-5374', '(19) 99977-8860']);
  assert.deepEqual(await page.$$eval('.card-contato a.btn-whatsapp', as => as.map(a => a.href)), [
    'https://wa.me/553591915374?text=' + encodeURIComponent(MSG('Pantufa')),
    'https://wa.me/5519999778860?text=' + encodeURIComponent(MSG('Dodô'))]);
  assert.equal(await page.getAttribute('.card-contato a.btn-whatsapp >> nth=0', 'target'), '_blank');
});
test('FAQ em acordeão cobrindo os temas pedidos', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.equal(await page.locator('#lista-faq details.faq-item').count(), 6);
  assert.equal(await page.locator('#lista-faq details[open]').count(), 0);
  const perguntas = await h.textos(page, '#lista-faq summary');
  for (const r of [/agregad/i, /mob[ií]li/i, /contas/i, /rotina/i, /inclu/i, /visita/i])
    assert.ok(perguntas.some(p => r.test(p)), String(r));
  await page.click('#lista-faq summary >> nth=0');
  assert.equal(await page.locator('#lista-faq details[open]').count(), 1);
  assert.equal(await page.isVisible('#lista-faq details[open] .faq-resposta'), true);
});
test('rodapé com Instagram, endereço, Área do Morador e ano', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  assert.equal(await page.getAttribute('footer a.rodape-instagram', 'href'), 'https://instagram.com/repsicoitajuba');
  assert.equal(await h.texto(page, 'footer a.rodape-instagram'), '@repsicoitajuba');
  assert.match(await h.texto(page, 'footer .rodape-endereco'), /Rua Coronel Francisco Braz, 1256/);
  assert.equal(await page.locator('footer [data-acao="abrir-login"]').count(), 1);
  assert.equal(await h.texto(page, 'footer .copyright'), `© ${new Date().getFullYear()} República REPSICO · Itajubá-MG`);
});
test('link da seção visível fica destacado na navbar', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate(() => document.getElementById('moradores').scrollIntoView());
  await page.waitForFunction(() => document.querySelector('.nav-links a[href="#moradores"]').getAttribute('aria-current') === 'true');
  assert.equal(await page.locator('.nav-links a[aria-current="true"]').count(), 1);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/localizacao-faq.test.cjs`
Expected: FAIL (`#localizacao .endereco` não encontrado).

- [ ] **Step 3: Implementar a localização, o FAQ, o rodapé, `toast` e `copiarTexto`**

- O endereço e o mapa vêm de `config.endereco`.
- Layout da localização: 2 colunas a partir de 900 px (card + contatos | mapa).
- O `<details>` anima a abertura com CSS, respeitando `prefers-reduced-motion`.

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/localizacao-faq.test.cjs`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add app.js index.html style.css
git commit -m "Add location with map and WhatsApp contacts, FAQ accordion and footer"
```

---

### Task 8: Login, Barra do Morador, toggle de vagas, Configurações e trocar senha

**Files:**
- Modify: `app.js` (seção 8: modal genérico + `abrirFormulario` com campos de texto; seção 9: login, barra, configurações, senha), `index.html`, `style.css`
- Test: `$T/morador.test.cjs`

**Interfaces:**
- Consumes: `store.auth`, `store.salvarConfig`, `mensagemErro`, `toast`.
- Produces:
  - **Modais:** `abrirModal(el)` / `fecharModal(el)` com foco preso, Esc, `html.sem-rolagem` e devolução do foco.
  - **`abrirFormulario({ titulo, campos, valores = {}, textoSalvar = 'Salvar', aoSalvar })`**, renderizado em `#modal-form`:
    - `Campo = { nome, rotulo, tipo, opcoes?, obrigatorio?, ajuda?, max? }`.
    - `tipo` ∈ `texto|textarea|numero|telefone|senha|select|icone|checkbox|grupo` (`imagem|imagens` chegam na Task 9).
    - `nome` aceita caminho com ponto (`funcionaria.nome`). O `name` do input é o próprio caminho.
    - `grupo` renderiza `<h3 id="grupo-<nome>">`.
    - Campo obrigatório vazio → `.erro-campo` "Obrigatório" e o modal continua aberto.
    - Ao enviar, chama `await aoSalvar(valores)`: números com `Number`, checkbox com boolean, caminhos com ponto viram objetos aninhados.
    - Sucesso → fecha o modal e mostra o toast `Salvo!`. Erro → `toast(mensagemErro(e), 'erro')` e o modal continua aberto.
  - **`atualizarModoAdmin(logado)`:**
    - Alterna `body.is-admin`, o `hidden` de `#barra-morador` e o botão da navbar (`Área do Morador`/`abrir-login` ↔ `Sair`/`sair`, com cadeado ↔ cadeado aberto).
    - Chama `renderizarTudo()`.
  - **`#modal-login`:** `#senha-login`, `[data-acao="mostrar-senha"]`, `button[type=submit]`, `.erro`, `.aviso-modo-local` (só no modo local).
  - **`#barra-morador`:**
    - `.indicador-modo` (`Local (só neste navegador)` | `Firebase`).
    - `input#toggle-vagas[type=checkbox]` + `label[for=toggle-vagas]`.
    - Botões `[data-acao="abrir-config|copiar-divulgacao|exportar-backup|importar-backup|trocar-senha|sair"]` e `input#arquivo-backup[type=file][accept=".json,application/json"][hidden]`.
  - **`abrirConfiguracoes(grupo?)`:**
    - Grupos `valores`, `funcionaria`, `textos`, `endereco`.
    - Campos: `valorMensal`, `itensInclusos` (textarea, um por linha), `funcionaria.nome|descricao|refeicoes`, `textos.chamada|sobreTitulo|sobreTexto|vagasAbertasTitulo|vagasAbertasTexto|casaCompletaTitulo|casaCompletaTexto|mascotesTitulo|mascotesSubtitulo`, `endereco.rua|cidade|distancias`, `instagram` (normalizado).
    - Com `grupo`, foca o primeiro campo do grupo.
  - **Botões contextuais `[data-acao="editar-config"][data-grupo]`** (só para admin): card financeiro (`valores`), card Equipe (`funcionaria`), `.sobre`, faixa de vagas e cabeçalho dos mascotes (`textos`), card de localização (`endereco`).
  - **`abrirTrocarSenha()`:**
    - Campos `nova` e `confirmacao` (tipo senha).
    - Diferentes → erro `As senhas não conferem.`. Com < 6 caracteres → `A senha precisa ter no mínimo 6 caracteres.`.
    - Sucesso → toast `Senha alterada!`.

- [ ] **Step 1: Escrever o teste que falha — `$T/morador.test.cjs`**

```js
const NB = ' ';
test('login: senha errada mostra erro; certa ativa o Modo Morador', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.click('.navbar [data-acao="abrir-login"]');
  assert.equal(await page.isVisible('#modal-login'), true);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'senha-login');
  assert.equal(await page.isVisible('#modal-login .aviso-modo-local'), true);
  await page.fill('#senha-login', 'errada'); await page.click('#modal-login button[type=submit]');
  await page.waitForFunction(() => document.querySelector('#modal-login .erro').textContent.includes('Senha incorreta.'));
  await page.fill('#senha-login', 'repsico'); await page.click('#modal-login button[type=submit]');
  await page.waitForSelector('body.is-admin');
  assert.equal(await page.isVisible('#modal-login'), false);
  assert.equal(await page.isVisible('#barra-morador'), true);
  assert.equal(await h.texto(page, '#barra-morador .indicador-modo'), 'Local (só neste navegador)');
  assert.equal(await h.texto(page, '.navbar .btn-morador'), 'Sair');
  assert.equal(await page.isVisible('footer [data-acao="abrir-login"]'), false);
});
test('modal: Tab fica preso, Esc fecha e devolve o foco', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.click('.navbar [data-acao="abrir-login"]');
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => document.getElementById('modal-login').contains(document.activeElement)));
  await page.keyboard.press('Escape');
  assert.equal(await page.isVisible('#modal-login'), false);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.acao), 'abrir-login');
});
test('rodapé abre o login; sessão persiste; Sair encerra', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.click('footer [data-acao="abrir-login"]');
  assert.equal(await page.isVisible('#modal-login'), true);
  await page.keyboard.press('Escape');
  await h.entrar(page);
  await page.reload(); await h.pronto(page);
  assert.ok(await page.$('body.is-admin'));
  await page.click('#barra-morador [data-acao="sair"]');
  assert.equal(await page.$('body.is-admin'), null);
  assert.equal(await page.isVisible('#barra-morador'), false);
  assert.equal(await page.locator('.admin-only:visible, [data-acao="editar-config"]:visible').count(), 0);
});
test('toggle de vagas: casa completa e persistência', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  assert.equal(await page.isChecked('#toggle-vagas'), true);
  await page.click('label[for="toggle-vagas"]');
  await page.waitForSelector('#faixa-vagas.completa');
  assert.equal(await page.locator('.hero-slide').count(), 3);
  assert.equal(await h.texto(page, '.hero-slide >> nth=0 >> .marcador-oculto'), 'oculto: casa completa');
  await page.reload(); await h.pronto(page);
  assert.equal(await page.isChecked('#toggle-vagas'), false);
  assert.ok(await page.$('#faixa-vagas.completa'));
});
test('Configurações gerais refletem na página', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('#barra-morador [data-acao="abrir-config"]');
  await page.fill('#modal-form [name="valorMensal"]', '950');
  await page.fill('#modal-form [name="itensInclusos"]', 'Aluguel\nInternet');
  await page.fill('#modal-form [name="funcionaria.nome"]', 'Dona Maria');
  await page.fill('#modal-form [name="instagram"]', '@nova.conta');
  await page.click('#modal-form button[type=submit]');
  assert.equal(await h.texto(page, '#toasts .toast'), 'Salvo!');
  assert.equal(await page.$eval('#card-financeiro .valor', e => e.textContent.trim()), `R$${NB}950,00`);
  assert.equal(await page.locator('#card-financeiro li').count(), 2);
  assert.match(await h.texto(page, '.card-equipe'), /Dona Maria/);
  assert.equal(await page.evaluate(() => REPSICO.store.obter().config.instagram), 'nova.conta');
});
test('editar do card Equipe abre as Configurações na funcionária', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('.card-equipe [data-acao="editar-config"]');
  assert.equal(await page.evaluate(() => document.activeElement.name), 'funcionaria.nome');
});
test('trocar senha no modo local', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="trocar-senha"]');
  await page.fill('#modal-form [name="nova"]', 'abc12345'); await page.fill('#modal-form [name="confirmacao"]', 'outra123');
  await page.click('#modal-form button[type=submit]');
  assert.match(await h.texto(page, '#modal-form'), /As senhas não conferem\./);
  await page.fill('#modal-form [name="nova"]', 'abc'); await page.fill('#modal-form [name="confirmacao"]', 'abc');
  await page.click('#modal-form button[type=submit]');
  assert.match(await h.texto(page, '#modal-form'), /A senha precisa ter no mínimo 6 caracteres\./);
  await page.fill('#modal-form [name="nova"]', 'abc12345'); await page.fill('#modal-form [name="confirmacao"]', 'abc12345');
  await page.click('#modal-form button[type=submit]');
  assert.equal(await h.texto(page, '#toasts .toast >> nth=-1'), 'Senha alterada!');
  await page.click('#barra-morador [data-acao="sair"]');
  await page.click('.navbar [data-acao="abrir-login"]');
  await page.fill('#senha-login', 'repsico'); await page.click('#modal-login button[type=submit]');
  await page.waitForFunction(() => document.querySelector('#modal-login .erro').textContent.includes('Senha incorreta.'));
  await page.fill('#senha-login', 'abc12345'); await page.click('#modal-login button[type=submit]');
  await page.waitForSelector('body.is-admin');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/morador.test.cjs`
Expected: FAIL (`#modal-login` não fica visível ao clicar).

- [ ] **Step 3: Implementar modais, `abrirFormulario`, login, barra, configurações e trocar senha**

A barra fica fixa no rodapé da tela, escura nos dois temas (`#1C1C21`). No celular rola na horizontal. Com admin logado, o `body` ganha `padding-bottom` igual à altura da barra.

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/morador.test.cjs $T/base.test.cjs`
Expected: PASS (todos).

- [ ] **Step 5: Commit**

```bash
git add app.js index.html style.css
git commit -m "Add resident login, admin bar, vacancy toggle, settings and password change"
```

---

### Task 9: CRUD de todas as coleções — formulários, fotos comprimidas, confirmação e reordenação

**Files:**
- Modify: `app.js` (`comprimirImagem`, campos `imagem`/`imagens` no `abrirFormulario`, `FORMULARIOS`, `confirmar`, ações `novo|editar|excluir|mover`, upload em massa da galeria, controles por item nas renderizações), `style.css`
- Test: `$T/crud.test.cjs`

**Interfaces:**
- Consumes: `abrirFormulario`, `store.*`, `proximaOrdem`, `linkSeguro`, `normalizarInstagram`, `formatarTelefone`, `toast`, `mensagemErro`.
- Produces:
  - **`REPSICO.utils.comprimirImagem(arquivo: Blob, { max = 800, qualidade = 0.75 } = {}) → Promise<dataUrl>`.** Rejeita com `.codigo = 'formato-imagem'` se não decodificar.
  - **`confirmar(mensagem, { textoSim = 'Excluir' } = {}) → Promise<boolean>`:** `#modal-confirmar` com `.mensagem`, `[data-acao="confirmar-sim"]` e `[data-acao="confirmar-nao"]`.
  - **Campo `imagem`:**
    - `input[type=file][accept="image/*"][data-campo="<nome>"]`, `.previa-imagem img`, `[data-acao="remover-imagem"][data-campo]` e `.status-imagem` ("Comprimindo…").
    - O valor entregue ao `aoSalvar` é `{ manter: id } | { novo: dataUrl } | null`.
  - **Campo `imagens`:**
    - Mesmo `input` com `multiple`, `.miniaturas .miniatura` com `[data-acao="remover-miniatura"]`.
    - O valor é um array desses objetos. Acima de `max` (12), mantém só os 12 primeiros e mostra o toast `Máximo de 12 fotos por rolê.`.
  - **`FORMULARIOS`, um por coleção, com título e campos:**
    - `slides`: tag, titulo*, descricao, destaque, botaoTexto, botaoLink (validado por `linkSeguro` → `Link inválido`), imagem, somenteComVagas.
    - `diferenciais`: icone (select de 16 ícones), titulo*, texto.
    - `galeria`: imagem*, legenda.
    - `mascotes`: nome*, descricao, foto.
    - `moradores`: apelido*, nome, curso, anoEntrada (número), time, categoria* (select: Morador/Agregado/Ex-Morador), instagram, foto.
    - `eventos`: titulo*, descricao, fotos (imagens, máx. 12).
    - `contatos`: nome*, apelido, telefone* (tipo `telefone`: formata ao sair do campo).
    - `faq`: pergunta*, resposta*.
  - **`salvarDoFormulario(colecao, id | null, valores) → Promise<void>`:**
    1. Grava as imagens `novo` e obtém os ids.
    2. Grava o item (id novo com `gerarId`, `ordem = proximaOrdem`).
    3. Apaga as imagens trocadas ou removidas.
  - **Botões por seção (`.acoes-secao`, só admin):**
    - `[data-acao="novo"][data-colecao]` com os textos `+ Adicionar slide`, `+ Adicionar diferencial`, `+ Adicionar mascote`, `+ Cadastrar Morador`, `+ Cadastrar Novo Rolê`, `+ Adicionar contato`, `+ Adicionar pergunta`.
    - Galeria: `label[for="input-galeria"]` "+ Adicionar fotos" com `input#input-galeria[type=file][multiple][accept="image/*"]`.
  - **Botões por item (`.controles-item`, só admin):**
    - `[data-acao="editar"]` e `[data-acao="excluir"]`.
    - Nas ordenáveis, também `[data-acao="mover"][data-direcao="-1|1"]`.
    - Todos com `data-colecao` e `data-id`.
    - No carrossel, ficam no painel do slide ativo.
  - **Excluir:** pede `confirmar('Excluir "<rótulo>"?')`. Ao confirmar, exclui o item, apaga as imagens dele e mostra o toast `Excluído.`.

- [ ] **Step 1: Escrever o teste que falha — `$T/crud.test.cjs`**

```js
const idsDe = (page, col) => page.evaluate((c) => Object.keys(REPSICO.store.obter()[c]), col);
test('comprimirImagem: 800 px em JPEG, sem ampliar, fundo branco', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const r = await page.evaluate(async (fx) => {
    const out = {};
    for (const [nome, d] of Object.entries(fx)) {
      const blob = await (await fetch(d)).blob();
      const url = await REPSICO.utils.comprimirImagem(blob);
      const img = new Image(); img.src = url; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
      out[nome] = { tipo: url.slice(0, 15), w: img.width, h: img.height, canto: [...ctx.getImageData(10, 10, 1, 1).data].slice(0, 3) };
    }
    return out;
  }, { grande: h.dataUrl('grande.png'), retrato: h.dataUrl('retrato.jpg'), pequena: h.dataUrl('pequena.png'), transparente: h.dataUrl('transparente.png') });
  assert.deepEqual([r.grande.tipo, r.grande.w, r.grande.h], ['data:image/jpeg', 800, 600]);
  assert.deepEqual([r.retrato.w, r.retrato.h], [600, 800]);
  assert.deepEqual([r.pequena.w, r.pequena.h], [400, 300]);
  assert.ok(r.transparente.canto.every(v => v >= 245), String(r.transparente.canto));
});
test('arquivo que não é imagem mostra erro e o formulário continua usável', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="novo"][data-colecao="moradores"]');
  await page.setInputFiles('#modal-form input[data-campo="foto"]', h.fixture('invalido.jpg'));
  await page.waitForFunction(() => [...document.querySelectorAll('#toasts .toast')].some(t => t.textContent === 'Formato de imagem não suportado.'));
  await page.fill('#modal-form [name="apelido"]', 'SemFoto');
  await page.click('#modal-form button[type=submit]');
  await page.locator('.card-morador', { hasText: 'SemFoto' }).waitFor();
});
test('morador: cadastrar com foto, editar, remover foto, excluir (e cancelar)', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="novo"][data-colecao="moradores"]');
  assert.equal(await h.texto(page, '[data-acao="novo"][data-colecao="moradores"]'), '+ Cadastrar Morador');
  await page.fill('#modal-form [name="apelido"]', 'Bixo');
  await page.fill('#modal-form [name="nome"]', 'João da Silva');
  await page.fill('#modal-form [name="curso"]', 'Engenharia Elétrica');
  await page.fill('#modal-form [name="anoEntrada"]', '2025');
  await page.fill('#modal-form [name="time"]', 'Cruzeiro');
  await page.selectOption('#modal-form [name="categoria"]', 'agregado');
  await page.fill('#modal-form [name="instagram"]', '@joao.silva');
  await page.setInputFiles('#modal-form input[data-campo="foto"]', h.fixture('grande.png'));
  await page.waitForFunction(() => document.querySelector('#modal-form .previa-imagem img')?.src.startsWith('data:image/jpeg'));
  await page.click('#modal-form button[type=submit]');
  const card = page.locator('.card-morador', { hasText: 'Bixo' });
  await card.waitFor();
  assert.equal(await card.locator('a.btn-instagram').getAttribute('href'), 'https://instagram.com/joao.silva');
  const m = await page.evaluate(() => Object.values(REPSICO.store.obter().moradores).find(x => x.apelido === 'Bixo'));
  assert.equal(m.anoEntrada, 2025); assert.equal(m.categoria, 'agregado');
  const foto = await page.evaluate((id) => REPSICO.store.lerImagem(id), m.foto);
  assert.deepEqual(await h.dimensoes(page, foto), { w: 800, h: 600 });
  await card.locator('[data-acao="editar"]').click();
  await page.fill('#modal-form [name="apelido"]', 'Bixão');
  await page.click('#modal-form [data-acao="remover-imagem"][data-campo="foto"]');
  await page.click('#modal-form button[type=submit]');
  const card2 = page.locator('.card-morador', { hasText: 'Bixão' });
  await card2.locator('.placeholder-iniciais').waitFor();
  assert.equal(await page.evaluate((id) => REPSICO.store.lerImagem(id), m.foto), null);
  await page.locator('.card-morador', { hasText: 'Pantufa' }).locator('[data-acao="excluir"]').click();
  await page.click('[data-acao="confirmar-nao"]');
  assert.equal(await page.locator('.card-morador', { hasText: 'Pantufa' }).count(), 1);
  await card2.locator('[data-acao="excluir"]').click();
  assert.match(await h.texto(page, '#modal-confirmar .mensagem'), /Bixão/);
  await page.click('[data-acao="confirmar-sim"]');
  await page.locator('.card-morador', { hasText: 'Bixão' }).waitFor({ state: 'detached' });
});
test('campos obrigatórios bloqueiam o envio', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="novo"][data-colecao="moradores"]');
  await page.click('#modal-form button[type=submit]');
  assert.equal(await page.isVisible('#modal-form'), true);
  assert.match(await h.texto(page, '#modal-form .erro-campo'), /Obrigatório/);
});
test('escapa HTML digitado', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="novo"][data-colecao="moradores"]');
  await page.fill('#modal-form [name="apelido"]', '<img src=x onerror="window.__xss=1">');
  await page.click('#modal-form button[type=submit]');
  await page.locator('.card-morador', { hasText: '<img src=x' }).waitFor();
  assert.equal(await page.evaluate(() => window.__xss), undefined);
});
test('rolê com várias fotos (máx. 12), remover miniatura e excluir apaga fotos', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="novo"][data-colecao="eventos"]');
  assert.equal(await h.texto(page, '[data-acao="novo"][data-colecao="eventos"]'), '+ Cadastrar Novo Rolê');
  await page.fill('#modal-form [name="titulo"]', 'Festa Teste');
  await page.fill('#modal-form [name="descricao"]', 'Muito boa');
  const treze = Array.from({ length: 13 }, (_, i) => ({ name: `f${i}.png`, mimeType: 'image/png', buffer: require('fs').readFileSync(h.fixture('pequena.png')) }));
  await page.setInputFiles('#modal-form input[data-campo="fotos"]', treze);
  await page.waitForFunction(() => document.querySelectorAll('#modal-form .miniatura').length === 12);
  await page.waitForFunction(() => [...document.querySelectorAll('#toasts .toast')].some(t => t.textContent === 'Máximo de 12 fotos por rolê.'));
  for (let i = 0; i < 10; i++) await page.click('#modal-form .miniatura >> nth=0 >> [data-acao="remover-miniatura"]');
  assert.equal(await page.locator('#modal-form .miniatura').count(), 2);
  await page.click('#modal-form button[type=submit]');
  const card = page.locator('.card-evento', { hasText: 'Festa Teste' });
  await card.waitFor();
  assert.equal(await card.locator('.evento-fotos img').count(), 2);
  const fotos = await page.evaluate(() => Object.values(REPSICO.store.obter().eventos).find(e => e.titulo === 'Festa Teste').fotos);
  await card.locator('[data-acao="excluir"]').click(); await page.click('[data-acao="confirmar-sim"]');
  await card.waitFor({ state: 'detached' });
  for (const id of fotos) assert.equal(await page.evaluate((id) => REPSICO.store.lerImagem(id), id), null);
});
test('galeria: várias fotos de uma vez, legenda e exclusão', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  assert.equal(await page.isVisible('#galeria'), true);
  await page.setInputFiles('#input-galeria', [h.fixture('pequena.png'), h.fixture('grande.png'), h.fixture('retrato.jpg')]);
  await page.waitForFunction(() => document.querySelectorAll('.galeria-item').length === 3);
  await page.waitForFunction(() => [...document.querySelectorAll('#toasts .toast')].some(t => t.textContent === '3 fotos adicionadas'));
  await page.click('.galeria-item >> nth=0 >> [data-acao="editar"]');
  await page.fill('#modal-form [name="legenda"]', 'Sala de sinuca');
  await page.click('#modal-form button[type=submit]');
  assert.equal(await h.texto(page, '.galeria-item >> nth=0 >> figcaption'), 'Sala de sinuca');
  await page.click('.galeria-item >> nth=2 >> [data-acao="excluir"]'); await page.click('[data-acao="confirmar-sim"]');
  await page.waitForFunction(() => document.querySelectorAll('.galeria-item').length === 2);
});
test('slides: link inválido barrado, adicionar com foto, reordenar e excluir', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="novo"][data-colecao="slides"]');
  await page.fill('#modal-form [name="tag"]', 'NOVIDADE'); await page.fill('#modal-form [name="titulo"]', 'Slide novo');
  await page.fill('#modal-form [name="botaoTexto"]', 'Ver'); await page.fill('#modal-form [name="botaoLink"]', 'javascript:alert(1)');
  await page.click('#modal-form button[type=submit]');
  assert.match(await h.texto(page, '#modal-form'), /Link inválido/);
  await page.fill('#modal-form [name="botaoLink"]', '#faq');
  await page.setInputFiles('#modal-form input[data-campo="imagem"]', h.fixture('grande.png'));
  await page.waitForFunction(() => document.querySelector('#modal-form .previa-imagem img')?.src.startsWith('data:image/jpeg'));
  await page.click('#modal-form button[type=submit]');
  await page.waitForFunction(() => document.querySelectorAll('.hero-slide').length === 4);
  await page.click('.hero-indicadores button >> nth=3');
  await page.click('.hero-slide.ativo [data-acao="mover"][data-direcao="-1"]');
  assert.deepEqual(await page.$$eval('.hero-slide .tag', e => e.map(x => x.textContent.trim())), ['VAGAS', 'TRADIÇÃO', 'NOVIDADE', 'A CASA']);
  await page.click('.hero-indicadores button >> nth=2');
  await page.click('.hero-slide.ativo [data-acao="excluir"]'); await page.click('[data-acao="confirmar-sim"]');
  await page.waitForFunction(() => document.querySelectorAll('.hero-slide').length === 3);
});
test('diferenciais, mascotes, contatos e FAQ: adicionar e excluir', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="novo"][data-colecao="diferenciais"]');
  await page.selectOption('#modal-form [name="icone"]', 'chama');
  await page.fill('#modal-form [name="titulo"]', 'Churrasco'); await page.fill('#modal-form [name="texto"]', 'Toda sexta');
  await page.click('#modal-form button[type=submit]');
  await page.locator('.card-diferencial', { hasText: 'Churrasco' }).locator('svg').waitFor();
  await page.click('[data-acao="novo"][data-colecao="mascotes"]');
  await page.fill('#modal-form [name="nome"]', 'Rex');
  await page.setInputFiles('#modal-form input[data-campo="foto"]', h.fixture('pequena.png'));
  await page.waitForFunction(() => document.querySelector('#modal-form .previa-imagem img')?.src.startsWith('data:image/jpeg'));
  await page.click('#modal-form button[type=submit]');
  await page.locator('.mascote', { hasText: 'Rex' }).waitFor();
  await page.click('[data-acao="novo"][data-colecao="contatos"]');
  await page.fill('#modal-form [name="nome"]', 'Fulano'); await page.fill('#modal-form [name="apelido"]', 'Ful');
  await page.fill('#modal-form [name="telefone"]', '35999998888'); await page.click('#modal-form [name="nome"]');
  assert.equal(await page.inputValue('#modal-form [name="telefone"]'), '(35) 99999-8888');
  await page.click('#modal-form button[type=submit]');
  const ful = page.locator('.card-contato', { hasText: 'Ful' });
  assert.equal(await ful.locator('a.btn-whatsapp').getAttribute('href'),
    'https://wa.me/5535999998888?text=' + encodeURIComponent('Fala Ful! Vi o site da REPSICO e gostaria de tirar dúvidas / marcar uma visita.'));
  await page.click('[data-acao="novo"][data-colecao="faq"]');
  await page.fill('#modal-form [name="pergunta"]', 'Pode levar pet?'); await page.fill('#modal-form [name="resposta"]', 'Combinar antes.');
  await page.click('#modal-form button[type=submit]');
  await page.waitForFunction(() => document.querySelectorAll('#lista-faq details').length === 7);
  await page.click('#lista-faq details >> nth=6 >> [data-acao="mover"][data-direcao="-1"]');
  assert.equal(await h.texto(page, '#lista-faq details >> nth=5 >> summary'), 'Pode levar pet?');
  for (const [sel, txt] of [['.card-diferencial', 'Churrasco'], ['.mascote', 'Rex'], ['.card-contato', 'Ful'], ['#lista-faq details', 'Pode levar pet?']]) {
    await page.locator(sel, { hasText: txt }).locator('[data-acao="excluir"]').click();
    await page.click('[data-acao="confirmar-sim"]');
    await page.locator(sel, { hasText: txt }).waitFor({ state: 'detached' });
  }
});
test('controles de edição somem ao sair', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  assert.ok(await page.locator('[data-acao="editar"]:visible').count() > 0);
  await page.click('#barra-morador [data-acao="sair"]');
  assert.equal(await page.locator('[data-acao="editar"], [data-acao="excluir"], [data-acao="novo"], [data-acao="mover"]').count(), 0);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/crud.test.cjs`
Expected: FAIL (`REPSICO.utils.comprimirImagem is not a function`).

- [ ] **Step 3: Implementar `comprimirImagem`, os campos de imagem, `FORMULARIOS`, `salvarDoFormulario`, `confirmar`, as ações e os controles por item**

- **`comprimirImagem`:** `createImageBitmap(blob)` (com fallback para `Image` + `URL.createObjectURL`), canvas com `fillStyle = '#FFFFFF'`, `toDataURL('image/jpeg', qualidade)`.
- **Upload em massa da galeria:** comprime e salva em sequência, um item por foto com legenda vazia, e mostra o toast `1 foto adicionada` / `<n> fotos adicionadas`.
- **`mover`:** troca a `ordem` com o vizinho em `listar` via `store.reordenar`.

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/crud.test.cjs`
Expected: PASS (10 testes).

- [ ] **Step 5: Rodar a suíte inteira**

Run: `node --test $T/*.test.cjs`
Expected: PASS (todos os arquivos).

- [ ] **Step 6: Commit**

```bash
git add app.js style.css
git commit -m "Add create, edit, delete and reorder for all content with compressed photos"
```

---

### Task 10: Texto de divulgação e backup (exportar/importar)

**Files:**
- Modify: `app.js` (ações `copiar-divulgacao`, `exportar-backup`, `importar-backup`, `urlSite()`, `#modal-texto`)
- Test: `$T/divulgacao-backup.test.cjs`

**Interfaces:**
- Consumes: `gerarTextoDivulgacao`, `copiarTexto`, `coletarIdsImagens`, `store.lerImagem`, `store.substituirTudo`, `normalizar`, `confirmar`, `toast`.
- Produces:
  - **`urlSite()`:** `location.origin + location.pathname` quando o protocolo é http(s). Caso contrário, `''`.
  - **`exportarBackup() → Promise<void>`:**
    - Arquivo `{ app: 'repsico', formato: 1, exportadoEm: ISO, conteudo, imagens }`, só com as imagens referenciadas.
    - Download `repsico-backup-AAAA-MM-DD.json` (data local) via `Blob` + `a[download]`. Toast `Backup exportado!`.
  - **`importarBackup(arquivo: File) → Promise<void>`:**
    - Arquivo inválido (JSON quebrado, `app !== 'repsico'`, `formato !== 1`, sem `conteudo`) → toast `Arquivo de backup inválido.`.
    - Pede `confirmar('Isto substitui TODO o conteúdo atual do site. Continuar?', { textoSim: 'Substituir tudo' })`.
    - Chama `store.substituirTudo` com progresso em toast (`Enviando fotos i/total`). No fim, toast `Backup importado!`.
    - Para o seletor, o `input#arquivo-backup` é zerado depois de cada uso.
  - **Divulgação:** copia o texto e mostra o toast `Texto de divulgação copiado!`. Se `copiarTexto` falhar, abre `#modal-texto` com `textarea` selecionado.

- [ ] **Step 1: Escrever o teste que falha — `$T/divulgacao-backup.test.cjs`**

```js
const fs = require('node:fs');
const NB = ' ';
test('copia o texto de divulgação com os dados atuais', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.evaluate(() => REPSICO.store.salvarConfig({ valorMensal: 950 }));
  await page.click('[data-acao="copiar-divulgacao"]');
  const t = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(t.includes(`💰 *R$${NB}950,00/mês — tudo incluso*`));
  assert.ok(t.includes('👩‍🍳 *Dona Zilda:*'));
  assert.ok(t.includes('• Thiago (Pantufa): (35) 9191-5374 — wa.me/553591915374'));
  assert.ok(t.includes(`🌐 ${srv.url}`));
  assert.equal(await h.texto(page, '#toasts .toast >> nth=-1'), 'Texto de divulgação copiado!');
});
test('exportar e importar backup restaura tudo, inclusive fotos', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  const fotoId = await page.evaluate(async (d) => {
    const id = await REPSICO.store.salvarImagem(d);
    await REPSICO.store.salvarItem('moradores', 'mx', { apelido: 'Bixo', nome: '', curso: '', anoEntrada: null, time: '', categoria: 'morador', instagram: '', foto: id });
    return id;
  }, h.dataUrl('pequena.png'));
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-acao="exportar-backup"]')]);
  assert.match(dl.suggestedFilename(), /^repsico-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const arquivo = await dl.path();
  const json = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  assert.equal(json.app, 'repsico'); assert.equal(json.formato, 1);
  assert.equal(json.conteudo.moradores.mx.apelido, 'Bixo');
  assert.deepEqual(Object.keys(json.imagens), [fotoId]);
  assert.ok(json.imagens[fotoId].startsWith('data:image/'));
  const { page: p2 } = await h.novaPagina(browser, srv.url);
  assert.equal(await p2.locator('.card-morador', { hasText: 'Bixo' }).count(), 0);
  await h.entrar(p2);
  await p2.setInputFiles('#arquivo-backup', arquivo);
  await p2.click('[data-acao="confirmar-sim"]');
  await p2.waitForFunction(() => [...document.querySelectorAll('#toasts .toast')].some(t => t.textContent === 'Backup importado!'));
  await p2.locator('.card-morador', { hasText: 'Bixo' }).waitFor();
  assert.equal(await p2.evaluate((id) => REPSICO.store.lerImagem(id), fotoId), json.imagens[fotoId]);
});
test('arquivo inválido mostra erro e não altera nada; cancelar não altera nada', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.setInputFiles('#arquivo-backup', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"outro"}') });
  await page.waitForFunction(() => [...document.querySelectorAll('#toasts .toast')].some(t => t.textContent === 'Arquivo de backup inválido.'));
  const valido = JSON.stringify({ app: 'repsico', formato: 1, exportadoEm: '', conteudo: { moradores: {} }, imagens: {} });
  await page.setInputFiles('#arquivo-backup', { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(valido) });
  await page.click('[data-acao="confirmar-nao"]');
  assert.equal(await page.locator('.card-morador').count(), 2);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/divulgacao-backup.test.cjs`
Expected: FAIL (o clipboard não contém o texto, porque a ação ainda não existe).

- [ ] **Step 3: Implementar a divulgação, a exportação e a importação**

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test $T/divulgacao-backup.test.cjs`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "Add WhatsApp promo text copy and backup export/import"
```

---

### Task 11: Modo Firebase (Firestore + Auth), store indisponível e README

**Files:**
- Modify: `app.js` (`carregarFirebase`, `criarStoreFirebase`, `criarStoreIndisponivel`, cache, `iniciar`)
- Create: `README.md`
- Test: `$T/firebase/firebase.json`, `$T/firebase/preparar.cjs`, `$T/firebase.emu.cjs`, `$T/rodar-firebase.sh`

**Interfaces:**
- Consumes: interface `store` (Task 3), `normalizar`, `CONTEUDO_INICIAL`, `EMAIL_MORADORES`, `FIREBASE_VERSAO`.
- Produces:
  - **`carregarFirebase() → Promise<{ app, fs, auth }>`:** `import()` dos três módulos de `https://www.gstatic.com/firebasejs/${FIREBASE_VERSAO}/firebase-{app,firestore,auth}.js`, com timeout de 10 s.
  - **`criarStoreFirebase(cfg, emu?) → Promise<store>`** (`modo: 'firebase'`):
    - **Gancho de emulador:** `emu = window.__REPSICO_EMULADOR__` = `{ firebaseConfig, firestore: { host, porta }, auth: 'http://127.0.0.1:9099' }` → `connectFirestoreEmulator` / `connectAuthEmulator(auth, url, { disableWarnings: true })`.
    - **Inicialização:** espera `auth.authStateReady()`.
    - **`iniciar`:**
      - Escuta `onSnapshot(doc(db,'site','conteudo'))`. Doc ausente → `structuredClone(CONTEUDO_INICIAL)`.
      - Cada snapshot é normalizado e grava `repsico:cache`.
      - Resolve no 1º snapshot ou em 3 s, o que vier antes.
    - **Gravações:**
      - Por campo: `updateDoc(ref, { '<col>.<id>': dados })`. Exclusão com `deleteField()`. Configuração com `'config.<k>'`.
      - Valores passam antes por `JSON.parse(JSON.stringify(…))`.
    - **Imagens:**
      - Gravação em `imagens/<id>` = `{ data, criadoEm: serverTimestamp() }`.
      - Leitura com cache em memória e deduplicação de pedidos. Imagem ausente → `null`.
    - **`substituirTudo`:** imagens com até 3 gravações em paralelo, depois `setDoc` do conteúdo e, por fim, exclusão das imagens antigas não usadas.
    - **`auth`:**
      - `entrar` → `signInWithEmailAndPassword(auth, EMAIL_MORADORES, senha)`. Se `site/conteudo` não existir, grava `CONTEUDO_INICIAL` com `setDoc`.
      - `logado` → e-mail do usuário atual igual a `EMAIL_MORADORES` (sem diferenciar maiúsculas).
      - `trocarSenha` → valida ≥ 6 e chama `updatePassword`.
      - `sair` → `signOut`. `aoMudar` → `onAuthStateChanged`.
  - **`criarStoreIndisponivel(conteudo) → store`** (`modo: 'offline'`): leituras do conteúdo dado, `lerImagem → null`, gravações e `entrar` rejeitam com `.codigo = 'offline'`.
  - **`iniciar()` com Firebase ativo** (`cfg = emu?.firebaseConfig || firebaseConfig`):
    1. Com cache, renderiza o cache na hora.
    2. Tenta `criarStoreFirebase`. Se falhar, usa `criarStoreIndisponivel(cache || inicial)`.
    3. `await store.iniciar(...)` e resolve `pronto`.
  - **README:** contém as regras do spec §8.12 entre os marcadores `<!-- regras:inicio -->` e `<!-- regras:fim -->`, num bloco ```` ``` ````. Seções do spec §8.13.

- [ ] **Step 1: Preparar o ambiente do emulador**

```bash
mkdir -p $T/firebase && cd $T/firebase && npm init -y >/dev/null && npm i firebase-tools@15.34.2 firebase@12.19.0 --silent && npx firebase --version
```

Expected: `15.34.2`.

- `$T/firebase/firebase.json`:
  ```json
  { "emulators": { "firestore": { "port": 8080 }, "auth": { "port": 9099 }, "ui": { "enabled": false }, "singleProjectMode": true },
    "firestore": { "rules": "firestore.rules" } }
  ```
- `$T/firebase/preparar.cjs`: extrai o bloco entre os marcadores do `README.md` para `$T/firebase/firestore.rules`. Sai com erro se não achar os marcadores.
- `$T/rodar-firebase.sh`:
  ```bash
  set -e; cd $T/firebase && node preparar.cjs && npx firebase emulators:exec --only firestore,auth --project demo-repsico "node --test --test-concurrency=1 $T/firebase.emu.cjs"
  ```

- [ ] **Step 2: Escrever o teste que falha — `$T/firebase.emu.cjs`**

Lado Node com `require('$T/firebase/node_modules/firebase/app' | '/firestore' | '/auth')`, conectado aos emuladores com projectId `demo-repsico`. No `before`:
- Limpar os emuladores:
  - `DELETE http://127.0.0.1:8080/emulator/v1/projects/demo-repsico/databases/(default)/documents`
  - `DELETE http://127.0.0.1:9099/emulator/v1/projects/demo-repsico/accounts`
- Criar o usuário `moradores@repsico.com` com a senha `senhaDaCasa1`.
- Constantes:
  ```js
  const EMU = { firebaseConfig: { apiKey: 'demo-key', authDomain: 'demo-repsico.firebaseapp.com', projectId: 'demo-repsico', appId: 'demo-app' },
                firestore: { host: '127.0.0.1', porta: 8080 }, auth: 'http://127.0.0.1:9099' };
  const pagina = (op = {}) => h.novaPagina(browser, srv.url, { emulador: EMU, ...op });
  ```

```js
test('regras do README: público lê; só a conta dos moradores grava', async () => {
  const db = nodeDb(); // Firestore do Node, sem login
  await getDoc(doc(db, 'site', 'conteudo'));
  await assert.rejects(setDoc(doc(db, 'site', 'conteudo'), { x: 1 }), /permission-denied|PERMISSION_DENIED/i);
  await createUserWithEmailAndPassword(nodeAuth(), 'outro@x.com', 'outra123');
  await assert.rejects(setDoc(doc(db, 'imagens', 'x'), { data: 'a' }), /permission-denied|PERMISSION_DENIED/i);
  await signInWithEmailAndPassword(nodeAuth(), 'moradores@repsico.com', 'senhaDaCasa1');
  await setDoc(doc(db, 'imagens', 'teste'), { data: 'data:image/jpeg;base64,AA' });
  await deleteDoc(doc(db, 'imagens', 'teste'));
  await signOut(nodeAuth());
});
test('visitante vê o conteúdo inicial com o Firestore vazio', async () => {
  const { page, erros } = await pagina();
  assert.equal(await page.evaluate(() => REPSICO.store.modo), 'firebase');
  await page.locator('.card-morador', { hasText: 'Pantufa' }).waitFor();
  assert.equal(await page.$('body.is-admin'), null);
  assert.deepEqual(erros, []);
});
test('login pelo Firebase grava o conteúdo inicial e as edições chegam ao Firestore', async () => {
  const { page } = await pagina();
  await page.click('.navbar [data-acao="abrir-login"]');
  assert.equal(await page.isVisible('#modal-login .aviso-modo-local'), false);
  await page.fill('#senha-login', 'errada'); await page.click('#modal-login button[type=submit]');
  await page.waitForFunction(() => document.querySelector('#modal-login .erro').textContent.includes('Senha incorreta.'));
  await page.fill('#senha-login', 'senhaDaCasa1'); await page.click('#modal-login button[type=submit]');
  await page.waitForSelector('body.is-admin');
  assert.equal(await h.texto(page, '#barra-morador .indicador-modo'), 'Firebase');
  const snap = await esperarDoc('site/conteudo');                        // lê do Node até existir (timeout 5 s)
  assert.equal(snap.config.valorMensal, 900);
  await page.evaluate(() => REPSICO.store.salvarItem('faq', 'f9', { pergunta: 'Q', resposta: 'R', ordem: 50 }));
  const id = await page.evaluate((d) => REPSICO.store.salvarImagem(d), h.dataUrl('pequena.png'));
  assert.equal((await lerDoc('site/conteudo')).faq.f9.pergunta, 'Q');
  assert.ok((await lerDoc('imagens/' + id)).data.startsWith('data:image/'));
});
test('edição feita em outro aparelho aparece ao vivo', async () => {
  const { page } = await pagina();
  await comoMoradores(db => updateDoc(doc(db, 'site', 'conteudo'), { 'config.valorMensal': 1000 }));
  await page.waitForFunction(() => document.querySelector('#card-financeiro .valor').textContent.trim() === 'R$ 1.000,00');
});
test('duas edições simultâneas em itens diferentes não se sobrescrevem', async () => {
  const a = await pagina(); const b = await pagina();
  await h.entrar(a.page, 'senhaDaCasa1'); await h.entrar(b.page, 'senhaDaCasa1');
  await Promise.all([
    a.page.evaluate(() => REPSICO.store.salvarItem('faq', 'qa', { pergunta: 'A', resposta: 'a', ordem: 60 })),
    b.page.evaluate(() => REPSICO.store.salvarItem('faq', 'qb', { pergunta: 'B', resposta: 'b', ordem: 61 }))]);
  const c = await lerDoc('site/conteudo');
  assert.equal(c.faq.qa.pergunta, 'A'); assert.equal(c.faq.qb.pergunta, 'B');
});
test('importar backup no Firebase substitui tudo e apaga fotos antigas', async () => {
  const { page } = await pagina();
  await h.entrar(page, 'senhaDaCasa1');
  const velha = await page.evaluate(async () => {
    const id = await REPSICO.store.salvarImagem('data:image/jpeg;base64,VkVMSEE=');
    await REPSICO.store.salvarItem('moradores', 'mv', { apelido: 'Velho', categoria: 'ex', foto: id });
    return id;
  });
  const backup = { app: 'repsico', formato: 1, exportadoEm: '', conteudo: { moradores: { mn: { apelido: 'Novo', categoria: 'morador', foto: 'imgnova' } } },
                   imagens: { imgnova: 'data:image/jpeg;base64,Tk9WQQ==' } };
  await page.setInputFiles('#arquivo-backup', { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await page.click('[data-acao="confirmar-sim"]');
  await page.waitForFunction(() => [...document.querySelectorAll('#toasts .toast')].some(t => t.textContent === 'Backup importado!'));
  const c = await lerDoc('site/conteudo');
  assert.deepEqual(Object.keys(c.moradores), ['mn']);
  assert.equal((await lerDoc('imagens/imgnova')).data, 'data:image/jpeg;base64,Tk9WQQ==');
  assert.equal(await lerDoc('imagens/' + velha), null);
});
test('Firebase indisponível: conteúdo do cache ou inicial, login avisa', async () => {
  const { page, erros } = await pagina({ bloquearFirebase: true });
  assert.equal(await page.evaluate(() => REPSICO.store.modo), 'offline');
  await page.locator('.card-morador', { hasText: 'Pantufa' }).waitFor();
  await page.click('.navbar [data-acao="abrir-login"]');
  await page.fill('#senha-login', 'senhaDaCasa1'); await page.click('#modal-login button[type=submit]');
  await page.waitForFunction(() => document.querySelector('#modal-login .erro').textContent.includes('Sem conexão com o Firebase'));
  assert.deepEqual(erros.filter(e => !/firebase|gstatic|Failed to fetch|import/i.test(e)), []);
});
test('cache: depois de uma visita, o Firebase fora do ar mostra os dados conhecidos', async () => {
  await comoMoradores(db => updateDoc(doc(db, 'site', 'conteudo'), { 'config.valorMensal': 1234 }));
  const { page, context } = await pagina();
  await page.waitForFunction(() => document.querySelector('#card-financeiro .valor').textContent.trim() === 'R$ 1.234,00');
  await context.route('https://www.gstatic.com/**', r => r.abort());   // registrada por último = tem prioridade
  await page.reload(); await h.pronto(page);
  assert.equal(await page.evaluate(() => REPSICO.store.modo), 'offline');
  assert.equal(await page.$eval('#card-financeiro .valor', e => e.textContent.trim()), 'R$ 1.234,00');
});
test('trocar senha no Firebase', async () => {
  const { page } = await pagina();
  await h.entrar(page, 'senhaDaCasa1');
  await page.click('[data-acao="trocar-senha"]');
  await page.fill('#modal-form [name="nova"]', 'outraSenha2'); await page.fill('#modal-form [name="confirmacao"]', 'outraSenha2');
  await page.click('#modal-form button[type=submit]');
  await page.waitForFunction(() => [...document.querySelectorAll('#toasts .toast')].some(t => t.textContent === 'Senha alterada!'));
  await page.click('#barra-morador [data-acao="sair"]');
  await assert.rejects(signInWithEmailAndPassword(nodeAuth(), 'moradores@repsico.com', 'senhaDaCasa1'));
  await signInWithEmailAndPassword(nodeAuth(), 'moradores@repsico.com', 'outraSenha2');
});
```

Helpers do arquivo:
- `nodeDb()` / `nodeAuth()`: instâncias únicas ligadas aos emuladores.
- `lerDoc(caminho) → dados | null`: lê como visitante.
- `esperarDoc(caminho)`: tenta até existir (timeout 5 s).
- `comoMoradores(fn)`: entra, executa `fn(db)` e sai.

- [ ] **Step 3: Escrever o README com o bloco de regras (necessário para o teste de regras)**

`README.md` em português, conforme o spec §8.13:
- **Logo:** já incluída.
- **Testar sem Firebase:** dois cliques no `index.html`, ou `python3 -m http.server 8000`. Senha `repsico`.
- **GitHub Pages:** passo a passo.
- **Firebase em 3 minutos:** criar o projeto e o app Web, colar o `firebaseConfig`, criar o Firestore e colar as regras. Authentication → E-mail/senha → adicionar o usuário com a senha da casa. Recomendação de desativar a criação de contas.
- **E-mail do login:** escolher um e-mail que a casa controla. Se não for `moradores@repsico.com`, trocar nas duas linhas: a constante no `app.js` e a linha das regras.
- **Migrar o modo local (Plano B):** Exportar → configurar → entrar → Importar.
- **Trocar ou recuperar a senha:** pelo painel ou pelo console. Com e-mail falso, excluir e recriar o usuário.
- **Limites do plano gratuito.**
- **Por que o `firebaseConfig` público é seguro.**

As regras entram exatamente como no spec §8.12, entre `<!-- regras:inicio -->` e `<!-- regras:fim -->`.

- [ ] **Step 4: Rodar e ver falhar**

Run: `bash $T/rodar-firebase.sh`
Expected: FAIL. O teste de regras deve **passar** (o README já tem as regras). Os demais falham com `REPSICO.store.modo` = `'local'` ≠ `'firebase'`.

- [ ] **Step 5: Implementar `carregarFirebase`, `criarStoreFirebase`, `criarStoreIndisponivel`, o cache e os ramos do `iniciar()`**

- [ ] **Step 6: Rodar e ver passar**

Run: `bash $T/rodar-firebase.sh`
Expected: PASS (9 testes).

Run: `node --test $T/*.test.cjs`
Expected: PASS (o modo local continua intacto).

- [ ] **Step 7: Commit**

```bash
git add app.js README.md
git commit -m "Add Firebase mode with live sync, offline fallback and setup README"
```

---

### Task 12: Acabamento — metatags/Open Graph, acessibilidade, layout com conteúdo longo, `file://` e revisão visual

**Files:**
- Modify: `index.html`, `style.css`, `app.js` (somente o que os testes apontarem)
- Test: `$T/acabamento.test.cjs`, `$T/screens.cjs` (gera screenshots para revisão)

**Interfaces:**
- Consumes: tudo das tasks anteriores.
- Produces: metatags finais. Nenhuma API nova.

- [ ] **Step 1: Escrever o teste que falha — `$T/acabamento.test.cjs`**

```js
const fs = require('node:fs');
const LONGO = 'Supercalifragilisticexpialidocious'.repeat(4);
test('metatags e Open Graph', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  const meta = (sel) => page.getAttribute(sel, 'content');
  assert.equal(await page.getAttribute('html', 'lang'), 'pt-BR');
  assert.ok((await meta('meta[name="description"]')).length > 50);
  assert.equal(await meta('meta[name="theme-color"]'), '#D90429');
  assert.equal(await meta('meta[property="og:title"]'), 'República REPSICO · Itajubá-MG');
  assert.equal(await meta('meta[property="og:type"]'), 'website');
  assert.equal(await meta('meta[property="og:locale"]'), 'pt_BR');
  assert.equal(await meta('meta[property="og:image"]'), 'https://lucaspivoto.github.io/Republica-Repsico/logo-repsico.png');
});
test('token de vermelho para texto nos dois temas', async () => {
  const { page } = await h.novaPagina(browser, srv.url, { colorScheme: 'light' });
  const token = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent-text').trim().toUpperCase());
  assert.equal(await token(), '#D90429');
  await page.click('[data-acao="alternar-tema"]');
  assert.equal(await token(), '#FF4D6D');
});
test('conteúdo longo não quebra o layout (360 px, visitante e logado)', async () => {
  const { page } = await h.novaPagina(browser, srv.url, { viewport: { width: 360, height: 780 } });
  await page.evaluate(async (L) => {
    const s = REPSICO.store;
    await s.salvarItem('moradores', 'ml', { apelido: L, nome: L, curso: L, anoEntrada: 2024, time: L, categoria: 'morador', instagram: L, foto: null });
    await s.salvarItem('eventos', 'el', { titulo: L, descricao: L + ' ' + L, fotos: [], ordem: 99 });
    await s.salvarItem('faq', 'fl', { pergunta: L, resposta: 'https://exemplo.com/' + L, ordem: 99 });
    await s.salvarItem('contatos', 'cl', { nome: L, apelido: L, telefone: '(35) 99999-9999', ordem: 99 });
    await s.salvarConfig({ endereco: { rua: L, cidade: L, distancias: L } });
  }, LONGO);
  const semRolagem = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  assert.ok(await semRolagem(), 'visitante');
  await h.entrar(page);
  assert.ok(await semRolagem(), 'logado');
});
test('sem rolagem horizontal em 390/768/1366 nos dois temas', async () => {
  for (const width of [390, 768, 1366]) for (const colorScheme of ['light', 'dark']) {
    const { page, context } = await h.novaPagina(browser, srv.url, { viewport: { width, height: 900 }, colorScheme });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${colorScheme}`);
    await context.close();
  }
});
test('botões e links só com ícone têm nome acessível', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  const semNome = await page.$$eval('button, a', els => els.filter(e => e.offsetParent !== null && !e.textContent.trim()
    && !e.getAttribute('aria-label') && !e.getAttribute('title')).map(e => e.outerHTML.slice(0, 80)));
  assert.deepEqual(semNome, []);
  const imgsSemAlt = await page.$$eval('img', is => is.filter(i => !i.hasAttribute('alt')).length);
  assert.equal(imgsSemAlt, 0);
});
test('funciona via file:// (dois cliques no index.html)', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const erros = []; page.on('pageerror', e => erros.push(String(e)));
  await context.route(/fonts\.(googleapis|gstatic)\.com|google\.com\/maps/, r => r.abort());
  await page.goto('file:///home/user/Republica-Repsico/index.html'); await h.pronto(page);
  await page.locator('.card-morador', { hasText: 'Pantufa' }).waitFor();
  await h.entrar(page);
  assert.deepEqual(erros, []);
  await context.close();
});
test('tamanho dos arquivos', () => {
  const t = (f) => fs.statSync('/home/user/Republica-Repsico/' + f).size;
  assert.ok(t('index.html') + t('style.css') + t('app.js') < 150_000, String(t('index.html') + t('style.css') + t('app.js')));
  assert.ok(t('logo-repsico.png') < 80_000);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test $T/acabamento.test.cjs`
Expected: FAIL (no mínimo, os testes de Open Graph e de token falham).

- [ ] **Step 3: Implementar as metatags e corrigir o que os testes apontarem**

Corrigir com `overflow-wrap: anywhere` e `min-width: 0` nos itens de grid/flex, `aria-label`s e `alt`s.

- [ ] **Step 4: Rodar e ver passar; rodar a suíte inteira e a do Firebase**

Run: `node --test $T/*.test.cjs && bash $T/rodar-firebase.sh`
Expected: PASS em tudo.

- [ ] **Step 5: Revisão visual por screenshots**

`$T/screens.cjs` gera em `$T/screens/` (deviceScaleFactor 1):
- celular 390×844 e desktop 1366×900;
- tema claro e escuro;
- visitante e logado;
- página inteira.

Abrir cada imagem e conferir:
- hierarquia e alinhamentos;
- contraste;
- placeholders da marca;
- carrossel com cara de vitrine Steam;
- barra do morador sem cobrir conteúdo.

Corrigir o que estiver feio e repetir o Step 4.

Run: `node $T/screens.cjs && ls $T/screens | wc -l`
Expected: `8`.

- [ ] **Step 6: Commit**

```bash
git add index.html style.css app.js
git commit -m "Polish metadata, accessibility, long-content layout and visual details"
```
