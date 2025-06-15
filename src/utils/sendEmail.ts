
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
  // The full function URL (replace with your Supabase project ref as needed)
  const fnUrl = "https://wufjtlnxiwipdlqsntqk.supabase.co/functions/v1/send-email";

  const body = {
    event,
    to,
    userName,
    courseTitle,
    certificateLink,
  };

  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // If user is logged in, include auth token for extra security (optional)
      ...(window?.supabase?.auth?.session?.access_token
        ? { Authorization: `Bearer ${window.supabase.auth.session().access_token}` }
        : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to send email");
  }
  return res.json();
}
