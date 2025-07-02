
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { sendEmail } from "@/utils/sendEmail";
import { testSupabaseAuth } from "@/utils/supabaseTest";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const navigate = useNavigate();

  const onAuth = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setLoading(true);
    setError(null);
    setConnectionStatus('Testing connection...');

    try {
      console.log("[Auth] Starting authentication...", { isSignUp, email });
      
      // Test auth connection first
      const authTest = await testSupabaseAuth();
      if (!authTest.success) {
        console.error("[Auth] Auth connection test failed:", authTest.error);
        setError(authTest.error || "Authentication service unavailable");
        setConnectionStatus('Auth service unavailable');
        return;
      }
      
      setConnectionStatus('Connected, processing...');
      
      if (isSignUp) {
        const [first_name, ...last] = fullName.split(" ");
        const last_name = last.join(" ");
        const redirectUrl = `${window.location.origin}/auth`;
        
        console.log("[Auth] Attempting signup...");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name,
              last_name,
              full_name: fullName,
            }
          }
        });
        
        if (error) {
          console.error("[Auth] Signup error:", error);
          let errorMsg = error.message;
          
          if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            errorMsg = "Network connection failed. Please check your internet connection and try again.";
          } else if (error.message.includes('User already registered')) {
            errorMsg = "An account with this email already exists. Please try logging in instead.";
          }
          
          setError(errorMsg);
          setConnectionStatus('Signup failed');
          toast({ title: "Signup Failed", description: errorMsg });
        } else {
          console.log("[Auth] Signup successful, sending welcome email...");
          setConnectionStatus('Account created, sending welcome email...');
          
          // Send Welcome Email
          try {
            await sendEmail({
              event: "welcome",
              to: email,
              userName: fullName,
            });
            console.log("[Auth] Welcome email sent via Resend.");
          } catch (e: any) {
            console.error("sendEmail welcome error:", e);
            toast({ title: "Could not send welcome email", description: e?.message });
          }
          
          toast({ title: "Signup successful!", description: "Check your email for confirmation." });
          setConnectionStatus('Success! Check your email.');
          setIsSignUp(false);
        }
      } else {
        console.log("[Auth] Attempting login...");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          console.error("[Auth] Login error:", error);
          let errorMsg = error.message;
          
          if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            errorMsg = "Network connection failed. Please check your internet connection and try again.";
          } else if (error.message.includes('Invalid login credentials')) {
            errorMsg = "Invalid email or password. Please check your credentials and try again.";
          }
          
          setError(errorMsg);
          setConnectionStatus('Login failed');
          toast({ title: "Login Failed", description: errorMsg });
        } else {
          console.log("[Auth] Login successful");
          setConnectionStatus('Login successful, redirecting...');
          toast({ title: "Logged in", description: "Welcome back!" });
          navigate("/");
        }
      }
    } catch (e: any) {
      console.error("[Auth] Exception during auth:", e);
      const errorMsg = `Connection error: ${e?.message || 'Please check your internet connection and try again'}`;
      setError(errorMsg);
      setConnectionStatus('Connection error');
      toast({ title: "Connection Error", description: errorMsg });
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
          
          {connectionStatus && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              Status: {connectionStatus}
            </div>
          )}
          
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
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : (isSignUp ? "Create Account" : "Login")}
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
