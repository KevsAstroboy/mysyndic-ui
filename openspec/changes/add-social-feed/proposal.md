## Why

La cité n'a aujourd'hui aucun espace de publication sociale : les habitants communiquent via messages privés/groupe et les modules `annonce`/`incident`, mais il n'existe ni fil de publications, ni likes, ni commentaires. Le backend `mysyndic-api` a déjà une base feed v1 (`feed_post`, `feed_post_media`, `feed_post_like`, `feed_post_commentaire`, migration `0007_feed.sql`) mais le frontend n'a **rien** (aucune route, composant, hook ou appel API). Cette change livre le feed social côté UI et corrige 6 écarts du contrat backend nécessaires à une expérience premium (like idempotent, DTO commentaire unifié, pagination commentaires, métadonnées média, avatar auteur, événements socket).

## What Changes

- **Nouvel onglet `/feed` accessible aux 5 rôles** (HABITANT, SYNDIC, ADMIN, SUPER_ADMIN, CHEF_SECURITE), route partagée dans le groupe `(habitant)` (shell adapté par rôle), entrée dans les 5 navs + `ROLE_PATHS`.
- **Fil paginé par curseur** (`useInfiniteQuery`, `GET /api/feed?cursor&limit`), infinite scroll `IntersectionObserver`, skeletons fidèles, empty/error premium, refresh non clignotant.
- **PostCard** : auteur + date relative + menu, texte (`Voir plus`), médias 1-2-3 photos (ratio depuis dimensions, `object-fit:cover`, anti-CLS), 1 vidéo max (player custom : play/pause, progression, mute, fullscreen, autoplay muted visible), lightbox galerie (clavier, ESC, clic extérieur).
- **Likes optimistes** multi-pages avec rollback, sans refetch du feed.
- **Commentaires 2 niveaux** : preview sur la card, panneau `BottomSheet`/modal, endpoint paginé dédié, composer sticky, réponse à un commentaire (profondeur max 2), insertion optimiste + scroll/focus.
- **Création de post** (`CreatePostSheet`) : texte + compteur `n=5000`, sélection média (≤3 photos XOR 1 vidéo), validation type/taille, previews, réorganisation, `ProgressBar` upload, erreurs/toasts via Design System, jamais `alert()`.
- **Temps réel** : écoute socket `feed:nouveau`, `feed:like`, `feed:commentaire`, `feed:suppression` et mise à jour ciblée du cache.
- **Corrections backend** (repo `mysyndic-api`) : unlike idempotent (`POST` like / `DELETE` unlike), `toCommentNode` unifié, `GET /feed/:id/commentaires` paginé + `GET /feed/:id` allégé, `media_meta` (largeur/hauteur/durée envoyés par le client), `auteur.photo_url` presignée, payloads socket enrichis.
- **Accessibilité & performance** : navigation clavier, focus management, `aria-label`, `prefers-reduced-motion`, lazy media, une seule vidéo active, mémoïsation.

## Capabilities

### New Capabilities
- `social-feed`: fil de publications d'une cité — création (texte/1-3 photos/1 vidéo), affichage (card, médias, lightbox, player), likes optimistes, commentaires 2 niveaux, pagination curseur, temps réel, états UI complets.

### Modified Capabilities
<!-- Aucune spec `openspec/specs/` existante modifiée. Les changements backend sont des corrections du module feed v1, non encore spécifié. -->

## Impact

- **Frontend (`mysyndic-ui`)** : nouveau `src/components/features/feed/*`, `src/lib/api/feed.ts`, `src/lib/hooks/feed/*`, `src/types/feed.types.ts`, `src/app/(habitant)/feed/page.tsx`, `src/lib/utils/toast.ts` + `ToastHost`; modifications `queryKeys.ts`, `SocketSync.tsx`, `navItems.ts`, `rbac.ts`, providers.
- **Backend (`mysyndic-api`)** : `src/modules/feed/feed.service.ts`, `feed.controller.ts`, `dto/create-post.dto.ts`, `dto/feed-query.dto.ts` (+ nouveau DTO commentaires), pas de nouvelle migration (colonnes `largeur/hauteur/duree_sec` déjà présentes).
- **API** : aucun endpoint cassé pour l'existant (le feed n'est consommé nulle part aujourd'hui) ; `GET /feed/:id` change de forme (allégé) — acceptable car non utilisé.
- **Docs** : régénération de `MySyndic.postman_collection.json` (`npm run postman:generate`).
- **Tests** : `npm run typecheck` + `npm run build` côté UI ; `npm run build` + `npm run test` côté API.
