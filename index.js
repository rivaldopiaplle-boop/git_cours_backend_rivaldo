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

// Retourne la liste des utilisateurs stockés en mémoire.
function handleUsersRequest(req, res) {
  // Supporte le filtrage via query params : id, age, name, residence
  // Exemples : /users?name=Amine   /users?age=24   /users?residence=Rabat
  const { id, age, name, residence } = req.query;

  let results = users.slice();

  // Filtre par identifiant (égalité numérique)
  if (id !== undefined) {
    const idNum = Number(id);
    if (!Number.isNaN(idNum)) {
      results = results.filter((u) => u.id === idNum);
    } else {
      // si id non numérique, renvoyer aucun résultat
      results = [];
    }
  }

  // Filtre par âge (égalité numérique)
  if (age !== undefined) {
    const ageNum = Number(age);
    if (!Number.isNaN(ageNum)) {
      results = results.filter((u) => u.age === ageNum);
    } else {
      results = [];
    }
  }

  // Filtre par nom (recherche insensible à la casse, correspondance partielle)
  if (name !== undefined) {
    const q = String(name).toLowerCase();
    results = results.filter((u) => u.name.toLowerCase().includes(q));
  }

  // Filtre par résidence (insensible à la casse, partiel)
  if (residence !== undefined) {
    const q = String(residence).toLowerCase();
    results = results.filter((u) => u.residence.toLowerCase().includes(q));
  }

  res.status(200).json({ status: "success", data: results });
}

// Retourne un utilisateur précis à partir de son identifiant.
function handleUserByIdRequest(req, res) {
  const userId = Number(req.params.id);
  const user = users.find((currentUser) => currentUser.id === userId);

  if (!user) {
    return res
      .status(404)
      .json({ status: "error", message: "Utilisateur introuvable" });
  }

  return res.status(200).json({ status: "success", data: user });
}

// Enregistre les routes de l'application.
function registerRoutes(application) {
  application.get("/", handleRootRequest);
  application.get("/users", handleUsersRequest);
  application.get("/users/:id", handleUserByIdRequest);
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
  handleUsersRequest,
  handleUserByIdRequest,
  registerRoutes,
  startServer,
  users,
};
