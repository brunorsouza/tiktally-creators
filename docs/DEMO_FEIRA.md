# Demo de feira

O app **real** rodando com dados fictícios, publicado num subdomínio próprio e
fechado por login e senha. Para mostrar o produto funcionando sem depender de
conta conectada, Wi-Fi da feira ou token da TikTok.

```bash
cp .env.demo.example .env.demo    # preencha DEMO_PASSWORD
npm run demo:build                # gera dist-demo/
npm run demo:deploy               # build + upload + confere que subiu fechado
npm run demo:test                 # testa a implementação de apr1
```

## Onde está o HTML

Em nenhum lugar até você buildar. Diferente do `tiktally-demo`, cujo
`index.html` de 2,1 MB **é** a demo e está versionado, aqui o HTML é **gerado**:
`npm run demo:build` compila o `src/` e escreve `dist-demo/index.html` — um
arquivo único de ~1,2 MB, com JS e CSS embutidos. `dist-demo/` é gitignorado,
como todo build.

O que está versionado é só o portão:
`scripts/demo/htaccess.template`, com `{{DOCROOT}}` substituído no build.

### Por que arquivo único

Para abrir por **duplo clique**, sem servidor e sem Wi-Fi do evento. O build
normal emite `<script type="module" src="./assets/...">`, e módulo ES buscado
por `src` a partir de `file://` é bloqueado por CORS (origem `null`): a tela
abre em branco. Com tudo embutido, o script é inline — não há fetch, não há
CORS, e o HTML roda do disco.

Caminho relativo (`base: "./"`) sozinho **não** resolve isso: conserta a
resolução dos caminhos e deixa o módulo externo continuar bloqueado. Foram as
duas coisas juntas, mais o HashRouter, que fizeram funcionar.

O `demo-build.mjs` confere isso: se voltar a existir `<script src=...>` externo
no HTML, o build aborta em vez de te entregar uma tela branca no estande.

### Fontes dependem de internet

As fontes vêm do Google Fonts. Offline, o navegador cai na fonte do sistema —
o app funciona igual, só muda a tipografia. Se a feira for sem rede nenhuma e
isso importar, vale embutir as fontes no build.

## Não é o mesmo que o `tiktally-demo`

O [`tiktally-demo`](../../tiktally-demo) serve um HTML único entregue pelo
designer — é um mockup, nada clica de verdade. Daqui sai o **app de verdade**:
as rotas navegam, os filtros filtram, os gráficos redesenham. O que é falso são
os dados, que vêm dos fixtures da documentação da TikTok em vez da API.

O portão de senha (`.htaccess` + `.htpasswd`, Basic Auth do Apache) e os
scripts de deploy foram trazidos de lá — inclusive a implementação de `apr1`,
que tem teste contra vetores do binário `htpasswd` do Apache.

## Por que existe um modo `demo` e não só uma env

O mock é travado em `import.meta.env.DEV`, e isso é deliberado: ligado por
acidente num build de produção, ele serviria fixture como se fosse a comissão
real do creator, e o login falso deixaria entrar quem não tem conta. Já esteve
assim — a flag era `!== "false"`, fail-open, e o guard que devia pegar isso
nunca disparava.

O modo `demo` é a única porta para fora do dev, e ela exige **duas** coisas
deliberadas ao mesmo tempo:

```
(import.meta.env.DEV || import.meta.env.MODE === "demo")
  && import.meta.env.VITE_USE_MOCK === "true"
```

`--mode demo` na linha de comando **e** a env. Variável faltando não liga nada.
E os dois deploys conferem coisas opostas:

| | `scripts/deploy.sh` (produção) | `scripts/demo-deploy.sh` (feira) |
|---|---|---|
| mock no bundle | **aborta** | **exige** |
| Basic Auth | não usa | **exige** |
| domínio | `creator.tiktally.com.br` | `demo-creator.tiktally.com.br` |
| saída | `dist/` | `dist-demo/` |

A trava invertida da demo não é capricho: sem o mock, ela subiria tentando falar
com a TikTok sem token e mostraria tela vazia na frente do cliente.

## Credenciais do Supabase vão falsas de propósito

O build de demo ignora o `.env` do app e passa placeholders
(`https://demo.invalid`). Em mock nenhuma chamada sai do navegador, e o client
só precisa ser construído — ele lança se a env faltar. Com valor falso, nem um
caminho esquecido alcança o projeto real na frente do cliente.

## Dados densos por padrão

`DEMO_MOCK_DENSE=true` é o padrão daqui, ao contrário do dev. O fixture normal
tem 13 pedidos: os gráficos ficam quase vazios e a aba **Horários** mostra,
corretamente, "amostra insuficiente". Com o denso são ~450 pedidos em 90 dias,
com padrão de horário realista — é o que faz a tela ter forma numa feira.

## Antes de mandar o link

1. **Criar o subdomínio no hPanel** como *website próprio*. Se a pasta ficar
   dentro do `public_html` do site principal, todo deploy do tiktally.com.br
   pode apagar a demo.
2. **Ligar "Forçar HTTPS"** no hPanel. Basic Auth manda usuário e senha em
   base64, que é texto aberto sem TLS — e numa feira o Wi-Fi é de terceiros. O
   redirect do `.htaccess` roda depois da autenticação, então sozinho ele não
   resolve.
3. `npm run demo:deploy` termina conferindo os **dois lados**: fecha sem senha
   (401) e abre com a senha (200). 401 sozinho não prova nada — no LiteSpeed, um
   `AuthUserFile` com caminho errado também responde 401.

## Duas telas que talvez você não queira na feira

`/toko` (Toko Mapper — converte IDs Tokopedia) e `/api-tester` (dispara
endpoints crus e mostra o JSON) são ferramentas internas. Elas funcionam na
demo porque "todas as funcionalidades" inclui elas, mas num estande valem
pouco e mostram encanamento. Para escondê-las, remova as rotas em
`src/App.tsx` e os itens em `src/components/Layout.tsx` (`SECTIONS`) dentro de
um `if (!IS_DEMO_BUILD)` — a flag já é exportada por
`src/services/creatorClient.ts`.

## Trocar a senha

Muda `DEMO_PASSWORD` no `.env.demo` e builda de novo. O hash sai diferente a
cada build porque o salt é sorteado, e isso é esperado.
