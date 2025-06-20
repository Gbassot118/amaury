# Jeux Éducatifs pour Enfants

Ce projet est une application Vue.js qui propose des jeux éducatifs interactifs spécialement conçus pour les enfants de 4 ans. L'application offre une variété de jeux ludiques qui aident au développement des compétences fondamentales comme la reconnaissance des lettres, le comptage, les mathématiques de base et la mémoire.

## Description de l'Application

L'application présente une interface colorée et conviviale, adaptée aux jeunes enfants. Elle propose un menu principal avec des icônes visuelles et des descriptions simples pour chaque jeu. La navigation est intuitive, permettant aux enfants de passer facilement d'un jeu à l'autre.

## Jeux Disponibles

### 1. Jeu de Lettres: AMAURY
Un jeu simple où l'enfant doit taper les lettres du prénom "AMAURY" dans l'ordre correct. Ce jeu aide à développer la reconnaissance des lettres et la séquence alphabétique.

### 2. Jeu des Classes
Dans ce jeu, l'enfant doit faire glisser le bon nombre d'enfants dans chaque classe. Cela renforce les compétences de comptage et la compréhension des quantités.

### 3. Jeu des Chiffres
L'enfant doit taper les chiffres dans l'ordre et compter les fleurs affichées à l'écran. Ce jeu combine la reconnaissance des chiffres et les compétences de comptage.

### 4. Jeu des Chiffres (Variante)
Une variante du jeu précédent où l'enfant doit compter les fleurs et trouver le chiffre correspondant. Cela renforce la relation entre les quantités et les symboles numériques.

### 5. Course de Voitures
Un jeu amusant où l'enfant parie sur une voiture et regarde la course se dérouler. Ce jeu introduit des concepts de hasard et de prédiction.

### 6. Jeu de Lettres: Prénom Aléatoire
Similaire au premier jeu, mais avec un prénom choisi aléatoirement. L'enfant doit taper les lettres du prénom dans l'ordre. Cela élargit la reconnaissance des lettres à différents mots.

### 7. Jeu d'Addition
Un jeu mathématique où l'enfant doit calculer la somme de deux nombres et taper le résultat. Ce jeu développe les compétences mathématiques de base.

### 8. Le Jardin des Animaux
Un jeu de comptage où l'enfant doit faire glisser le bon nombre d'animaux dans un jardin pour correspondre au chiffre affiché. Ce jeu renforce la reconnaissance des chiffres et le dénombrement visuel.

### 9. Le Marché Magique
Un jeu où l'enfant doit aider le client à faire ses courses en plaçant les bons fruits et légumes sur le tapis de caisse. Ce jeu développe les compétences de comptage et de correspondance.

### 10. Les Flocons de Cristalia
Un jeu de niveau avancé où l'enfant doit aider la Reine Cristalia à reconstruire son palais de glace en récoltant les bons nombres de flocons magiques à différents endroits du royaume. Ce jeu introduit la résolution de problèmes de comptage avec des contraintes numériques.

## Fonctionnalités Techniques

- Menu principal avec accès aux différents jeux
- Navigation entre les jeux via Vue Router
- Interface adaptée aux enfants avec des couleurs vives et des icônes intuitives
- Animations et retours visuels pour encourager l'interaction
- Conception responsive pour différents appareils

## Installation

```
npm install
```

### Compilation et hot-reload pour le développement

```
npm run serve
```

### Compilation et minification pour la production

```
npm run build
```

### Linting et correction des fichiers

```
npm run lint
```

## Structure du projet

- `src/views/Home.vue` : Page d'accueil avec le menu principal
- `src/views/Game1.vue` à `Game10.vue` : Composants des différents jeux
- `src/router/index.js` : Configuration des routes
- `src/App.vue` : Composant racine de l'application

## Ajouter un nouveau jeu

1. Créer un nouveau composant Vue dans le dossier `src/views/`
2. Ajouter une nouvelle route dans `src/router/index.js`
3. Ajouter un lien vers le jeu dans le menu principal (`Home.vue`)
