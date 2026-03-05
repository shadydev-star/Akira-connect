import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import FreelancerDashboard from "./pages/dashboard/FreelancerDashboard";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";

type UserRole = "freelancer" | "company" | null;

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<UserRole>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      try {
        // First check if there's a session (this doesn't throw errors)
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          // No session means user is not logged in - that's fine!
          console.log("No active session - user is not logged in");
          setRole(null);
          setLoading(false);
          return;
        }

        // Session exists, now get the verified user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          // Check if it's an auth session error
          if (userError.name === 'AuthSessionMissingError' || 
              userError.message?.includes('Auth session missing')) {
            console.log("Session expired or invalid");
            setRole(null);
            return;
          }
          throw userError;
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profileError) {
            // Profile not found - user might need to complete signup
            if (profileError.code === 'PGRST116') {
              console.log("User profile not found");
              setRole(null);
            } else {
              throw profileError;
            }
          } else if (profile) {
            setRole(profile.role as UserRole);
          }
        }
      } catch (err) {
        // Only log errors that are NOT auth session issues
        if (err instanceof Error) {
          const isAuthError = err.name === 'AuthSessionMissingError' || 
                             err.message?.includes('Auth session missing') ||
                             err.message?.includes('JWT');
          
          if (!isAuthError) {
            console.error("Error checking user:", err);
            setError(err.message);
          } else {
            console.log("Authentication state: No valid session");
            // No need to set error for auth issues
          }
        } else {
          console.error("Unknown error:", err);
          setError("Failed to load user data");
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Optional: Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile on sign in
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (profile) {
            setRole(profile.role as UserRole);
          }
        } else if (event === 'SIGNED_OUT') {
          setRole(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh" 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        color: "red"
      }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const getRootRedirect = () => {
    switch (role) {
      case "freelancer":
        return <Navigate to="/dashboard/freelancer" replace />;
      case "company":
        return <Navigate to="/dashboard/company" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={getRootRedirect()} />

      {/* Public routes */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Protected freelancer dashboard */}
      <Route
        path="/dashboard/freelancer"
        element={
          <ProtectedRoute role="freelancer">
            <FreelancerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected company dashboard */}
      <Route
        path="/dashboard/company"
        element={
          <ProtectedRoute role="company">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;