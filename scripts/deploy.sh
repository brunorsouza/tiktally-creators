#!/bin/bash

# TikTally Creator — deploy pra Hostinger (subdomínio creator.tiktally.com.br)
#
#   ./scripts/deploy.sh              # build + deploy
#   ./scripts/deploy.sh --skip-build # deploy do build existente (usado no CI)
#
# O subdomínio é um "website" próprio na Hostinger, então o deploy NÃO toca no
# app principal (tiktally.com.br) nem no backoffice — é por isso que
# HOSTINGER_DOMAIN precisa ser o subdomínio do creator.

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export HOSTINGER_DOMAIN="${HOSTINGER_DOMAIN:-creator.tiktally.com.br}"

SKIP_BUILD=false
for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
  esac
done

echo "========================================="
echo "  TikTally Creator → ${HOSTINGER_DOMAIN}"
echo "========================================="
echo ""

if [ "$SKIP_BUILD" = false ]; then
  echo "[1/4] Build..."
  cd "$PROJECT_DIR"
  npm run build
  echo ""
else
  echo "[1/4] Build pulado (--skip-build)"
fi

if [ ! -d "${PROJECT_DIR}/dist" ]; then
  echo "ERRO: dist/ não encontrado."
  exit 1
fi

# O .htaccess precisa ir junto — sem ele, /ganhos dá 404 no refresh. O Vite
# copia public/ pra dist/, mas o zip ignora dotfiles se não for explícito.
if [ ! -f "${PROJECT_DIR}/dist/.htaccess" ]; then
  echo "ERRO: dist/.htaccess ausente — o SPA quebraria em qualquer rota."
  exit 1
fi

# Trava contra mock em produção — serviria fixture da doc como se fosse a
# comissão real, e o login falso deixaria entrar quem não tem conta.
#
# A checagem anterior procurava '"VITE_USE_MOCK":"true"' e NUNCA disparava: o
# Vite inlina o VALOR da env, não o par chave-valor, então aquela string não
# existe no bundle. Passava tanto com VITE_USE_MOCK=true quanto com a variável
# ausente (medido nos três cenários).
#
# Agora procuramos um marcador que só existe DENTRO do caminho de mock: a chave
# do localStorage da sessão forjada. Com o mock travado em `import.meta.env.DEV`
# o build de produção já não deveria conter isso — este grep é a rede embaixo,
# para o dia em que alguém tirar a trava sem perceber.
if grep -rqs "tc-mock-session" "${PROJECT_DIR}/dist/assets" 2>/dev/null; then
  echo "::error::o bundle contém o login mockado (tc-mock-session) — abortando"
  echo "  Alguém removeu a trava import.meta.env.DEV de MOCK_AUTH/USE_MOCK."
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="tiktally_creator_${TIMESTAMP}.zip"
ARCHIVE_PATH="${PROJECT_DIR}/${ARCHIVE_NAME}"

# trap em vez de `rm` no fim: com `set -e`, uma falha no upload encerraria o
# script antes da limpeza e deixaria o zip temporário no repo.
trap 'rm -f "${ARCHIVE_PATH}"' EXIT

echo "[2/4] Empacotando: ${ARCHIVE_NAME}"
cd "${PROJECT_DIR}/dist"
# -x exclui .DS_Store; dotfiles como .htaccess entram porque usamos "." como raiz
zip -r -q "${ARCHIVE_PATH}" . -x "*.DS_Store"
cd "$PROJECT_DIR"
echo "       Tamanho: $(du -h "${ARCHIVE_PATH}" | cut -f1)"
unzip -l "${ARCHIVE_PATH}" | grep -q "\.htaccess" \
  && echo "       .htaccess incluído ✓" \
  || { echo "ERRO: .htaccess ficou de fora do zip."; rm -f "${ARCHIVE_PATH}"; exit 1; }
echo ""

echo "[3/4] Upload..."
echo "[4/4] Deploy..."
echo ""

if node "${PROJECT_DIR}/scripts/hostinger-deploy.mjs" "${ARCHIVE_PATH}"; then
  echo ""
  echo "✅ https://${HOSTINGER_DOMAIN}"
else
  DEPLOY_EXIT=$?
  exit $DEPLOY_EXIT
fi
