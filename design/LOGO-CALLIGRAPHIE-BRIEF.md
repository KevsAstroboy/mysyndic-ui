# MySyndic — Brief de calligraphie / lettrage du logo

Document de référence à remettre au calligraphe / letterer / dessinateur de caractères.
Objectif : **reproduire le logo MySyndic au trait** (emblème + monogramme **MS** + logotype)
avec une fidélité géométrique totale, dans les bons coloris selon le fond.

> Le logo est **monolinéaire** : une seule épaisseur de trait, partout, du toit au MS
> jusqu'au pin. C'est la règle fondatrice — aucune variation de graisse, aucun plein.

---

## 0. En un mot : ce qu'on dessine

Trois éléments, toujours dans cet ordre d'importance :

1. **Le MS** — monogramme majuscule, trait unique, dessiné à la main (pas une police tapée).
2. **L'emblème** — une **maison** (toit + corps) qui **contient** le MS, prolongée vers le bas
   par un **pin / queue** qui se termine en boucle arrondie.
3. **Le logotype « MySyndic »** — pour les lockups complets (à droite ou sous l'emblème).

Versions fournies : `Logo MySyndic isolé - fichier png.png` (variante froide) et
`Logo MySyndic isolé vert - fichier png.png` (variante verte, **référence principale**).

---

## 1. Le monogramme **MS** (cœur du logo)

### 1.1 Deux déclinaisons à produire

**A. Le MS « emblème »** (dans la maison) — lettrage monolinéaire custom, comme sur le PNG.
C'est la version calligraphique à retravailler.

**B. Le MS « badge »** (application, favicon, avatar) — monogramme sobre, hors emblème :
- Conteneur : carré à coins arrondis, rayon ≈ **29 %** du côté, bordure fine (≈ 3 % du côté).
- « MS » centré, **ExtraBold**, sans-serif (voir police §4).
- Fond dégradé `#0D6E5A → #00A87C` (135°) et « MS » blanc.
- Déclinaison claire : fond `#E6F5F1`, bordure `#E2EAE7`, « MS » `#0D6E5A`.

### 1.2 Construction du M et du S (version emblème)

- **Casse** : majuscules d'imposture (capitales), hauteur optique égale pour les deux lettres.
- **Trait** : épaisseur **constante** ≈ **38–40 px** sur l'artboard de référence (légèrement
  plus fine que le trait de la maison, ≈ 43 px — écart volontaire pour que les lettres
  « respirent » à l'intérieur).
- **Terminaisons** : **rondes** (caps arrondis), jamais coupées net.
- **Jonctions** : **arrondies** également (le M et le S gardent la même famille de courbes).
- **Pas de plein, pas d'empattement, pas de contraste** plein/délié.

**Le M** : deux montants, un V central. Sommets et points bas arrondis. Les deux jambes
tombent à la même ligne de base ; la pointe médiane peut descendre un peu sous la
mi-hauteur (dessin « souple », pas mécanique).

**Le S** : une seule courbe continue en spirale, deux contre-courbes, ouverture franche,
terminaisons arrondies. Le S **frôle** le M : l'écart optique entre les deux doit être
le plus juste possible — assez pour lire la séparation, assez peu pour qu'ils forment
**un seul bloc** (c'est ce qui donne l'effet monogramme).

**Direction artistique** : le couple M+S doit se lire comme **un glyphe unique** avant de
se lire comme deux lettres. Penser « sceau », « tampon », « monogramme de maison », pas
« typographie publicitaire ».

### 1.3 Variante « MS » simple (badge app)

Si le MS emblème n'est pas utilisable en très petit : utiliser le MS badge (capitales
ExtraBold de la police, §4), interlettrage resserré ≈ **−2 %**. Le M et le S restent
collés mais lisibles. C'est la version pour favicon < 32 px.

---

## 2. L'emblème — maison + pin

### 2.1 Construction géométrique (artboard de référence 1024 × 1536)

Repère : X vers la droite, Y vers le bas. **Trait unique ≈ 43 px** (≈ 6,6 % de la largeur
de l'emblème). La symétrie est axiale : **axe central X ≈ 511**.

| Élément | Étendue | Mesure | Commentaire |
|---|---|---|---|
| **Emblème complet** | X 186 → 837 · Y 72 → 1452 | 651 × 1380 | ratio **1 : 2,12** (portrait) |
| **Toit** | Y 72 (pointe) → 340 (égout) | haut. 268 (19 %) · larg. 651 | chevron / triangle, pointe arrondie, égouts qui **dépassent** les murs |
| **Corps (murs)** | X 245 → 778 · Y 348 → 672 | 533 × 324 | rectangle ouvert, murs verticaux, bouts arrondis |
| **Base (rail)** | Y ≈ 672 → 700 | pleine largeur | barre horizontale qui **ferme** la maison, arrondie aux extrémités |
| **MS** | X ≈ 360 → 670 · Y ≈ 360 → 560 | ~310 × ~200 | centré dans le corps, hauteur ≈ 60 % de l'intérieur |
| **Pin / queue** | X 428 → 594 · Y 700 → 1452 | 166 × 752 (54 %) | deux montants + boucle basse |
| **Écart intérieur murs** | X 287 → 735 | 448 | le MS flotte dedans avec une marge régulière |

### 2.2 Le toit

- Un **chevron** (triangle) dont les deux pans montent vers une **pointe arrondie**.
- Les **égouts dépassent** nettement les murs (débord de ≈ 20–40 px de chaque côté) :
  c'est ce détail qui donne le côté « maison / abri » plutôt que « tente ».
- Jonctions toit/murs **arrondies**.

### 2.3 Le corps et la base

- Deux **murs verticaux** parallèles, à bords arrondis en haut et en bas.
- La **base** est une barre horizontale pleine largeur, qui **ferme** la maison.
  C'est de son **centre** que descend le pin.

### 2.4 Le pin / la queue (élément signature)

C'est le détail qui rend le logo unique — à traiter avec soin :

- Un **montant droit** part du centre de la base (X ≈ 570) et descend. Il est dessiné
  **en pointillé / tirets** : deux segments puis un vide, deux fois (rythme régulier),
  comme un **chemin / trajet**.
- Un **montant gauche** parallèle (X ≈ 450) démarre **plus bas** et descend **plein**.
- Les deux se rejoignent en bas par une **boucle arrondie** (U), ouverture vers le haut.
- Lecture voulue : une **épingle de localisation** (« pin ») sous la maison, dont la tige
  est un **chemin pointillé** — « la maison, au bout du chemin ».

> Le rythme des tirets et le rayon de la boucle basse sont **à valider** : proposer 2–3
> variantes (tirets plus longs, plus courts ; boucle plus ou moins ouverte).

---

## 3. Le logotype « MySyndic »

- **Casse exacte** : `MySyndic` — M et S **capitales**, le reste en bas de casse
  (y, y, n, d, i, c). Le **i** garde son point.
- **Interlettrage** : resserré, ≈ **−0,3 à −0,4 px** au corps affiché (soit ≈ **−2 %**).
  Le rendre optiquement régulier à la main (l'espace autour du « y » et du « d » se corrige
  à l'œil, jamais au réglage automatique).
- **Graisse** : ExtraBold (voir §4).
- **Alignement** : le logotype s'aligne sur la **hauteur de poitrine** du MS (hauteur de
  capitale optique), pas sur la hauteur d'x.
- **Lockups** :
  1. **Vertical** : emblème au-dessus, `MySyndic` dessous, centré.
  2. **Horizontal** : emblème à gauche, `MySyndic` à droite, aligné sur la ligne médiane ;
     écart ≈ 0,5 × largeur de l'emblème.
  3. **Avec baseline** : `La vie en cité` en petit (voir §4, poids Medium), sous `MySyndic`.

---

## 4. La police de référence

**Plus Jakarta Sans** (Google Fonts) — sans-serif géométrique humaniste, terminaisons
légèrement adoucies.

| Usage | Graisse | Taille de référence | Interlettrage |
|---|---|---|---|
| Logotype `MySyndic` | **800 (ExtraBold)** | 22 px app / libre en imprimeur | −0,3 à −0,4 px |
| Baseline `La vie en cité` | 500 (Medium) | 12 px | 0 |
| MS badge | **800 (ExtraBold)** | selon conteneur | −2 % |
| Titres d'interface | 800 | 27–32 px | −0,8 px |
| Corps | 500–600 | 15 px | 0 |

Poids disponibles chargés : 400, 500, 600, 700, 800.

**Consigne au calligraphe** : ce n'est pas une invitation à composer le logo « à la
police ». La police est le **squelette** ; le lettrage final du mot et du MS est
**redessiné** (courbes corrigées, approches optiques, cohérence avec le M du monogramme).

---

## 5. Couleurs

### 5.1 Palette de marque (tokens, exacts)

| Rôle | Hex | Usage logo |
|---|---|---|
| `primary` | **#0D6E5A** | vert teal principal — MS badge, monochrome |
| `primary-dark` | **#083D31** | monochrome foncé, textes sur clair |
| `primary-mid` | **#0A5A49** | ombres de dégradé |
| `primary-light` | **#E6F5F1** | fond pastel, badge clair |
| `emerald` | **#00A87C** | vert vif — dégradé badge, accents |
| `gold` | **#E8A020** | accent chaud (accent éditorial, filets) |
| `gold-soft` | **#FEF3DC** | fond accent très clair |
| `ink` | **#0F1E2D** | « noir » de marque (textes, monochrome) |
| `ink-2` | **#3A5068** | texte secondaire |
| `ink-3` | **#8BA4B8** | texte tertiaire |
| `border` | **#E2EAE7** | bordures, séparateurs |
| `bg` | **#F5F7F4** | fond d'application |
| `surface` | **#FFFFFF** | blanc |
| `danger` | **#E8453C** | erreurs (hors logo) |

### 5.2 Dégradé de l'emblème (relevé sur le PNG vert — référence)

- **Départ (haut-gauche / toit)** : ≈ **#7AD33F** (vert clair lumineux)
- **Arrivée (bas-droite / mur droit)** : ≈ **#02783B** (vert profond)
- **Angle** : **135°** (du haut-gauche vers le bas-droite), linéaire.
- Le bas du pin revient vers ≈ #20A23A : le dégradé est **global à l'emblème**, pas par élément.

> ⚠️ Un fichier de logo **bleu** existe aussi (`isolé - fichier png`, #F1FCFF → #4D99FD).
> À considérer comme **variante froide / secondaire**, pas comme couleur principale.
> La référence de marque est **verte**.

### 5.3 Dégradé des interfaces (badge, boutons)

`linear-gradient(135deg, #0D6E5A 0%, #00A87C 100%)` — badger MS, bouton primaire.

---

## 6. Comportement selon le fond (le point clé)

### 6.1 Sur **blanc** (#FFFFFF)

- Emblème : **dégradé vert canonique** (#7AD33F → #02783B) ; ou **monochrome** `#0D6E5A`
  si le dégradé n'est pas possible (gravure, tampon, une couleur).
- Logotype `MySyndic` : **`#0F1E2D`** (ink) ou `#083D31`.
- MS badge : dégradé plein + **MS blanc**, ou version claire (fond `#E6F5F1`, MS `#0D6E5A`).
- Baseline : `#8BA4B8` (ink-3).

### 6.2 Sur **fond clair / pastel** (#F5F7F4, #E6F5F1, #FEF3DC)

- Emblème **monochrome** `#0D6E5A` (ou `#083D31` sur pastel très clair).
- Logotype `#0F1E2D`. Ne pas poser le dégradé sur un fond déjà coloré (manque de contraste).

### 6.3 Sur **fond teal / dégradé sombre** (#0D6E5A → #083D31)

- Emblème : **blanc pur** en **négatif** (trait blanc, intérieur vide/transparent) — c'est
  la signature sur les panneaux sombres de l'application.
- Logotype : **#FFFFFF**. Baseline : **blanc à 55–65 %**.
- MS badge : **effet verre** — fond `rgba(255,255,255,0.15)`, bordure `rgba(255,255,255,0.25)`,
  **MS blanc**. (C'est exactement le badge de l'écran de connexion.)

### 6.4 Sur **fond très sombre / noir** (#0F1E2D)

- Emblème : **blanc** ou **dégradé vert clair** (#7AD33F → #4DBB4A) pour la « lumière ».
- Logotype : blanc. Éviter l'or sur noir si le support est petit (perte de lisibilité).

### 6.5 Sur **fond doré / accent chaud** (#E8A020)

- Emblème : **`#0F1E2D`** (ink) — jamais blanc (contraste insuffisant).
- Logotype : ink. Baseline : ink à 70 %.

### 6.6 Sur **photo / image**

- Toujours la version **blanche** avec **espace de respiration**, et si le fond est chargé,
  un **halo doux** (ombre portée diffuse, jamais un contour dur) ou un cartouche translucide.

### 6.7 Monochrome & une couleur

Fournir systématiquement : **Noir**, **Blanc (négatif)**, `#0D6E5A`, `#083D31`, et
**or #E8A020** pour usages spéciaux.

---

## 7. Grille, zone de protection, tailles minimales

- **Zone de protection** : au minimum **la hauteur du MS** (ou **l'épaisseur du trait ×3**)
  tout autour de l'emblème et du logotype. Rien ne doit y pénétrer.
- **Taille minimale** :
  - Emblème complet : **24 px** de large (en dessous → utiliser le **MS badge**).
  - MS badge : **16 px**.
  - Logotype `MySyndic` : **80 px** de large.
- **Grille** : construire sur une grille carrée dont le module = **épaisseur du trait (1u)**
  = 6,6 % de la largeur de l'emblème. Toutes les mesures de l'annexe sont des multiples
  approximatifs de cette unité.

---

## 8. Interdits (à ne jamais faire)

- ❌ Changer l'épaisseur du trait ou créer un contraste plein/délié.
- ❌ Casser le monoline : pas d'ombre portée sur le trait, pas de contour, pas de biseau,
  pas de 3D.
- ❌ Déformer, incliner, étirer, comprimer l'emblème ou le MS.
- ❌ Redessiner le MS avec une autre police que la version calligraphiée validée.
- ❌ Détacher le MS de l'emblème pour recomposer un lockup non prévu.
- ❌ Utiliser le dégradé sur un fond coloré (contraste insuffisant).
- ❌ Mettre du blanc sur fond doré ou pastel clair.
- ❌ Modifier la casse (`Mysyndic`, `MYSYNDIC`), sauf tout-majuscule pour un usage titrage
  validé séparément.
- ❌ Ajouter des éléments (fenêtres, porte, nuage, personne) à la maison.

---

## 9. Livrables attendus

1. **Tracés vectoriels propres** (SVG + AI/PDF) : emblème, MS seul, logotype seul, et les
   3 lockups (§3).
2. **Jeu de couleurs** : dégradé canonique, monochromes (ink, blanc, primary, primary-dark,
   gold), dans les variantes de fond (§6).
3. **Études calligraphiques** : recherches au trait (plusieurs propositions de MS, du
   rythme des tirets du pin, de la boucle basse).
4. **Grille de construction** documentée (module = épaisseur du trait) et fichier des
   proportions.
5. **Planche de présentations** : les variantes de fond côte à côte, sur blanc et sur les
   couleurs de marque.
6. **Formats raster** de contrôle : PNG fond transparent (noir, blanc, dégradé) en
   1024 / 512 / 256 / 64 px.

---

## Annexe — Mesures relevées (artboard 1024 × 1536, PNG vert)

- Emblème : **X 186→837, Y 72→1452** → 651 × 1380 (ratio 1 : 2,12).
- Épaisseur du trait (maison **et** pin) : **43–45 px** (≈ 6,6 % de 651).
- Trait du MS : **38–40 px** (plus fin que la maison).
- Toit : pointe à Y72 (largeur ~20 px) → égout à Y340 (largeur 651 px).
- Murs : X 245→778 (largeur extérieure 533, écart intérieur 448).
- Base pleine : Y ≈ 672→700.
- Pin : X 428→594 (166), Y 700→1452 (752) ; montant droit centré X ≈ 570,
  montant gauche centré X ≈ 450 ; deux coupures (tirets) sur le montant droit
  (≈ Y 936→968 et Y 1200→1232).
- MS : X ≈ 360→670, Y ≈ 360→560.
- Axe de symétrie : **X ≈ 511**.

*Toutes ces valeurs sont des relevés optiques destinés à la reconstruction, pas des cotes
contractuelles : le calligraphe peut corriger de quelques pixels pour l'œil.*
