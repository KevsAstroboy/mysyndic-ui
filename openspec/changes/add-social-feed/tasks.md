## 1. Backend — corrections contrat feed (`mysyndic-api`)

- [x] 1.1 Split `toggleLike` → `like()` (POST) / `unlike()` (DELETE) idempotents ; retour `{ liked, likes_count }` ; brancher le contrôleur
- [x] 1.2 Ajouter `toCommentBase()`/`toCommentNode()` unifiés et les utiliser dans `findOne`, `addCommentaire`, `repondre`
- [x] 1.3 Ajouter `GET /feed/:id/commentaires?cursor&limit` (keyset niveau=1 + réponses groupées) ; alléger `GET /feed/:id` (sans arbre complet)
- [x] 1.4 Accepter `media_meta` dans `CreatePostDto` (JSON) ; valider/clamp dans le service ; persister `largeur/hauteur/duree_sec`
- [x] 1.5 Ajouter `auteur.photo_url` presignée (helper + cache requête) sur posts et commentaires
- [x] 1.6 Enrichir socket : `feed:like` porte `likes_count` ; `remove` émet `feed:suppression { post_id }`
- [~] 1.7 `tsc --noEmit` 0 erreur (fait) ; `nest build` + `npm run postman:generate` bloqués par `dist/` root-owned + config ts-node ESM (outillage, hors code)

## 2. Frontend — socle

- [x] 2.1 `src/types/feed.types.ts` (FeedAuthor, FeedMedia, FeedPost, FeedComment, FeedPage, MediaMeta, MediaItem) en snake_case, champs optionnels
- [x] 2.2 `src/lib/api/feed.ts` : `list`, `get`, `create` (FormData + `media_meta` + `onUploadProgress`), `remove`, `like`, `unlike`, `comments`, `addComment`, `reply`
- [x] 2.3 `queryKeys.ts` : `feedList`, `feedPost(id)`, `feedComments(id)`
- [x] 2.4 `src/lib/hooks/feed/` : `useFeed`, `useLikePost`, `useCreatePost`, `useComments`, `useCreateComment`, `useDeletePost`, `patchPost`
- [x] 2.5 `SocketSync` : écoute `feed:nouveau`, `feed:like`, `feed:commentaire`, `feed:suppression` (maj ciblée, filtre self)
- [x] 2.6 `src/lib/utils/toast.ts` + `ToastHost` (+ montage provider)

## 3. Frontend — lecture du fil

- [x] 3.1 Route `src/app/(habitant)/feed/page.tsx` ; `ROLE_PATHS["/feed"]` (5 rôles) ; entrées nav (5 navs)
- [x] 3.2 `FeedList` : infinite scroll IntersectionObserver, skeletons, empty state, error non-bloquant + Réessayer, refresh
- [x] 3.3 `PostSkeleton`, `PostCard` (memo), `PostHeader` (avatar/date/menu suppression), `PostContent` (Voir plus, sauts de ligne)
- [x] 3.4 `PostMedia` (0/1/2/3 images + vidéo, proportions, lazy, états loading/error)
- [x] 3.5 `VideoPlayer` (contrôles custom, autoplay muted visible, une seule vidéo active)
- [x] 3.6 `ImageLightbox` (portal, clavier ←/→/Esc, clic extérieur, compteur)

## 4. Frontend — interactions

- [x] 4.1 `PostActions` : like optimiste animé (aria-pressed/label), bouton commentaire, compteurs, états disabled/loading
- [x] 4.2 `PostCommentsPreview` : compteur + 2 previews + « Voir les X commentaires »
- [x] 4.3 `CommentsSheet` : BottomSheet/modal, pagination, scroll infini interne, composer sticky, bandeau réponse annulable, focus auto
- [x] 4.4 `CommentItem` : avatar, auteur, date, texte, répondre ; profondeur max 2 (réponse à une réponse → racine)
- [x] 4.5 Composer : textarea, send, insertion optimiste + scroll/focus, compteur local (compteur post maj)

## 5. Frontend — création de post

- [x] 5.1 `MediaPickerGrid` : ≤3 photos XOR 1 vidéo (mix refusé inline), validation type/taille, previews, suppression, réorganisation, lecture dims/durée
- [x] 5.2 `CreatePostSheet` : textarea + compteur 5000, previews, `ProgressBar` upload, disabled/pending, erreur `apiErrorMessage`, success + toast
- [x] 5.3 Limites par défaut `3`/`50` (configuration `FEED_*` non lue pour l'instant — TODO)

## 6. Frontend — a11y, perf, responsive

- [x] 6.1 `MotionConfig reducedMotion="user"` global + `usePrefersReducedMotion` + media query CSS
- [x] 6.2 Focus visible, `aria-label` icon-only, ESC overlays, alt images, focus composer
- [x] 6.3 Mobile-first (média quasi edge-to-edge, touch targets, sheets) / desktop (feed centré, hover, clavier)
- [x] 6.4 Perf : memo, cache unique, lazy images/vidéos, proportions, une seule vidéo, mutations locales

## 7. Vérification

- [x] 7.1 Frontend : `npm run typecheck` + `npm run build` 0 erreur (`/feed` généré)
- [~] 7.2 Backend : `tsc --noEmit` 0 erreur ; `npm run test` → aucun test présent (config jest, pré-existant)
- [ ] 7.3 Matrice manuelle DoD (à dérouler avec backend démarré) : texte / 1-2-3 photos / 1 vidéo / previews / création / like optimiste + rollback / commentaires / replies 2 niveaux / compteurs / infinite scroll / loading-empty-error / mobile-desktop / a11y
