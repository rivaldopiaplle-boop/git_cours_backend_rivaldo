const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const usersRoutes = require("./routers/userRouters");
const users = require("./data/usersData");

app.use(express.json());

function buildServerStatusPayload() {
  return { status: "OK", message: "Serveur démarré avec succès" };
}

function handleRootRequest(req, res) {
  res.status(200).json(buildServerStatusPayload());
}

function registerRoutes(application) {
  application.get("/", handleRootRequest);
  application.use("/users", usersRoutes);
}

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
