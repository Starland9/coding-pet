# Mon Extension VS Code 🚀

Une extension VS Code qui transforme votre expérience de développement avec un compagnon virtuel qui évolue selon votre activité de programmation.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Configuration](#-configuration)
- [Commandes](#-commandes)
- [Développement](#-développement)
- [Contribution](#-contribution)
- [License](#-license)

## ✨ Fonctionnalités

### 🎯 Suivi automatique de l'activité

- **Comptage des lignes de code** : Suivi en temps réel du code écrit
- **Détection des sauvegardes** : Récompenses pour chaque fichier sauvegardé
- **Mesure de l'activité** : Analyse de votre productivité de programmation
- **Dégradation progressive** : Les statistiques diminuent en cas d'inactivité

### 🐾 Compagnon virtuel évolutif

- **Évolution dynamique** : Votre animal grandit selon votre activité
- **Niveaux de progression** : Système de montée de niveau basé sur vos actions
- **États émotionnels** : Réactions selon votre productivité
- **Personnalisation** : Différents types d'animaux disponibles

### 🔧 Intégration VS Code

- **Barre de statut** : Affichage permanent des statistiques
- **Panel dédié** : Interface complète dans la barre latérale
- **Notifications** : Alertes pour les montées de niveau et événements
- **Commandes** : Accès rapide via la palette de commandes

### 💾 Persistance des données

- **Sauvegarde automatique** : Conservation des statistiques entre les sessions
- **Synchronisation** : Données préservées lors des redémarrages de VS Code
- **Historique** : Suivi de l'évolution dans le temps

## 📦 Installation

### Via le Marketplace VS Code

1. Ouvrez VS Code
2. Allez dans l'onglet Extensions (`Ctrl+Shift+X`)
3. Recherchez "Mon Extension"
4. Cliquez sur "Installer"

### Installation manuelle

1. Téléchargez le fichier `.vsix` depuis les [releases](https://github.com/votre-username/votre-extension/releases)
2. Ouvrez VS Code
3. Utilisez la commande `Extensions: Install from VSIX...`
4. Sélectionnez le fichier téléchargé

## 🚀 Utilisation

### Premier lancement

1. Une fois installée, l'extension se lance automatiquement
2. Votre compagnon apparaît dans la barre de statut
3. Commencez à coder pour voir l'évolution !

### Interface principale

- **Barre de statut** : Cliquez sur l'icône pour voir les détails
- **Panel latéral** : Ouvrez via `Affichage > Mon Compagnon`
- **Palette de commandes** : `Ctrl+Shift+P` puis tapez "Compagnon"

### Système de progression

- **Lignes de code** : +1 XP par ligne écrite
- **Sauvegarde** : +5 XP par fichier sauvegardé
- **Bonus quotidien** : Récompenses pour la régularité
- **Inactivité** : -1 XP par jour sans activité

## ⚙️ Configuration

Accédez aux paramètres via `Fichier > Préférences > Paramètres` puis recherchez "Compagnon".

### Paramètres disponibles

```json
{
  "monCompagnon.type": "chat",          // Type d'animal : "chat", "chien", "oiseau"
  "monCompagnon.notifications": true,    // Activer les notifications
  "monCompagnon.autoSave": true,        // Sauvegarde automatique
  "monCompagnon.theme": "auto",         // Thème : "clair", "sombre", "auto"
  "monCompagnon.updateInterval": 30,    // Intervalle de mise à jour (secondes)
  "monCompagnon.showInStatusBar": true  // Afficher dans la barre de statut
}
```

## 🎮 Commandes

| Commande | Description | Raccourci |
|----------|-------------|-----------|
| `Compagnon: Afficher le panel` | Ouvre l'interface principale | - |
| `Compagnon: Statistiques` | Affiche les statistiques détaillées | - |
| `Compagnon: Réinitialiser` | Remet à zéro les données | - |
| `Compagnon: Changer d'animal` | Sélectionne un nouvel animal | - |
| `Compagnon: Exporter données` | Sauvegarde les données | - |

## 🛠️ Développement

### Prérequis

- Node.js 16+
- VS Code 1.70+
- Git

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/votre-extension.git
cd votre-extension

# Installer les dépendances
npm install

# Compiler l'extension
npm run compile
```

### Tester l'extension

```bash
# Lancer en mode développement
npm run watch

# Ouvrir une nouvelle fenêtre VS Code avec l'extension
# Appuyez sur F5 dans VS Code
```

### Structure du projet

```
├── src/
│   ├── extension.ts      # Point d'entrée principal
│   ├── compagnon.ts      # Logique du compagnon
│   ├── stats.ts          # Gestion des statistiques
│   └── ui/
│       ├── panel.ts      # Interface du panel
│       └── statusBar.ts  # Barre de statut
├── resources/            # Images et assets
├── package.json          # Configuration de l'extension
└── README.md
```

## 📊 Statistiques suivies

- **Lignes de code écrites** : Compteur total et par session
- **Fichiers sauvegardés** : Nombre de sauvegardes effectuées
- **Temps d'activité** : Durée des sessions de codage
- **Niveau actuel** : Progression du compagnon
- **XP total** : Points d'expérience accumulés
- **Streak** : Jours consécutifs d'activité

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une **Pull Request**

### Guidelines

- Suivez les conventions de code TypeScript
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Vérifiez que tous les tests passent

## 🐛 Problèmes connus

- Performance ralentie avec de très gros fichiers (>10k lignes)
- Synchronisation parfois décalée sur certains systèmes
- Thème sombre non optimal sur VS Code versions < 1.70

## 🗺️ Roadmap

### Version 2.0 (à venir)

- [ ] Nouveaux types d'animaux
- [ ] Système de récompenses avancé
- [ ] Intégration avec Git
- [ ] Mode multijoueur (comparaison avec équipe)

### Version 1.5

- [ ] Thèmes personnalisables
- [ ] Export des statistiques
- [ ] Paramètres avancés

## 📝 Changelog

### [1.0.0] - 2024-XX-XX

#### Ajouté

- Système de compagnon virtuel
- Suivi automatique de l'activité de codage
- Interface dans VS Code
- Sauvegarde des données

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- L'équipe VS Code pour l'excellente API d'extension
- La communauté pour les retours et suggestions
- Tous les contributeurs du projet

---

**Développé avec ❤️ pour améliorer votre expérience de développement**

![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/votre-username/votre-extension/issues)
- **Email** : <votre-email@example.com>
- **Documentation** : [Wiki du projet](https://github.com/votre-username/votre-extension/wiki)
