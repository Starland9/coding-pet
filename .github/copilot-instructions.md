# Copilot Instructions for Coding Pet 🐱

## Vue d'ensemble du projet

- **Coding Pet** est une extension VS Code qui ajoute un animal virtuel interactif à l'éditeur. L'animal évolue selon l'activité de codage de l'utilisateur (lignes de code, fichiers sauvegardés, bugs corrigés).
- L'architecture principale repose sur trois composants :
  - `src/extension.ts` : point d'entrée, gestion de l'activation, commandes, status bar, et événements VS Code.
  - `src/petManager.ts` : logique métier, gestion de l'état de l'animal, calculs d'XP, évolution, et persistance via `globalState`.
  - `src/webview/petPanel.ts` : affichage de l'animal et interactions utilisateur via Webview.

## Flux et conventions clés

- **Flux de données** :
  - Les événements d'édition (changement, sauvegarde, ouverture de fichier) déclenchent des méthodes sur `PetManager` qui modifient l'état de l'animal et sauvegardent via `globalState`.
  - Le Webview récupère les données de l'animal via `PetManager` et envoie des commandes (ex : nourrir, corriger un bug) via `postMessage`.
- **Statut de l'animal** : affiché dans la barre d'état, mis à jour toutes les 30s.
- **Tests** :
  - Les tests sont dans `src/test/` et doivent suivre le pattern `**.test.ts`.
  - Utiliser la tâche `watch` ou `watch-tests` pour exécuter les tests (voir `vsc-extension-quickstart.md`).
- **Build & Dev** :
  - Utiliser `pnpm install` pour les dépendances.
  - Le build utilise Webpack (`webpack.config.js`).
  - Pour le dev, lancer avec F5 dans VS Code (mode extension).

## Points d'intégration et dépendances

- **VS Code API** : Utilisation intensive de l'API pour la persistance (`globalState`), la barre d'état, les commandes, et les Webviews.
- **Aucune base de données externe** : tout est stocké dans le contexte utilisateur VS Code.
- **Dépendances principales** : TypeScript, Webpack, ESLint (voir `eslint.config.mjs`).

## Spécificités et pièges à éviter

- Toujours passer par `PetManager` pour toute modification de l'état de l'animal.
- Les évolutions de l'animal sont calculées automatiquement selon l'XP et les stats.
- Les styles du Webview utilisent les variables CSS de VS Code pour le thème.
- Les boutons du Webview envoient des messages JS à l'extension (voir fonction `sendMessage`).
- Les tests ne sont découverts que si la tâche `watch` tourne en arrière-plan.

## Exemples de patterns

- Pour ajouter une nouvelle action utilisateur :

  1. Ajouter une méthode dans `PetManager`.
  2. Gérer le message correspondant dans `petPanel.ts`.
  3. Mettre à jour le Webview si besoin.

- Pour persister une nouvelle donnée :
  - Étendre l'interface `PetData` et adapter `loadPetData`/`savePetData`.

## Fichiers clés

- `src/extension.ts` : activation, commandes, status bar
- `src/petManager.ts` : logique métier, persistance
- `src/webview/petPanel.ts` : UI Webview, interactions
- `src/test/` : tests unitaires
- `webpack.config.js` : configuration build
- `eslint.config.mjs` : règles de lint

---

Pour toute modification structurelle, veillez à respecter la séparation logique entre extension, gestion d'état, et UI Webview. Pour toute question, consultez le README ou les fichiers de configuration du projet.
