import { io, type Socket } from "socket.io-client";

// `||` (et non `??`) : en mode relais ces variables valent "" → on doit tomber
// sur l'origine courante, pas sur une chaîne vide. Sans URL explicite, on
// laisse socket.io utiliser l'origine de la page (le relais Next proxifie
// /socket.io vers le backend).
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

let socket: Socket | null = null;

/** Connexion socket singleton (namespace par défaut `/`). Handshake `auth.token`. */
export function connectSocket(token: string): Socket {
  if (socket && socket.auth && (socket.auth as { token?: string }).token === token) {
    return socket;
  }
  if (socket) socket.disconnect();
  const opts = {
    auth: { token },
    // WebSocket en PRIORITÉ (persistant, full-duplex, latence minimale), polling
    // en secours. `tryAllTransports` fait que si l'upgrade WS échoue (relais
    // Next/ngrok), le client bascule automatiquement sur le long-polling au lieu
    // de rester bloqué à retenter WS → temps réel garanti partout.
    transports: ["websocket", "polling"] as ("websocket" | "polling")[],
    tryAllTransports: true,
    path: "/api/socket.io",
  };
  socket = SOCKET_URL ? io(SOCKET_URL, opts) : io(opts);
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
