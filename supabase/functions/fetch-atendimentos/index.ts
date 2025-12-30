import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", data: [] }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user's JWT token using the local Supabase instance
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Invalid token", data: [] }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const externalSupabase = createClient(externalUrl, externalKey);

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

        // Validate date range to prevent abuse (max 90 days)
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

    let query = externalSupabase
      .from("registra_interacoes_tokai")
      .select("*")
      .order("timestamp_chamada", { ascending: false })
      .limit(500);

    if (startDate) {
      query = query.gte("timestamp_chamada", startDate);
    }
    if (endDate) {
      query = query.lte("timestamp_chamada", endDate);
    }
    if (agente) {
      query = query.eq("agente_associado", agente);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching from external Supabase:", error);
      return new Response(
        JSON.stringify({ error: error.message, data: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetched records:", data?.length || 0);

    return new Response(
      JSON.stringify({ data: data || [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error", data: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
