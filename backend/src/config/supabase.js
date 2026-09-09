import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('tu-proyecto-supabase') &&
    !supabaseAnonKey.includes('tu_anon_key')
  );
};

// Cliente Supabase Anon / Servidor
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente Admin (para bypass de RLS si es necesario en backend)
export const supabaseAdmin = isSupabaseConfigured() && supabaseServiceKey && !supabaseServiceKey.includes('tu_service_role')
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;
