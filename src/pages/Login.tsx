
import Navbar from "@/components/Navbar";
import React from "react";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white w-full">
      <Navbar />
      <main className="pt-32 pb-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-white dark:bg-background rounded-xl shadow-lg px-10 py-8 max-w-md w-full flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-green-800">Sign In / Create Account</h1>
          <p className="text-muted-foreground mb-4">
            Authentication coming soon! To enable login and user accounts, please connect <span className="font-semibold">Supabase</span> in the Lovable UI.
          </p>
          <button
            className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition"
            onClick={() => alert("Please connect Supabase for full authentication.")}
          >
            Enable with Supabase
          </button>
        </div>
      </main>
    </div>
  );
}

