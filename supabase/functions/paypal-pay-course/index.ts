
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

  const resp = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
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
  // handle: create order, approve order, and enrollment after success
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const { action, course_id, order_id } = await req.json();

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({error: "No auth"}), {headers: corsHeaders, status: 401});
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return new Response(JSON.stringify({error: "Not authenticated"}), {headers: corsHeaders, status: 401});
    const user = authData.user;

    // Fetch course info
    const { data: course, error: courseError } = await supabase.from("courses").select("id,title,price").eq("id", course_id).maybeSingle();
    if (courseError || !course) return new Response(JSON.stringify({error: "Course not found"}), {headers: corsHeaders, status: 404});

    if (action === "create") {
      // Step 1: Create PayPal order
      const accessToken = await getAccessToken();
      const res = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
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
                currency_code: "USD",
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
      if (!data.id) return new Response(JSON.stringify({error: "Could not create PayPal order"}), {headers: corsHeaders, status: 400});

      // Insert db order
      await supabase.from("orders").insert({
        user_id: user.id,
        course_id,
        provider: "paypal",
        provider_order_id: data.id,
        status: "pending",
        amount: course.price,
        currency: "usd"
      });

      return new Response(JSON.stringify({id: data.id, url: data.links?.find((l: any) => l.rel === "approve")?.href}), {headers: {...corsHeaders, "Content-Type": "application/json"}, status: 200});
    }

    if (action === "capture" && order_id) {
      // Step 2: Capture funds after approval (client calls after PayPal redirects back)
      const accessToken = await getAccessToken();
      const res = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${order_id}/capture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!data.id || data.status !== "COMPLETED") {
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

    return new Response(JSON.stringify({error: "Invalid action"}), {headers: corsHeaders, status: 400});
  } catch (error) {
    return new Response(JSON.stringify({error: error.message}), {headers: corsHeaders, status: 500});
  }
});
