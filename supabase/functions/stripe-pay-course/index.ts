
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Enable CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log step: Initializing Supabase
    console.log("[stripe-pay-course] Initializing Supabase client");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const { course_id } = body;
    console.log(`[stripe-pay-course] Request body parsed:`, body);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[stripe-pay-course] No Authorization header");
      return new Response(JSON.stringify({ error: "No auth" }), { headers: corsHeaders, status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    console.log("[stripe-pay-course] Auth token parsed");

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      console.log("[stripe-pay-course] Auth failed", { authError, user: authData?.user });
      return new Response(JSON.stringify({ error: "Not authenticated", details: authError }), { headers: corsHeaders, status: 401 });
    }
    const user = authData.user;
    console.log("[stripe-pay-course] Authenticated user:", user.email);

    // Fetch course info (price)
    const { data: course, error: courseError } = await supabase.from("courses").select("id,title,price").eq("id", course_id).maybeSingle();
    if (courseError || !course) {
      console.log("[stripe-pay-course] Failed to fetch course", { courseError, course });
      return new Response(JSON.stringify({ error: "Course not found", details: courseError }), { headers: corsHeaders, status: 404 });
    }
    console.log("[stripe-pay-course] Loaded course:", course);

    // Stripe setup
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      console.log("[stripe-pay-course] STRIPE_SECRET_KEY not set");
      return new Response(JSON.stringify({ error: "Stripe secret key not set" }), { headers: corsHeaders, status: 500 });
    }
    // FIX: Use a valid Stripe API version string ("2023-10-16"). DO NOT use "2023-10-01".
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
    console.log("[stripe-pay-course] Stripe initialized");

    // Look up customer
    let customerId: string | undefined;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0]?.id;
      console.log("[stripe-pay-course] Found Stripe customer", { customerId });
    } catch (cErr) {
      console.log("[stripe-pay-course] Error finding Stripe customer", cErr);
    }

    // Create checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: !customerId ? user.email : undefined,
        line_items: [{
          price_data: {
            product_data: { name: course.title },
            unit_amount: Math.round(Number(course.price) * 100),
            currency: "hkd",
          },
          quantity: 1,
        }],
        metadata: {
          supabase_user_id: user.id,
          supabase_course_id: course_id,
        },
        mode: "payment",
        success_url: `${Deno.env.get("SUPABASE_URL")}/course/${course_id}?payment=success`,
        cancel_url: `${Deno.env.get("SUPABASE_URL")}/course/${course_id}?payment=cancel`,
      });
      console.log("[stripe-pay-course] Stripe session created", { sessionId: session.id, url: session.url });
    } catch (err) {
      console.log("[stripe-pay-course] Stripe session creation failed", err);
      return new Response(JSON.stringify({ error: "Stripe session creation failed", details: err }), { headers: corsHeaders, status: 500 });
    }

    // Create order in db right away (status: pending)
    try {
      const { error: dbOrderError } = await supabase.from("orders").insert({
        user_id: user.id,
        course_id,
        provider: "stripe",
        provider_order_id: session.id,
        status: "pending",
        amount: course.price,
        currency: "hkd"
      });
      if (dbOrderError) {
        console.log("[stripe-pay-course] Failed to insert order in db", dbOrderError);
        // Non-blocking, so we continue anyway
      } else {
        console.log("[stripe-pay-course] Inserted order with Stripe session id", session.id);
      }
    } catch (err) {
      console.log("[stripe-pay-course] Error inserting order in db", err);
    }

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    let errInfo = error;
    // Deno's runtime error may not always stringify well
    try {
      errInfo = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    } catch {}
    console.log("[stripe-pay-course] Unhandled error", errInfo);
    return new Response(JSON.stringify({ error: "Internal server error", details: errInfo }), { headers: corsHeaders, status: 500 });
  }
});
