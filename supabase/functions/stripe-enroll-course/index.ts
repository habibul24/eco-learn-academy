
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Expects POST body: { course_id: number, stripe_session_id?: string }
 * - Marks order as "paid"
 * - Creates course_enrollments entry for the user+course if not present
 * Returns { enrolled: true } or error.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
    }
    const user = authData.user;
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Bad request" }), { status: 400, headers: corsHeaders });
    }
    const { course_id, stripe_session_id } = body;
    if (!course_id) {
      return new Response(JSON.stringify({ error: "Missing course_id" }), { status: 400, headers: corsHeaders });
    }
    // 1. Update Stripe order status (paid)
    if (stripe_session_id) {
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("provider_order_id", stripe_session_id)
        .eq("provider", "stripe");
    }
    // 2. Enroll user in the course if not enrolled yet
    const { data: alreadyEnrolled } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .maybeSingle();
    if (!alreadyEnrolled) {
      await supabase.from("course_enrollments").insert({
        user_id: user.id,
        course_id,
        status: "active",
      });
    }
    return new Response(JSON.stringify({ enrolled: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
