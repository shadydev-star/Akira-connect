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
    // Flag to prevent state updates after unmount
    let isMounted = true;
    
    // Add a timeout to prevent infinite loading (increased to 15 seconds for slow devices)
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log("⚠️ Loading timeout - forcing loading to false");
        setLoading(false);
      }
    }, 15000);

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.log("📝 User profile not found");
            if (isMounted) setRole(null);
          } else {
            throw profileError;
          }
        } else if (profile && isMounted) {
          console.log("📝 Profile found:", profile.role);
          setRole(profile.role as UserRole);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    const checkUser = async (retryCount = 0): Promise<void> => {
      try {
        // Add a small delay to let locks settle (especially on slow devices)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log("🔍 Checking user session...");
        
        // First check if there's a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // Handle lock timeout errors with retry
        if (sessionError) {
          // Check if it's a lock timeout error
          if (sessionError.name === 'NavigatorLockAcquireTimeoutError' || 
              sessionError.message?.includes('Navigator LockManager') ||
              sessionError.message?.includes('timed out waiting')) {
            
            if (retryCount < 3) {
              console.log(`⏳ Lock timeout, retrying... (${retryCount + 1}/3)`);
              const delay = 500 * Math.pow(2, retryCount);
              await new Promise(resolve => setTimeout(resolve, delay));
              return checkUser(retryCount + 1);
            } else {
              console.log("⚠️ Max retries reached for lock timeout");
              if (isMounted) {
                setRole(null);
                setLoading(false);
                clearTimeout(timeoutId);
              }
              return;
            }
          }
          throw sessionError;
        }
        
        if (!sessionData.session) {
          console.log("No active session - user is not logged in");
          if (isMounted) {
            setRole(null);
            setLoading(false);
            clearTimeout(timeoutId);
          }
          return;
        }

        // Session exists, now get the verified user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          if (userError.name === 'AuthSessionMissingError' || 
              userError.message?.includes('Auth session missing')) {
            console.log("Session expired or invalid");
            if (isMounted) {
              setRole(null);
              setLoading(false);
              clearTimeout(timeoutId);
            }
            return;
          }
          throw userError;
        }

        if (user && isMounted) {
          console.log("👤 User found:", user.email);
          await fetchUserProfile(user.id);
        }
      } catch (err) {
        if (err instanceof Error && isMounted) {
          const isLockError = err.name === 'NavigatorLockAcquireTimeoutError' || 
                              err.message?.includes('Navigator LockManager') ||
                              err.message?.includes('timed out waiting');
          
          const isAuthError = err.name === 'AuthSessionMissingError' || 
                             err.message?.includes('Auth session missing') ||
                             err.message?.includes('JWT');
          
          if (isLockError) {
            console.log("🔐 Auth lock issue, treating as not logged in");
            setRole(null);
          } else if (!isAuthError) {
            console.error("❌ Error checking user:", err);
            setError(err.message);
          } else {
            console.log("Authentication state: No valid session");
            setRole(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    // Set up auth state listener FIRST to catch any immediate events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event);
        
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          console.log("👤 User signed in, fetching profile...");
          setLoading(true); // Show loading while fetching profile
          await fetchUserProfile(session.user.id);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log("👋 User signed out");
          setRole(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("🔄 Token refreshed");
          // Optionally re-check user
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        }
      }
    );

    // THEN check current session
    checkUser();

    // Cleanup subscription and timeout
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  console.log("🔄 Current state - loading:", loading, "role:", role, "error:", error);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        gap: "1rem"
      }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: "4px solid #f3f3f3", 
          borderTop: "4px solid #9709aa", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }} />
        <p>Checking credentials...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        gap: "1rem"
      }}>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button 
          onClick={() => window.location.href = "/login"}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#9709aa",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          Go to Login
        </button>
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
      <Route path="/" element={getRootRedirect()} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard/freelancer"
        element={
          <ProtectedRoute role="freelancer">
            <FreelancerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/company"
        element={
          <ProtectedRoute role="company">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;