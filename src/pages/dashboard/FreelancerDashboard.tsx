import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import "../../styles/dashboard.css";
import DashboardHeader from "../../components/DashboardHeader";

export default function FreelancerDashboard() {
  const [freelancerName, _setFreelancerName] = useState("Freelancer");
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from("jobs").select("*").limit(5);
      if (!error && data) setJobs(data);
    };
    fetchJobs();
  }, []);

  return (
    <div className="dashboard-container">
      <DashboardHeader name={freelancerName} />

      <section className="dashboard-section">
        <h3>Suggested Jobs</h3>
        {jobs.length ? (
          <ul>
            {jobs.map((job) => (
              <li key={job.id}>
                {job.title} - <button className="btn-primary">View</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No jobs available.</p>
        )}
      </section>
    </div>
  );
}