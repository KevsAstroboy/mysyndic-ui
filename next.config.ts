import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Un package-lock.json parasite dans /home/abdia fait croire à Next que la
  // racine du workspace est le home. On fixe la racine sur le projet.
  outputFileTracingRoot: path.join(__dirname),
  // Poste de dev à mémoire limitée : plusieurs workers de build provoquent des
  // PageNotFoundError/ENOENT aléatoires (fichiers .next manquants). 1 worker
  // fiabilise le build. Retirer pour accélérer sur une machine libre.
  experimental: { cpus: 1 },
};

export default nextConfig;
