// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

// Esses dados vêm do .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
