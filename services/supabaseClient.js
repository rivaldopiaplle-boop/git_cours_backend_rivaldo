require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

function normalizeSupabaseUrl(url) {
  if (!url) {
    return "";
  }

  return url.replace(/\/rest\/v1\/?$/i, "");
}

const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env",
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
