import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  'https://ildaiqtamtawjuoveuuq.lovable.app',
  'https://ildaiqtamtawjuoveuuq.supabase.co',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) || 
    origin.endsWith('.lovable.app') ||
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.vercel.app')
  );
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
};

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", data: [] }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user's JWT token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const token = authHeader.replace('Bearer ', '');
    const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseAnonKey,
      },
    });

    if (!verifyResponse.ok) {
      console.error("Authentication failed:", verifyResponse.status);
      return new Response(
        JSON.stringify({ error: "Invalid token", data: [] }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = await verifyResponse.json();
    console.log("Authenticated user:", user.id);

    // External Supabase credentials for data fetching
    const externalUrl = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_ANON_KEY");

    if (!externalUrl || !externalKey) {
      console.error("Missing credentials:", { hasUrl: !!externalUrl, hasKey: !!externalKey });
      return new Response(
        JSON.stringify({ error: "External Supabase credentials not configured", data: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body for filters
    let startDate: string | null = null;
    let endDate: string | null = null;
    let agente: string | null = null;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        startDate = body.startDate || null;
        endDate = body.endDate || null;
        agente = body.agente || null;

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const daysDiff = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff > 90) {
            console.warn("Date range too large:", daysDiff, "days");
            return new Response(
              JSON.stringify({ error: "Date range too large (max 90 days)", data: [] }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch {
        // No body or invalid JSON, continue without filters
      }
    }

    console.log("Fetching from registra_interacoes_tokai with filters:", { startDate, endDate, agente });

    // Build query URL
    let queryUrl = `${externalUrl}/rest/v1/registra_interacoes_tokai?select=*&order=timestamp_chamada.desc&limit=500`;
    
    if (startDate) {
      queryUrl += `&timestamp_chamada=gte.${startDate}`;
    }
    if (endDate) {
      queryUrl += `&timestamp_chamada=lte.${endDate}`;
    }
    if (agente) {
      queryUrl += `&agente_associado=eq.${encodeURIComponent(agente)}`;
    }

    const dataResponse = await fetch(queryUrl, {
      headers: {
        'apikey': externalKey,
        'Authorization': `Bearer ${externalKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!dataResponse.ok) {
      console.error("Error fetching from external Supabase:", dataResponse.status);
      return new Response(
        JSON.stringify({ error: "Unable to fetch data. Please try again later.", data: [] }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await dataResponse.json();
    console.log("Fetched records:", data?.length || 0);

    return new Response(
      JSON.stringify({ data: data || [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again later.", data: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
