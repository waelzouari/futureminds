# FutureMinds

Application mobile professionnelle d'accompagnement cognitif et de suivi attentionnel pour enfants (difficultés d'attention / TDAH) couplée à des mini-jeux 2D/3D Unity et un service d'analyse IA bienveillant (sans diagnostic médical).

## Structure du Projet

```
futureminds/
├── mobile/      # Application mobile React Native (Expo, TypeScript, Zustand)
└── backend/     # API Node.js / Express sécurisée (TypeScript, Gemini Pro AI)
```

---

## 📱 Application Mobile (`mobile/`)

L'application mobile gère l'onboarding (avec avertissement médical explicite), la gestion des profils enfants, le lancement des séances et l'affichage des rapports de performance.

### Fonctionnalités Clés :
- **Onboarding & Disclaimer** : 3 écrans d'onboarding, avec un disclaimer médical très visible : *"Cette application ne remplace pas l'avis d'un professionnel de santé."*
- **Espace Parent / Dashboard** : Statistiques globales, gestion multi-enfants, rapports d'analyse IA.
- **Espace Enfant** : Menu coloré et chaleureux avec 6 mini-jeux d'attention, mémoire, inhibition, et réaction.
- **Simulateur Unity Bridge** : Composant de simulation de jeu produisant des logs comportementaux réalistes.

### Lancement Local :

1. Entrer dans le dossier mobile :
   ```bash
   cd mobile
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Démarrer le serveur de développement Expo :
   ```bash
   npm start
   ```

---

## ⚙️ Backend API (`backend/`)

Le serveur Node.js reçoit anonymement les données comportementales de la session de jeu de l'enfant et interroge l'API Gemini pour générer des conseils éducatifs bienveillants pour les parents, sans poser aucun diagnostic clinique.

### Configuration :
1. Entrer dans le dossier backend :
   ```bash
   cd backend
   ```
2. Copier le fichier d'environnement et y renseigner votre clé API Gemini :
   ```bash
   cp .env.example .env
   ```
   Remplacer `YOUR_GEMINI_API_KEY` dans le fichier `.env` par votre clé Google Gemini.

3. Installer les dépendances :
   ```bash
   npm install
   ```
4. Lancer le serveur en mode développement :
   ```bash
   npm run dev
   ```
   Le serveur démarrera sur le port `3001` par défaut.

---

## ⚠️ Engagement Éthique & Médical

- **Aucun diagnostic** : L'IA analyse uniquement les tendances et recommande des stratégies éducatives (ex: routines, pauses de jeu). Elle ne pose jamais de diagnostic clinique.
- **Anonymisation** : Le prénom de l'enfant est remplacé par un tag générique (`Enfant (X ans)`) avant tout envoi au service cloud d'IA.
