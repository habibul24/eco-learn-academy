
import { supabase } from "@/integrations/supabase/client";

// Utility to call the Supabase send-email edge function

type EventType = "welcome" | "enrollment" | "certificate";

export async function sendEmail({
  event,
  to,
  userName,
  courseTitle,
  certificateLink,
}: {
  event: EventType;
  to: string;
  userName?: string;
  courseTitle?: string;
  certificateLink?: string;
}) {
  const body = {
    event,
    to,
    userName,
    courseTitle,
    certificateLink,
  };

  console.log("[sendEmail] Invoking send-email edge function with:", body);
  const { data, error } = await supabase.functions.invoke("send-email", {
    body,
  });

  if (error) {
    console.error("[sendEmail] Error invoking send-email function:", error);
    throw new Error(error.message || "Failed to send email");
  }
  console.log("[sendEmail] send-email function succeeded:", data);
  return data;
}
