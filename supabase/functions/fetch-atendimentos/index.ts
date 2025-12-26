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
