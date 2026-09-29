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

- **`POST /incidents` (multipart, photo)** : `categorie_id` arrive en **texte**
  dans le multipart (`"2"`). Le DTO doit `@Type(() => Number)` (ou implicit
  conversion) sur les champs numériques, sinon `400 "categorie_id must be an
  integer number"`. Le front contourne en envoyant du JSON quand il n'y a pas
  de photo.
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

## 4. Sous-compte Paystack par cité — BLoquant (super admin)

Le super admin doit pouvoir **créer le sous-compte Paystack d'une cité** depuis
la gestion de ladite cité (`/cites/{id}`, onglet Configuration), avec un code
`subaccount_code` en retour pour le persister automatiquement.

### État actuel

- `POST /configuration/paystack/subaccount` existe (page Configuration de
  l'espace admin) : crée le sous-compte **de la cité courante** (contexte du
  profil actif) et persiste le code. Le super admin n'a pas de cité courante
  fiable → inutilisable pour gérer une autre cité que la sienne.

### Endpoint à ajouter

| Endpoint | Usage UI |
|---|---|
| `POST /cites/{citeId}/paystack/subaccount` | CiteManager → onglet Configuration → « Créer le sous-compte » |

### Comportement attendu

1. Le front envoie le compte de règlement (sans jamais connaître la clé secrète).
2. Le backend appelle Paystack `POST https://api.paystack.co/subaccount` avec la
   **clé secrète mère** (env ou vault — jamais exposée au front).
3. Succès → le backend persiste `subaccount_code` dans la configuration de la
   cité (`PATCH /cites/{id}/configuration` interne) et renvoie le code.

### Requête

```
POST /cites/{citeId}/paystack/subaccount
Authorization: Bearer <super_admin>
Content-Type: application/json

{
  "business_name": "Résidence Synacassy 1",   // prérempli avec le nom de la cité
  "settlement_bank": "044",                    // code banque de règlement
  "account_number": "0123456789",              // numéro de compte
  "percentage_charge": 0,                      // commission plateforme (%)
  "paystack_subaccount_mode": "SIMPLE",        // SIMPLE (commission) ou SPLIT
  "paystack_subaccount_split": 90              // part cité (SPLIT uniquement)
}
```

### Réponse attendue

```json
{
  "paystack_subaccount_code": "SUB_XXXXX"
}
```

### Règle anti double-prélèvement (à imposer côté backend)

- `percentage_charge > 0` **et** `paystack_subaccount_mode = "SPLIT"` sont
  **mutuellement exclusifs** : si une commission est active sur le sous-compte,
  rejeter le mode SPLIT (`400 ANTI_DOUBLE_LEVIER`).
- Exposer `percentage_charge` dans `GET /cites/{citeId}/configuration` pour que
  le front puisse verrouiller le mode SPLIT (protection de l'existant).

> Le frontend met à jour l'affichage localement (statut « Connecté » + code
> copiable, mode réglé dans le wizard) et invalide `["sa","config",citeId]` +
> `["cites"]`.

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
