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

// Email Templates
function welcomeEmailTemplate(firstName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Green Data!</h1>
        </div>
        <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Welcome to Green Data! We're excited to have you join our community of learners committed to sustainable living.</p>
            <p>With your account, you can:</p>
            <ul>
                <li>Browse our selection of ESG courses</li>
                <li>Track your learning progress</li>
                <li>Earn certificates upon completion</li>
                <li>Access course materials anytime</li>
            </ul>
            <p>Start your learning journey today by exploring our course catalog!</p>
        </div>
        <div class="footer">
            <p>© 2024 Green Data. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
}

function certificateEmailTemplate(firstName: string, courseName: string, certificateNumber: string) {
  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .certificate-info { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations!</h1>
        </div>
        <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Congratulations on completing the ${courseName} course!</p>
            <div class="certificate-info">
                <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
                <p>You can download your certificate from your dashboard in the "My Certificates" section.</p>
            </div>
            <p>Keep up the great work in your sustainability journey!</p>
        </div>
        <div class="footer">
            <p>© 2024 Green Data. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
}

function enrollmentConfirmationTemplate(firstName: string, courseName: string, courseDescription?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .course-info { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Course Enrollment Confirmation</h1>
        </div>
        <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Thank you for enrolling in our course!</p>
            <div class="course-info">
                <h3>${courseName}</h3>
            </div>
            <p>You can access your course materials immediately through your dashboard.</p>
            <p>We're excited to have you join this learning journey!</p>
        </div>
        <div class="footer">
            <p>© 2024 Green Data. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
}

// Helper to extract first name from userName or email
function getFirstName(userName?: string, email?: string) {
  if (userName && userName.trim().length > 0) {
    return userName.trim().split(" ")[0]; // First word
  }
  if (email) return email.split("@")[0];
  return "Learner";
}

// Helper for email subject and template
function renderEmailBody(payload: SendEmailRequest): { subject: string; html: string } {
  const firstName = getFirstName(payload.userName, payload.to);
  switch (payload.event) {
    case "welcome":
      return {
        subject: "Welcome to Green Data!",
        html: welcomeEmailTemplate(firstName),
      };
    case "enrollment":
      return {
        subject: "Course Enrollment Confirmation",
        html: enrollmentConfirmationTemplate(firstName, payload.courseTitle || ""),
      };
    case "certificate":
      // We expect certificateLink to contain the certificate number for now (due to client logic)
      // But if not, show a placeholder or blank
      let certNumber = "";
      if (payload.certificateLink && typeof payload.certificateLink === "string") {
        // If the client passes a certificate number, use it directly; otherwise, fallback
        certNumber = payload.certificateLink.startsWith("CERT-")
          ? payload.certificateLink
          : "";
      }
      return {
        subject: "Certificate Awarded",
        html: certificateEmailTemplate(firstName, payload.courseTitle || "", certNumber || "N/A"),
      };
    default:
      return {
        subject: "Notification from Green Data",
        html: "<p>Generic notification.</p>",
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
      from: "hello@greendatabiz.com",
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
