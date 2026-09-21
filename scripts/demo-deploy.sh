#!/bin/bash

# TikTally Creator — deploy da DEMO DE FEIRA (o app real, com dados fictícios,
# fechado por login e senha).
#
#   ./scripts/demo-deploy.sh              # build + deploy
#   ./scripts/demo-deploy.sh --skip-build # deploy do build existente
#
# NÃO confundir com ./scripts/deploy.sh, que publica o app DE VERDADE em
# creator.tiktally.com.br. Os dois sobem coisas opostas e as travas são
# opostas: lá, achar o modo demonstração no bundle aborta; aqui, não achar
# aborta.
#
# O subdomínio precisa ser um "website" próprio na Hostinger. Se a pasta ficar
# dentro do public_html do site principal, todo deploy do tiktally.com.br pode
# apagar a demo — na véspera da feira, de preferência não.

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST="${PROJECT_DIR}/dist-demo"

# Lê DEMO_DOMAIN do .env.demo se não veio do ambiente.
if [ -z "$DEMO_DOMAIN" ] && [ -f "${PROJECT_DIR}/.env.demo" ]; then
  DEMO_DOMAIN=$(grep -E '^\s*DEMO_DOMAIN\s*=' "${PROJECT_DIR}/.env.demo" | tail -1 | cut -d= -f2- | tr -d ' "'"'"'')
fi
export HOSTINGER_DOMAIN="${DEMO_DOMAIN:-demo-creator.tiktally.com.br}"

SKIP_BUILD=false
for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
  esac
done

echo "========================================="
echo "  TikTally Creator · DEMO → ${HOSTINGER_DOMAIN}"
echo "========================================="
echo ""

if [ -z "$HOSTINGER_API_TOKEN" ]; then
  echo "ERRO: HOSTINGER_API_TOKEN não definido."
  echo "  export HOSTINGER_API_TOKEN=... e rode de novo."
  exit 1
fi

# O AuthUserFile do .htaccess exige caminho absoluto da pasta na conta, e ele
# muda de conta pra conta. Em vez de pedir isso na mão, resolve o usuário pela
# mesma API que faz o upload.
if [ -z "$DEMO_DOCROOT" ]; then
  echo "[1/5] Resolvendo o caminho da pasta no servidor..."
  DEMO_DOCROOT=$(node "${PROJECT_DIR}/scripts/demo/docroot.mjs") || {
    echo ""
    echo "Não consegui resolver sozinho. Duas saídas:"
    echo "  node scripts/demo/docroot.mjs --lista"
    echo "  DEMO_DOCROOT=/home/uXXXXXXXXX/... npm run demo:deploy"
    exit 1
  }
  export DEMO_DOCROOT
else
  echo "[1/5] Usando DEMO_DOCROOT informado."
fi
echo "       ${DEMO_DOCROOT}"
echo ""

if [ "$SKIP_BUILD" = false ]; then
  echo "[2/5] Build da demo..."
  cd "$PROJECT_DIR"
  npm run demo:build
  echo ""
else
  echo "[2/5] Build pulado (--skip-build)"
fi

[ -d "$DIST" ] || { echo "ERRO: dist-demo/ não encontrado."; exit 1; }

# O portão inteiro precisa ir junto. Sem .htaccess ou sem .htpasswd, a demo
# sobe ABERTA — e esse é o único erro aqui que não dá pra desfazer depois de
# alguém ver o link.
[ -f "${DIST}/.htaccess" ] || { echo "ERRO: .htaccess ausente — a demo subiria aberta."; exit 1; }
[ -f "${DIST}/.htpasswd" ] || { echo "ERRO: .htpasswd ausente — a demo subiria aberta."; exit 1; }
grep -q '^Require valid-user' "${DIST}/.htaccess" || { echo "ERRO: .htaccess sem 'Require valid-user'."; exit 1; }
grep -q '{{' "${DIST}/.htaccess" && { echo "ERRO: .htaccess com marcador por substituir."; exit 1; }

# Trava invertida em relação ao deploy de produção: a demo TEM que estar
# mockada. Sem isso ela sobe tentando falar com a TikTok sem token e mostra
# tela vazia na frente do cliente.
grep -rqs "tc-mock-session" "${DIST}/assets" \
  || { echo "ERRO: o bundle não está em modo demonstração — mostraria tela vazia."; exit 1; }

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="tiktally_creator_demo_${TIMESTAMP}.zip"
ARCHIVE_PATH="${PROJECT_DIR}/${ARCHIVE_NAME}"

# trap em vez de `rm` no fim: com `set -e`, uma falha no upload encerraria o
# script antes da limpeza e deixaria o zip temporário no repo.
trap 'rm -f "${ARCHIVE_PATH}"' EXIT

echo "[3/5] Empacotando: ${ARCHIVE_NAME}"
cd "$DIST"
# -x exclui .DS_Store; dotfiles como .htaccess entram porque usamos "." como raiz
zip -r -q "${ARCHIVE_PATH}" . -x "*.DS_Store"
cd "$PROJECT_DIR"
echo "       Tamanho: $(du -h "${ARCHIVE_PATH}" | cut -f1)"
unzip -l "${ARCHIVE_PATH}" | grep -q "\.htpasswd" \
  && echo "       portão incluído ✓" \
  || { echo "ERRO: .htpasswd ficou de fora do zip."; exit 1; }
echo ""

echo "[4/5] Upload + deploy..."
node "${PROJECT_DIR}/scripts/hostinger-deploy.mjs" "${ARCHIVE_PATH}"
echo ""

# 401 sozinho NÃO prova que o portão funciona: no LiteSpeed, um AuthUserFile
# apontando pra caminho errado também responde 401 (o Apache responderia 500).
# Por isso a conferência tem dois lados: fecha sem senha E abre com a senha.
echo "[5/5] Conferindo o portão..."
sleep 5
node "${PROJECT_DIR}/scripts/demo/check.mjs"
