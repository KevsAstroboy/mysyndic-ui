import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

let socket: Socket | null = null;

/** Connexion socket singleton (namespace par défaut `/`). Handshake `auth.token`. */
export function connectSocket(token: string): Socket {
  if (socket && socket.auth && (socket.auth as { token?: string }).token === token) {
    return socket;
  }
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
