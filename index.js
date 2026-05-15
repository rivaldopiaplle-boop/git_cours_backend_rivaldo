const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Source de données temporaire en mémoire pour préparer le futur CRUD.
const users = [
  { id: 1, name: "Amine", age: 24, residence: "Casablanca" },
  { id: 2, name: "Sara", age: 29, residence: "Rabat" },
  { id: 3, name: "Yassine", age: 31, residence: "Marrakech" },
  { id: 4, name: "Lina", age: 22, residence: "Tanger" },
];

// Construit la réponse standard de santé du serveur.
function buildServerStatusPayload() {
  return { status: "OK", message: "Serveur démarré avec succès" };
}

// Gère la route d'accueil utilisée pour vérifier que l'API répond.
function handleRootRequest(req, res) {
  res.status(200).json(buildServerStatusPayload());
}

// Enregistre les routes de l'application.
function registerRoutes(application) {
  application.get("/", handleRootRequest);
}

// Démarre le serveur HTTP sur le port configuré.
function startServer(application, listenPort) {
  return application.listen(listenPort, () => {
    console.log(`Server listening on port ${listenPort}`);
  });
}

registerRoutes(app);
startServer(app, port);

module.exports = {
  buildServerStatusPayload,
  handleRootRequest,
  registerRoutes,
  startServer,
  users,
};
