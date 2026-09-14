# LEARN-NEXT — Lire MySyndic comme un backend

> **Pour qui ?** Un développeur backend qui découvre le front. Ce fichier est la **carte de l'application réelle** (`mysyndic-ui`) : comment elle est organisée, pourquoi ces choix, comment elle appelle le backend. Il accompagne le cours dans `../next-cours/` où tu construiras un **clone minimaliste** branché sur les **mêmes endpoints**.

> Prérequis : tu sais lire du code, tu connais HTTP/JSON, tu as déjà un backend NestJS en tête (l'API de MySyndic tourne sur `http://localhost:3000`, préfixe global `/api`).

---

## 1. Vue d'ensemble — la stack et *pourquoi*

| Brique | Outil | Rôle | Analogie backend |
|---|---|---|---|
| Framework | **Next.js 15 (App Router)** | Routing, rendu, middleware | Routeur + contrôleurs |
| UI | **React 19** | Composants | Templates/partials réutilisables |
| Langage | **TypeScript** | Types partagés | TypeORM/classes |
| Styles | **Tailwind CSS** | CSS utilitaire | *(pas d'équivalent : c'est du CSS)* |
| État serveur (données API) | **TanStack Query** | Fetch + cache | Repository + cache |
| État client (session, thème) | **Zustand** | Petit store global | Session/context |
| HTTP | **axios** | Client HTTP + intercepteurs | fetch/axios côté Node |
| Temps réel | **socket.io-client** | Push WS | WebSocket gateway |
| Animations | **framer-motion** | Transitions | — |
| Icônes | **lucide-react** | SVG icons | — |

**Choix clés expliqués :**

- **TanStack Query pour les données API, PAS `useEffect`+fetch.** C'est le choix n°1 à retenir. Il donne : cache en mémoire, déduplication des requêtes, retries, invalidation/synchronisation, états `isLoading/isError/isPending`. C'est l'équivalent d'un *repository avec cache et observabilité*.
- **Zustand pour l'état *client* uniquement** (qui est connecté, token, profil actif, thème). Query s'occupe des données serveur ; Zustand des données de session. Deux problèmes ≠ deux outils.
- **axios pour les intercepteurs** : injection automatique du `Bearer`, et **refresh automatique du token** sur 401 (crucial pour une session longue).
- **Un fichier API par domaine** (`lib/api/alerte.ts`, `paiement.ts`…) : chaque endpoint backend a **une fonction front typée**. C'est ta couche "client HTTP".
- **Route groups** `(auth)`, `(habitant)`, `(syndic)`… : organiser les pages SANS ajouter de segment d'URL. Le layout d'un groupe s'applique à toutes ses routes.

---

## 2. Arborescence commentée

```
mysyndic-ui/
├── design/                  # Maquettes HTML source (à reproduire en code)
├── src/
│   ├── middleware.ts        # Garde d'auth au niveau du ROUTEUR (avant rendu)
│   ├── app/
│   │   ├── layout.tsx       # Layout racine (fonts, providers)
│   │   ├── globals.css      # Design tokens + styles de base + animations
│   │   ├── (auth)/login/…   # Pages publiques (route group sans URL)
│   │   ├── (habitant)/…     # Espace habitant (accueil, quartier, messages…)
│   │   ├── (syndic)/…       # Espace syndic
│   │   └── (securite)/…     # Espace chef de sécurité
│   ├── components/
│   │   ├── ui/              # Primitives réutilisables : Button, Card, Avatar,
│   │   │                    #   Skeleton, Spinner, BottomSheet, Modal, Input…
│   │   ├── layout/          # Sidebar, TopBar, BottomNav, RoleShell, PageHeader
│   │   ├── features/        # Composants MÉTIER, 1 dossier par domaine
│   │   │   └── alerte/, paiement/, message/, incident/…
│   │   └── providers/       # QueryProvider, SocketSync, NotificationToaster
│   ├── lib/
│   │   ├── api/             # ★ LA couche API (voir §4)
│   │   ├── hooks/           # useAuth, useCurrentVilla, useNotifications…
│   │   ├── store/           # authStore (Zustand + persist), themeStore
│   │   ├── socket.ts        # Connexion socket.io singleton
│   │   └── utils/           # cn(), apiError(), formatDate(), rbac(), cotisation()
│   └── types/               # Types TS par domaine (alignés sur le backend)
```

**Convention de séparation** (la plus importante) :
- `components/ui/*` = **sans métier** (bouton, carte, modal…). Réutilisable partout.
- `components/features/*` = **avec métier** (une carte d'alerte, un formulaire de paiement).
- `lib/api/*` = **toutes les appels HTTP**, jamais d'appel API éparpillé dans les pages.

---

## 3. Le cycle d'une page (mental model)

1. **Route** : l'utilisateur va sur `/quartier/alertes` → Next charge `app/(habitant)/quartier/alertes/page.tsx`.
2. **Middleware** : avant le rendu, `src/middleware.ts` vérifie le cookie `access_token`, décode le JWT, contrôle le rôle autorisé pour le segment de route, sinon redirige.
3. **Page (composant client)** : elle appelle un **hook** (`useQuery`) qui appelle une **fonction de `lib/api`** qui appelle **axios** → `GET /api/alertes/mes-alertes`.
4. **React Query** : gère le cache, renvoie `{ data, isLoading, isError }`.
5. **Rendu** : la page affiche des `Skeleton` pendant `isLoading`, la liste quand `data`, un `EmptyState` sinon.
6. **Actions** : un bouton déclenche `useMutation` → `POST/PATCH/DELETE` → `invalidateQueries` pour re-fetch la liste.

---

## 4. La couche API (le cœur à comprendre)

### 4.1 L'instance axios — `src/lib/api/axios.ts`

```ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`, // le backend expose un préfixe global /api
});
```

Deux intercepteurs :
- **Request** : injecte `Authorization: Bearer <access_token>` depuis le store Zustand à chaque appel.
- **Response** : sur 401 → tente un refresh via `POST /auth/refresh` avec le `refresh_token`, met à jour le store, rejoue la requête. Si le refresh échoue → `logout()` + redirection `/login`. Gère aussi `MUST_CHANGE_PASSWORD` et `CITE_INACTIVE`.

> ⚠️ Le cookie `access_token` (posé par le front au login) sert au **middleware** et aux **`<img src=…>`** (qui ne peuvent pas envoyer d'en-tête `Authorization`). Le backend accepte le Bearer **et** ce cookie.

### 4.2 Un fichier par domaine — `src/lib/api/alerte.ts`

```ts
export const alerteApi = {
  motifs: () => api.get<MotifAlerte[]>("/alertes/motifs").then((r) => r.data),

  mesAlertes: (params: { page?: number; size?: number } = {}) =>
    api.get<MesAlertesResponse>("/alertes/mes-alertes", { params })
       .then((r) => r.data),

  // Multipart (photo) → on construit un FormData, axios pose le bon Content-Type.
  create: (dto: { description?: string; motif_id?: number; photo?: File | null }) => {
    const fd = new FormData();
    if (dto.description) fd.append("description", dto.description);
    if (dto.motif_id) fd.append("motif_id", String(dto.motif_id));
    if (dto.photo) fd.append("photo", dto.photo);
    return api.post("/alertes", fd).then((r) => r.data);
  },
};
```

Chaque méthode = **1 endpoint backend**, typé en entrée ET en sortie. Les pages ne connaissent jamais l'URL brute.

### 4.3 Les clés de cache — `src/lib/api/queryKeys.ts`

```ts
export const QUERY_KEYS = {
  mesAlertes: (page: number, size: number) => ["alertes", "mes-alertes", page, size],
  conversations: () => ["messages", "conversations"],
  me: () => ["users", "me"],
  // …
};
```

Une clé identifie **une donnée précise** dans le cache. Pour re-fetch après une mutation : `invalidateQueries({ queryKey: QUERY_KEYS.mesAlertes(...) })`.

### 4.4 Usage dans une page — `useQuery` / `useMutation`

```tsx
const all = useQuery({
  queryKey: QUERY_KEYS.mesAlertes(1, 1000),
  queryFn: () => alerteApi.mesAlertes({ page: 1, size: 1000 }),
});

const send = useMutation({
  mutationFn: () => alerteApi.create({ description, photo }),
  onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.mesAlertes(1, 1000) }),
});
```

---

## 5. Auth, rôles et multi-profils

1. **Login** (`components/features/auth/LoginForm`) : `POST /auth/login` → réponse `{ user, profils, access_token, refresh_token, … }` → `setSession(data)` dans **authStore** (Zustand + `persist`).
2. **authStore** garde : `user`, `accessToken`, `refreshToken`, `profils[]`, `profilActif`, `citeId`, `features[]`. Il pose aussi le **cookie** `access_token`.
3. **Middleware** (`src/middleware.ts`) : décode le JWT (partie payload, base64), lit `role`, autorise le préfixe de route selon `ROLE_PATHS`, sinon redirige vers le dashboard du rôle (`ROLE_ROUTES`).
4. **Multi-profils** : un compte peut être SYNDIC **et** HABITANT. `redirectAfterAuth()` → si plusieurs profils, envoie vers `/profil-switcher` ; `switchContext(user_profil_id)` → `POST /auth/context` → nouveau token → `setSession`.
5. **Rôles** : `SUPER_ADMIN`, `ADMIN`, `SYNDIC`, `CHEF_SECURITE`, `HABITANT`. Chaque rôle a sa nav (`navItems.ts`) et son layout (`RoleShell`).

> Le `middleware` est une **garde UX** (déjà connecté ? bon rôle ?). La **sécurité réelle** est côté backend (JWT + RBAC). Ne jamais faire confiance au front.

---

## 6. Design system — des tokens aux composants

- **Source** : maquettes HTML dans `/design/*.html`.
- **Tokens CSS** dans `globals.css` (`:root`) : couleurs (`--primary`, `--gold`, `--danger`…), radius (`--r-md`…), ombres (`--shadow-card`…).
- **Tokens Tailwind** dans `tailwind.config.ts` : ces mêmes valeurs deviennent des classes utilitaires : `bg-primary`, `text-ink-3`, `rounded-md`, `shadow-card`, `border-border`…
- **Composants UI** (`components/ui/`) encapsulent les styles : `<Button variant="danger" loading>`, `<Skeleton className="h-28">`, `<Spinner/>`, `<Avatar name src>`, `<Chip>`, `<StatusPill>`, `<BottomSheet>`, `<Modal>`, `<EmptyState>`.
- **`cn()`** (`lib/utils/cn.ts`) : concatène des classes conditionnelles.
- **Squelettes** : `Skeleton` (shimmer) pour les états de chargement ; `Spinner` pour les boutons en cours.

Règle d'or : **on ne met presque jamais de styles inline** ; on utilise les tokens via les classes Tailwind pour rester cohérent.

---

## 7. Temps réel (sockets)

- `lib/socket.ts` : singleton socket.io-client, handshake avec `auth: { token }`.
- `components/providers/SocketSync.tsx` : écoute `message:new`, `notification:nouvelle`, `alerte:*` → invalide le cache React Query (et déclenche les toasts).
- `components/providers/NotificationToaster.tsx` : affiche les toasts (notification + son).

Backend correspondant : gateway NestJS `ChatGateway` (rooms `user:{id}`, `cite:{citeId}`).

---

## 8. Par où commencer (map de lecture)

1. `src/lib/api/axios.ts` → comment part un appel.
2. `src/lib/api/alerte.ts` + `queryKeys.ts` → la couche domaine.
3. `src/app/(habitant)/quartier/alertes/page.tsx` → une page complète (query + skeletons + pagination).
4. `src/components/features/alerte/AlerteSheet.tsx` → formulaire + mutation + photo (multipart).
5. `src/lib/store/authStore.ts` + `src/middleware.ts` → auth.
6. `tailwind.config.ts` + `globals.css` + `components/ui/Button.tsx` → le design system.

---

## 9. Et maintenant ?

Le cours complet est dans **`../next-cours/`** (voir `MISSION.md`). Tu y construiras **`mini-mysyndic/`**, un clone minimaliste (login + layout + liste + formulaire) branché sur **les mêmes endpoints** que cette app — en apprenant Tailwind et le layouting au passage. Ce fichier reste ta référence pour comprendre chaque choix de l'original.
