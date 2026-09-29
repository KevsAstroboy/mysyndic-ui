#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  MySyndic — Lien public temporaire (ngrok)
#
#   npm run public       → démarre, applique l'infra, imprime le lien
#   npm run public:stop  → arrête tout et restaure la config locale
#
#  Un seul tunnel vers le front (3001) ; Next relaie /api, /socket.io et les
#  objets MinIO (buckets mysyndic-uploads / mysyndic-documents) vers les
#  services locaux. Une seule origine à partager.
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/../mysyndic-api"
PORT=3001
STATE=/tmp/opencode/mysyndic-public.state
RESTORE=/tmp/opencode/mysyndic-public.restore
NGROK_LOG=/tmp/opencode/ngrok-public.log
NEXT_LOG=/tmp/opencode/next-relay.log
HUB="http://127.0.0.1:4040/api/tunnels"

tunnel_url() {  # https://… si un tunnel https vers $PORT est en ligne
  curl -sf --max-time 2 "$HUB" 2>/dev/null | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    raise SystemExit
for t in d.get('tunnels', []):
    if t.get('proto') == 'https' and t['config'].get('addr') == 'http://localhost:$PORT':
        print(t['public_url']); break
" 2>/dev/null || true
}

port_pid() {  # pid du process qui écoute sur $PORT
  ss -ltnp 2>/dev/null | grep -E ":$PORT\\b" | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2 | sort -u
}

start() {
  command -v ngrok >/dev/null 2>&1 || { echo "❌ ngrok manquant : https://ngrok.com/download"; exit 1; }
  test -f ~/.config/ngrok/ngrok.yml || { echo "❌ configure ton token : ngrok config add-authtoken <TOKEN>"; exit 1; }

  # 1) Déjà en ligne ? → on renvoie juste le lien.
  EXISTING=$(tunnel_url)
  if [ -n "$EXISTING" ]; then
    echo "ℹ  Un lien public est déjà actif : $EXISTING"
    [ -n "$(port_pid)" ] && echo "ℹ  Relais front déjà en écoute (port $PORT)."
    exit 0
  fi

  # 2) Tunnel ngrok (détaché : setsid, survit au terminal).
  echo "▶ Tunnel ngrok → http://localhost:$PORT"
  setsid -f ngrok http "$PORT" --log "$NGROK_LOG" >/dev/null 2>&1 || true
  URL=""
  for _ in $(seq 1 30); do sleep 1; URL=$(tunnel_url); [ -n "$URL" ] && break; done
  [ -z "$URL" ] && { echo "❌ ngrok n'a pas publié d'URL (log : $NGROK_LOG)"; exit 1; }
  HOST="${URL#https://}"

  # 3) Backend : URLs pré-signées MinIO signées pour la CIBLE du relais
  #    (Next réécrit l'en-tête Host vers `localhost:9010` : signer pour l'hôte
  #    public produirait une SignatureDoesNotMatch). Callbacks → URL publique.
  #    BUGFIX : backup COMPLET du .env (le grep 4 lignes écrasait tout au stop !).
  if [ ! -f "$RESTORE" ]; then
    cp "$API_DIR/.env" "$RESTORE"
  fi
  sed -i "s#^MINIO_PUBLIC_ENDPOINT=.*#MINIO_PUBLIC_ENDPOINT=localhost#" "$API_DIR/.env"
  sed -i "s#^MINIO_PUBLIC_PORT=.*#MINIO_PUBLIC_PORT=9010#"             "$API_DIR/.env"
  sed -i "s#^MINIO_PUBLIC_USE_SSL=.*#MINIO_PUBLIC_USE_SSL=false#"      "$API_DIR/.env"
  sed -i "s#^FRONTEND_URL=.*#FRONTEND_URL=$URL#"                       "$API_DIR/.env"
  (cd "$API_DIR" && docker compose up -d api >/dev/null 2>&1 || true)

  # 4) Front : relais mono-origine (relance le dev).
  OLD=$(port_pid); [ -n "$OLD" ] && kill "$OLD" 2>/dev/null; sleep 1
  (cd "$ROOT" && setsid -f env NEXT_PUBLIC_RELAY=1 NEXT_PUBLIC_API_URL= \
     NEXT_PUBLIC_SOCKET_URL= NEXT_PUBLIC_WS_URL= npm run dev >"$NEXT_LOG" 2>&1)
  sleep 8
  [ -z "$(port_pid)" ] && { echo "❌ le relais Next n'a pas démarré ($NEXT_LOG)"; exit 1; }

  # 5) État + lien.
  { echo "URL=$URL"; echo "HOST=$HOST"; } > "$STATE"
  cat <<EOF

═══════════════════════════════════════════════════════════════════
   🌍  $URL
   Partage ce lien : le testeur ouvre, crée un compte et explore.
   Pour revenir à la normale :      npm run public:stop
═══════════════════════════════════════════════════════════════════
EOF
}

stop() {
  # 1) Kill ngrok (notre tunnel 3001 uniquement).
  [ -n "$(tunnel_url || true)" ] || pgrep -f "ngrok http $PORT" >/dev/null && \
    pkill -9 -f "ngrok http $PORT" 2>/dev/null || true
  sleep 1

  # 2) Kill le relais Next.
  RELAY=$(port_pid); [ -n "$RELAY" ] && kill "$RELAY" 2>/dev/null; sleep 2

  # 3) Restaure le backend local (fichier complet restauré).
  if [ -f "$RESTORE" ]; then
    cp "$RESTORE" "$API_DIR/.env"
    grep -qE '^POSTGRES_USER=' "$API_DIR/.env" \
      && (cd "$API_DIR" && docker compose up -d api >/dev/null 2>&1 || true) \
      || echo "⚠️  .env restauré sans POSTGRES_USER — vérifie le fichier."
  else
    echo "ℹ  Pas d'état sauvegardé (backend inchangé ?)."
  fi

  # 4) Relance le dev normal local.
  (cd "$ROOT" && setsid -f npm run dev >/tmp/opencode/next-local.log 2>&1)
  sleep 8
  rm -f "$STATE" "$RESTORE"

  echo "✅ Retour à la normale : backend local + npm run dev sur http://localhost:3001"
}

case "${1:-start}" in
  start) start ;;
  stop)  stop ;;
  *) echo "usage: public.sh [start|stop]"; exit 1 ;;
esac