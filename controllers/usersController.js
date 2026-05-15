const users = require("../data/usersData");

// Petit helper pour renvoyer des erreurs homogènes dans toute l'API.
// Cela évite d'écrire plusieurs fois le même code de réponse JSON.
function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ status: "error", message });
}

// Vérifie que l'ID reçu dans l'URL est valide.
// Si l'ID n'est pas un entier positif, on renvoie une erreur 400.
function parseUserId(req, res) {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    sendError(res, 400, "ID utilisateur invalide");
    return null;
  }

  return userId;
}

// Nettoie les champs texte en supprimant les espaces inutiles.
// Exemple : "  Rabat  " devient "Rabat".
function normalizeTextField(value) {
  return typeof value === "string" ? value.trim() : String(value).trim();
}

// GET /users
// Cette route retourne tous les utilisateurs de la base mémoire.
// On peut aussi filtrer les résultats via les query params :
// - id
// - age
// - name
// - residence
function handleUsersRequest(req, res) {
  const { id, age, name, residence } = req.query;

  let results = users.slice();

  if (id !== undefined) {
    const idNum = Number(id);
    if (!Number.isNaN(idNum)) {
      results = results.filter((u) => u.id === idNum);
    } else {
      results = [];
    }
  }

  if (age !== undefined) {
    const ageNum = Number(age);
    if (!Number.isNaN(ageNum)) {
      results = results.filter((u) => u.age === ageNum);
    } else {
      results = [];
    }
  }

  if (name !== undefined) {
    const q = String(name).toLowerCase();
    results = results.filter((u) => u.name.toLowerCase().includes(q));
  }

  if (residence !== undefined) {
    const q = String(residence).toLowerCase();
    results = results.filter((u) => u.residence.toLowerCase().includes(q));
  }

  res.status(200).json({ status: "success", data: results });
}

// GET /users/:id
// Cherche un utilisateur précis. Si l'utilisateur n'existe pas,
// on renvoie une 404 avec un message clair.
function handleUserByIdRequest(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) {
    return;
  }

  const user = users.find((currentUser) => currentUser.id === userId);

  if (!user) {
    return sendError(res, 404, "Utilisateur introuvable");
  }

  return res.status(200).json({ status: "success", data: user });
}

// POST /users
// Crée un nouvel utilisateur dans le tableau "users".
// Ici, on fait une vraie validation minimale avant l'insertion :
// - name ne doit pas être vide
// - age doit être un entier positif
// - residence ne doit pas être vide
function handleCreateUserRequest(req, res) {
  const { name, age, residence } = req.body || {};
  const normalizedName = normalizeTextField(name);
  const normalizedResidence = normalizeTextField(residence);

  if (!normalizedName || age === undefined || !normalizedResidence) {
    return sendError(
      res,
      400,
      "Champs invalides ou manquants: name, age, residence",
    );
  }

  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum <= 0) {
    return sendError(res, 400, "Age doit être un entier positif");
  }

  const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const newUser = {
    id: nextId,
    name: normalizedName,
    age: ageNum,
    residence: normalizedResidence,
  };

  users.push(newUser);

  return res.status(201).json({ status: "success", data: newUser });
}

// DELETE /users/:id
// Supprime un utilisateur existant de la base en mémoire.
// Si l'ID n'existe pas, on renvoie une 404.
function handleDeleteUserRequest(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) {
    return;
  }

  const userIndex = users.findIndex((currentUser) => currentUser.id === userId);

  if (userIndex === -1) {
    return sendError(res, 404, "Utilisateur introuvable");
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  return res.status(200).json({ status: "success", data: deletedUser });
}

// PUT /users/:id
// Met à jour un utilisateur existant.
// La logique ici est "partielle" : on peut envoyer un seul champ,
// ou plusieurs champs à la fois.
// Les champs absents ne sont pas modifiés.
function handleUpdateUserRequest(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) {
    return;
  }

  const user = users.find((currentUser) => currentUser.id === userId);

  if (!user) {
    return sendError(res, 404, "Utilisateur introuvable");
  }

  const { name, age, residence } = req.body || {};
  const hasName = name !== undefined;
  const hasAge = age !== undefined;
  const hasResidence = residence !== undefined;

  if (!hasName && !hasAge && !hasResidence) {
    return sendError(
      res,
      400,
      "Au moins un champ doit être fourni: name, age, residence",
    );
  }

  if (hasAge) {
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum <= 0) {
      return sendError(res, 400, "Age doit être un entier positif");
    }
    user.age = ageNum;
  }

  if (hasName) {
    const normalizedName = normalizeTextField(name);
    if (!normalizedName) {
      return sendError(res, 400, "Le champ name ne peut pas être vide");
    }
    user.name = normalizedName;
  }

  if (hasResidence) {
    const normalizedResidence = normalizeTextField(residence);
    if (!normalizedResidence) {
      return sendError(res, 400, "Le champ residence ne peut pas être vide");
    }
    user.residence = normalizedResidence;
  }

  return res.status(200).json({ status: "success", data: user });
}

module.exports = {
  // On exporte chaque handler pour pouvoir les brancher dans le router.
  handleUsersRequest,
  handleUserByIdRequest,
  handleCreateUserRequest,
  handleDeleteUserRequest,
  handleUpdateUserRequest,
};
