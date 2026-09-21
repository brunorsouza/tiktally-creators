/**
 * Gera o HTML da demo: o app real, com dados fictícios, num arquivo único.
 *
 * Este script só PRODUZ o arquivo. Quem publica é o repo
 * `tiktally-creator-demo`, que guarda o portão de senha (`.htaccess` +
 * `.htpasswd`) e o deploy — mesma divisão do `tiktally-demo` do seller. De lá,
 * `npm run sync` chama este build e traz o arquivo.
 *
 * ## Por que existe um modo `demo`
 * O mock é travado em `import.meta.env.DEV` de propósito: ligado por acidente
 * num build de produção, ele serviria fixture como se fosse a comissão real do
 * creator, e o login falso deixaria entrar quem não tem conta. O modo `demo` é
 * a única porta para fora do dev, e exige DUAS coisas deliberadas: `--mode
 * demo` na linha de comando E `VITE_USE_MOCK=true`. Variável faltando não liga
 * nada.
 *
 * ## Por que arquivo único
 * Para a demo abrir por duplo clique, sem servidor e sem Wi-Fi do evento. Ver o
 * comentário do `viteSingleFile` no vite.config.ts.
 *
 * Uso: npm run demo:build
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist-demo");
const HTML = path.join(DIST, "index.html");

const RESET = "\x1b[0m", BOLD = "\x1b[1m", RED = "\x1b[31m", GREEN = "\x1b[32m";
const die = (msg, dica) => {
  console.error(`\n${RED}${BOLD}ERRO:${RESET} ${msg}`);
  if (dica) console.error(dica);
  process.exit(1);
};

console.log(`${BOLD}TikTally Creator — HTML da demo${RESET}\n`);

fs.rmSync(DIST, { recursive: true, force: true });

// `--mode demo` libera o mock fora do dev e liga o viteSingleFile;
// VITE_USE_MOCK=true é a segunda chave.
//
// As credenciais do Supabase vão como placeholder de propósito: em mock nenhuma
// chamada sai do navegador, e o client só precisa ser construído (ele lança se
// a env faltar). Com valor falso, nem um caminho esquecido alcança o projeto
// real na frente do cliente.
console.log("  vite build --mode demo");
try {
  execFileSync("npx", ["vite", "build", "--mode", "demo", "--outDir", DIST, "--emptyOutDir"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      VITE_USE_MOCK: "true",
      VITE_MOCK_DENSE: process.env.VITE_MOCK_DENSE || "true",
      VITE_SUPABASE_URL: "https://demo.invalid",
      VITE_SUPABASE_PUBLISHABLE_KEY: "demo-nao-usado-em-mock",
      VITE_PUBLIC_URL: "https://demo-creator.tiktally.com.br",
    },
  });
} catch (e) {
  die(`o vite build falhou:\n${e.stdout?.toString() || ""}${e.stderr?.toString() || ""}`);
}

if (!fs.existsSync(HTML)) die("o build não gerou dist-demo/index.html.");
const html = fs.readFileSync(HTML, "utf8");

// --- Conferência ----------------------------------------------------------
// Os modos de falha reais, cada um com um jeito específico de estragar uma
// demonstração.
const erros = [];

// 1. Script externo: abriria em branco por duplo clique. Módulo ES buscado por
//    `src` a partir de file:// é bloqueado por CORS (origem "null"). Módulo
//    INLINE não é buscado pela rede, então o que importa é o `src`, não o
//    `type="module"` — a primeira versão desta checagem errou justamente aí.
if (/<script[^>]+src=/.test(html)) {
  erros.push("o HTML tem <script src=...> externo — abriria em branco por duplo clique");
}
if (/(src|href)="\.?\/?assets\//.test(html)) {
  erros.push("o HTML referencia arquivos em assets/ — não é autocontido");
}

// 2. Sem o mock, a demo tenta falar com a TikTok sem token e mostra tela vazia
//    na frente do cliente. É o inverso do que o deploy de produção exige.
if (!html.includes("tc-mock-session")) {
  erros.push("o bundle NÃO está em modo demonstração — mostraria tela vazia");
}

if (erros.length) {
  fs.rmSync(DIST, { recursive: true, force: true });
  die(`a conferência falhou, dist-demo/ foi apagado:\n  - ${erros.join("\n  - ")}`);
}

const mb = (fs.statSync(HTML).size / 1024 / 1024).toFixed(2);
console.log(`  ${"index.html".padEnd(16)}${mb} MB, autocontido\n`);
console.log(`${GREEN}Pronto.${RESET} O arquivo é ${BOLD}dist-demo/index.html${RESET}.`);
console.log(`Para publicar com senha, use o repo ${BOLD}tiktally-creator-demo${RESET}:`);
console.log(`lá o ${BOLD}npm run sync${RESET} traz este arquivo e o ${BOLD}npm run deploy${RESET} sobe.\n`);
