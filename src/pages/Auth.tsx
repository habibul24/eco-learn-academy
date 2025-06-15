
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onAuth = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const [first_name, ...last] = fullName.split(" ");
        const last_name = last.join(" ");
        const redirectUrl = `${window.location.origin}/auth`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name,
              last_name,
            }
          }
        });
        if (error) {
          setError(error.message);
          toast({ title: "Signup Failed", description: error.message });
        } else {
          toast({ title: "Signup successful!", description: "Check your email for confirmation." });
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          toast({ title: "Login Failed", description: error.message });
        } else {
          toast({ title: "Logged in", description: "Welcome back!" });
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="bg-white rounded-xl shadow-lg px-10 py-8 w-full max-w-md flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-green-800">
            {isSignUp ? "Sign Up" : "Login"}
          </h1>
          <form className="flex flex-col gap-4" onSubmit={onAuth}>
            {isSignUp && (
              <Input
                autoFocus
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            )}
            <Input
              placeholder="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {error && <div className="text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : (isSignUp ? "Create Account" : "Login")}
            </Button>
          </form>
          <div className="text-center">
            {isSignUp
              ? <>Already have an account? <button className="text-green-600 underline" onClick={() => setIsSignUp(false)}>Log in</button></>
              : <>Don't have an account? <button className="text-green-600 underline" onClick={() => setIsSignUp(true)}>Sign up</button></>
            }
          </div>
        </div>
      </div>
    </>
  );
}
