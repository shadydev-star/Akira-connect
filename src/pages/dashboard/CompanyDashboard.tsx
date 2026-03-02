import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import "../../styles/companyDashboard.css";
import PostJobModal from "../../components/PostJobModal";

export default function CompanyDashboard() {
  const [companyName, _setCompanyName] = useState("Company");
  const [jobs, setJobs] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // For stats
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
  });

  const fetchJobs = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    if (!userId) return;

    const { data: jobsData, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", userId);

    if (!error && jobsData) {
      setJobs(jobsData);

      const totalJobs = jobsData.length;
      const activeJobs = jobsData.filter((j) => j.status === "active").length;
      const totalApplicants = jobsData.reduce(
        (acc, j) => acc + (j.applicants_count || 0),
        0
      );

      setStats({ totalJobs, activeJobs, totalApplicants });
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="company-dashboard">
      {/* Welcome Banner */}
      <header className="dashboard-header">
        <h1>Welcome back, {companyName} 👋</h1>
        <p>Here’s what’s happening with your jobs</p>
      </header>

      {/* Stats Cards */}
      <section className="stats-cards">
        <div className="card">
          <h3>Total Jobs</h3>
          <p>{stats.totalJobs}</p>
        </div>
        <div className="card">
          <h3>Active Jobs</h3>
          <p>{stats.activeJobs}</p>
        </div>
        <div className="card">
          <h3>Total Applicants</h3>
          <p>{stats.totalApplicants}</p>
        </div>
      </section>

      {/* Actions */}
      <section className="dashboard-actions">
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          Post a New Job
        </button>
        <button className="btn-secondary">View Applicants</button>
      </section>

      {/* Job Cards */}
      <section className="jobs-list">
        <h2>Your Jobs</h2>
        <div className="jobs-grid">
          {jobs.length ? (
            jobs.map((job) => (
              <div className="job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p>
                  Status: <span className={`status ${job.status}`}>{job.status}</span>
                </p>
                <p>Applicants: {job.applicants_count || 0}</p>
                <button className="btn-primary">View Details</button>
              </div>
            ))
          ) : (
            <p>No jobs posted yet.</p>
          )}
        </div>
      </section>

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onJobPosted={fetchJobs} // Refresh jobs after posting
      />
    </div>
  );
}