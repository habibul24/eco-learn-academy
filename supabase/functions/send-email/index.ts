
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EventType = "welcome" | "enrollment" | "certificate";

interface SendEmailRequest {
  event: EventType;
  to: string;
  userName?: string;
  courseTitle?: string;
  certificateLink?: string;
}

// Helper to render email body and subject according to event
function renderEmailBody(payload: SendEmailRequest): { subject: string; html: string } {
  switch (payload.event) {
    case "welcome":
      return {
        subject: "Welcome to Our Courses!",
        html: `
          <h2>Welcome, ${payload.userName || 'Learner'}!</h2>
          <p>Your account has been created successfully. Enjoy learning with us.</p>
        `
      };
    case "enrollment":
      return {
        subject: "Course Enrollment Confirmation",
        html: `
          <h2>Congratulations, ${payload.userName || 'Learner'}!</h2>
          <p>You have been enrolled in <b>${payload.courseTitle}</b>. Start your journey now!</p>
        `
      };
    case "certificate":
      return {
        subject: "Certificate Awarded",
        html: `
          <h2>Great job, ${payload.userName || 'Learner'}!</h2>
          <p>You have completed <b>${payload.courseTitle}</b> and earned a certificate.</p>
          ${payload.certificateLink ? `<p>Your certificate: <a href="${payload.certificateLink}" target="_blank">${payload.certificateLink}</a></p>` : ""}
          <p>Visit your dashboard to download and share it!</p>
        `
      };
    default:
      return {
        subject: "Notification",
        html: `<p>Generic notification.</p>`
      };
  }
}

export default serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const payload: SendEmailRequest = await req.json();

    if (!payload.event || !payload.to) {
      return new Response(JSON.stringify({ error: "Invalid request: missing event or to" }), { status: 400, headers: corsHeaders });
    }

    const { subject, html } = renderEmailBody(payload);

    const response = await resend.emails.send({
      from: "Learn Online <no-reply@resend.dev>",
      to: [payload.to],
      subject,
      html,
    });

    return new Response(JSON.stringify({ ok: true, id: response.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
