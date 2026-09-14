# Backend — Endpoints manquants (MySyndic)

Spécification des endpoints et événements absents du backend (`mysyndic-api`) mais
nécessaires au frontend (`mysyndic-ui`). Vérifié sur les controllers, le schéma
Prisma, la collection Postman et les designs HTML.

---

## 1. Listes de référence — BLOQUANT

Ces tables existent en base (`id`, `libelle`, `code`, `is_deleted`) mais **aucun
endpoint ne les expose**. Le frontend ne peut pas les hardcoder : elles vivent en
DB et sont modifiables.

### Convention générale

- Lecture seule, accessible à tout profil connecté (pas de `@RequireFeature`).
- Réponse : tableau d'objets `{ id, libelle, code }` (filtre `is_deleted = false`).
- Le nettoyage null s'applique (clés nulles absentes).

### Endpoints

| Table | Endpoint | Usage UI |
|---|---|---|
| `motif_alerte` | `GET /alertes/motifs` | FAB urgence — 4 motifs (Intrusion / Agression, Malaise médical, Incendie, Autre urgence) |
| `statut_alerte` | `GET /alertes/statuts` | AlerteCard — libellés + actions (RECUE → AGENT_EN_ROUTE → AGENT_SUR_PLACE → RESOLU) |
| `categorie_incident` | `GET /incidents/categories` | Chips filtres (champ `icon_name` inclus) |
| `categorie_annonce` | `GET /annonces/categories` | Chips annonces (Sécurité, Cotisation…) |
| `categorie_conflit` | `GET /conflits/categories` | Chips conflits |
| `statut_conflit` | `GET /conflits/statuts` | Stepper 3 étapes (Signalé → Médiation → Résolu) |
| `type_document` | `GET /documents/types` | Formulaire upload (champ `extension`, `code`) |
| `type_notification` | `GET /notifications/types` | Basse priorité — l'UI lit `titre`/`message` directement |

### Exemple de réponse attendue

```json
[
  { "id": 1, "libelle": "Intrusion / Agression", "code": "INTRUSION" },
  { "id": 2, "libelle": "Malaise médical", "code": "MEDICAL" },
  { "id": 3, "libelle": "Incendie", "code": "INCENDIE" },
  { "id": 4, "libelle": "Autre urgence", "code": "AUTRE" }
]
```

> `categorie_incident` : ajouter `icon_name` dans la réponse (déjà présent en DB).

---

## 2. Événements Socket.io — manquants (design temps réel)

Le backend n'émet que `message:new`. Le design exige un flux temps réel complet.

### État actuel

- `ChatGateway` : rooms `user:{userId}` et `cite:{citeId}`, handshake `auth.token`.
- Seul `message` module émet (`message:new`).
- `alerte-securite` et `notification` n'utilisent pas le gateway.

### Événements à ajouter

| Événement | Room | Besoin UI |
|---|---|---|
| `message:lu` | `user:{id}` | Ticks "✓✓ lu" en direct (aujourd'hui uniquement HTTP `PATCH /messages/{id}/lu`) |
| `alerte:nouvelle` | `cite:{cite_id}` | Feed chef sécurité en direct |
| `alerte:statut` | `cite:{cite_id}` | Changement statut en direct (RECUE → … → RESOLU) |
| `alerte:escaladee` | `cite:{cite_id}` | Badge escalade clignotant |
| `notification:nouvelle` | `user:{id}` | Cloche + toast live |

### Payloads suggérés

```jsonc
// message:lu
{ "message_id": "uuid", "user_id": "uuid" }

// alerte:nouvelle
{ "alerte": { "id": "uuid", "motif_id": 1, "statut_id": 1, "villa": { "numero": "31" }, "created_at": "…", "escalade": false, "silencieuse": false } }

// alerte:statut
{ "alerte_id": "uuid", "statut_id": 2 }

// alerte:escaladee
{ "alerte_id": "uuid", "escalade_at": "…" }

// notification:nouvelle
{ "id": "uuid", "type_id": 5, "titre": "…", "message": "…", "data": { "message_id": "…" }, "created_at": "…" }
```

---

## 3. Améliorations optionnelles (non bloquant)

- **`GET /messages/conversations`** : renvoie `other_user_id` sans nom/avatar.
  Le frontend doit faire `GET /users` + map côté client.
  Option : enrichir avec `contact: { prenom, nom }`.
- **`GET /files/presign?path=…`** : `GET /files/preview` exige un header JWT
  (impossible en `<img>` nu, fallback blob). Une URL signée simplifierait
  l'affichage des photos alerte/incident.
- **`GET /paiements/{id}`** : vérifier le statut après retour Paystack.
  `get-by-criteria` suffit, mais un statut par id serait plus net.
- **`GET /dashboard/summary`** : KPIs syndic actuellement calculés côté front
  via `recouvrement` / `impayes` / `villas` / `users`.

---

## Déjà couvert (aucun ajout nécessaire)

- `GET /users/me` → villa courante (`{ id, numero, rue }`) + cité. L'habitant a
  son `villaId`.
- `GET /public/cites` + `GET /public/cites/{citeId}/villas` → inscription
  (sélection de villa).
- Un seul groupe par cité (`groupe_cite`), thread groupe = `__groupe__`.
  Pas de gestion multi-groupes requise.

---

## Priorités

1. **§1 Listes de référence** — bloquant pour démarrer le frontend.
2. **§2 Socket** — ajout progressif pendant le dev des listeners front.
3. **§3 Améliorations** — au fil de l'eau.
