const supabase = require("../services/supabaseClient");

async function createProfileUserRecord(meta) {
  const { name, age, residence } = meta;

  if (!name || !Number.isInteger(age) || age <= 0 || !residence) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name,
        age,
        residence,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Crée un nouvel utilisateur en utilisant Supabase Auth.
// On utilise le champ `user_metadata` pour stocker `name`, `age`, `residence`.
async function signUp(req, res) {
  const { email, password, name, age, residence } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "email et password requis" });
  }

  try {
    const meta = {};
    if (name !== undefined) meta.name = String(name);
    if (age !== undefined) meta.age = Number(age);
    if (residence !== undefined) meta.residence = String(residence);

    // Utilise la méthode admin.createUser si elle est disponible côté service_role
    if (
      supabase.auth &&
      supabase.auth.admin &&
      typeof supabase.auth.admin.createUser === "function"
    ) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: meta,
      });

      if (error) {
        console.error(error);
        return res.status(500).json({
          status: "error",
          message: error.message || "Erreur création utilisateur",
        });
      }

      let profileUser = null;
      try {
        profileUser = await createProfileUserRecord(meta);
      } catch (profileError) {
        console.error(profileError);
      }

      return res.status(201).json({
        status: "success",
        message: "Compte créé avec succès",
        data: {
          authUser: data?.user || null,
          profileUser,
        },
      });
    }

    // Fallback : signUp classique (envoie email de confirmation selon les paramètres du projet)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta,
      },
    });
    if (error) {
      console.error(error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Erreur création utilisateur",
      });
    }

    let profileUser = null;
    try {
      profileUser = await createProfileUserRecord(meta);
    } catch (profileError) {
      console.error(profileError);
    }

    return res.status(201).json({
      status: "success",
      message: "Compte créé avec succès",
      data: {
        authUser: data?.user || data,
        profileUser,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Erreur interne" });
  }
}

// Authentifie un utilisateur et retourne la session (access token + user).
async function signIn(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "email et password requis" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      return res.status(401).json({
        status: "error",
        message: error.message || "Authentification échouée",
      });
    }

    return res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Erreur interne" });
  }
}

module.exports = { signUp, signIn };
