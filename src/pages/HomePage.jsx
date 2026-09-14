import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
