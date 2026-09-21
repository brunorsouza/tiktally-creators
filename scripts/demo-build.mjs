/**
 * Build da DEMO DE FEIRA: o app real, rodando com dados fictícios, fechado por
 * login e senha.
 *
 * Não confundir com o `tiktally-demo`, que serve um HTML único entregue pelo
 * designer. Aqui é o app de verdade — as telas navegam, os filtros filtram, os
 * gráficos redesenham. O que é falso são os dados, que vêm dos fixtures da
 * documentação da TikTok em vez da API.
 *
 * ## Por que existe um modo `demo` separado
 * O mock é travado em `import.meta.env.DEV` de propósito: ligado por acidente
 * num build de produção, ele serviria fixture como se fosse a comissão real do
 * creator, e o login falso deixaria entrar quem não tem conta. O modo `demo` é
 * a única porta para fora do dev, e ela exige DUAS coisas deliberadas:
 * `--mode demo` na linha de comando E `VITE_USE_MOCK=true`. Variável faltando
 * não liga nada.
 *
 * ## O que este script confere no fim
 * As asserções são o INVERSO das do deploy de produção. Lá, achar o caminho de
 * mock no bundle aborta. Aqui, NÃO achar aborta: uma demo publicada em modo
 * live tentaria falar com a TikTok sem token e mostraria tela vazia na frente
 * do cliente — que é exatamente o cenário que a feira não perdoa.
 *
 * Uso: npm run demo:build
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { apr1, randomSalt, verify } from "./demo/htpasswd.mjs";
import { loadEnv } from "./demo/env.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist-demo");
const GATE = path.join(ROOT, "demo", ".htaccess");

const RESET = "\x1b[0m", BOLD = "\x1b[1m", RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m";
const die = (msg, dica) => {
  console.error(`\n${RED}${BOLD}ERRO:${RESET} ${msg}`);
  if (dica) console.error(dica);
  process.exit(1);
};

const env = { ...loadEnv(path.join(ROOT, ".env.demo")), ...process.env };

const DOMAIN = env.DEMO_DOMAIN || "demo-creator.tiktally.com.br";
const USER = env.DEMO_USER || "demo";
const PASSWORD = env.DEMO_PASSWORD;

if (!PASSWORD) {
  die(
    "DEMO_PASSWORD não definido.",
    "Copie .env.demo.example pra .env.demo e preencha a senha.\nSem ela a demo subiria aberta."
  );
}

// O AuthUserFile só aceita caminho absoluto do servidor, e ele depende do
// usuário da hospedagem. `npm run demo:deploy` resolve pela API da Hostinger e
// passa por env; num build solto, tem que vir do .env.demo. Sem isso o build
// para, em vez de gerar um dist que devolve 500 no ar.
let DOCROOT = env.DEMO_DOCROOT;
if (!DOCROOT && env.DEMO_HOSTINGER_USER) {
  DOCROOT = `/home/${env.DEMO_HOSTINGER_USER}/domains/tiktally.com.br/public_html/${DOMAIN.split(".")[0]}`;
}
if (!DOCROOT) {
  die(
    "não sei o caminho absoluto da pasta do subdomínio no servidor.",
    `
O ${BOLD}AuthUserFile${RESET} do .htaccess só aceita caminho absoluto, e ele muda de
conta pra conta.

  ${BOLD}npm run demo:deploy${RESET} resolve sozinho pela API da Hostinger (precisa do
  HOSTINGER_API_TOKEN no ambiente). É o caminho normal.

Pra buildar solto e subir pelo Gerenciador de Arquivos, preencha UM dos dois
no .env.demo:

  ${BOLD}DEMO_HOSTINGER_USER=uXXXXXXXXX${RESET}
  ${BOLD}DEMO_DOCROOT=/caminho/completo${RESET}`
  );
}
DOCROOT = DOCROOT.replace(/\/+$/, "");
if (!DOCROOT.startsWith("/")) die(`o caminho precisa ser absoluto (começar com /). Recebi: ${DOCROOT}`);

// --- Build ----------------------------------------------------------------
console.log(`${BOLD}TikTally Creator — demo de feira${RESET}  ->  ${DOMAIN}\n`);

fs.rmSync(DIST, { recursive: true, force: true });

// `--mode demo` é o que libera o mock fora do dev; VITE_USE_MOCK=true é a
// segunda chave. As duas juntas, e só aqui.
//
// As credenciais do Supabase vão como placeholder de propósito: em mock nenhuma
// chamada sai do navegador, e o client só precisa existir para ser construído
// (ele lança se a env faltar). Com valor falso, nem um caminho esquecido
// alcança o projeto real na frente do cliente.
console.log("  vite build --mode demo");
try {
  execFileSync("npx", ["vite", "build", "--mode", "demo", "--outDir", DIST, "--emptyOutDir"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      VITE_USE_MOCK: "true",
      VITE_MOCK_DENSE: env.DEMO_MOCK_DENSE || "true",
      VITE_SUPABASE_URL: "https://demo.invalid",
      VITE_SUPABASE_PUBLISHABLE_KEY: "demo-nao-usado-em-mock",
      VITE_PUBLIC_URL: `https://${DOMAIN}`,
    },
  });
} catch (e) {
  die(`o vite build falhou:\n${e.stdout?.toString() || ""}${e.stderr?.toString() || ""}`);
}

const assets = path.join(DIST, "assets");
const tamanho = fs
  .readdirSync(assets)
  .reduce((soma, f) => soma + fs.statSync(path.join(assets, f)).size, 0);
console.log(`  ${"bundle".padEnd(16)}${(tamanho / 1024 / 1024).toFixed(2)} MB`);

// O Vite copiou o public/.htaccess (só fallback de SPA, sem senha). Sobrescreve
// pelo portão da demo, que faz as duas coisas.
fs.writeFileSync(path.join(DIST, ".htaccess"), fs.readFileSync(GATE, "utf8").replaceAll("{{DOCROOT}}", DOCROOT));
console.log(`  ${".htaccess".padEnd(16)}AuthUserFile em ${DOCROOT}/.htpasswd`);

fs.writeFileSync(path.join(DIST, ".htpasswd"), `${USER}:${apr1(PASSWORD, randomSalt())}\n`, { mode: 0o600 });
console.log(`  ${".htpasswd".padEnd(16)}usuário "${USER}"`);

// --- Conferência ----------------------------------------------------------
const erros = [];
const htaccess = fs.readFileSync(path.join(DIST, ".htaccess"), "utf8");
const htpasswd = fs.readFileSync(path.join(DIST, ".htpasswd"), "utf8");
const bundle = fs
  .readdirSync(assets)
  .filter((f) => f.endsWith(".js"))
  .map((f) => fs.readFileSync(path.join(assets, f), "utf8"))
  .join("");

// 1. O portão está inteiro. Modo de falha: demo aberta e silenciosa.
if (!/^Require valid-user$/m.test(htaccess)) erros.push('.htaccess sem "Require valid-user"');
if (!/^AuthType Basic$/m.test(htaccess)) erros.push('.htaccess sem "AuthType Basic"');
if (htaccess.includes("{{")) erros.push(".htaccess com marcador {{...}} por substituir");
if (!htaccess.includes(`AuthUserFile "${DOCROOT}/.htpasswd"`)) erros.push("AuthUserFile não aponta pro caminho esperado");
if (!verify(PASSWORD, htpasswd.split(":")[1].trim())) erros.push("hash do .htpasswd não confere com a senha");

// 2. O SPA responde em qualquer rota. Modo de falha: 404 ao atualizar /ganhos
//    no meio da demonstração.
if (!htaccess.includes("FallbackResource /index.html")) erros.push(".htaccess sem fallback de SPA");
if (!fs.existsSync(path.join(DIST, "index.html"))) erros.push("index.html não saiu no dist-demo");

// 3. O mock está no bundle — o inverso do que o deploy de produção exige.
//    Modo de falha: demo em modo live, tentando falar com a TikTok sem token,
//    mostrando tela vazia na frente do cliente.
if (!bundle.includes("tc-mock-session")) {
  erros.push("o bundle NÃO tem o modo demonstração — subiria tentando dados reais e não mostraria nada");
}

if (erros.length) {
  fs.rmSync(DIST, { recursive: true, force: true });
  die(`a conferência falhou, dist-demo/ foi apagado:\n  - ${erros.join("\n  - ")}`);
}

console.log(`\n${GREEN}Build ok.${RESET}  ${BOLD}npm run demo:deploy${RESET} sobe, ou suba o conteúdo de dist-demo/ na mão.`);
console.log(`${YELLOW}Se for na mão, os arquivos que começam com ponto também precisam ir:${RESET}`);
console.log("  .htaccess  .htpasswd\n");
