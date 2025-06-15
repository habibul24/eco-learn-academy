
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Courses", path: "/courses" },
  { name: "About", path: "/about" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuthUser();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    async function checkAdmin() {
      if (user?.id) {
        const { data } = await import("@/integrations/supabase/client").then(({ supabase }) =>
          supabase.from("user_roles").select("role").eq("user_id", user.id)
        );
        setIsAdmin(data?.some((r: any) => r.role === "admin"));
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

  return (
    <header className="w-full bg-white dark:bg-background shadow-md fixed top-0 left-0 z-40">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-8">
        <Link to="/" className="flex items-center gap-3 group" aria-label="GreenData Home">
          <img
            src="/lovable-uploads/86331d3a-e552-4c3b-8471-0c10bc776b9a.png"
            alt="GreenData Logo"
            className="h-10 w-auto"
            style={{ maxWidth: 130 }}
          />
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
          {user && (
            <>
              <Link
                to="/my-courses"
                className={cn(
                  "text-lg font-medium hover:text-green-700 transition-colors flex items-center",
                  location.pathname === "/my-courses" && "text-green-700 underline"
                )}
                aria-label="My Courses"
              >
                {/* Icon from lucide-react: book */}
                <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20"></path>
                  <path d="M6.5 7v10"></path>
                  <rect width="16" height="20" x="4" y="2" rx="2.5"></rect>
                </svg>
                My Courses
              </Link>
              <Link
                to="/my-certificates"
                className={cn(
                  "text-lg font-medium hover:text-green-700 transition-colors flex items-center",
                  location.pathname === "/my-certificates" && "text-green-700 underline"
                )}
                aria-label="My Certificates"
              >
                {/* Icon from lucide-react: award */}
                <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
                My Certificates
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "text-lg font-semibold text-yellow-700 hover:text-green-700 underline"
              )}
            >
              Admin
            </Link>
          )}
        </div>
        <div>
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-green-800 font-medium">{user.email}</span>
              <Button variant="secondary" onClick={async () => {
                await import("@/integrations/supabase/client").then(({ supabase }) => supabase.auth.signOut());
                navigate("/auth");
              }}>Logout</Button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded px-6 py-2 font-semibold text-white bg-green-600 hover:bg-green-700 shadow transition-colors duration-150"
            >
              Login/Signup
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
