/**
 * Hash apr1 (MD5 do Apache), o formato `$apr1$` do .htpasswd.
 *
 * Escrito na mao pra o projeto nao ter dependencia nenhuma: o conteudo aqui e
 * um HTML ja empacotado, entao `npm install` nao precisa baixar nada. apr1 foi
 * escolhido em vez de bcrypt porque e o formato que o LiteSpeed da Hostinger
 * le sem surpresa.
 *
 * Algoritmo: md5crypt com o magic "$apr1$" (Apache APR). Conferido contra a
 * saida do binario `htpasswd` em scripts/htpasswd.test.mjs.
 */
import crypto from 'node:crypto';

const ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const MAGIC = '$apr1$';

function md5(...bufs) {
  const h = crypto.createHash('md5');
  for (const b of bufs) h.update(b);
  return h.digest();
}

function to64(value, chars) {
  let out = '';
  let v = value;
  for (let i = 0; i < chars; i++) {
    out += ITOA64[v & 0x3f];
    v >>>= 6;
  }
  return out;
}

export function randomSalt(len = 8) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ITOA64[bytes[i] & 0x3f];
  return out;
}

export function apr1(password, salt) {
  const pw = Buffer.from(password, 'utf8');
  const sa = Buffer.from(salt, 'utf8');

  // Digest inicial: senha + salt + senha.
  const inner = md5(pw, sa, pw);

  const parts = [pw, Buffer.from(MAGIC, 'utf8'), sa];
  for (let i = pw.length; i > 0; i -= 16) {
    parts.push(inner.subarray(0, Math.min(i, 16)));
  }
  // Bits do tamanho da senha decidem entre NUL e o primeiro byte da senha.
  for (let i = pw.length; i > 0; i >>= 1) {
    parts.push(i & 1 ? Buffer.from([0]) : pw.subarray(0, 1));
  }
  let result = md5(...parts);

  // 1000 voltas de embaralhamento, o que torna o hash caro de forcar.
  for (let i = 0; i < 1000; i++) {
    const round = [];
    round.push(i & 1 ? pw : result);
    if (i % 3) round.push(sa);
    if (i % 7) round.push(pw);
    round.push(i & 1 ? result : pw);
    result = md5(...round);
  }

  const r = result;
  const encoded =
    to64((r[0] << 16) | (r[6] << 8) | r[12], 4) +
    to64((r[1] << 16) | (r[7] << 8) | r[13], 4) +
    to64((r[2] << 16) | (r[8] << 8) | r[14], 4) +
    to64((r[3] << 16) | (r[9] << 8) | r[15], 4) +
    to64((r[4] << 16) | (r[10] << 8) | r[5], 4) +
    to64(r[11], 2);

  return `${MAGIC}${salt}$${encoded}`;
}

/** Confere uma senha contra uma linha `usuario:hash` de .htpasswd. */
export function verify(password, hash) {
  const m = /^\$apr1\$([^$]+)\$/.exec(hash);
  if (!m) return false;
  return apr1(password, m[1]) === hash;
}
