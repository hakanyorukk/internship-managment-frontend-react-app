import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { handleLogError, getErrorMessage } from "../lib/helpers";

// quick links for each role on the home page
const roleLinks = {
  STUDENT: [
    { to: "/internships", title: "Browse internships", text: "Search offers by keyword, city, work type or skill." },
    { to: "/applications", title: "My applications", text: "See the status and the company's comment." },
    { to: "/profile", title: "My profile", text: "Keep your faculty number, specialty and skills up to date." },
  ],
  COMPANY: [
    { to: "/internships", title: "My offers", text: "Create, edit and delete your internship offers." },
    { to: "/applications", title: "Applications", text: "Review candidates and change their status." },
    { to: "/companies", title: "Company profile", text: "Register your company. An admin has to approve it." },
  ],
  ADMIN: [
    { to: "/companies", title: "Companies", text: "Accept or reject company registrations." },
    { to: "/internships", title: "Internship offers", text: "See every offer on the platform." },
    { to: "/applications", title: "Applications", text: "Overview of all applications and their status." },
  ],
};

const steps = [
  { title: "A company publishes an offer", text: "After an administrator approves the company profile." },
  { title: "A student applies", text: "With a short motivation letter, once per offer." },
  { title: "The company reviews it", text: "The student sees the new status and comment right away." },
];

// ADMIN: numbers from GET /api/admin/statistics
function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getStatistics()
      .then((response) => setStats(response.data))
      .catch((error) => {
        handleLogError(error);
        setError(getErrorMessage(error, "Could not load statistics."));
      });
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!stats) {
    return <p className="muted">Loading statistics…</p>;
  }

  const skills = Object.entries(stats.topSkills);

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card">
          <span>Active offers</span>
          <strong>{stats.totalActiveOffers}</strong>
        </div>
        <div className="stat-card">
          <span>Applications</span>
          <strong>{stats.totalApplications}</strong>
        </div>
        <div className="stat-card">
          <span>Approved applications</span>
          <strong>{stats.approvedApplications}</strong>
        </div>
      </div>
      <div className="card">
        <h2>Most requested skills</h2>
        {skills.length === 0 ? (
          <p className="muted">No offers yet.</p>
        ) : (
          <div className="chips">
            {skills.map(([skill, count]) => (
              <span className="chip" key={skill}>
                {skill} · {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function HomePage() {
  const { user, userIsAuthenticated } = useAuth();

  if (!userIsAuthenticated()) {
    return (
      <div className="page">
        <section className="intro">
          <div className="intro-text">
            <h1>Internship management for SIT students</h1>
            <p>
              One place where companies publish internship offers, students
              apply and companies review the applications.
            </p>
            <div className="form-buttons">
              <Link to="/register" className="btn-link">
                Create an account
              </Link>
              <Link to="/login" className="btn-link btn-secondary">
                Log in
              </Link>
            </div>
          </div>

          <ol className="steps">
            {steps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back</h1>
          <p className="page-subtitle">You are logged in as {user.email}.</p>
        </div>
      </div>
      {user.role === "ADMIN" && <AdminStatistics />}
      <div className="link-grid">
        {(roleLinks[user.role] || []).map((link) => (
          <Link to={link.to} className="link-card" key={link.to}>
            <strong>{link.title}</strong>
            <span>{link.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
