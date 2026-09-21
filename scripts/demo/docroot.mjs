/**
 * Descobre o caminho absoluto da pasta do site no servidor, usando a mesma API
 * da Hostinger que o deploy usa pra subir o arquivo.
 *
 * Existe porque o AuthUserFile do .htaccess so aceita caminho absoluto
 * (/home/uXXXXXXXXX/...), e esse caminho depende do usuario da hospedagem.
 *
 * Uso:
 *   node scripts/docroot.mjs           imprime so o caminho (pro deploy usar)
 *   node scripts/docroot.mjs --lista   mostra todos os sites da conta
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './env.mjs';

// '../..' e nao '..': aqui os scripts moram em scripts/demo/, um nivel mais
// fundo que no tiktally-demo de onde vieram.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const env = { ...loadEnv(path.join(ROOT, '.env.demo')), ...process.env };

const TOKEN = env.HOSTINGER_API_TOKEN;
const DOMAIN = env.DEMO_DOMAIN || 'demo-creator.tiktally.com.br';
const LISTA = process.argv.includes('--lista');
const BASE = 'https://developers.hostinger.com';

const erro = (msg) => { console.error(`ERRO: ${msg}`); process.exit(1); };

if (!TOKEN) erro('HOSTINGER_API_TOKEN nao definido (export HOSTINGER_API_TOKEN=... ou coloque no .env).');

let resposta, corpo;
try {
  resposta = await fetch(`${BASE}/api/hosting/v1/websites`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  });
  corpo = await resposta.text();
} catch (e) {
  erro(`nao consegui falar com a API da Hostinger: ${e.message}`);
}

if (!resposta.ok) {
  console.error(`ERRO: a API respondeu ${resposta.status}.`);
  console.error(corpo.slice(0, 600));
  if (resposta.status === 401 || resposta.status === 403) {
    console.error('\nToken invalido ou sem permissao. Gere um novo em hPanel > API.');
  }
  process.exit(1);
}

let dados;
try { dados = JSON.parse(corpo); } catch { erro(`a API nao devolveu JSON:\n${corpo.slice(0, 400)}`); }

// A API ja mudou de formato antes; aceita lista solta ou embrulhada em data.
const sites = Array.isArray(dados) ? dados : (dados.data ?? dados.websites ?? []);
if (!Array.isArray(sites) || sites.length === 0) {
  erro(`a API nao listou nenhum site. Resposta:\n${corpo.slice(0, 600)}`);
}

if (LISTA) {
  console.log(`\n${sites.length} site(s) na conta:\n`);
  for (const s of sites) console.log(JSON.stringify(s, null, 2));
  console.log('');
  process.exit(0);
}

const achaPorDominio = (d) => sites.find((s) => (s.domain || s.name || '').toLowerCase() === d.toLowerCase());

const site = achaPorDominio(DOMAIN);
const principal = achaPorDominio('tiktally.com.br') || sites[0];
const username = site?.username || principal?.username;

if (!username) {
  console.error('ERRO: nenhum site da conta trouxe "username".');
  console.error('Rode `node scripts/docroot.mjs --lista` pra ver o que a API devolve.');
  process.exit(1);
}

if (!site) {
  console.error(`AVISO: ${DOMAIN} nao aparece como site na conta.`);
  console.error('  O upload pela API pode falhar. Nesse caso, suba o dist/ pelo Gerenciador de Arquivos.');
  console.error(`  Sites encontrados: ${sites.map((s) => s.domain || s.name).join(', ')}`);
}

// O painel mostra "public_html", mas o caminho real no disco passa por
// domains/tiktally.com.br/. Confirmado pelo proprio servidor via
// %{DOCUMENT_ROOT} (ver README). Apontar pro atalho faz o LiteSpeed responder
// 401 em toda credencial, que foi o bug de 24/08/2026.
const sub = DOMAIN.split('.')[0];
console.log(env.DEMO_DOCROOT || `/home/${username}/domains/tiktally.com.br/public_html/${sub}`);
