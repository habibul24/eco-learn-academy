
import Navbar from "@/components/Navbar";
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 w-full">
      <Navbar />
      <main className="flex flex-col items-center justify-center h-full py-40">
        <h1 className="text-6xl font-bold mb-4 text-green-900">404</h1>
        <p className="text-xl text-green-800 mb-3">Oops! Page not found.</p>
        <a
          href="/"
          className="text-green-600 hover:text-green-800 underline font-medium text-lg transition"
        >
          Return to Home
        </a>
      </main>
    </div>
  );
}
