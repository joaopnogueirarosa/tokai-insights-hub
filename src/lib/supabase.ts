import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para conexão direta (GitHub/Vercel)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tphixssaqecyrbtreixk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaGl4c3NhcWVjeXJidHJlaXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjM1ODEsImV4cCI6MjA2NzU5OTU4MX0.E50fGtQJNFzNDmqi4s6JJmalx2eFpbCMLuD3xQIGJ2Y';

export const supabaseExternal = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
