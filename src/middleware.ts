import { NextResponse, type NextRequest } from "next/server";
import { ROLE_PATHS, ROLE_ROUTES } from "@/lib/utils/rbac";

const ACCESS_COOKIE = "access_token";

const AUTH_PATHS = [
  "/login",
  "/register",
  "/activate",
  "/forgot-password",
  "/reset-password",
];

interface JwtPayload {
  sub: string;
  role: string;
  cite_id: string | null;
  must_change_password: boolean;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

function homeFor(role: string | undefined): string {
  return ROLE_ROUTES[role ?? ""] ?? "/accueil";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_COOKIE)?.value ?? null;
  const payload = token ? decodeJwt(token) : null;

  // Racine → selon l'état
  if (pathname === "/") {
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.must_change_password)
      return NextResponse.redirect(new URL("/change-password", req.url));
    return NextResponse.redirect(new URL(homeFor(payload.role), req.url));
  }

  const isAuthPath = AUTH_PATHS.includes(pathname);

  // Écrans d'auth : si connecté, renvoyer vers son espace
  if (isAuthPath) {
    if (payload) {
      if (payload.must_change_password)
        return NextResponse.redirect(new URL("/change-password", req.url));
      return NextResponse.redirect(new URL(homeFor(payload.role), req.url));
    }
    return NextResponse.next();
  }

  // Change-password : connexion requise
  if (pathname === "/change-password") {
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  // Sélecteur de profil : connexion requise, sans must_change_password
  if (pathname === "/profil-switcher") {
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.must_change_password)
      return NextResponse.redirect(new URL("/change-password", req.url));
    return NextResponse.next();
  }

  // Routes protégées
  if (!payload) return NextResponse.redirect(new URL("/login", req.url));

  if (payload.must_change_password)
    return NextResponse.redirect(new URL("/change-password", req.url));

  // Vérification rôle
  const firstSegment = "/" + pathname.split("/")[1];
  const allowedRoles = ROLE_PATHS[firstSegment];
  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return NextResponse.redirect(new URL(homeFor(payload.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|ico)$).*)",
  ],
};
