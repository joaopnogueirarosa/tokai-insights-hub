import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para conexão direta (GitHub/Vercel)
// - Em Vercel, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou VITE_EXTERNAL_*).
// - Schema padrão: public (pode sobrescrever com VITE_SUPABASE_SCHEMA)
const SUPABASE_URL =
  import.meta.env.VITE_EXTERNAL_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://tphixssaqecyrbtreixk.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

const SUPABASE_SCHEMA = import.meta.env.VITE_SUPABASE_SCHEMA || 'public';

if (!SUPABASE_ANON_KEY) {
  // Falha explícita (melhor do que “conectar” no backend errado)
  // eslint-disable-next-line no-console
  console.error(
    'Configuração ausente: defina VITE_SUPABASE_ANON_KEY (ou VITE_EXTERNAL_SUPABASE_ANON_KEY) no ambiente.'
  );
}

export const supabaseExternal = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: SUPABASE_SCHEMA },
});
