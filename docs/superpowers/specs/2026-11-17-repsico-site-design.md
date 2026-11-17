# Design — Site da República REPSICO

- **Data:** 2026-11-17
- **Status:** aguardando aprovação
- **Base:** especificação enviada pelo usuário (seções 1 a 5) + conversa de brainstorming

Marcação usada neste documento:
- **[usuário]** = decidido pelo usuário (na especificação ou na conversa).
- **[minha decisão]** = escolha minha, preenchendo uma lacuna; pode ser corrigida.

---

## 1. Intenção e porquê

Site institucional de **página única** para a República REPSICO, república universitária masculina em Itajubá-MG com mais de 18 anos de história.

- **Objetivo principal [minha leitura, não contestada]:** preencher as vagas mais rápido. O bixo (e os pais) chega pelo link compartilhado no WhatsApp ou no Instagram. Ele entende como a casa funciona, quanto custa e o que está incluso, e chama um responsável no WhatsApp.
- **Objetivo secundário:** vitrine e memória da casa, com moradores, agregados, ex-moradores e rolês.
- **Quem mantém [usuário]:** os próprios moradores, sem programar. Quem souber a **senha única compartilhada** edita tudo direto na página.
- **Custo [usuário]:** zero. Hospedagem no GitHub Pages e plano gratuito (Spark) do Firebase.

## 2. Objetivos

1. Site estático (HTML5 + CSS3 + JavaScript ES6+ puro), sem Node.js, sem framework e sem etapa de build **[usuário]**.
2. **Funciona imediatamente sem Firebase (modo local)** e passa a usar o Firebase quando o `firebaseConfig` for colado no `app.js` **[usuário]**.
3. Login só com senha. Quem acerta edita a página **[usuário]**. No Firebase, a senha nunca aparece no código público **[usuário]**.
4. Todo o conteúdo listado na especificação é editável no Modo Morador. Só a logo é fixa **[usuário]**.
5. **Backup exportar/importar (Plano B) [usuário]:** levar o que foi cadastrado no modo local para o Firebase e servir de seguro contra exclusões acidentais.
6. Mobile-first, tema claro/escuro e carrossel estilo vitrine Steam **[usuário]**.
7. Fotos comprimidas no navegador (lado maior até 800 px, JPEG qualidade 0.75) antes de salvar **[usuário]**.

## 3. Não-objetivos

- Contas individuais, papéis ou permissões diferentes entre moradores.
- Servidor próprio, funções em nuvem ou qualquer etapa de build.
- Firebase Storage ou hospedagem externa de imagens.
- Trocar a logo pelo painel.
- Agendamento de visitas dentro do site. O contato é pelo WhatsApp.
- Blog, notícias, analytics, outros idiomas.

## 4. Anti-objetivos (seria fracasso mesmo "funcionando")

- Visitante ver botões ou controles de edição.
- Qualquer pessoa conseguir alterar o conteúdo público sem a senha.
- Site lento no celular (imagens pesadas, bibliotecas grandes).
- Site quebrado ou em branco enquanto o Firebase não estiver configurado (ou se ele cair).
- Perder conteúdo na migração do modo local para o Firebase.

## 5. Restrições

| Restrição | Consequência no design |
|---|---|
| GitHub Pages só serve arquivos estáticos | Toda lógica roda no navegador. A segurança vem das regras do Firestore. |
| Firestore: máx. **1 MiB por documento** | Cada foto é um documento próprio (coleção `imagens`). O texto fica separado das fotos. |
| Firestore grátis: 1 GiB armazenado, 50 mil leituras/dia, 20 mil gravações/dia | Todo o texto do site num único documento (1 leitura por visita). Fotos carregadas sob demanda (*lazy*). |
| Firebase Storage exige plano pago (Blaze, com cartão) | Fotos em base64 dentro do Firestore, como o usuário pediu. |
| `localStorage` ≈ 5 MB | No modo local, o texto vai para o `localStorage` e as **fotos para o IndexedDB** (centenas de MB). Ver §8.2. |
| `firebaseConfig` é público por natureza | Normal no Firebase. Quem protege são as regras (§8.12). |
| Firebase Auth: senha com no mínimo 6 caracteres | A tela "Trocar senha" valida isso. |
| Arquivos entregues **[usuário]:** `index.html`, `style.css`, `app.js`, `README.md` (+ `logo-repsico.png`) | Todo o JS fica num único `app.js`. Nada de pastas de build. |

## 6. Abordagens consideradas

A decisão central: **como o site roda antes e depois de conectar o Firebase, e o que acontece com o que foi cadastrado antes.**

- **A) Modo local só para teste.** Sem Firebase, o conteúdo inicial aparece e a senha libera edição só naquele navegador. Ao conectar, o Firestore começa do conteúdo inicial.
  - *A favor:* mais simples.
  - *Contra:* tudo o que foi cadastrado antes precisa ser refeito.
- **B) Modo local + backup (exportar/importar).** Igual ao A, mais "Exportar backup" (um arquivo `.json` com tudo, fotos incluídas) e "Importar backup" no painel. **Escolhida pelo usuário.**
  - *A favor:* nada se perde na migração. Também protege contra um "Excluir" errado, já que todos dividem a mesma senha e não existe desfazer.
  - *Contra:* um pouco mais de código e um passo manual na hora de migrar.
- **Descartadas:**
  - Fotos no Firebase Storage: exige plano pago.
  - Serviço externo de imagens (Imgur, Cloudinary): mais contas e chaves para gerenciar.
  - Conteúdo num `dados.json` versionado no GitHub: cada edição exigiria um commit, contrariando "quem tem a senha edita a página".

Escolhas internas de construção, também consideradas **[minha decisão]**:
- **Um documento para todo o texto (`site/conteudo`) vs. um documento por item.**
  - Escolhi um documento único. Cada coleção vira um mapa `{id: item}` e as gravações são feitas **por campo** (`updateDoc` com caminho `moradores.<id>`). Assim, duas pessoas editando itens diferentes não se sobrescrevem.
  - *A favor:* 1 leitura por visita para todo o texto e um único listener em tempo real.
  - *Contra:* limite de 1 MiB para todo o texto, o que é folgado (100 moradores ≈ 50 KB).
- **Fotos embutidas no item vs. fotos em documentos próprios.**
  - Escolhi documentos próprios (`imagens/<id>`), referenciados por id.
  - *Motivo:* um rolê com várias fotos estouraria 1 MiB. E as fotos podem ser carregadas só quando aparecem na tela.

## 7. Decisões do usuário (resumo)

- Paleta: vermelho `#D90429` (hover `#EF233C`), branco e preto.
- Tema claro: fundo `#FFFFFF`, cards `#F8F9FA`, texto `#121214`.
- Tema escuro: fundo `#121214` (sem preto puro), cards `#1C1C21`, texto `#F4F4F5`. A preferência fica salva no `localStorage`, com botão Sol/Lua na barra superior.
- Fontes: Montserrat (títulos) e Inter (textos), pelo Google Fonts.
- Logo fixa `logo-repsico.png` na navbar, no favicon e no rodapé, sem edição pelo painel.
- Navbar fixa com logo + "REPSICO" e os links Home, A Casa, Moradores, Eventos & Rolês, Localização e FAQ (rolagem suave). Tem também o botão de tema e o botão discreto "Área do Morador" (cadeado).
- Login: modal só com senha. Por baixo, Firebase Auth com e-mail interno fixo + a senha digitada. Fallback local quando não há Firebase.
- Seções, conteúdos iniciais, CRUDs, ferramentas do painel e README conforme a especificação (detalhadas abaixo).
- **Telefones e contatos são totalmente cadastráveis.** Os do Thiago e do Lucas entram só como exemplo inicial.
- Plano B (backup).

## 8. Design

### 8.1 Arquivos

```
index.html           estrutura da página, metatags, modais vazios
style.css            temas (variáveis CSS), layout mobile-first, componentes
app.js               configuração no topo + toda a lógica
logo-repsico.png     a logo enviada, otimizada para 512×512 (~40 KB)
README.md            guia objetivo (§8.13)
docs/superpowers/…   este design e o plano (não afetam o site)
```

- **Origem da logo:** a imagem anexada pelo usuário na conversa.
  - Original: PNG 1024×1024, RGB sem transparência. É o selo redondo preto e branco com "REPÚBLICA REPSICO" sobre fundo vermelho.
  - No site: reduzida para 512×512 e otimizada.
  - Como tem fundo vermelho próprio, funciona igual nos dois temas. Na navbar e no rodapé aparece com cantos arredondados.

- **[minha decisão]** `app.js` é um **script clássico** (`<script src="app.js" defer>`), não um módulo. O SDK do Firebase é carregado com `import()` dinâmico **só quando o `firebaseConfig` estiver preenchido**.
  - Efeito 1: o modo local funciona até abrindo o `index.html` com dois cliques (`file://`).
  - Efeito 2: no modo local, nenhum byte do Firebase é baixado.
- **[minha decisão]** SDK do Firebase fixado numa versão exata com pelo menos 2 semanas de publicação (hoje: **12.19.0**). URL: `https://www.gstatic.com/firebasejs/<versão>/firebase-{app,firestore,auth}.js`.

Topo do `app.js`, com comentários explicando cada item:

```js
// 1) Cole aqui o firebaseConfig (Console Firebase → Configurações do projeto → Seus apps → Web).
//    Vazio = MODO LOCAL (dados salvos só neste navegador).
const firebaseConfig = { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" };
// 2) E-mail do usuário único dos moradores no Firebase Authentication (o mesmo das regras do Firestore).
const EMAIL_MORADORES = "moradores@repsico.com";
// 3) Senha padrão do MODO LOCAL: "repsico" (guardada como hash SHA-256; só vale sem Firebase).
const SENHA_LOCAL_HASH = "<sha256('repsico')>";
```

O Firebase está "ativo" quando `firebaseConfig.apiKey` e `firebaseConfig.projectId` estão preenchidos.

### 8.2 Camada de dados: modo local e modo Firebase

Uma interface única, `store`, com duas implementações escolhidas automaticamente. O resto do código não sabe qual está em uso.

```
store.modo                      'local' | 'firebase'
store.iniciar(aoMudar)          carrega o conteúdo e chama aoMudar(conteudo) a cada mudança
store.salvarItem(colecao, id, dados)
store.excluirItem(colecao, id)
store.salvarConfig(parcial)     mescla campos em conteudo.config
store.reordenar(colecao, [[id, ordem], …])
store.salvarImagem(dataUrl) → id
store.lerImagem(id) → dataUrl   (com cache em memória e deduplicação de pedidos)
store.excluirImagem(id)
store.substituirTudo(conteudo, imagens, aoProgresso)   usado pelo Importar backup
auth.entrar(senha) / auth.sair() / auth.aoMudar(cb) / auth.trocarSenha(nova)
```

**Modo local:**
- Texto em `localStorage['repsico:conteudo']` (JSON). Fotos em **IndexedDB** (banco `repsico`, store `imagens`, chave = id).
- **[minha decisão]** IndexedDB em vez de `localStorage` para as fotos. Os ~5 MB do `localStorage` acabam com umas 40 fotos, o que inviabilizaria o Plano B.
- Sem conteúdo salvo, usa o conteúdo inicial (§9).
- Erros de cota viram aviso amigável: "Espaço local cheio — conecte o Firebase".

**Modo Firebase:**
- Texto no documento `site/conteudo` (Firestore), com `onSnapshot`: edições de outro morador aparecem ao vivo.
- Fotos em `imagens/{id}` = `{ data: "data:image/jpeg;base64,…", criadoEm }`.
- Gravações por campo: `updateDoc(ref, {"moradores.<id>": dados})`. Exclusão com `deleteField()`. Configuração com `"config.<campo>"`.
- Se `site/conteudo` ainda não existe:
  - Visitantes veem o conteúdo inicial.
  - No primeiro login de morador, o conteúdo inicial é gravado no Firestore (`setDoc`).
- **[minha decisão]** Resiliência: a cada snapshot, o texto é guardado em `localStorage['repsico:cache']`. Se o Firebase não carregar (rede, CDN bloqueada, config errada), o site mostra o cache, ou o conteúdo inicial se não houver cache. Para o morador logado aparece um aviso.
- **Normalização:** todo conteúdo lido (de qualquer fonte, inclusive backup) passa por `normalizar()`. Essa função garante todas as coleções e completa `config` com os padrões do conteúdo inicial, o que protege contra campos novos em versões futuras.

### 8.3 Modelo de dados

```
conteudo = {
  versao: 1,
  config: {
    vagasAbertas: true,
    valorMensal: 900,
    itensInclusos: [string],                       // lista do card de transparência
    funcionaria: { nome, descricao, refeicoes },
    textos: { chamada,                              // 1ª linha do texto de divulgação (§8.9)
              sobreTitulo, sobreTexto,
              vagasAbertasTitulo, vagasAbertasTexto,
              casaCompletaTitulo, casaCompletaTexto,
              mascotesTitulo, mascotesSubtitulo },
    endereco: { rua, cidade, distancias },          // distancias = "2 min da UNIFEI • 8 min do Centro"
    instagram: "repsicoitajuba"
  },
  slides:       { [id]: { tag, titulo, descricao, destaque, botaoTexto, botaoLink, imagem, somenteComVagas, ordem } },
  diferenciais: { [id]: { icone, titulo, texto, ordem } },
  galeria:      { [id]: { imagem, legenda, ordem } },
  mascotes:     { [id]: { nome, descricao, foto, ordem } },
  moradores:    { [id]: { apelido, nome, curso, anoEntrada, time, categoria, instagram, foto } },
  eventos:      { [id]: { titulo, descricao, fotos: [idImagem], ordem } },
  contatos:     { [id]: { nome, apelido, telefone, ordem } },
  faq:          { [id]: { pergunta, resposta, ordem } }
}
```

Regras dos campos:
- `categoria` ∈ `"morador" | "agregado" | "ex"`.
- `imagem`, `foto` e `fotos[]` guardam **ids** de `imagens`, ou `null`.
- Ids: `Date.now().toString(36) + aleatório`, só alfanuméricos (seguros em caminhos do Firestore).
- **Ordem:** item novo recebe `max(ordem) + 1`. No Modo Morador, coleções ordenáveis têm botões ↑ ↓ que trocam a `ordem` com o vizinho **[minha decisão]**.
  - Ordenáveis: slides, diferenciais, galeria, mascotes, eventos, contatos, faq.
  - Moradores têm ordenação automática: categoria (morador → agregado → ex), depois ano de entrada e depois apelido.
- **Obrigatórios:**
  - Slide: título.
  - Morador: apelido e categoria.
  - Rolê: título.
  - Contato: nome e telefone.
  - FAQ: pergunta e resposta.
  - Diferencial: título.
  - Mascote: nome.
  - Foto da galeria: imagem.

### 8.4 Imagens

- `comprimirImagem(arquivo)`:
  - Decodifica e desenha num `<canvas>` com o lado maior ≤ 800 px, sem ampliar fotos menores.
  - Pinta o fundo de branco (PNG transparente não fica preto).
  - Exporta com `toDataURL('image/jpeg', 0.75)`.
  - Formato não suportado (ex.: HEIC no Chrome desktop) gera mensagem clara.
- Lazy loading: os templates usam `<img data-img="<id>">`. Um `IntersectionObserver` busca a foto em `store.lerImagem(id)` quando ela se aproxima da tela, com placeholder até lá.
- Higiene:
  - Ao trocar ou remover a foto de um item, ou ao excluir o item, as imagens antigas são apagadas **depois** de o item ser salvo.
  - Limite de **12 fotos por rolê** **[minha decisão]**.
- Galeria: "+ Adicionar fotos" aceita **várias de uma vez**. Cada foto vira um item com legenda vazia, que pode ser editada depois.

### 8.5 Autenticação ("Área do Morador")

- O modal tem só um campo de senha (com mostrar/ocultar), o botão "Entrar" e uma área de erro em português (senha errada, muitas tentativas, sem conexão).
- **Firebase:**
  - Login com `signInWithEmailAndPassword(auth, EMAIL_MORADORES, senha)`.
  - É morador quem estiver logado com o e-mail `EMAIL_MORADORES`.
  - A sessão persiste no aparelho até clicar em "Sair" (padrão do Firebase).
- **Local:**
  - Compara o SHA-256 da senha (`crypto.subtle`) com `SENHA_LOCAL_HASH`, ou com o hash trocado salvo em `localStorage['repsico:senhaLocal']`.
  - Sessão em `localStorage['repsico:sessao']`.
  - O modal avisa: "Modo local: as alterações ficam salvas só neste navegador."
- **[minha decisão]** **Trocar senha** no painel:
  - No Firebase, usa `updatePassword` (mín. 6 caracteres, com confirmação). Se o Firebase pedir login recente, pede para entrar de novo.
  - No local, salva o novo hash neste navegador.
  - *Motivo:* quando alguém sai da casa, a senha compartilhada precisa mudar.
- Estado logado:
  - Adiciona a classe `is-admin` no `<body>`, o que mostra os controles `.admin-only` (o CSS os esconde por padrão).
  - Exibe a barra do morador.
  - O botão da navbar vira "Sair" (cadeado aberto).

### 8.6 Backup (Plano B)

- **Exportar:** baixa `repsico-backup-AAAA-MM-DD.json`:
  ```json
  { "app": "repsico", "formato": 1, "exportadoEm": "ISO", "conteudo": {…}, "imagens": { "<id>": "data:image/jpeg;base64,…" } }
  ```
  Inclui só as imagens referenciadas pelo conteúdo. No Firebase, cada uma é buscada por id.
- **Importar:** escolher o arquivo, validar `app`/`formato` e normalizar. Depois vem a confirmação: "Isto substitui TODO o conteúdo atual do site. Continuar?". Em seguida:
  1. Grava as imagens, no máximo 3 por vez, com progresso ("Enviando fotos 12/40").
  2. Grava o conteúdo, sobrescrevendo.
  3. Apaga as imagens que o conteúdo anterior usava e o novo não usa.

  Funciona igual nos dois modos.
- **Fluxo de migração (documentado no README):**
  1. No navegador onde cadastraram em modo local: Exportar.
  2. Colar o `firebaseConfig`, criar o usuário e as regras.
  3. Entrar e Importar.

### 8.7 A página

Ordem das seções (ids das âncoras entre parênteses):

```
Navbar fixa
1. Carrossel de novidades estilo Steam   (#home)
2. Faixa de status de vagas
3. A Casa                                (#casa)
   história · diferenciais (+ card Equipe) · card de transparência financeira · galeria · mascotes
4. Moradores                             (#moradores)
5. Eventos & Rolês                       (#eventos)
6. Localização & contatos                (#localizacao)
7. FAQ                                   (#faq)
Rodapé
[Barra do Morador — só logado]  [modais: login, formulário, confirmação, configurações, lightbox]  [toasts]
```

**Navbar.**
- Desktop:
  ```
  [logo] REPSICO   Home  A Casa  Moradores  Eventos & Rolês  Localização  FAQ    ☀/☾   🔒 Área do Morador
  ```
- Mobile: `[logo] REPSICO … ☀ 🔒 ☰`. O menu ☰ abre os links e fecha ao clicar num deles.
- Rolagem suave com `scroll-margin-top` igual à altura da navbar.
- O link da seção visível fica destacado **[minha decisão]**.

**1. Carrossel estilo Steam.**
- Desktop:
  ```
      ┌──────────────────────────────────┬────────────────────┐
   ‹  │                                  │ [VAGAS]            │  ›
      │      FOTO GRANDE (≈16:9)         │ Vagas abertas a    │
      │                                  │ 2 min da UNIFEI    │
      │                                  │ descrição breve…   │
      │                                  │ [Quero uma vaga →] │
      └──────────────────────────────────┴────────────────────┘
                              ▬ ▬ ▬
  ```
- Mobile: foto em cima (16:10) com setas sobrepostas, painel embaixo e indicadores no fim.
- Comportamento:
  - Transição em fade.
  - Autoplay a cada 6 s, pausado com mouse em cima, com foco dentro, com a aba oculta ou com `prefers-reduced-motion`.
  - Swipe no toque. Setas do teclado quando o carrossel tem foco.
- Slide sem foto: placeholder da marca, com degradê vermelho, **anéis concêntricos** (referência aos olhos em espiral da logo) e o texto `destaque` em tamanho gigante (ex.: "2 MIN"). Sem `destaque`, aparece a logo **[minha decisão]**.
- `botaoLink`: âncora (`#localizacao`) ou URL (abre em nova aba).
- **[minha decisão]** Slide com `somenteComVagas` ("Mostrar só quando houver vagas") some do carrossel para visitantes quando a casa está completa. O morador ainda o vê, com a marcação "oculto: casa completa". Assim o slide "Vagas abertas" não contradiz a faixa.

**2. Faixa de vagas** (controlada por `config.vagasAbertas`):
- **Abertas (padrão):** faixa vermelha com ponto pulsante e "VAGAS ABERTAS NA REPSICO! Venha fazer parte da nossa família". O botão "Agendar visita no WhatsApp" abre o WhatsApp do **primeiro contato** (pela ordem) com a mensagem padrão. Sem contatos, rola até #localizacao.
- **Casa completa:** faixa neutra com "Casa Completa no Momento — Acompanhe nossos rolês no Instagram @repsicoitajuba" e botão para o Instagram.
- Textos editáveis em Configurações.

**3. A Casa.**
- História: `sobreTitulo` + `sobreTexto`.
- Grid de diferenciais: card com ícone + título + texto. Ícone escolhido numa lista fixa de SVGs inline:
  - pin, casa, controle de videogame, wi-fi, chapéu de chef, talheres, pessoas, pata, chama, TV, cama, chuveiro, escudo, estrela, coração, música.
- Por último no grid fica o card destacado **"Comodidade & Equipe"**, montado a partir de `config.funcionaria` (nome, descrição, refeições). O botão "editar" dele abre as Configurações na parte da funcionária.
- **Card de transparência financeira:** "R$ 900,00 /mês" em destaque (formatado com `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`), o subtítulo "valor médio · tudo incluso" e um checklist de `itensInclusos`.
- **Galeria:**
  - Grade de quadrados (`object-fit: cover`) com legenda opcional. O clique abre o lightbox.
  - **Visitante não vê a galeria se ela estiver vazia** [minha decisão]. O morador vê o estado vazio com "+ Adicionar fotos".
- **Mascotes:** card carismático com `mascotesTitulo` ("Zé e Mingau") e `mascotesSubtitulo` ("Os verdadeiros donos da casa"). Mini-cards com foto redonda (placeholder de pata), nome e descrição. Dá para adicionar, editar e remover mascotes.

**4. Moradores.**
- Filtros (chips com contagem): Todos · Moradores Atuais · Agregados · Ex-Moradores.
- Card do morador:
  - Foto 1:1. Sem foto, placeholder com as iniciais do apelido sobre degradê + anéis.
  - **Apelido** grande e nome completo.
  - Curso · "desde <ano>".
  - Badge do time.
  - Badge da categoria.
  - Botão "@usuario" para `https://instagram.com/<usuario>` em nova aba.
- Campos vazios simplesmente não aparecem.
- **[minha decisão]** O badge do time usa as cores do clube para os ~20 clubes mais populares do Brasil (mapa nome → cores). Para os outros, estilo neutro.
- Instagram aceita `@user`, `user` ou URL completa e guarda só `user`.
- Filtro sem resultado: "Nenhum agregado cadastrado ainda."

**5. Eventos & Rolês.**
- Card: fotos num carrossel interno (`scroll-snap` nativo + setas no desktop + pontinhos), nome do rolê e descrição. O clique na foto abre o lightbox com todas as fotos do rolê.
- Sem fotos: placeholder da marca.
- Grade: 1 coluna no celular, 2 no tablet e no desktop.

**6. Localização & contatos.**
- Card com o endereço (`rua`, `cidade`), o botão "Copiar endereço", o selo de distâncias e o link "Abrir no Google Maps".
- Mapa: `<iframe loading="lazy" src="https://www.google.com/maps?q=<endereço codificado>&output=embed">`, sem chave de API.
- Contatos: um card por responsável, com nome (apelido), telefone e o botão "Chamar no WhatsApp".
- **Link do WhatsApp:** os dígitos do telefone vão para `https://wa.me/55<DDD+número>` (sem duplicar o `55` se ele já vier). O texto é `encodeURIComponent("Fala <Apelido>! Vi o site da REPSICO e gostaria de tirar dúvidas / marcar uma visita.")`, usando o nome quando não houver apelido.
- **[minha decisão]** O telefone é formatado ao sair do campo: `(DD) 9XXXX-XXXX` com 11 dígitos ou `(DD) XXXX-XXXX` com 10. Caso contrário, fica como digitado.

**7. FAQ.** Acordeão com `<details>/<summary>` (acessível por padrão), com abrir/fechar animado.

**Rodapé.** Logo + REPSICO + frase curta, link do Instagram @repsicoitajuba, endereço, links das seções, "Área do Morador" (discreto) e "© <ano atual> República REPSICO · Itajubá-MG".

**Lightbox (genérico).**
- Usado na galeria e nos rolês.
- Tem anterior/próximo, contador "3 / 8", legenda e fechar.
- Responde a Esc, às setas do teclado e a swipe, e trava a rolagem da página.

### 8.8 Modo Morador

**Barra do Morador** (fixa no rodapé da tela, escura nos dois temas; no celular rola na horizontal, com ícone + rótulo curto):

```
● Firebase | Vagas: [■ Abertas] | ⚙ Configurações | ⧉ Divulgação | ⇩ Exportar | ⇧ Importar | 🔑 Senha | ⎋ Sair
```

1. Indicador de modo: "Firebase" ou "Local (só neste navegador)".
2. **Toggle Vagas Abertas / Casa Completa** (switch). Grava `config.vagasAbertas` na hora.
3. **Configurações gerais:** modal com grupos:
   - Valores: valor mensal e itens inclusos (um por linha).
   - Funcionária: nome, descrição e refeições.
   - Textos: sobre, faixas de vagas e mascotes.
   - Endereço & redes: rua, cidade, distâncias e Instagram.
4. **Copiar texto de divulgação (WhatsApp)** (§8.9).
5. Exportar / Importar backup (§8.6).
6. Trocar senha (§8.5).
7. Sair.

**Edição na própria página:**
- Cada seção ganha botões "+ Cadastrar…" ("+ Cadastrar Morador", "+ Cadastrar Novo Rolê" etc.).
- Cada item ganha botões pequenos: editar, excluir e, nas coleções ordenáveis, ↑ ↓.
- Cards vindos de `config` (história, financeiro, funcionária, faixa de vagas, cabeçalho dos mascotes) ganham "editar", que abre as Configurações no grupo certo.

**Formulário genérico:**
- Um só componente de modal montado a partir de uma lista de campos.
- Tipos de campo: texto, textarea, número, telefone, select, ícone, imagem única e várias imagens.
- Campo de imagem: prévia, "Escolher foto" e "Remover". O status "Comprimindo…" aparece durante a compressão.
- Campo de várias imagens: miniaturas com × e "Adicionar fotos" (múltiplas).
- Ao salvar:
  1. Grava as imagens novas e obtém os ids.
  2. Grava o item.
  3. Apaga as imagens removidas.
  4. Mostra o toast "Salvo!".

**Exclusões:** sempre pedem confirmação num modal próprio (não o `confirm()` do navegador).

**Erros:**
- Sem permissão: "Sua sessão expirou — entre de novo".
- Também aparecem como toast: sem rede, cota cheia.

### 8.9 Texto de divulgação (WhatsApp)

Gerado a partir do conteúdo atual e copiado com `navigator.clipboard.writeText`. Se não der, usa `textarea` + `execCommand('copy')`. Se ainda assim falhar, abre um modal com o texto selecionado. Modelo:

```
🔴⚫ *VAGAS ABERTAS NA REPSICO!* ⚫🔴
<textos.chamada>

📍 <rua> — <distancias>
<para cada diferencial, em ordem: emoji do ícone + *título:* texto>
👩‍🍳 *<funcionaria.nome>:* <funcionaria.descricao>
🍽️ <funcionaria.refeicoes>
🐾 Mascotes: <nomes dos mascotes>

💰 *<valor formatado>/mês — tudo incluso*

📲 Agende sua visita:
• <nome> (<apelido>): <telefone> — wa.me/<dígitos>
…
🌐 <URL atual do site, omitida quando aberto via file://>
📸 Instagram: @<instagram>
```

Com a casa completa, o título vira "*REPSICO — República masculina em Itajubá-MG*", sem "vagas abertas".

**[minha decisão]** Nenhum fato da casa fica fixo no modelo: a linha de apresentação vem de `textos.chamada`, editável em Configurações → Textos. Assim o "mais de 18 anos" não fica desatualizado no código.

### 8.10 Visual, tema e acessibilidade

- **Tokens CSS** em `:root[data-theme="light"]` e `:root[data-theme="dark"]`: `--bg`, `--bg-card`, `--text`, `--text-muted`, `--border`, `--accent` (`#D90429`), `--accent-hover` (`#EF233C`) e `--accent-text`.
  - **[minha decisão]** `--accent-text` é a cor de textos pequenos em vermelho. No escuro, usa um vermelho mais claro (ex.: `#FF4D6D`): o `#D90429` sobre `#121214` só tem contraste 3,6:1, abaixo do mínimo de 4,5:1 para texto pequeno. Botões vermelhos com texto branco mantêm `#D90429` (5,2:1).
- **Tema inicial:** um script inline no `<head>` aplica o tema antes de desenhar a página (sem "piscar"). Usa `localStorage['repsico:tema']` ou, se não houver, a preferência do sistema.
- **Fontes:** Montserrat 700/800/900 e Inter 400/500/600 do Google Fonts, com `preconnect` e `display=swap`.
- **Ícones:** SVG inline (estilo traço, `currentColor`), sem biblioteca externa. Inclui os glifos do WhatsApp e do Instagram.
- **Responsividade:** mobile-first, com breakpoints aproximados em 640 / 900 / 1200 px e conteúdo limitado a ~1200 px.
- **Acessibilidade:**
  - Landmarks semânticos, `aria-label` em botões só de ícone e foco visível.
  - Modais com foco preso, Esc para fechar e devolução do foco.
  - `alt` nas imagens. Contraste AA.
  - Respeito a `prefers-reduced-motion`.
- **Metatags:** `lang="pt-BR"`, description, `theme-color` `#D90429`, favicon e apple-touch-icon com a logo.
- **[minha decisão] Open Graph** (prévia bonita quando o link é colado no WhatsApp): `og:image` com URL absoluta `https://lucaspivoto.github.io/Republica-Repsico/logo-repsico.png`. O README avisa para ajustar se a URL mudar.
- `<noscript>` com um aviso simples.

### 8.11 Desempenho

- Sem frameworks. HTML + CSS + JS somam bem menos de 150 KB sem compressão. A logo tem ~40 KB.
- Fotos só sob demanda (lazy). O mapa tem `loading="lazy"`. Firebase só quando configurado.
- Re-renderizar uma seção não reinicia o carrossel (mantém o slide atual).

### 8.12 Segurança — regras do Firestore (vão prontas no README)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function ehMorador() {
      return request.auth != null
          && request.auth.token.email == 'moradores@repsico.com';
    }
    match /site/{doc}     { allow read: if true; allow write: if ehMorador(); }
    match /imagens/{id}   { allow read: if true; allow write: if ehMorador(); }
  }
}
```

- As regras verificam **o e-mail**, e não "qualquer usuário logado": com a configuração pública, qualquer pessoa conseguiria criar uma conta própria. O README também recomenda desativar "Criação de contas" em Authentication → Configurações.
- **[minha decisão] E-mail do login:** o padrão continua `moradores@repsico.com`, o exemplo da especificação.
  - No passo do Firebase, o README pede para **escolher o e-mail antes de criar o usuário** e recomenda um que a casa controla (ex.: o Gmail da república).
  - *Motivo:* qualquer pessoa pode pedir "redefinir senha" para esse e-mail. Se o domínio `repsico.com` for de outra pessoa, ela receberia o link.
  - O README mostra exatamente as duas linhas a trocar: a constante no `app.js` e a linha das regras.
  - **Recuperação de senha:**
    - Com e-mail real, pelo e-mail de redefinição do Firebase.
    - Caso contrário, excluindo e recriando o usuário no console com o mesmo e-mail. As regras checam o e-mail, então nada mais muda.
- Todo texto vindo do conteúdo é escapado (`escapeHtml`) antes de ir para o `innerHTML`. Links de Instagram, WhatsApp e `botaoLink` são montados e validados (só `http(s):`, `#âncora` ou `wa.me`).

### 8.13 README (em português, objetivo)

1. O que é o site e os arquivos.
2. **Logo:** `logo-repsico.png` na raiz (já incluída). Para trocar, substitua o arquivo mantendo o nome.
3. **Testar já, sem Firebase:** abrir o `index.html` ou usar um servidor local. A senha do modo local é `repsico`.
4. **Publicar no GitHub Pages:** Settings → Pages → *Deploy from a branch* → branch + `/ (root)` → URL `https://lucaspivoto.github.io/Republica-Repsico/`.
5. **Firebase em 3 minutos:**
   1. Criar o projeto e adicionar um app Web.
   2. Colar o `firebaseConfig` no `app.js`.
   3. Criar o Firestore e colar as regras.
   4. Authentication → E-mail/senha → adicionar o usuário `EMAIL_MORADORES` com a senha da casa.
   5. (Recomendado) Desativar a criação de contas.
6. **Migrar o que foi feito no modo local** (Plano B).
7. **Trocar a senha,** e o que fazer se esquecerem (excluir e recriar o usuário no console com o mesmo e-mail).
8. Limites do plano gratuito, de forma prática.
9. Por que o `firebaseConfig` público não é problema.

## 9. Conteúdo inicial (pré-populado)

Fatos dados pelo usuário entram literalmente. O que não foi dado está marcado como **exemplo genérico** e deve ser revisado pelos moradores pelo painel.

- **Slides (3):**
  1. `VAGAS` · "Vagas abertas a 2 min da UNIFEI" · destaque "2 MIN" · botão "Quero uma vaga" → `#localizacao` · `somenteComVagas: true`.
  2. `TRADIÇÃO` · "Mais de 18 anos de história e festas" · destaque "18+ ANOS" · "Ver os rolês" → `#eventos`.
  3. `A CASA` · "Infraestrutura completa, lazer e mascotes" · destaque "TUDO INCLUSO" · "Conhecer a casa" → `#casa`.

  Descrições curtas usam só fatos da especificação. **Sem preço no texto dos slides**, para não ficar desatualizado quando o valor mudar.
- **Config:**
  - Vagas abertas: sim. Valor: 900.
  - Itens inclusos (exemplo genérico a revisar): aluguel e contas da casa; internet fibra 800MB; Dona Zilda de seg. a sex.; almoço e janta de seg. a sex.; streamings.
  - Funcionária: Dona Zilda. "De segunda a sexta: limpa, cozinha, lava e passa roupa." / "Almoço e janta inclusos de segunda a sexta, com cardápio variado."
  - Chamada (divulgação): "República masculina em Itajubá-MG com mais de 18 anos de história."
  - Sobre: "República Masculina com mais de 18 anos de tradições, festas, risadas e apoio em Itajubá." (+ 1–2 frases no mesmo tom).
  - Textos das faixas: conforme a especificação.
  - Endereço: Rua Coronel Francisco Braz, 1256 · Itajubá - MG · "2 min da UNIFEI • 8 min do Centro".
  - Instagram: `repsicoitajuba`.
- **Diferenciais (4 + card Equipe):**
  - Localização: 2 min da UNIFEI e 8 min do centro.
  - Estrutura: casa mobiliada, 5 quartos (1 suíte), 3 banheiros.
  - Lazer: área de churrasco, quintal amplo, sinuca, PS3, PS4 e todos os streamings.
  - Internet: fibra óptica 800MB com 2 pontos pela casa.
- **Mascotes:** Zé e Mingau, sem foto, com descrições curtas e bem-humoradas que **não dependem da espécie** (exemplo genérico).
- **Moradores [minha decisão]:** Pantufa (Thiago) e Dodô (Lucas), categoria "morador", demais campos vazios. Não invento curso nem time de pessoas reais.
- **Contatos:** Thiago (Pantufa) — (35) 9191-5374; Lucas (Dodô) — (19) 99977-8860. Ficam como digitados pelo usuário, que disse serem exemplos.
- **Rolês (exemplo genérico):** 2 rolês típicos de república (ex.: churrasco de boas-vindas aos bixos; resenha da casa), sem fotos, para trocar pelos de verdade.
- **FAQ (exemplo genérico a revisar), 6 perguntas:**
  - Período de agregado.
  - Mobília nos quartos.
  - Divisão de contas.
  - Rotina da casa.
  - O que está incluso.
  - Como agendar visita / pais podem visitar.

  As respostas não citam o valor em reais (ele já aparece no card financeiro).
- **Galeria:** vazia.

## 10. Verificação

**[minha decisão]** Os testes rodam neste ambiente com Playwright (Chromium) e um servidor estático. **Os scripts de teste não entram no repositório**, que continua sem Node.

- **Celular (390×844) e desktop (1366×900), nos dois temas:** screenshots revisadas e sem rolagem horizontal.
- **Modo local, ponta a ponta:**
  - Visitante não vê controles.
  - Login com `repsico` (e senha errada rejeitada).
  - CRUD de cada coleção.
  - Upload: a imagem salva é JPEG com lado ≤ 800 px.
  - Lightbox, controles e pausa do carrossel.
  - Toggle de vagas e configurações refletindo na página.
  - Texto de divulgação com os valores atuais.
  - Exportar, limpar o armazenamento, importar e conferir o conteúdo restaurado.
  - Trocar senha. Sair.
- **Modo Firebase:**
  - Contra o **Firebase Emulator Suite** local (Java disponível aqui). Para isso, um gancho de teste (`window.__REPSICO_EMULADOR__`, ignorado em produção) faz o SDK apontar para o emulador.
  - O SDK é servido a partir do pacote npm `firebase` da mesma versão, porque o `gstatic.com` está bloqueado neste ambiente.
  - Cobre login, edições, tempo real, importação de backup e as **regras**: visitante e outra conta não gravam, a conta dos moradores grava.
  - Se o emulador não puder rodar aqui, isso será dito claramente e o README trará um roteiro curto de checagem para fazerem com o projeto real.

## 11. Decisões minhas para revisar

1. Um documento só para todo o texto + fotos em documentos próprios (§6, §8.2).
2. Fotos do modo local no IndexedDB, não no `localStorage` (§8.2).
3. `app.js` como script clássico com `import()` dinâmico do Firebase, abrindo até por `file://` (§8.1).
4. Botão "Trocar senha" (§8.5) e senha padrão `repsico` no modo local.
5. `EMAIL_MORADORES` padrão `moradores@repsico.com`, com o README recomendando um e-mail que a casa controla e explicando a recuperação de senha nos dois casos (§8.12).
6. Reordenar itens com ↑ ↓ (§8.3); limite de 12 fotos por rolê (§8.4).
7. Galeria escondida para visitantes quando vazia; placeholders da marca quando não há foto (§8.7).
8. Badges de time com cores dos clubes (§8.7).
9. Seeds genéricos (rolês, FAQ, itens inclusos, mascotes) e Pantufa/Dodô como moradores iniciais (§9).
10. Open Graph apontando para `lucaspivoto.github.io/Republica-Repsico` (§8.10).
11. Cache do último conteúdo para quando o Firebase não carregar (§8.2).
12. Testes fora do repositório (§10).
13. Slides "só com vagas" somem quando a casa está completa (§8.7).
14. Linha de apresentação da divulgação editável (`textos.chamada`) em vez de fixa no código (§8.9).

## 12. Deixado para o construtor

- Detalhes visuais finos: espaçamentos, sombras, raios, animações de entrada, breakpoints exatos.
- Redação dos textos genéricos do conteúdo inicial, sem inventar fatos sobre a casa além dos da especificação.
- Desenho dos ícones SVG e do mapa de cores dos times.
- Organização interna do `app.js` (seções comentadas) e redação das mensagens de erro e dos toasts.
