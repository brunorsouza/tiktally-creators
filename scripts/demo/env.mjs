/** Leitor de .env sem dependencia (o projeto nao tem node_modules). */
import fs from 'node:fs';

export function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const linha of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(linha);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}
