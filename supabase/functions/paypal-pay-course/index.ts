import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");
  const creds = btoa(`${clientId}:${secret}`);

  // Log PayPal secret presence (redact for security)
  console.log("getAccessToken: PAYPAL_CLIENT_ID defined:", !!clientId, "PAYPAL_SECRET defined:", !!secret);

  // CHANGED TO LIVE ENDPOINT
  const resp = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!resp.ok) throw new Error("Could not obtain PayPal access token.");
  const data = await resp.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // Add log: secret values and incoming request
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const secret = Deno.env.get("PAYPAL_SECRET");

    console.log("Supabase and PayPal secret defined?:", {
      SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
      PAYPAL_CLIENT_ID: !!clientId,
      PAYPAL_SECRET: !!secret,
    });

    const supabase = createClient(
      supabaseUrl!,
      supabaseServiceKey!,
      { auth: { persistSession: false } }
    );

    let body: any = {};
    try {
      body = await req.json();
    } catch (err) {
      console.error("Failed parsing JSON", err);
      throw new Error("Could not parse body as JSON");
    }
    const { action, course_id, order_id } = body;

    console.log("PayPal function request body:", body);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No Authorization header found");
      return new Response(JSON.stringify({error: "No auth"}), {headers: corsHeaders, status: 401});
    }
    const token = authHeader.replace("Bearer ", "");

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      console.error("Supabase getUser failed", authError);
      return new Response(JSON.stringify({error: "Not authenticated"}), {headers: corsHeaders, status: 401});
    }
    const user = authData.user;

    // Fetch course info
    const { data: course, error: courseError } = await supabase.from("courses").select("id,title,price").eq("id", course_id).maybeSingle();
    if (courseError || !course) {
      console.error("Course fetch failed", courseError, course);
      return new Response(JSON.stringify({error: "Course not found"}), {headers: corsHeaders, status: 404});
    }

    if (action === "create") {
      console.log("Attempting to create PayPal order for course", course_id);
      // Step 1: Create PayPal order
      const accessToken = await getAccessToken();
      // CHANGED TO LIVE ENDPOINT
      const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              description: course.title,
              amount: {
                currency_code: "HKD",
                value: course.price.toFixed(2)
              }
            }
          ],
          application_context: {
            return_url: `${Deno.env.get("SUPABASE_URL")}/course/${course_id}?payment=success`,
            cancel_url: `${Deno.env.get("SUPABASE_URL")}/course/${course_id}?payment=cancel`
          }
        })
      });
      const data = await res.json();
      if (!data.id) {
        console.error("PayPal order create failed:", data);
        return new Response(JSON.stringify({error: "Could not create PayPal order"}), {headers: corsHeaders, status: 400});
      }

      // Insert db order
      await supabase.from("orders").insert({
        user_id: user.id,
        course_id,
        provider: "paypal",
        provider_order_id: data.id,
        status: "pending",
        amount: course.price,
        currency: "hkd"
      });

      return new Response(JSON.stringify({id: data.id, url: data.links?.find((l: any) => l.rel === "approve")?.href}), {headers: {...corsHeaders, "Content-Type": "application/json"}, status: 200});
    }

    if (action === "capture" && order_id) {
      console.log("Attempting to capture PayPal order", order_id);
      // Step 2: Capture funds after approval (client calls after PayPal redirects back)
      const accessToken = await getAccessToken();
      // CHANGED TO LIVE ENDPOINT
      const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${order_id}/capture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!data.id || data.status !== "COMPLETED") {
        console.error("PayPal order capture failed:", data);
        await supabase.from("orders").update({ status: "failed" }).eq("provider_order_id", order_id);
        return new Response(JSON.stringify({error: "Could not capture PayPal order"}), {headers: corsHeaders, status: 400});
      }

      // Update order to paid
      await supabase.from("orders").update({ status: "paid" }).eq("provider_order_id", order_id);

      // Enroll user in course
      await supabase.from("course_enrollments").insert({
        user_id: user.id,
        course_id,
        status: "active"
      });

      return new Response(JSON.stringify({success: true}), {headers: corsHeaders, status: 200});
    }

    console.error("Invalid action", action);
    return new Response(JSON.stringify({error: "Invalid action"}), {headers: corsHeaders, status: 400});
  } catch (error: any) {
    console.error("[PAYPAL ERROR]", error, error?.stack);
    return new Response(JSON.stringify({error: error && error.message ? error.message : "Unknown error"}), {headers: corsHeaders, status: 500});
  }
});
