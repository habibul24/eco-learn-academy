
import { Book, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Courses", path: "/courses" },
  { name: "About", path: "/about" },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <header className="w-full bg-white dark:bg-background shadow-md fixed top-0 left-0 z-40">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-green-700 hover:text-green-800 transition-colors">
          <Book className="text-green-700" size={32} />
          SustainLearn
        </Link>
        <div className="flex gap-6">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-lg font-medium hover:text-green-700 transition-colors",
                location.pathname === link.path && "text-green-700 underline"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div>
          <Link
            to="/login"
            className="rounded px-6 py-2 font-semibold text-white bg-green-600 hover:bg-green-700 shadow transition-colors duration-150"
          >
            Login/Signup
          </Link>
        </div>
      </nav>
    </header>
  );
}
