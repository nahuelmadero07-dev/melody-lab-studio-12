import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso EXCLUSIVO en el backend.
 * Usa la service_role key, que ignora Row Level Security.
 * NUNCA importar este archivo desde un componente cliente ("use client").
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
