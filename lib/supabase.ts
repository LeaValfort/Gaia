import { createClient } from '@supabase/supabase-js'

// Ces variables sont lues depuis le fichier .env à la racine du projet
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client Supabase partagé dans toute l'application
// À importer partout où on a besoin d'accéder à la base de données
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
