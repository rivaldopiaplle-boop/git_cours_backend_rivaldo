const supabase = require("../services/supabaseClient");

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

// Prépare une réponse d'erreur si Supabase remonte un problème technique.
function sendSupabaseError(res, error) {
  console.error(error);
  return sendError(res, 500, "Erreur interne du serveur");
}

// GET /users
// Cette route retourne tous les utilisateurs depuis Supabase.
// On peut aussi filtrer les résultats via les query params :
// - id
// - age
// - name
// - residence
async function handleUsersRequest(req, res) {
  const { id, age, name, residence } = req.query;

  let query = supabase.from("users").select("*");

  if (id !== undefined) {
    const idNum = Number(id);
    if (!Number.isNaN(idNum)) {
      query = query.eq("id", idNum);
    } else {
      return res.status(200).json({ status: "success", data: [] });
    }
  }

  if (age !== undefined) {
    const ageNum = Number(age);
    if (!Number.isNaN(ageNum)) {
      query = query.eq("age", ageNum);
    } else {
      return res.status(200).json({ status: "success", data: [] });
    }
  }

  if (name !== undefined) {
    const q = String(name).toLowerCase();
    query = query.ilike("name", `%${q}%`);
  }

  if (residence !== undefined) {
    const q = String(residence).toLowerCase();
    query = query.ilike("residence", `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return sendSupabaseError(res, error);
  }

  return res.status(200).json({ status: "success", data });
}

// GET /users/:id
// Cherche un utilisateur précis. Si l'utilisateur n'existe pas,
// on renvoie une 404 avec un message clair.
async function handleUserByIdRequest(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) {
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return sendSupabaseError(res, error);
  }

  if (!data) {
    return sendError(res, 404, "Utilisateur introuvable");
  }

  return res.status(200).json({ status: "success", data });
}

// POST /users
// Crée un nouvel utilisateur dans la table Supabase.
// Ici, on fait une vraie validation minimale avant l'insertion :
// - name ne doit pas être vide
// - age doit être un entier positif
// - residence ne doit pas être vide
async function handleCreateUserRequest(req, res) {
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

  const newUser = {
    name: normalizedName,
    age: ageNum,
    residence: normalizedResidence,
  };

  const { data, error } = await supabase
    .from("users")
    .insert([newUser])
    .select("*")
    .single();

  if (error) {
    return sendSupabaseError(res, error);
  }

  return res.status(201).json({ status: "success", data });
}

// DELETE /users/:id
// Supprime un utilisateur existant dans Supabase.
// Si l'ID n'existe pas, on renvoie une 404.
async function handleDeleteUserRequest(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) {
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId)
    .select("*");

  if (error) {
    return sendSupabaseError(res, error);
  }

  if (!data || data.length === 0) {
    return sendError(res, 404, "Utilisateur introuvable");
  }

  return res.status(200).json({ status: "success", data: data[0] });
}

// PUT /users/:id
// Met à jour un utilisateur existant.
// La logique ici est "partielle" : on peut envoyer un seul champ,
// ou plusieurs champs à la fois.
// Les champs absents ne sont pas modifiés.
async function handleUpdateUserRequest(req, res) {
  const userId = parseUserId(req, res);
  if (userId === null) {
    return;
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

  const updateData = {};

  if (hasAge) {
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum <= 0) {
      return sendError(res, 400, "Age doit être un entier positif");
    }
    updateData.age = ageNum;
  }

  if (hasName) {
    const normalizedName = normalizeTextField(name);
    if (!normalizedName) {
      return sendError(res, 400, "Le champ name ne peut pas être vide");
    }
    updateData.name = normalizedName;
  }

  if (hasResidence) {
    const normalizedResidence = normalizeTextField(residence);
    if (!normalizedResidence) {
      return sendError(res, 400, "Le champ residence ne peut pas être vide");
    }
    updateData.residence = normalizedResidence;
  }

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    return sendSupabaseError(res, error);
  }

  if (!data) {
    return sendError(res, 404, "Utilisateur introuvable");
  }

  return res.status(200).json({ status: "success", data });
}

module.exports = {
  // On exporte chaque handler pour pouvoir les brancher dans le router.
  handleUsersRequest,
  handleUserByIdRequest,
  handleCreateUserRequest,
  handleDeleteUserRequest,
  handleUpdateUserRequest,
};
