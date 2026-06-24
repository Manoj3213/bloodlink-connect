import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const notificationId = url.searchParams.get("id");

    if (req.method === "GET") {
      const unreadOnly = url.searchParams.get("unread_only") === "true";
      const limit = parseInt(url.searchParams.get("limit") || "20", 10);
      const offset = parseInt(url.searchParams.get("offset") || "0", 10);

      let query = supabaseClient
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        query = query.eq("read", false);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching notifications:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch notifications" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const unreadCount = await supabaseClient
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      return new Response(
        JSON.stringify({
          data: data || [],
          total: count || 0,
          unread_count: unreadCount.count || 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "PUT") {
      if (!notificationId) {
        return new Response(
          JSON.stringify({ error: "Notification ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json().catch(() => ({}));
      const { read } = body;

      if (typeof read !== "boolean") {
        return new Response(
          JSON.stringify({ error: "'read' field (boolean) is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabaseClient
        .from("notifications")
        .update({ read })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating notification:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update notification" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE") {
      if (notificationId) {
        const { error } = await supabaseClient
          .from("notifications")
          .delete()
          .eq("id", notificationId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error deleting notification:", error);
          return new Response(
            JSON.stringify({ error: "Failed to delete notification" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        const readOrAll = url.searchParams.get("read_only") === "true";

        let query = supabaseClient
          .from("notifications")
          .delete()
          .eq("user_id", user.id);

        if (readOrAll) {
          query = query.eq("read", true);
        }

        const { error } = await query;

        if (error) {
          console.error("Error deleting notifications:", error);
          return new Response(
            JSON.stringify({ error: "Failed to delete notifications" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && url.pathname.endsWith("/mark-all-read")) {
      const { error } = await supabaseClient
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error marking all as read:", error);
        return new Response(
          JSON.stringify({ error: "Failed to mark all as read" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
