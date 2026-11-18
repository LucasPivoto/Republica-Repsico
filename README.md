# República REPSICO — site oficial

Site de uma página da República REPSICO (república masculina em Itajubá-MG). Visitantes navegam sem login. Os moradores entram com a **senha da casa** e editam tudo direto na página: slides, vagas, fotos, moradores, rolês, contatos, FAQ, valores e textos.

- **Hospedagem:** GitHub Pages, de graça. São só arquivos estáticos, sem Node.js e sem etapa de build.
- **Dados na nuvem:** Firebase (Firestore + Authentication), plano gratuito.
- **Antes de configurar o Firebase:** o site já funciona no **modo local** (detalhes abaixo).

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página |
| `style.css` | Visual, temas claro/escuro e celular |
| `app.js` | Toda a lógica. As **configurações ficam no topo do arquivo** |
| `logo-repsico.png` | Logo fixa: navbar, rodapé, ícone da aba e prévia no WhatsApp |
| `docs/` | Design e plano do projeto (não afetam o site) |

---

## 1. Logo

A logo já está na raiz como `logo-repsico.png`. Para trocar, salve a nova imagem **na raiz, com o mesmo nome** `logo-repsico.png`, de preferência PNG quadrado com cerca de 512×512. A logo não é editável pelo painel.

## 2. Testar agora, sem Firebase (modo local)

1. Abra o `index.html` com dois cliques, ou rode um servidor local:
   ```bash
   python3 -m http.server 8000
   ```
   e acesse `http://localhost:8000`.
2. Clique em **Área do Morador** (cadeado) e use a senha **`repsico`**.

> No modo local, as alterações ficam salvas **só no navegador de quem editou**. Os visitantes continuam vendo o conteúdo inicial. Serve para testar e para ir cadastrando. Depois, leve tudo para o Firebase com o backup (seção 5).

> ⚠️ Exporte o backup do modo local **antes** de colar o `firebaseConfig` e publicar. Depois disso o site passa a usar o Firebase e não enxerga mais o que foi salvo no navegador. Na Área do Morador, use **Exportar** e guarde o arquivo `.json`.

## 3. Publicar no GitHub Pages

1. Coloque os arquivos na branch `main` do repositório.
2. No GitHub, vá em **Settings → Pages**.
3. Em **Build and deployment**, escolha **Source: Deploy from a branch**.
4. Selecione **Branch: `main`** e a pasta **`/ (root)`** e clique em **Save**.
5. Em cerca de 1 minuto o site fica no ar em `https://repsico.github.io/`.
   - O endereço vem do nome da organização (`repsico`).
   - Como o repositório se chama `repsico.github.io`, o site fica na raiz, sem nada depois da barra.

> A prévia do link no WhatsApp usa a logo pelo endereço acima (`og:url` e `og:image` no `index.html`). Se o endereço mudar (domínio próprio, outro repositório), atualize essas duas linhas.

## 4. Firebase grátis em 3 minutos

1. Acesse <https://console.firebase.google.com> e clique em **Adicionar projeto**. O Google Analytics não é necessário.
2. **Ligue o app Web:**
   1. Vá em **⚙ Configurações do projeto → Seus apps** e clique no ícone **`</>` (Web)**.
   2. Registre o app e copie o objeto `firebaseConfig`.
   3. Cole no topo do `app.js`, preenchendo os campos vazios.
3. **Crie o banco:**
   1. Vá em **Build → Firestore Database → Criar banco de dados**.
   2. Escolha **modo de produção** e, de preferência, a região `southamerica-east1` (São Paulo).
   3. Na aba **Regras**, cole as regras abaixo e clique em **Publicar**.
4. **Ative o login:** vá em **Build → Authentication → Começar** e ative **E-mail/senha**.
5. **Crie o usuário dos moradores:**
   1. Vá em **Authentication → Users → Adicionar usuário**.
   2. Use o e-mail escrito em `EMAIL_MORADORES` no `app.js`: hoje é `repsicounifei@gmail.com`, o Gmail da república (veja o quadro abaixo).
   3. Defina a **senha da casa**, com no mínimo 6 caracteres.
6. **(Recomendado) Feche o cadastro:** em **Authentication → Configurações → Ações do usuário**, desmarque **Ativar criação (inscrição)**. Assim ninguém cria conta própria.
7. Envie o `app.js` atualizado para o GitHub. Pronto: o site passa a ler e gravar no Firebase. Na barra do morador aparece **Firebase** em vez de **Local**.

### Regras do Firestore

Leitura liberada para todos. Gravação **só** para o usuário dos moradores.

<!-- regras:inicio -->
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function ehMorador() {
      return request.auth != null
          && request.auth.token.email == 'repsicounifei@gmail.com';
    }
    match /site/{doc}     { allow read: if true; allow write: if ehMorador(); }
    match /imagens/{id}   { allow read: if true; allow write: if ehMorador(); }
  }
}
```
<!-- regras:fim -->

> **Por que o Gmail da república?** O login precisa usar um e-mail que **a casa controla**.
> - Qualquer pessoa pode pedir "redefinir senha" para esse endereço, e o link chega na caixa de entrada dele. Com o Gmail da casa, só vocês recebem.
> - Se um dia trocarem de e-mail:
>   1. troque **em dois lugares**, sempre em letras minúsculas:
>      - a constante `EMAIL_MORADORES` no topo do `app.js`;
>      - a linha `request.auth.token.email == '...'` das regras;
>   2. crie o usuário com o novo e-mail no Authentication.

## 5. Levar o que foi feito no modo local para o Firebase (backup)

1. **Exporte:** no navegador onde vocês cadastraram em modo local, entre na Área do Morador e clique em **Exportar**. Vai baixar o arquivo `repsico-backup-AAAA-MM-DD.json`, com tudo, fotos incluídas.
2. **Configure:** faça o passo 4 e publique.
3. **Importe:** abra o site publicado, entre com a senha do Firebase e clique em **Importar**. Escolha o arquivo e confirme **Substituir tudo**.

Dica: exporte um backup de vez em quando. Como todos usam a mesma senha, um "Excluir" errado não tem desfazer, mas o backup restaura.

## 6. Senha da casa

- **Trocar:** use o botão **Senha** na barra do morador.
  - No Firebase, troca a senha do usuário dos moradores.
  - No modo local, vale só naquele navegador.
  - Troque sempre que alguém sair da casa.
- **Esqueceram a senha:**
  - Com e-mail real: Console → **Authentication → Users → ⋮ → Redefinir senha** (chega por e-mail).
  - Sem e-mail real: **exclua o usuário e crie de novo** com o mesmo e-mail e uma nova senha. As regras verificam o e-mail, então nada mais muda.

## 7. Limites do plano gratuito

| Recurso | Limite grátis | Na prática |
|---|---|---|
| Armazenamento | 1 GiB | Milhares de fotos (cada uma tem ~100 KB depois de comprimida) |
| Leituras | 50 mil/dia | Cada visita lê o texto 1 vez + 1 leitura por foto que aparece na tela |
| Gravações | 20 mil/dia | Muito acima do que os moradores vão editar |

As fotos são comprimidas no próprio navegador antes de salvar: lado maior até 800 px, JPEG com qualidade 75%.

## 8. "O `firebaseConfig` fica público no GitHub. Tem problema?"

Não. Ele só identifica o projeto, e isso é normal em qualquer site com Firebase.

- **Quem pode gravar** é decidido pelas **regras**: só o usuário dos moradores.
- **A senha da casa nunca aparece no código.**
- No modo local, a senha `repsico` só protege as edições daquele navegador, que nenhum visitante vê.

## 9. Para quem for mexer no código

- O `app.js` é dividido em seções numeradas:
  1. Configuração
  2. Ícones
  3. Utilitários
  4. Conteúdo inicial
  5. Imagens
  6. Armazenamento
  7. Renderização
  8. Componentes
  9. Modo Morador
  10. Inicialização
- **Dados no Firebase:**
  - Todo o texto do site fica num único documento: `site/conteudo`.
  - Cada foto é um documento em `imagens/{id}`.
  - Assim cada visita faz só 1 leitura para todo o texto.
- **Dados no modo local:** texto no `localStorage` e fotos no IndexedDB.
- Não há dependências nem build: edite os arquivos e publique.
