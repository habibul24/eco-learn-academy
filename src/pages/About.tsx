
import Navbar from "@/components/Navbar";
import { Users } from "lucide-react";
import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white w-full">
      <Navbar />
      <main className="pt-32 pb-24 max-w-[900px] mx-auto px-8">
        <h1 className="text-4xl font-bold mb-2 text-green-800">About SustainLearn</h1>
        <p className="text-lg max-w-2xl mb-6 text-muted-foreground">
          SustainLearn is dedicated to empowering people worldwide with knowledge and practical skills to drive real environmental impact. We bring together passionate instructors, proven strategies, and interactive learning for individuals and organizations.
        </p>
        <div className="flex flex-col sm:flex-row gap-10 items-center mt-12">
          <div className="bg-white dark:bg-background shadow-lg rounded-lg p-8 flex flex-col items-center w-full sm:w-1/2">
            <Users className="text-green-700 mb-3" size={40} />
            <div className="font-bold text-xl text-green-800">Our Vision</div>
            <p className="text-muted-foreground mt-2 text-center">
              A world where sustainability isn’t optional, but second nature—for every person, company, and community.
            </p>
          </div>
          <div className="bg-white dark:bg-background shadow-lg rounded-lg p-8 flex flex-col items-center w-full sm:w-1/2">
            <span className="font-bold text-xl text-green-800 mb-3">Our Team</span>
            <p className="text-muted-foreground mt-2 text-center">
              Our team features educators, business leaders, and sustainability experts, all united to create real, measurable change.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
