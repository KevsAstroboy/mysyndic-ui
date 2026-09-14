## ADDED Requirements

### Requirement: Consulter le fil de la cité
Le système SHALL afficher à tout membre autorisé (feature `FEED_READ`) un fil paginé par curseur des publications de sa cité, triées de la plus récente à la plus ancienne, en chargement incrémental (infinite scroll).

#### Scenario: chargement initial
- **WHEN** un membre ouvre `/feed`
- **THEN** les premières publications de sa cité s'affichent avec des skeletons pendant le chargement

#### Scenario: pagination infinite scroll
- **WHEN** le membre atteint le bas du fil
- **THEN** la page suivante est chargée via `next_cursor` et ajoutée sans recharger les publications existantes

#### Scenario: fil vide
- **WHEN** la cité n'a aucune publication
- **THEN** un empty state premium s'affiche et invite à publier

#### Scenario: erreur de chargement partiel
- **WHEN** le chargement d'une page suivante échoue
- **THEN** les publications déjà chargées restent affichées et une action « Réessayer » est proposée

### Requirement: Publier une publication
Le système SHALL permettre à un membre autorisé (feature `FEED_CREATE`) de publier un contenu texte (≤ 5000 caractères) et/ou des médias, sans jamais autoriser de combinaison invalide.

#### Scenario: texte seul
- **WHEN** le membre saisit un texte sans média et valide
- **THEN** la publication est créée et apparaît en tête du fil sans rechargement complet

#### Scenario: une à trois photos
- **WHEN** le membre sélectionne 1 à 3 photos
- **THEN** les aperçus s'affichent, la publication est créée et les photos sont rendues en layout immersif (1), équilibré (2) ou en grille (3)

#### Scenario: une seule vidéo
- **WHEN** le membre sélectionne une vidéo
- **THEN** un seul média vidéo est accepté et rendu dans un player intégré

#### Scenario: combinaison invalide bloquée
- **WHEN** le membre tente de mélanger photos et vidéo, de dépasser 3 photos ou 1 vidéo
- **THEN** la sélection est refusée avec un message inline (sans `alert()`)

#### Scenario: progression d'upload
- **WHEN** la publication est en cours d'envoi
- **THEN** une progression d'upload est affichée et le bouton est désactivé

### Requirement: Liker une publication (optimiste)
Le système SHALL permettre à un membre autorisé (feature `FEED_LIKE`) de liker ou d'unliker une publication de façon idempotente, avec mise à jour optimiste du compteur et de l'état actif, et rollback en cas d'échec.

#### Scenario: like optimiste
- **WHEN** le membre clique sur le bouton like
- **THEN** l'état et le compteur se mettent à jour immédiatement sans recharger le fil

#### Scenario: échec du like
- **WHEN** l'appel API échoue
- **THEN** l'état et le compteur reviennent à leur valeur précédente

#### Scenario: clics rapides
- **WHEN** le membre clique plusieurs fois rapidement
- **THEN** une seule requête par état est émise par publication

### Requirement: Commenter une publication (2 niveaux)
Le système SHALL permettre à un membre autorisé (feature `FEED_COMMENT`) de commenter une publication et de répondre à un commentaire, sans dépasser 2 niveaux de profondeur.

#### Scenario: commentaire racine
- **WHEN** le membre envoie un commentaire
- **THEN** il apparaît de façon optimiste, le compteur augmente et le focus/scroll cible le nouveau commentaire

#### Scenario: réponse à un commentaire
- **WHEN** le membre répond à un commentaire racine
- **THEN** la réponse apparaît sous son parent (niveau 2) et l'auteur ciblé est clairement indiqué

#### Scenario: profondeur maximale
- **WHEN** le membre tente de répondre à une réponse
- **THEN** la réponse est rattachée au commentaire racine (aucun niveau 3 créé)

#### Scenario: chargement paresseux du panneau
- **WHEN** le membre ouvre le panneau de commentaires
- **THEN** les commentaires sont chargés par pages avec scroll infini et le champ de saisie reste accessible en bas

### Requirement: Affichage riche des médias
Le système SHALL afficher les médias d'une publication avec des proportions cohérentes, un chargement paresseux et une gestion d'erreur, et ouvrir les photos dans une galerie immersive.

#### Scenario: ouverture de la galerie
- **WHEN** le membre clique sur une photo
- **THEN** une lightbox s'ouvre, permet la navigation entre photos, la fermeture par ESC ou clic extérieur, et le support clavier

#### Scenario: échec d'un média
- **WHEN** un média ne peut pas être chargé
- **THEN** un état d'erreur visuel s'affiche sans casser la mise en page

### Requirement: Temps réel du fil
Le système SHALL synchroniser le fil en temps réel sans recharger l'intégralité des publications.

#### Scenario: nouveau post
- **WHEN** un autre membre publie dans la cité
- **THEN** la nouvelle publication est intégrée au fil de façon ciblée

#### Scenario: like d'autrui
- **WHEN** un autre membre like une publication visible
- **THEN** le compteur se met à jour sans refetch global

#### Scenario: suppression
- **WHEN** une publication est supprimée
- **THEN** elle disparaît du fil
