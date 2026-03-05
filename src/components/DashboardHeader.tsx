// src/components/DashboardHeader.tsx
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/dashboardHeader.css";

interface DashboardHeaderProps {
  name: string;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ name }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <a href="/dashboard" className="logo">
          AKIRA-CONNECT
        </a>
        <nav className="header-nav">
          <a href="/dashboard" className="nav-link">
            Dashboard
          </a>
          <a href="/jobs" className="nav-link">
            Jobs
          </a>
          <a href="/applicants" className="nav-link">
            Applicants
          </a>
          <a href="/contracts" className="nav-link">
            Contracts
          </a>
        </nav>
      </div>
      <div className="header-right">
        <span className="company-name">{name}</span>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;