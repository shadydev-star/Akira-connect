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
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          if (profile) {
            setRole(profile.role as UserRole);
          }
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setError(err instanceof Error ? err.message : "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
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

  // FIXED: Removed the return type annotation ": JSX.Element"
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