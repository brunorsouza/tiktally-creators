/**
 * Confere a implementacao de apr1 contra vetores gerados pelo binario
 * `htpasswd` do Apache. Roda com: npm test
 */
import { apr1, verify, randomSalt } from './htpasswd.mjs';

// Vetores gerados com: htpasswd -nbm <user> <senha>
const VECTORS = [
  { password: 'AcessoDemo1*', salt: 'FhYEnd3z', hash: '$apr1$FhYEnd3z$vBwJjWdJBk5fABgG8.R4b.' },
  { password: '6Czu7qxhp2TGj6', salt: 'SOIPXx2J', hash: '$apr1$SOIPXx2J$Vd8xzWj85TElUyDpm4QAc/' },
];

let falhas = 0;
for (const v of VECTORS) {
  const got = apr1(v.password, v.salt);
  const ok = got === v.hash;
  if (!ok) falhas++;
  console.log(`${ok ? 'ok  ' : 'FALHA'}  apr1(${JSON.stringify(v.password)}, ${v.salt})`);
  if (!ok) console.log(`      esperado: ${v.hash}\n      obtido:   ${got}`);
}

// verify() aceita a senha certa e recusa a errada.
const h = apr1('AcessoDemo1*', randomSalt());
if (!verify('AcessoDemo1*', h)) { falhas++; console.log('FALHA  verify recusou a senha certa'); }
else console.log('ok    verify aceita a senha certa');
if (verify('AcessoDemo1', h)) { falhas++; console.log('FALHA  verify aceitou senha errada'); }
else console.log('ok    verify recusa a senha errada');

// Salt aleatorio tem o alfabeto certo e nao repete.
const s1 = randomSalt(), s2 = randomSalt();
if (!/^[./0-9A-Za-z]{8}$/.test(s1)) { falhas++; console.log('FALHA  salt fora do alfabeto'); }
else if (s1 === s2) { falhas++; console.log('FALHA  salt repetiu'); }
else console.log('ok    salt aleatorio');

console.log(falhas === 0 ? '\nTodos os testes passaram.' : `\n${falhas} teste(s) falharam.`);
process.exit(falhas === 0 ? 0 : 1);
