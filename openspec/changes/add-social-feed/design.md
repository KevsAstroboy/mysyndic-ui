## Context

`mysyndic-ui` : Next.js 15 (App Router), React 19, TanStack Query v5, axios (intercepteur Bearer + refresh 401), zustand (session), framer-motion, socket.io-client, Tailwind sur design tokens `globals.css`/`tailwind.config.ts`. La couche API suit `lib/api/<domaine>.ts` + `QUERY_KEYS` centralisés ; les types `src/types/*.types.ts` sont en **snake_case** alignés sur le backend (null-cleaning → champs optionnels). UI kit dans `components/ui` (Button, Card, Avatar, BottomSheet, Modal, Skeleton, Spinner, EmptyState, Input, Chip, ProgressBar, ConfirmDialog, PhotoUpload…). Images protégées chargées en blob via `useAuthedImage`. Temps réel centralisé dans `SocketSync` (invalidation ciblée). RBAC front via `hasFeature` + `ROLE_PATHS`.

`mysyndic-api` : NestJS. Module feed déjà présent et monté (`FeedModule` dans `app.module.ts`, dépendances globales). Modèles Prisma `feed_post`, `feed_post_media` (colonnes `largeur/hauteur/duree_sec`), `feed_post_like`, `feed_post_commentaire` (`niveau` 1|2). Médias stockés MinIO via `StorageService`, URLs presignées (TTL config `MINIO_PRESIGNED_URL_TTL_SEC`, défaut 3600). Features RBAC `FEED_*` octroyées à tous les profils. Socket : room `cite:{citeId}`, événements `feed:*` déjà émis.

## Goals / Non-Goals

**Goals:**
- Feed social complet et premium : fil, card riche, médias, likes optimistes, commentaires 2 niveaux, création de post, temps réel.
- Adapter l'implémentation aux conventions existantes (API layer, query keys, types snake_case, UI kit, shell/nav, socket) — aucun design system parallèle.
- Corriger les écarts backend bloquants pour une UX propre (like idempotent, DTO commentaire unifié, pagination commentaires, métadonnées média, avatar auteur, payloads socket).
- États UI complets (default/hover/active/focus/disabled/loading/optimistic/success/error/empty) + accessibilité réelle.
- Performance : pas de duplication du feed, pas de refetch global après like/commentaire, lazy média, une seule vidéo active.

**Non-Goals:**
- Pas de like/suppression de commentaire (non présents en base) ; pas d'édition de post.
- Pas de génération de poster vidéo ni de transcodage (V2) ; lecture via `preload="metadata"`.
- Pas de notifications push natives ; le toast in-app existant suffit (+ toast générique pour les erreurs d'action).
- Pas de refonte du système de notification ni du gateway socket.
- Pas de changement de schéma Prisma.

## Decisions

1. **Placement `/feed` tous rôles.** Route `src/app/(habitant)/feed/page.tsx` : le layout `(habitant)` rend déjà `RoleShell` selon `profilActif`, donc un seul point d'entrée sert les 5 rôles. Ajout de `"/feed"` dans `ROLE_PATHS` (5 rôles) et d'une entrée nav dans `HABITANT_NAV/SYNDIC_NAV/ADMIN_NAV/SUPER_ADMIN_NAV/SECURITE_NAV`. *Trade-off* : `BottomNav` habitant passe à 6 items.

2. **`useInfiniteQuery` (nouveau dans le projet) pour le fil.** `GET /api/feed?cursor&limit` renvoie `{ items, next_cursor }` → `getNextPageParam`. Le feed n'existe qu'une seule fois dans le cache (pas de copie locale). *Alternative rejetée* : pagination page/size de `get-by-criteria` — renvoie des `feed_post` bruts sans média/likes.

3. **Likes optimistes multi-pages.** `useLikePost` : `cancelQueries`, `setQueryData` sur toutes les pages (flip `liked_by_me`/`likes_count`), `onError` rollback, `onSettled` réconciliation avec `likes_count` serveur. Un état `pending` par post empêche les doubles requêtes (clics rapides). Aucun `invalidateQueries` du feed.

4. **Commentaires via endpoint dédié paginé.** `GET /api/feed/:id/commentaires?cursor&limit` → `{ items: CommentNode[], next_cursor }`, top-level `niveau=1` keyset ascendant, réponses `niveau=2` incluses par page. `GET /api/feed/:id` allégé (post + media + likes + compteurs, sans arbre complet). *Alternative rejetée* : garder l'arbre complet — charge/rendu ingérables sur posts très commentés.

5. **Métadonnées média côté client.** Le front lit `largeur/hauteur/duree_sec` via `Image`/`<video>` avant upload et les envoie dans un champ multipart `media_meta` (JSON array aligné `media[]`). Le backend valide/clampe et persiste. Pas de dépendance native (`sharp`/`ffmpeg`). Poster vidéo différé (V2).

6. **Avatar auteur presigné.** Le backend ajoute `auteur.photo_url` (URL pré-signée MinIO, cache par requête) à chaque post/commentaire. Fallback UI : initiales (`Avatar`) si absent. *Alternative rejetée* : `/files/presign` à la volée — TTL court et complexité côté client.

7. **Player vidéo custom + policy une seule vidéo.** `VideoPlayer` : autoplay `muted` uniquement si visible (IntersectionObserver) et autorisé ; contrôles play/pause, progression/seek, mute, fullscreen ; loading/error ; registre module pour n'activer qu'une vidéo à la fois. Client restreint l'upload aux formats lisibles (mp4/webm) alors que le backend reste permissif sur `video/*` — écart documenté.

8. **Temps réel via `SocketSync`.** Écoute `feed:nouveau` (prepend/invalidate ciblé), `feed:like` (maj compteur si auteur ≠ moi), `feed:commentaire` (invalidate preview/commentaires du post), `feed:suppression` (retrait du post). Aucun refetch global.

9. **Toasts génériques.** Ajout d'un petit `toast` (événement window + `ToastHost`) pour les erreurs/succès d'action, sans détourner `NotificationToaster` (spécifique notifications).

10. **`media_meta` et validation DTO.** Le `create-post.dto.ts` accepte `media_meta?: string` (JSON) validé en service (bornes, types). `whitelist/forbidNonWhitelisted` global déjà actif → le champ doit être décoré.

## Risks / Trade-offs

- [URLs presignées TTL 1h vs cache client long] → média/avatar peuvent devenir invalides en session longue ; mitigation : TTL configurable, refetch ciblé, fallback visuel.
- [Backend accepte tout `video/*` mais navigateurs limités] → restriction client mp4/webm + message d'erreur explicite ; écart documenté.
- [Curseur commentaires ascendant `id` seul] → valider absence de doublon/saut ; `created_at` en microsecondes limite les égalités.
- [`GET /feed/:id` change de forme] → aucun consommateur existant, risque nul.
- [6 items `BottomNav`] → surveiller densité mobile ; possible regroupement ultérieur.
- [Aucune maquette feed existante dans `/design`] → design à créer en respectant strictement les tokens.
- [Pas de poster ni transcodage] → première frame via `preload="metadata"` ; acceptable MVP.
