# Ficha do Morador — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ao clicar num card de morador, abrir uma ficha sobreposta (foto à esquerda, dados à direita) com até 3 características em estrelas (1–5) e o lema do morador, todos cadastráveis.

**Architecture:**
- O item `moradores` ganha `lema` e `caracteristicas`, normalizados em `normalizarItem`.
- O formulário ganha o campo especial `caracteristicas` (3 linhas: nome + 5 estrelas).
- A ficha é um novo modal `#modal-ficha`, aberto por um botão que cobre o card e que reutiliza `abrirModal`/`fecharModal`.

**Tech Stack:** o mesmo do site (HTML/CSS/JS sem build). Testes fora do repositório com `node:test` + Playwright.

**Spec:** `docs/superpowers/specs/2026-11-18-ficha-morador-design.md`

## Global Constraints

- Até **3** características, cada uma com estrelas inteiras **1 a 5**. Linha sem nome é ignorada. Linha nova começa com **3** estrelas.
- Rótulos exatos:
  - `REPSICO · Ficha do morador`, `NOME:`, `ANO:`, `LEMA DO MORADOR:`;
  - colunas da tabela `Características` e `Nível`;
  - campos `Características (até 3)` e `Lema do morador`.
- Todo texto do usuário passa por `escapeHtml`. Campos vazios não aparecem na ficha.
- Testes em `T=/tmp/claude-0/-home-user-Republica-Repsico/5e136209-52b1-5753-a776-3f1a68fed94a/scratchpad/tests`. As suítes existentes (`$T/*.test.cjs` e `bash $T/rodar-firebase.sh`) continuam verdes.

## Review Focus

1. **Lema e características longos no celular:** sem rolagem horizontal. *Teste: Task 2 `celular empilha…`.*
2. **HTML digitado no lema ou nas características:** aparece como texto. *Teste: Task 2 `abre a ficha…`.*
3. **Morador sem foto, sem características e sem lema:** iniciais, sem tabela e sem lema. *Teste: Task 2 `ficha mínima…`.*
4. **Usuário de teclado:** abre a ficha com Enter no card, Esc fecha e o foco volta ao card. *Teste: Task 2 `teclado…`.*
5. **Instagram e controles de admin do card:** continuam clicáveis por cima do botão da ficha. *Teste: Task 2 `Instagram e controles…`.*

---

### Task 1: Dados e formulário — características e lema

**Files:**
- Modify: `app.js` (`PADROES_ITEM.moradores`, `normalizarItem`, `CAMPOS_ESPECIAIS.caracteristicas`, `FORMULARIOS.moradores.campos`), `style.css` (estrelas do formulário)
- Test: `$T/unit.test.cjs`, `$T/crud.test.cjs` (acrescentar)

**Interfaces:**
- Produces:
  - **Item morador:** `{ …, lema: string, caracteristicas: Array<{ nome: string, estrelas: 1|2|3|4|5 }> }`.
  - **DOM do formulário:**
    - nome da característica: `[name="caract-nome-0..2"]`;
    - estrelas: `input[type=radio][name="caract-estrelas-0..2"][value="1..5"]`;
    - lema: `[name="lema"]`.

- [ ] **Step 1: Testes que falham**

```js
// unit.test.cjs
test('normalizar morador: características (máx. 3, estrelas 1–5) e lema', async () => {
  const n = await u('normalizar', { moradores: { a: { apelido: 'A', lema: '  Viva  ', caracteristicas: [
    { nome: ' Festas ', estrelas: 0 }, { nome: '', estrelas: 5 }, { nome: 'Cerveja', estrelas: 9 },
    { nome: 'Dormir', estrelas: '3' }, { nome: 'Academia', estrelas: 2 }] }, b: { apelido: 'B' } } });
  assert.deepEqual(n.moradores.a.caracteristicas, [{ nome: 'Festas', estrelas: 1 }, { nome: 'Cerveja', estrelas: 5 }, { nome: 'Dormir', estrelas: 3 }]);
  assert.equal(n.moradores.a.lema, 'Viva');
  assert.deepEqual(n.moradores.b.caracteristicas, []); assert.equal(n.moradores.b.lema, '');
});
// crud.test.cjs
test('cadastrar morador com características e lema, e editar mantém os valores', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await h.entrar(page);
  await page.click('[data-acao="novo"][data-colecao="moradores"]');
  assert.equal(await page.isChecked('#modal-form [name="caract-estrelas-0"][value="3"]'), true);
  await page.fill('#modal-form [name="apelido"]', 'Ficha');
  await page.fill('#modal-form [name="caract-nome-0"]', 'Festas'); await page.check('#modal-form [name="caract-estrelas-0"][value="4"]');
  await page.fill('#modal-form [name="caract-nome-1"]', 'Cerveja'); await page.check('#modal-form [name="caract-estrelas-1"][value="5"]');
  await page.fill('#modal-form [name="lema"]', 'Os melhores momentos são com um copo na mão');
  await page.click('#modal-form button[type=submit]');
  await page.locator('.card-morador', { hasText: 'Ficha' }).waitFor();
  const m = await page.evaluate(() => Object.values(REPSICO.store.obter().moradores).find(x => x.apelido === 'Ficha'));
  assert.deepEqual(m.caracteristicas, [{ nome: 'Festas', estrelas: 4 }, { nome: 'Cerveja', estrelas: 5 }]);
  assert.equal(m.lema, 'Os melhores momentos são com um copo na mão');
  await page.locator('.card-morador', { hasText: 'Ficha' }).locator('[data-acao="editar"]').click();
  assert.equal(await page.inputValue('#modal-form [name="caract-nome-1"]'), 'Cerveja');
  assert.equal(await page.isChecked('#modal-form [name="caract-estrelas-0"][value="4"]'), true);
  assert.equal(await page.inputValue('#modal-form [name="lema"]'), 'Os melhores momentos são com um copo na mão');
});
```

- [ ] **Step 2: Rodar e ver falhar** — `node --test $T/unit.test.cjs $T/crud.test.cjs`. Expected: FAIL nos 2 testes novos.

- [ ] **Step 3: Implementar.**
  - **`normalizarItem`:** `lema` aparado. `caracteristicas` filtra os nomes vazios, apara, corta em 3 e aplica `estrelas = min(5, max(1, parseInt(v) || 1))`.
  - **Campo `caracteristicas`:**
    - `html`: 3 linhas `.linha-caracteristica`, cada uma com o input de nome e um `role="radiogroup"` de 5 rádios ★, com `aria-label` "1 estrela"…"5 estrelas".
    - `valor`: lista das linhas com nome.
    - Valores iniciais vêm do item; linhas novas começam com 3.
  - **Ordem dos campos no formulário:** `caracteristicas` e `lema` entram depois de `instagram` e antes de `foto`.

- [ ] **Step 4: Rodar e ver passar** — o mesmo comando + `node --test $T/*.test.cjs`. Expected: tudo PASS.

- [ ] **Step 5: Commit** — `Add characteristics with stars and motto to resident form`.

---

### Task 2: A ficha do morador (modal)

**Files:**
- Modify: `index.html` (adiciona `<div id="modal-ficha" class="modal" hidden></div>`), `app.js` (`htmlMorador`, `abrirFicha(id)`, ações `abrir-ficha`/`editar-ficha`), `style.css` (ficha e botão de cobertura)
- Test: `$T/ficha.test.cjs` (novo)

**Interfaces:**
- Consumes: item morador da Task 1, `abrirModal`, `fecharModal`, `abrirFormularioColecao`, `imgTag`, `hidratarImagens`, `iniciais`, `coresTime`, `CATEGORIAS`.
- Produces:
  - **No card:** `button.morador-abrir[data-acao="abrir-ficha"][data-id]` cobre o card (`aria-label="Ver ficha de <apelido>"`). `a.btn-instagram` e `.controles-item` ficam acima dele (z-index).
  - **`#modal-ficha`:**
    - `.ficha` com `role="dialog"` e `aria-modal`;
    - `#titulo-ficha` "REPSICO · Ficha do morador";
    - `.ficha-foto` com `img` ou `.placeholder-iniciais`;
    - `.ficha-apelido`, `.ficha-ano`, `.ficha-sub`, `.ficha-selos`;
    - `table.ficha-tabela`, uma linha por característica, cada uma com `.estrelas[role=img][aria-label="N de 5 estrelas"]` contendo 5 `span` (`.cheia` ou `.vazia`);
    - `.ficha-lema` com o texto entre “ ”;
    - para admin: `[data-acao="editar-ficha"][data-id]` "Editar".

- [ ] **Step 1: Testes que falham — `$T/ficha.test.cjs`**

```js
const FICHA = { apelido: 'Dodô', nome: 'Lucas', curso: 'Eng. Mecânica', anoEntrada: 2024, time: 'Flamengo', categoria: 'morador',
  instagram: 'dodo', foto: null, lema: 'Os melhores momentos são com um copo na mão',
  caracteristicas: [{ nome: 'Festas', estrelas: 4 }, { nome: '<b>Cerveja</b>', estrelas: 5 }] };
test('clicar no card abre a ficha com foto, dados, características e lema; Esc fecha', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate(async ([m, d]) => { m.foto = await REPSICO.store.salvarImagem(d); await REPSICO.store.salvarItem('moradores', 'dodo', m); }, [FICHA, h.dataUrl('retrato.jpg')]);
  await page.locator('.card-morador', { hasText: 'Dodô' }).click();
  assert.equal(await page.isVisible('#modal-ficha'), true);
  assert.equal(await h.texto(page, '#titulo-ficha'), 'REPSICO · Ficha do morador');
  assert.equal(await h.texto(page, '.ficha-apelido'), 'Dodô');
  assert.equal(await h.texto(page, '.ficha-ano'), '2024');
  assert.match(await h.texto(page, '.ficha-sub'), /Lucas · Eng\. Mecânica/);
  assert.deepEqual(await h.textos(page, '.ficha-tabela tbody td:first-child'), ['Festas', '<b>Cerveja</b>']);
  assert.equal(await page.locator('.ficha-tabela tbody tr >> nth=0 >> .estrelas .cheia').count(), 4);
  assert.equal(await page.getAttribute('.ficha-tabela tbody tr >> nth=1 >> .estrelas', 'aria-label'), '5 de 5 estrelas');
  assert.equal(await h.texto(page, '.ficha-lema'), '“Os melhores momentos são com um copo na mão”');
  await page.waitForFunction(() => document.querySelector('.ficha-foto img')?.src.startsWith('data:image/'));
  await page.keyboard.press('Escape');
  assert.equal(await page.isVisible('#modal-ficha'), false);
});
test('ficha mínima: sem foto mostra iniciais; sem características nem lema não mostra tabela nem lema', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.locator('.card-morador', { hasText: 'Pantufa' }).click();
  assert.equal(await h.texto(page, '.ficha-foto .placeholder-iniciais'), 'PA');
  assert.equal(await page.locator('#modal-ficha .ficha-tabela').count(), 0);
  assert.equal(await page.locator('#modal-ficha .ficha-lema').count(), 0);
  assert.equal(await page.locator('#modal-ficha [data-acao="editar-ficha"]').count(), 0);
});
test('teclado: Enter no card abre, Esc fecha e o foco volta ao card', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.focus('.card-morador >> nth=0 >> .morador-abrir');
  await page.keyboard.press('Enter');
  assert.equal(await page.isVisible('#modal-ficha'), true);
  assert.ok(await page.evaluate(() => document.getElementById('modal-ficha').contains(document.activeElement)));
  await page.keyboard.press('Escape');
  assert.ok(await page.evaluate(() => document.activeElement.classList.contains('morador-abrir')));
});
test('Instagram e controles de admin do card ficam acima do botão da ficha', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate((m) => REPSICO.store.salvarItem('moradores', 'dodo', m), FICHA);
  await h.entrar(page);
  const noTopo = (sel) => page.$eval(sel, (el) => { const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); });
  const card = '.card-morador:has(.morador-apelido:text-is("Dodô"))';
  assert.equal(await noTopo(card + ' a.btn-instagram'), true);
  assert.equal(await noTopo(card + ' [data-acao="editar"]'), true);
});
test('morador logado: Editar na ficha abre o formulário do morador', async () => {
  const { page } = await h.novaPagina(browser, srv.url);
  await page.evaluate((m) => REPSICO.store.salvarItem('moradores', 'dodo', m), FICHA);
  await h.entrar(page);
  await page.locator('.card-morador', { hasText: 'Dodô' }).locator('.morador-abrir').click();
  await page.click('#modal-ficha [data-acao="editar-ficha"]');
  assert.equal(await page.isVisible('#modal-ficha'), false);
  assert.equal(await page.inputValue('#modal-form [name="apelido"]'), 'Dodô');
});
test('celular empilha foto e dados e não cria rolagem horizontal, mesmo com textos longos', async () => {
  const L = 'Supercalifragilisticexpialidocious'.repeat(3);
  const { page } = await h.novaPagina(browser, srv.url, { viewport: { width: 360, height: 780 } });
  await page.evaluate((m) => REPSICO.store.salvarItem('moradores', 'dodo', m),
    { ...FICHA, lema: L, caracteristicas: [{ nome: L, estrelas: 3 }], curso: L });
  await page.locator('.card-morador', { hasText: 'Dodô' }).locator('.morador-abrir').click();
  const [foto, dados] = await Promise.all(['.ficha-foto', '.ficha-dados'].map(s => page.locator(s).boundingBox()));
  assert.ok(foto.y + foto.height <= dados.y + 1, 'foto acima dos dados');
  assert.ok(await page.$eval('#modal-ficha .ficha', e => e.scrollWidth <= e.clientWidth + 1));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
});
```

- [ ] **Step 2: Rodar e ver falhar** — `node --test $T/ficha.test.cjs`. Expected: FAIL (o clique não abre `#modal-ficha`).

- [ ] **Step 3: Implementar.**
  - **`htmlMorador`:** ganha o botão de cobertura.
  - **`abrirFicha(id)`:** monta o HTML no `#modal-ficha`, chama `abrirModal(el, origem)`, foca o botão fechar e chama `hidratarImagens(el)`.
  - **`editar-ficha`:** fecha a ficha e chama `abrirFormularioColecao('moradores', id)`.
  - **Estrelas:** `★` em spans `.cheia` (vermelho) e `.vazia` (cinza).
  - **Layout:**
    - ≥ 640 px: grid `minmax(0, 0.9fr) minmax(0, 1.4fr)`;
    - < 640 px: uma coluna, foto em cima.
  - **Visual:**
    - moldura `3px solid #D90429` e fundo "papel" (`--bg-elevado` com textura leve de anéis);
    - lema em Montserrat itálico vermelho (`--accent-text`).

- [ ] **Step 4: Rodar e ver passar** — `node --test $T/ficha.test.cjs && node --test --test-concurrency=4 $T/*.test.cjs && bash $T/rodar-firebase.sh`. Expected: tudo PASS.

- [ ] **Step 5: Revisão visual:** screenshots da ficha em celular e desktop, claro e escuro. Corrigir o que estiver feio.

- [ ] **Step 6: Commit** — `Add resident profile card modal with star ratings and motto`.
