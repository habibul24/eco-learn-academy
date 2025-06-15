
// Full landing page for the Sustainability LMS

import Navbar from "@/components/Navbar";
import CourseCatalog from "@/components/CourseCatalog";
import { Users } from "lucide-react";
import React from "react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white w-full">
      <Navbar />
      {/* Hero section */}
      <section className="pt-32 px-8 max-w-[1400px] mx-auto flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-24">
        <div className="flex-1 mb-6 lg:mb-0">
          <span className="bg-green-100 rounded-full px-4 py-1 text-green-800 font-semibold text-sm mb-4 inline-block animate-fade-in">
            Learn • Grow • Impact
          </span>
          <h1 className="text-5xl font-extrabold text-green-900 mb-6 leading-tight">
            Master Sustainability With <span className="text-green-700">Expert-Led</span> Courses
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-xl">
            Sustainability isn’t just a buzzword — it’s a way of life and business.
            Join <span className="font-semibold text-green-700">SustainLearn</span> to gain actionable skills from passionate instructors, and create positive environmental change.
          </p>
          <a
            href="#courses"
            className="inline-block bg-green-600 text-white rounded-lg px-8 py-3 font-semibold text-lg shadow-lg hover:bg-green-700 hover:scale-105 transition story-link"
          >
            Shop Sustainability Courses
          </a>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=620&q=80"
            alt="Sustainability landscape"
            className="rounded-2xl shadow-2xl border-2 border-green-50 w-[400px] h-[320px] object-cover animate-scale-in"
          />
        </div>
      </section>

      {/* Quick Stats & Mission */}
      <section className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-between max-w-[1200px] mx-auto py-12 mt-8 mb-2">
        <div className="bg-white dark:bg-background rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-2 w-full md:w-auto min-w-[250px]">
          <Users className="text-green-700" size={32} />
          <span className="font-bold text-2xl">5,000+</span>
          <span className="text-muted-foreground text-sm">Students enrolled</span>
        </div>
        <div className="bg-white dark:bg-background rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-2 w-full md:w-auto min-w-[250px]">
          <span className="font-bold text-2xl text-green-700">Top Experts</span>
          <span className="text-muted-foreground text-sm">Taught by leaders in sustainability</span>
        </div>
        <div className="bg-white dark:bg-background rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-2 w-full md:w-auto min-w-[250px]">
          <span className="font-bold text-2xl">7 Countries</span>
          <span className="text-muted-foreground text-sm">Global community impact</span>
        </div>
      </section>

      {/* Courses */}
      <main id="courses" className="max-w-[1400px] mx-auto pb-20">
        <CourseCatalog />
      </main>

      {/* About & Footer */}
      <footer className="bg-green-900 text-green-50 py-12 mt-12">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-6">
          <div>
            <span className="text-2xl font-bold">SustainLearn</span>
            <p className="text-green-100 mt-2 max-w-xs">
              Our mission: make sustainability knowledge accessible, practical, and inspiring—worldwide.
            </p>
          </div>
          <div className="flex gap-8 text-lg font-medium">
            <a href="/" className="hover:underline hover:text-green-200 story-link">Home</a>
            <a href="/courses" className="hover:underline hover:text-green-200 story-link">Courses</a>
            <a href="/about" className="hover:underline hover:text-green-200 story-link">About</a>
          </div>
        </div>
        <div className="text-center text-green-200 pt-8 text-xs">
          &copy; {new Date().getFullYear()} SustainLearn. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
