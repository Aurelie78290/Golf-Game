# ⛳ Mini Golf 3D — React + Vite + Three.js

Jeu de mini-golf 3D en multijoueur local (tour par tour, même écran), construit avec :

- **React + Vite** pour l'app
- **@react-three/fiber** + **three.js** pour le rendu 3D
- **@react-three/cannon** pour la physique de la balle (gravité, frottement, rebond)
- **zustand** pour l'état de la partie (joueurs, tours, scores)

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir l'URL affichée (en général http://localhost:5173).

## Comment jouer

1. Sur l'écran de démarrage, ajouter/renommer les joueurs (2 à 6).
2. À son tour, chaque joueur **clique (ou touche) et glisse vers le bas** pour viser :
   - Glisser **à gauche/droite** oriente le tir par rapport à l'axe balle → trou.
   - Glisser **plus ou moins loin vers le bas** règle la puissance.
   - Relâcher déclenche le coup.
3. La caméra suit automatiquement la balle et regarde vers le trou.
4. Quand tous les joueurs ont fini le trou, un résumé s'affiche avant de passer au trou suivant.
5. Après le dernier trou, le classement final s'affiche.

## Structure du code

```
src/
  store/gameStore.js    # état global (joueurs, tour courant, scores) via zustand
  game/
    holes.js            # définition des 3 trous (tee, position du trou, obstacles)
    Course.jsx           # sol, murs, obstacles, trou/drapeau (avec corps physiques)
    Ball.jsx              # balle physique (cannon), détection arrêt + détection trou
    CameraRig.jsx         # caméra qui suit la balle et vise le trou
    AimControls.jsx       # overlay de visée/puissance (glisser-déposer)
    HUD.jsx                # tableau des scores en overlay
    SetupScreen.jsx        # écran de configuration des joueurs
    EndScreens.jsx         # résumé de trou + résultats finaux
  App.jsx                 # assemble Canvas, Physics, HUD et les écrans selon la phase
```

## Ajouter des trous

Ouvrir `src/game/holes.js` et ajouter un objet dans le tableau `HOLES` :

```js
{
  name: 'Trou 4 - ...',
  par: 3,
  tee: [x, 0.3, z],
  hole: [x, 0.05, z],
  fairway: { width: 8, length: 22, center: [0, 0, 0] },
  obstacles: [{ position: [x, y, z], size: [w, h, d], color: '#8a6d3b' }],
}
```

## Backend (Express + MySQL) — optionnel

Le jeu fonctionne entièrement côté client pour l'instant.

A suivre : persister les scores (historique de parties, classements, comptes joueurs), avec :

- Un dossier `server/` avec une API Express (`POST /games`, `GET /leaderboard`, etc.)
- Une base MySQL avec des tables `players`, `games`, `game_scores`
- Un appel `fetch` depuis `GameOver` (dans `EndScreens.jsx`) pour enregistrer la partie terminée
