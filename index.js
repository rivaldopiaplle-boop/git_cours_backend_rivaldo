const express = require("express");

// Création de l'application Express principale.
// Tout le reste du projet vient se brancher autour de cet objet.
const app = express();
// Port d'écoute du serveur.
// On prend la variable d'environnement si elle existe, sinon on utilise 3000.
const port = process.env.PORT || 3000;

// Le router des utilisateurs contient toutes les routes liées à la ressource "users".
const usersRoutes = require("./routers/userRouters");

// Middleware JSON d'Express.
// Il permet de lire req.body quand le client envoie du JSON.
app.use(express.json());

// Construit la réponse de santé du serveur.
// Utile pour vérifier rapidement que l'API est bien démarrée.
function buildServerStatusPayload() {
  return { status: "OK", message: "Serveur démarré avec succès" };
}

// Route racine : elle sert de point de contrôle simple pour tester l'API.
function handleRootRequest(req, res) {
  res.status(200).json(buildServerStatusPayload());
}

// Fonction qui enregistre les routes principales de l'application.
// Elle sépare clairement le montage des routes de la logique métier.
function registerRoutes(application) {
  application.get("/", handleRootRequest);
  application.use("/users", usersRoutes);
}

// Middleware spécial pour intercepter les erreurs JSON mal formées.
// Si un client envoie un body invalide, Express déclenche une SyntaxError.
function handleJsonParseError(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ status: "error", message: "JSON invalide" });
  }

  return next(err);
}

// Middleware de secours pour capturer les erreurs inattendues.
// On logge l'erreur côté serveur puis on renvoie un message générique au client.
function handleUnexpectedError(err, req, res, next) {
  console.error(err);
  return res
    .status(500)
    .json({ status: "error", message: "Erreur interne du serveur" });
}

// Lance le serveur HTTP sur le port demandé.
function startServer(application, listenPort) {
  return application.listen(listenPort, () => {
    console.log(`Server listening on port ${listenPort}`);
  });
}

// Ordre de montage de l'application :
// 1. on enregistre les routes
// 2. on ajoute les middlewares d'erreur
// 3. on démarre le serveur
registerRoutes(app);
app.use(handleJsonParseError);
app.use(handleUnexpectedError);
startServer(app, port);

module.exports = {
  // Export utile surtout pour les tests ou pour réutiliser certaines fonctions.
  buildServerStatusPayload,
  handleRootRequest,
  registerRoutes,
  startServer,
};
