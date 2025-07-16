// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chzaensdxdpyfhxacwdc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoemFlbnNkeGRweWZoeGFjd2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NzkyNDgsImV4cCI6MjA2NzU1NTI0OH0.AhXXQFpRHAHg1tb_ezcujfAVFh4NVuZAkcVAFn1Nb38';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
