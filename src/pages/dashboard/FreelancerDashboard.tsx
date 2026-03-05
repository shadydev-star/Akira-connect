import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import "../../styles/freelancer.css";
import DashboardHeader from "../../components/DashboardHeader";
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Clock, 
  Star, 
  TrendingUp,
  Filter,
  Search,
  Bookmark,
  CheckCircle,
  Users,
  Calendar,
  Award
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  budget: string;
  duration: string;
  location: string;
  category: string;
  skills: string[];
  posted_at: string;
  applicants_count: number;
  rating: number;
  description: string;
}

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  applied_at: string;
}

export default function FreelancerDashboard() {
  const [freelancerName, _setFreelancerName] = useState("Freelancer");
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const [stats, _setStats] = useState({
    profileViews: 142,
    applicationsSent: 12,
    interviews: 4,
    jobOffers: 2,
    earnings: 8500,
    completedProjects: 24,
    successRate: 98,
    responseRate: 95
  });

  // Mock data for suggested jobs
  const mockJobs: Job[] = [
    {
      id: "1",
      title: "Senior Full Stack Developer",
      company: "TechCorp Inc.",
      budget: "$5,000 - $8,000",
      duration: "3-6 months",
      location: "Remote",
      category: "Development & IT",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      posted_at: "2 hours ago",
      applicants_count: 18,
      rating: 4.9,
      description: "We're looking for an experienced full-stack developer to lead our e-commerce platform rebuild..."
    },
    {
      id: "2",
      title: "UI/UX Designer for Mobile App",
      company: "DesignStudio",
      budget: "$3,000 - $5,000",
      duration: "1-3 months",
      location: "New York, USA",
      category: "Design & Creative",
      skills: ["Figma", "UI Design", "User Research", "Prototyping"],
      posted_at: "5 hours ago",
      applicants_count: 12,
      rating: 5.0,
      description: "Seeking a talented UI/UX designer to create an intuitive mobile app experience for our fitness startup..."
    },
    {
      id: "3",
      title: "Content Writer - Tech Blog",
      company: "ContentLab",
      budget: "$2,000 - $3,500",
      duration: "1-4 weeks",
      location: "Remote",
      category: "Writing & Content",
      skills: ["Technical Writing", "SEO", "Blog Posts", "Research"],
      posted_at: "1 day ago",
      applicants_count: 24,
      rating: 4.8,
      description: "Looking for a tech-savvy writer to create engaging content about software development and AI..."
    },
    {
      id: "4",
      title: "DevOps Engineer",
      company: "CloudTech Solutions",
      budget: "$6,000 - $9,000",
      duration: "6-12 months",
      location: "Remote",
      category: "Development & IT",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      posted_at: "3 days ago",
      applicants_count: 9,
      rating: 4.7,
      description: "Join our team to build and maintain scalable cloud infrastructure for enterprise clients..."
    }
  ];

  // Mock data for applications
  const mockApplications: Application[] = [
    {
      id: "1",
      job_title: "Senior Full Stack Developer",
      company: "TechCorp Inc.",
      status: "reviewing",
      applied_at: "2 days ago"
    },
    {
      id: "2",
      job_title: "UI/UX Designer",
      company: "DesignStudio",
      status: "pending",
      applied_at: "5 days ago"
    },
    {
      id: "3",
      job_title: "Content Writer",
      company: "ContentLab",
      status: "accepted",
      applied_at: "1 week ago"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      // In production, fetch from Supabase
      setSuggestedJobs(mockJobs);
      setApplications(mockApplications);
      
      // Actual Supabase fetch example:
      // const userId = (await supabase.auth.getUser()).data.user?.id;
      // if (!userId) return;
      // 
      // const { data: jobsData } = await supabase
      //   .from("jobs")
      //   .select("*")
      //   .limit(10);
      // if (jobsData) setSuggestedJobs(jobsData);
    };
    
    fetchData();
  }, []);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };

  const applyForJob = (jobId: string) => {
    console.log("Applying for job:", jobId);
    // In production, handle job application
  };

  const filteredJobs = suggestedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'accepted': return 'status-badge accepted';
      case 'reviewing': return 'status-badge reviewing';
      case 'pending': return 'status-badge pending';
      case 'rejected': return 'status-badge rejected';
      default: return 'status-badge';
    }
  };

  return (
    <div className="freelancer-dashboard">
      <DashboardHeader name={freelancerName} />

      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Welcome back, {freelancerName}! 👋</h1>
          <p className="welcome-subtitle">Here's your freelance overview and recommended opportunities.</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline">
            <Award size={16} />
            Complete Profile
          </button>
          <button className="btn-primary">
            <Briefcase size={16} />
            Find Work
          </button>
        </div>
      </div>

      {/* Freelancer Stats Cards */}
      <section className="freelancer-stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Eye size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Profile Views</span>
            <span className="stat-value">{stats.profileViews}</span>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              +12 this week
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Send size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Applications</span>
            <span className="stat-value">{stats.applicationsSent}</span>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              4 active
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <MessageSquare size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Interviews</span>
            <span className="stat-value">{stats.interviews}</span>
            <span className="stat-trend neutral">
              {stats.responseRate}% response rate
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Job Offers</span>
            <span className="stat-value">{stats.jobOffers}</span>
            <span className="stat-trend positive">
              {stats.successRate}% success rate
            </span>
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="freelancer-two-column">
        {/* Left Column - Suggested Jobs */}
        <section className="suggested-jobs">
          <div className="section-header">
            <h2>Suggested Jobs for You</h2>
            <button className="btn-text">
              View All <ChevronRight size={16} />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="search-filter">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-dropdown">
              <Filter size={18} />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="Development & IT">Development & IT</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Writing & Content">Writing & Content</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          {/* Job Cards */}
          <div className="job-list">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div className="job-card-modern" key={job.id}>
                  <div className="job-card-header">
                    <div className="job-company">
                      <span className={`job-category ${job.category === 'Development & IT' ? 'category-dev' : 
                                                          job.category === 'Design & Creative' ? 'category-design' : 
                                                          'category-writing'}`}>
                        {job.category}
                      </span>
                      <span className="company-name">{job.company}</span>
                    </div>
                    <button 
                      className={`save-job-btn ${savedJobs.includes(job.id) ? 'saved' : ''}`}
                      onClick={() => toggleSaveJob(job.id)}
                    >
                      <Bookmark size={18} fill={savedJobs.includes(job.id) ? "#9709aa" : "none"} />
                    </button>
                  </div>

                  <h3 className="job-title">{job.title}</h3>
                  
                  <p className="job-description">{job.description}</p>

                  <div className="job-skills">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>

                  <div className="job-details">
                    <span className="job-detail">
                      <DollarSign size={14} />
                      {job.budget}
                    </span>
                    <span className="job-detail">
                      <Clock size={14} />
                      {job.duration}
                    </span>
                    <span className="job-detail">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                  </div>

                  <div className="job-footer">
                    <div className="job-meta">
                      <span className="rating">
                        <Star size={14} className="star-icon" />
                        {job.rating}
                      </span>
                      <span className="applicants">
                        <Users size={14} />
                        {job.applicants_count} applicants
                      </span>
                      <span className="posted-time">{job.posted_at}</span>
                    </div>
                    <button 
                      className="btn-primary"
                      onClick={() => applyForJob(job.id)}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No jobs match your search criteria.</p>
            )}
          </div>
        </section>

        {/* Right Column - Overview & Applications */}
        <div className="right-column">
          {/* Profile Completion */}
          <section className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {freelancerName.charAt(0)}
              </div>
              <div className="profile-info">
                <h3>{freelancerName}</h3>
                <p>Full Stack Developer & UI Designer</p>
              </div>
            </div>
            
            <div className="profile-stats">
              <div className="profile-stat">
                <Star size={16} className="star-icon" />
                <span>4.9</span>
                <span className="stat-detail">(47 reviews)</span>
              </div>
              <div className="profile-stat">
                <CheckCircle size={16} className="check-icon" />
                <span>{stats.completedProjects}</span>
                <span className="stat-detail">jobs completed</span>
              </div>
              <div className="profile-stat">
                <DollarSign size={16} />
                <span>${stats.earnings}</span>
                <span className="stat-detail">total earned</span>
              </div>
            </div>

            <div className="profile-progress">
              <div className="progress-label">
                <span>Profile Completion</span>
                <span>85%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '85%'}}></div>
              </div>
              <p className="progress-hint">Add your portfolio to reach 100%</p>
            </div>
          </section>

          {/* Recent Applications */}
          <section className="recent-applications">
            <div className="section-header">
              <h3>Recent Applications</h3>
              <button className="btn-text">
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="applications-list">
              {applications.map((app) => (
                <div className="application-item" key={app.id}>
                  <div className="application-info">
                    <h4>{app.job_title}</h4>
                    <p className="company">{app.company}</p>
                    <span className={`status-badge ${app.status}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="application-meta">
                    <Clock size={14} />
                    <span>{app.applied_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section className="upcoming-deadlines">
            <h3>Upcoming Deadlines</h3>
            <div className="deadline-item">
              <Calendar size={16} className="calendar-icon" />
              <div className="deadline-info">
                <span className="deadline-title">Portfolio Review</span>
                <span className="deadline-date">Tomorrow, 10:00 AM</span>
              </div>
            </div>
            <div className="deadline-item">
              <Calendar size={16} className="calendar-icon" />
              <div className="deadline-info">
                <span className="deadline-title">Project Proposal Due</span>
                <span className="deadline-date">Fri, 5:00 PM</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Missing icon imports
const Eye = (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const Send = (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const MessageSquare = (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const ChevronRight = (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;