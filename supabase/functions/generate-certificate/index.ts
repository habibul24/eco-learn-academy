import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as encodePng, Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template image URL from Lovable uploads (publicly accessible)
const TEMPLATE_IMAGE_URL = "https://{YOUR_PROJECT_ID}.lovable.app/lovable-uploads/e957ac2d-caf7-4093-af3e-a1d00fea5764.png"; // <-- Replace {YOUR_PROJECT_ID} with your project subdomain if needed

// Parameters to control text positioning—adjust as needed for your template
const NAME_FONT_SIZE = 52;
const NAME_Y = 240;
const NAME_COLOR = 0x223a29ff;
const NAME_FONT = await Deno.readFile("assets/OpenSans-Bold.ttf"); // Add this font to your assets if needed

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_name } = await req.json();
    if (!user_name) {
      return new Response(JSON.stringify({ error: "Missing user_name" }), { ...corsHeaders, status: 400 });
    }

    // Fetch template image
    const imgRes = await fetch(TEMPLATE_IMAGE_URL);
    const arr = new Uint8Array(await imgRes.arrayBuffer());
    const img = await Image.decode(arr);

    // Draw the user name
    await img.drawText(NAME_FONT_SIZE, user_name, img.width / 2, NAME_Y, {
      color: NAME_COLOR,
      font: NAME_FONT,
      anchor: { x: 0.5, y: 0 }, // center horizontally, Y position is from top
    });

    // Encode PNG
    const png = await img.encode();
    return new Response(png, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="certificate.png"`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Error generating certificate" }), {
      ...corsHeaders,
      status: 500,
    });
  }
});
