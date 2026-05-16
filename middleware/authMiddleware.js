const supabase = require("../services/supabaseClient");

// Middleware minimal pour exiger une authentification via un Bearer token.
// Vérifie la présence de l'en-tête Authorization et récupère l'utilisateur via Supabase.
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    // Utilise Supabase pour récupérer l'utilisateur à partir du token.
    // La méthode `auth.getUser` retourne { data: { user }, error }.
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data || !data.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    // Attache l'utilisateur à la requête pour les handlers qui en auraient besoin.
    req.user = data.user;
    return next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(500).json({ status: "error", message: "Erreur interne" });
  }
}

module.exports = requireAuth;
