import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import FreelancerDashboard from "./pages/dashboard/FreelancerDashboard";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";

function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"freelancer" | "company" | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile) {
          setRole(profile.role);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          role === "freelancer" ? (
            <Navigate to="/dashboard/freelancer" />
          ) : role === "company" ? (
            <Navigate to="/dashboard/company" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard/freelancer" element={<FreelancerDashboard />} />
      <Route path="/dashboard/company" element={<CompanyDashboard />} />
    </Routes>
  );
}

export default App;