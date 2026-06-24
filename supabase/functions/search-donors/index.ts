import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function validateBloodGroup(bloodGroup: string | null): boolean {
  if (!bloodGroup) return true;
  return BLOOD_GROUPS.includes(bloodGroup);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    const bloodGroup = url.searchParams.get("blood_group") || null;
    const city = url.searchParams.get("city") || null;
    const availableOnly = url.searchParams.get("available_only") !== "false";
    const verifiedOnly = url.searchParams.get("verified_only") === "true";
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    if (bloodGroup && !validateBloodGroup(bloodGroup)) {
      return new Response(
        JSON.stringify({ error: "Invalid blood group. Must be one of: " + BLOOD_GROUPS.join(", ") }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({ error: "Limit must be between 1 and 100" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (offset < 0) {
      return new Response(
        JSON.stringify({ error: "Offset must be 0 or greater" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    const { data, error } = await supabaseClient.rpc("search_donors", {
      p_blood_group: bloodGroup,
      p_city: city,
      p_available_only: availableOnly,
      p_verified_only: verifiedOnly,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error("Error searching donors:", error);
      return new Response(
        JSON.stringify({ error: "Failed to search donors" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
      data: data || [],
      filters: { blood_group: bloodGroup, city, available_only: availableOnly, verified_only: verifiedOnly },
      pagination: { limit, offset, count: data?.length || 0 }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
