import type { NextConfig } from "next";
import path from "path";

// Mode « lien public » (ngrok) : le navigateur du testeur d'appelle qu'UNE
// origine (le tunnel front). Next relaie /api, /socket.io et les uploads
// MinIO vers les services locaux — zéro CORS, zéro IP privée à partager.
const RELAY = process.env.NEXT_PUBLIC_RELAY === "1";
const API_TARGET = process.env.NEXT_PUBLIC_RELAY_TARGET || "http://localhost:3000";
const MINIO_TARGET = process.env.NEXT_PUBLIC_RELAY_MINIO || "http://localhost:9010";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Un package-lock.json parasite dans /home/abdia fait croire à Next que la
  // racine du workspace est le home. On fixe la racine sur le projet.
  outputFileTracingRoot: path.join(__dirname),
  // Poste de dev à mémoire limitée : plusieurs workers de build provoquent des
  // PageNotFoundError/ENOENT aléatoires (fichiers .next manquants). 1 worker
  // fiabilise le build. Retirer pour accélérer sur une machine libre.
  experimental: { cpus: 1 },
  ...(RELAY
    ? {
        // engine.io appelle `/api/socket.io/` (slash final). Next supprime le
        // slash final en rewrite ; le gateway est configuré avec
        // `addTrailingSlash: false` pour accepter le chemin sans slash.
        skipTrailingSlashRedirect: true,
        async rewrites() {
          return [
            { source: "/api/:path*", destination: `${API_TARGET}/api/:path*` },
            {
              source: "/mysyndic-uploads/:path*",
              destination: `${MINIO_TARGET}/mysyndic-uploads/:path*`,
            },
            {
              source: "/mysyndic-documents/:path*",
              destination: `${MINIO_TARGET}/mysyndic-documents/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
