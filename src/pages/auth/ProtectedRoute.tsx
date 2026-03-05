import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

interface ProtectedRouteProps {
  children: ReactNode;
  role: string;
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    checkUser(); // initial check

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    setLoading(true);
    setAuthorized(false);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        setLoading(false);
        return;
      }

      const user = sessionData.session.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.role === role) {
        setAuthorized(true);
      }
    } catch (err) {
      console.error("ProtectedRoute error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center mt-10">Checking credentials...</div>;
  if (!authorized) return <Navigate to="/login" replace />;

  return <>{children}</>;
}