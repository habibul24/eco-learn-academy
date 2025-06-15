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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const { course_id } = body;

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({error: "No auth"}), {headers: corsHeaders, status: 401});
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return new Response(JSON.stringify({error: "Not authenticated"}), {headers: corsHeaders, status: 401});
    const user = authData.user;

    // Fetch course info (price)
    const { data: course, error: courseError } = await supabase.from("courses").select("id,title,price").eq("id", course_id).maybeSingle();
    if (courseError || !course) return new Response(JSON.stringify({error: "Course not found"}), {headers: corsHeaders, status: 404});

    // Stripe setup
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-01" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
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

    // Create order in db right away (status: pending)
    await supabase.from("orders").insert({
      user_id: user.id,
      course_id,
      provider: "stripe",
      provider_order_id: session.id,
      status: "pending",
      amount: course.price,
      currency: "hkd"
    });

    return new Response(JSON.stringify({url: session.url}), {headers: {...corsHeaders, "Content-Type": "application/json"}, status: 200});
  } catch (error) {
    return new Response(JSON.stringify({error: error.message}), {headers: corsHeaders, status: 500});
  }
});
