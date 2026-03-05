import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import "../../styles/companyDashboard.css";
import PostJobModal from "../../components/PostJobModal";
import DashboardHeader from "../../components/DashboardHeader";
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  CheckCircle, 
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  Star,
  ChevronRight
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  status: "active" | "inactive" | "closed";
  applicants_count: number;
  budget?: string;
  duration?: string;
  location?: string;
  category?: string;
  posted_at?: string;
}

interface Applicant {
  id: string;
  name: string;
  job_title: string;
  rating: number;
  completed_jobs: number;
  location: string;
  cover_letter: string;
  applied_at: string;
  hourly_rate: string;
  status: "New" | "Reviewing" | "Shortlisted" | "Rejected";
  avatar?: string;
}

export default function CompanyDashboard() {
  const [companyName, _setCompanyName ] = useState("TechCorp Inc.");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "applicants">("overview");

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    newJobsThisWeek: 0,
    totalApplicants: 0,
    newApplicants: 0,
    reviewingApplicants: 0,
    shortlistedApplicants: 0,
    hiredFreelancers: 0,
    hiredThisMonth: 0,
    completedProjects: 0,
    successRate: 89,
    avgTimeToHire: 5.2,
    activeContracts: 15,
    contractsEndingThisMonth: 3,
    satisfactionRate: 4.8,
    totalReviews: 24
  });

  const [applicants, _setApplicants] = useState<Applicant[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      job_title: "Senior Full Stack Developer",
      rating: 4.9,
      completed_jobs: 47,
      location: "San Francisco, USA",
      cover_letter: "I am a seasoned full-stack developer with over 8 years of experience building scalable web applications. I have extensive experience with React, Node.js, and cloud technologies...",
      applied_at: "2 hours ago",
      hourly_rate: "$85/hour",
      status: "New"
    },
    {
      id: "2",
      name: "Michael Chen",
      job_title: "UI/UX Designer for Mobile App",
      rating: 5.0,
      completed_jobs: 62,
      location: "London, UK",
      cover_letter: "With a passion for creating intuitive and beautiful user experiences, I have designed mobile apps for Fortune 500 companies and startups alike. My portfolio includes...",
      applied_at: "5 hours ago",
      hourly_rate: "$70/hour",
      status: "New"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      job_title: "Content Writer - Tech Blog",
      rating: 4.8,
      completed_jobs: 34,
      location: "Toronto, Canada",
      cover_letter: "As a tech writer with a background in software engineering, I bring both technical expertise and storytelling skills to every project. I have written for major tech publications...",
      applied_at: "1 day ago",
      hourly_rate: "$50/hour",
      status: "Reviewing"
    }
  ]);

  const fetchJobs = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    const { data: jobsData, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", userId);

    if (!error && jobsData) {
      setJobs(jobsData);
      
      // Enhanced stats calculation
      const totalJobs = jobsData.length;
      const activeJobs = jobsData.filter((j) => j.status === "active").length;
      const newJobsThisWeek = jobsData.filter((j) => {
        const postedDate = new Date(j.posted_at || Date.now());
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return postedDate >= weekAgo;
      }).length;
      
      const totalApplicants = jobsData.reduce(
        (acc, j) => acc + (j.applicants_count || 0),
        0
      );

      setStats(prev => ({
        ...prev,
        totalJobs,
        activeJobs,
        newJobsThisWeek,
        totalApplicants
      }));
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Mock job data for display (in production, this would come from the database)
  const mockJobs: Job[] = [
    {
      id: "1",
      title: "Senior Full Stack Developer",
      status: "active",
      applicants_count: 24,
      budget: "$5,000 - $8,000",
      duration: "3-6 months",
      location: "Remote",
      category: "Development & IT",
      posted_at: "2 days ago"
    },
    {
      id: "2",
      title: "UI/UX Designer for Mobile App",
      status: "active",
      applicants_count: 18,
      budget: "$3,000 - $5,000",
      duration: "1-3 months",
      location: "New York, USA",
      category: "Design & Creative",
      posted_at: "5 days ago"
    },
    {
      id: "3",
      title: "Content Writer - Tech Blog",
      status: "active",
      applicants_count: 31,
      budget: "$2,000 - $3,500",
      duration: "1-4 weeks",
      location: "Remote",
      category: "Writing & Content",
      posted_at: "1 week ago"
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : mockJobs;

  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return 'status-badge active';
      case 'reviewing': return 'status-badge reviewing';
      case 'shortlisted': return 'status-badge shortlisted';
      case 'new': return 'status-badge new';
      default: return 'status-badge';
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Development & IT': return 'category-dev';
      case 'Design & Creative': return 'category-design';
      case 'Writing & Content': return 'category-writing';
      default: return '';
    }
  };

  return (
    <div className="company-dashboard">
      <DashboardHeader name={companyName} />
      
      {/* Welcome Section */}
      <div className="welcome-section">
        
        <div className="header-actions">
          <button className="btn-outline" onClick={() => setActiveTab("overview")}>
            <TrendingUp size={16} />
            Overview
          </button>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Briefcase size={16} />
            Post a Job
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Jobs
        </button>
        <button 
          className={`tab ${activeTab === 'applicants' ? 'active' : ''}`}
          onClick={() => setActiveTab('applicants')}
        >
          Applicants
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics Cards */}
          <section className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon blue">
                <Briefcase size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Active Jobs</span>
                <div className="metric-value-wrapper">
                  <span className="metric-value">{stats.activeJobs}</span>
                  <span className="metric-trend positive">
                    <TrendingUp size={14} />
                    3 posted this week
                  </span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon purple">
                <Users size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Applications</span>
                <div className="metric-value-wrapper">
                  <span className="metric-value">{stats.totalApplicants}</span>
                  <span className="metric-trend positive">
                    <TrendingUp size={14} />
                    45 pending review
                  </span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon green">
                <UserCheck size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Hired Freelancers</span>
                <div className="metric-value-wrapper">
                  <span className="metric-value">{stats.hiredFreelancers}</span>
                  <span className="metric-trend positive">
                    <TrendingUp size={14} />
                    2 this month
                  </span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon orange">
                <CheckCircle size={20} />
              </div>
              <div className="metric-content">
                <span className="metric-label">Completed Projects</span>
                <div className="metric-value-wrapper">
                  <span className="metric-value">{stats.completedProjects}</span>
                  <span className="metric-trend positive">
                    <TrendingUp size={14} />
                    {stats.successRate}% success rate
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Applications Overview */}
          <section className="applications-overview">
            <div className="section-header">
              <h2>Applications Overview</h2>
              <button className="btn-text">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="overview-stats">
              <div className="overview-stat">
                <span className="stat-value">{stats.totalApplicants}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="overview-stat">
                <span className="stat-value new">23</span>
                <span className="stat-label">New</span>
              </div>
              <div className="overview-stat">
                <span className="stat-value reviewing">45</span>
                <span className="stat-label">Reviewing</span>
              </div>
              <div className="overview-stat">
                <span className="stat-value shortlisted">12</span>
                <span className="stat-label">Shortlisted</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-segment new" style={{width: '12%'}}></div>
              <div className="progress-segment reviewing" style={{width: '24%'}}></div>
              <div className="progress-segment shortlisted" style={{width: '6%'}}></div>
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="dashboard-two-column">
            {/* Left Column - Active Job Postings */}
            <section className="job-postings">
              <div className="section-header">
                <h2>Active Job Postings</h2>
                <button className="btn-text">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="job-cards">
                {displayJobs.map((job) => (
                  <div className="job-card-modern" key={job.id}>
                    <div className="job-card-header">
                      <span className={`job-category ${getCategoryColor(job.category || '')}`}>
                        {job.category || 'General'}
                      </span>
                      <span className={`status-badge ${job.status}`}>{job.status}</span>
                    </div>
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-details">
                      <span className="job-detail">
                        <DollarSign size={14} />
                        {job.budget || '$5,000 - $8,000'}
                      </span>
                      <span className="job-detail">
                        <Clock size={14} />
                        {job.duration || '3-6 months'}
                      </span>
                      <span className="job-detail">
                        <MapPin size={14} />
                        {job.location || 'Remote'}
                      </span>
                    </div>
                    <div className="job-footer">
                      <span className="applicant-count">{job.applicants_count} applicants</span>
                      <span className="posted-date">Posted {job.posted_at || '2 days ago'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right Column - Recent Applications */}
            <section className="recent-applications">
              <div className="section-header">
                <h2>Recent Applications</h2>
                <button className="btn-text">
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="applicants-list">
                {applicants.map((applicant) => (
                  <div className="applicant-card" key={applicant.id}>
                    <div className="applicant-header">
                      <div className="applicant-avatar">
                        {applicant.name.charAt(0)}
                      </div>
                      <div className="applicant-info">
                        <h4>{applicant.name}</h4>
                        <p className="applicant-role">Applied for: {applicant.job_title}</p>
                      </div>
                      <span className={getStatusBadgeClass(applicant.status)}>
                        {applicant.status}
                      </span>
                    </div>
                    
                    <div className="applicant-meta">
                      <span className="meta-item">
                        <Star size={14} className="star-icon" />
                        {applicant.rating}
                      </span>
                      <span className="meta-item">{applicant.completed_jobs} jobs</span>
                      <span className="meta-item">{applicant.location}</span>
                    </div>

                    <p className="applicant-cover">{applicant.cover_letter}</p>

                    <div className="applicant-footer">
                      <span className="applied-time">{applicant.applied_at}</span>
                      <span className="hourly-rate">{applicant.hourly_rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Bottom Metrics */}
          <section className="bottom-metrics">
            <div className="metric-small-card">
              <span className="metric-small-label">Avg. Time to Hire</span>
              <div className="metric-small-value">
                {stats.avgTimeToHire} days
                <span className="trend-badge negative">↓ 12% faster than average</span>
              </div>
            </div>
            <div className="metric-small-card">
              <span className="metric-small-label">Active Contracts</span>
              <div className="metric-small-value">
                {stats.activeContracts}
                <span className="trend-badge neutral">{stats.contractsEndingThisMonth} ending this month</span>
              </div>
            </div>
            <div className="metric-small-card">
              <span className="metric-small-label">Satisfaction Rate</span>
              <div className="metric-small-value">
                {stats.satisfactionRate}/5.0
                <span className="trend-badge neutral">Based on {stats.totalReviews} reviews</span>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'jobs' && (
        <section className="jobs-list">
          <h2>All Job Postings</h2>
          <div className="jobs-grid">
            {displayJobs.map((job) => (
              <div className="job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p>
                  Status: <span className={`status ${job.status}`}>{job.status}</span>
                </p>
                <p>Applicants: {job.applicants_count || 0}</p>
                <button className="btn-primary">View Details</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'applicants' && (
        <section className="applicants-list-full">
          <h2>All Applicants</h2>
          <div className="applicants-grid">
            {applicants.map((applicant) => (
              <div className="applicant-card-full" key={applicant.id}>
                <div className="applicant-header">
                  <div className="applicant-avatar-large">
                    {applicant.name.charAt(0)}
                  </div>
                  <div>
                    <h3>{applicant.name}</h3>
                    <p>{applicant.job_title}</p>
                  </div>
                  <span className={getStatusBadgeClass(applicant.status)}>
                    {applicant.status}
                  </span>
                </div>
                <div className="applicant-details">
                  <div className="detail-row">
                    <Star size={16} className="star-icon" />
                    <span>{applicant.rating} · {applicant.completed_jobs} jobs</span>
                  </div>
                  <div className="detail-row">
                    <MapPin size={16} />
                    <span>{applicant.location}</span>
                  </div>
                  <div className="detail-row">
                    <DollarSign size={16} />
                    <span>{applicant.hourly_rate}</span>
                  </div>
                </div>
                <button className="btn-secondary">View Application</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <PostJobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onJobPosted={fetchJobs}
      />
    </div>
  );
}