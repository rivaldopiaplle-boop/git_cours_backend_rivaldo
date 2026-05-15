const express = require("express");

// Un Router Express sert à regrouper les routes liées à une même ressource.
// Ici, toutes les routes concernent les utilisateurs.
const router = express.Router();
const {
  handleUsersRequest,
  handleUserByIdRequest,
  handleCreateUserRequest,
  handleDeleteUserRequest,
  handleUpdateUserRequest,
} = require("../controllers/usersController");

// GET /users
// Renvoie la liste des utilisateurs, avec support des filtres via query params.
router.get("/", handleUsersRequest);

// GET /users/:id
// Renvoie un utilisateur précis à partir de son identifiant.
router.get("/:id", handleUserByIdRequest);

// POST /users
// Crée un nouvel utilisateur dans la liste en mémoire.
router.post("/", handleCreateUserRequest);

// DELETE /users/:id
// Supprime l'utilisateur correspondant à l'identifiant demandé.
router.delete("/:id", handleDeleteUserRequest);

// PUT /users/:id
// Modifie un utilisateur existant selon les champs fournis dans le body.
router.put("/:id", handleUpdateUserRequest);

module.exports = router;
