/**
 * Confere o portao no ar. Duas perguntas, nao uma:
 *
 *   1. sem credencial, fecha?           (401)
 *   2. com a credencial certa, abre?    (200)
 *
 * A segunda existe porque 401 sozinho nao prova nada. No LiteSpeed, que e o
 * servidor da Hostinger, um AuthUserFile apontando pra caminho errado tambem
 * responde 401 (o Apache responderia 500). O resultado e um portao que pede
 * senha e recusa todas: parece protegido, e esta quebrado.
 *
 * Uso: npm run check
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './env.mjs';

// '../..' e nao '..': aqui os scripts moram em scripts/demo/, um nivel mais
// fundo que no tiktally-demo de onde vieram.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const env = { ...loadEnv(path.join(ROOT, '.env.demo')), ...process.env };

const DOMAIN = env.DEMO_DOMAIN || 'demo-creator.tiktally.com.br';
const USER = env.DEMO_USER || 'demo';
const PASSWORD = env.DEMO_PASSWORD;
const URL_BASE = `https://${DOMAIN}/`;

const RESET = '\x1b[0m', BOLD = '\x1b[1m', RED = '\x1b[31m', GREEN = '\x1b[32m';

if (!PASSWORD) {
  console.error('ERRO: DEMO_PASSWORD nao definido no .env.demo.');
  process.exit(1);
}

async function bater(comCredencial) {
  const headers = comCredencial
    ? { Authorization: 'Basic ' + Buffer.from(`${USER}:${PASSWORD}`).toString('base64') }
    : {};
  const r = await fetch(URL_BASE, { headers, redirect: 'manual' });
  // content-length nao vem quando a resposta chega comprimida, entao mede o
  // corpo de fato. Tamanho zero num 200 seria pagina vazia, e vale saber.
  const corpo = r.status === 200 ? await r.arrayBuffer() : null;
  return { status: r.status, tamanho: corpo ? corpo.byteLength : 0 };
}

console.log(`\n${BOLD}${URL_BASE}${RESET}\n`);

const semSenha = await bater(false);
const comSenha = await bater(true);

const fecha = semSenha.status === 401;
const abre = comSenha.status === 200;

console.log(`  sem credencial      ${semSenha.status}  ${fecha ? `${GREEN}fecha${RESET}` : `${RED}deveria ser 401${RESET}`}`);
console.log(`  com a credencial    ${comSenha.status}  ${abre ? `${GREEN}abre (${(comSenha.tamanho / 1024 / 1024).toFixed(2)} MB)${RESET}` : `${RED}deveria ser 200${RESET}`}`);

if (fecha && abre) {
  console.log(`\n${GREEN}Portao ok.${RESET} Fecha pra quem nao tem senha e abre pra quem tem.\n`);
  process.exit(0);
}

console.log('');
if (semSenha.status === 200) {
  console.log(`${RED}${BOLD}O preview esta ABERTO.${RESET} Algum arquivo do portao nao subiu.`);
} else if (fecha && comSenha.status === 401) {
  console.log(`${RED}${BOLD}O portao recusa a credencial certa.${RESET}`);
  console.log(`
Quase sempre e o caminho do AuthUserFile. No LiteSpeed, quando ele nao
consegue ler o .htpasswd, a resposta e 401 em vez de 500, entao "pede senha"
nao significa "funciona".

O que conferir, nessa ordem:

  1. O .htpasswd subiu junto? E arquivo oculto, o Gerenciador esconde por
     padrao. Sem ele nao ha senha nenhuma pra comparar.

  2. O caminho no .htaccess bate com a pasta de verdade? Abra o .htaccess no
     Gerenciador de Arquivos e olhe a linha AuthUserFile. Ela precisa ser o
     caminho absoluto ate a MESMA pasta onde o .htpasswd esta, algo como
     /home/uXXXXXXXXX/public_html/demo/.htpasswd

  3. Sobrou {{DOCROOT}} literal nessa linha? Ai o build nao foi rodado com o
     caminho, e o arquivo veio de uma versao antiga.

Com o caminho certo no .env (DEMO_HOSTINGER_USER ou DEMO_DOCROOT), rode
npm run build e suba de novo. Ou use npm run deploy, que resolve sozinho.`);
} else {
  console.log(`${RED}Resposta inesperada.${RESET} Confira na mao: ${URL_BASE}`);
}
console.log('');
process.exit(1);
