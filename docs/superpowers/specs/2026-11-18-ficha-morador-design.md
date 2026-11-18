# Design curto — Ficha do morador

- **Data:** 2026-11-18
- **Status:** aprovado pelo usuário ("Perfeito, pode seguir")
- **Base:** pedido do usuário (imagem de exemplo de "ficha" no Instagram da casa) + conversa

## Intenção

Na seção Moradores, clicar num card abre uma "ficha do morador" sobreposta à página, no espírito das fichas que a casa posta no Instagram. A ficha mostra a foto à esquerda e os dados à direita, com até 3 características avaliadas em estrelas e o lema do morador.

## Decidido pelo usuário

- **Abrir a ficha:** clicar no card de um morador abre uma janela sobreposta, com foto à esquerda e dados à direita.
- **Características:** até **3**, cada uma com nível de **1 a 5 estrelas**, cadastráveis.
- **Lema do morador:** campo novo, cadastrável.
- **Fora:**
  - vídeo no mural (abandonado);
  - segunda foto (o pedido fala em "a foto").

## Design

**Dados**, dentro do item de `moradores`, sem coleção nova:
- `lema`: texto, opcional.
- `caracteristicas`: `[{ nome, estrelas }]`, no máximo 3, com `estrelas` inteiro de 1 a 5.
- A normalização apara os nomes, descarta os vazios, corta em 3 e limita as estrelas a 1–5.

**Formulário de morador.** Ganha dois campos:
- "Lema do morador" (texto).
- "Características (até 3)": 3 linhas, cada uma com um campo de nome e 5 estrelas clicáveis (rádios estilizados). Uma linha nova começa sem nome e com 3 estrelas, e uma linha sem nome é ignorada.

**A ficha** (`#modal-ficha`), que reutiliza o sistema de modais (foco preso, Esc, clique fora fecha, foco volta ao card):
- **Cabeçalho:** logo + "REPSICO · Ficha do morador" + botão fechar.
- **Coluna esquerda:** a foto (ou as iniciais) em moldura vermelha.
- **Coluna direita:**
  - "NOME: <apelido>" e "ANO: <anoEntrada>";
  - nome completo · curso;
  - selos de categoria, time e Instagram;
  - tabela "CARACTERÍSTICAS | NÍVEL" com estrelas vermelhas (cheias e vazias), com texto acessível "4 de 5";
  - "LEMA DO MORADOR" com o lema entre aspas.
- Campos vazios não aparecem.
- **Celular** (< 640 px): a foto vai para cima e os dados ficam embaixo.
- **Morador logado:** a ficha mostra o botão **Editar**, que abre o formulário do morador.

**Abrir pelo card:** o card ganha um botão que cobre a área de foto e nome (acessível por teclado). O link do Instagram e os controles de admin continuam funcionando separados.

**Visual:**
- Moldura vermelha `#D90429` e estrelas vermelhas.
- Lema em vermelho, Montserrat itálico.
- Fundo "papel": claro no tema claro, grafite no escuro.

## Abordagens consideradas

- **Escolhida:** estender o item `morador` e reutilizar os modais existentes. Funciona igual no modo local, no Firebase e no backup, sem mudança de estrutura.
- **Descartadas:**
  - Página própria por morador (rota com `#`): o pedido é uma janela sobreposta.
  - Coleção separada para características: desnecessária para no máximo 3 itens por morador.

## Deixado para o construtor

Espaçamentos, a textura do "papel" e as animações de abertura.
