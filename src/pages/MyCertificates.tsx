
import React from "react";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";
import CertificatePreview from "@/components/CertificatePreview";
import { Loader2, Award } from "lucide-react";

export default function MyCertificates() {
  const { user, loading } = useAuthUser();
  const [certs, setCerts] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingCerts(true);
      supabase
        .from("certificates")
        .select("*, courses(title)")
        .eq("user_id", user.id)
        .then(res => {
          setCerts((res.data || []).map(c => ({
            ...c,
            courseTitle: c.courses?.title || "",
          })));
          setLoadingCerts(false);
        });
    } else {
      setCerts([]);
      setLoadingCerts(false);
    }
  }, [user]);

  // Removed old handleDownload and its usage

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white w-full">
      <Navbar />
      <main className="pt-32 pb-16 flex flex-col items-center min-h-[50vh]">
        <div className="bg-white rounded-xl shadow-lg px-10 py-8 max-w-2xl w-full flex flex-col gap-5 items-center">
          <h1 className="text-2xl font-bold text-green-800 mb-2 flex items-center gap-2">
            <Award className="text-green-700" /> My Certificates
          </h1>
          {loadingCerts ? (
            <div className="flex items-center gap-2 text-green-900"><Loader2 className="animate-spin" /> Loading certificates...</div>
          ) : certs.length === 0 ? (
            <p className="text-muted-foreground">No certificates yet. Complete all videos in a course to earn a certificate.</p>
          ) : (
            certs.map(cert => (
              <CertificatePreview
                key={cert.id}
                userName={user?.user_metadata?.full_name || user?.email || ""}
                courseTitle={cert.courseTitle}
              />
            ))
          )}
          {/* Optionally you can show a message or loader if needed */}
          {/* {downloading && <div className="text-green-800 font-semibold mt-2">Generating certificate...</div>} */}
        </div>
      </main>
    </div>
  );
}

