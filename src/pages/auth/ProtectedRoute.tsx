import { useEffect, useState } from "react";
import type { ReactNode } from 'react';
import { Navigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

interface ProtectedRouteProps {
  children: ReactNode;
  role: "freelancer" | "company"; // More specific type instead of string
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    setAuthorized(false);

    try {
      // First check for session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError.message);
        return;
      }

      if (!session) {
        console.log("No session found - redirecting to login");
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        // Handle specific error cases
        if (profileError.code === 'PGRST116') {
          console.log("Profile not found for user");
        } else {
          console.error("Profile fetch error:", profileError.message);
        }
        return;
      }

      // Check if user has required role
      if (profile?.role === role) {
        setAuthorized(true);
      } else {
        console.log(`User role ${profile?.role} doesn't match required role ${role}`);
      }
    } catch (err) {
      console.error("ProtectedRoute unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, [role]); // Add role to dependency array

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh" 
      }}>
        <p>Checking credentials...</p>
      </div>
    );
  }
  
  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}