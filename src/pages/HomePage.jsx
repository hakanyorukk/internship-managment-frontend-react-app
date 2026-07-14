import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user, userIsAuthenticated } = useAuth();

  return (
    <div className="page narrow">
      <h1>SIT Internship Management</h1>
      {userIsAuthenticated() ? (
        <>
          <p>
            Logged in as <strong>{user && user.email}</strong>
          </p>
          <ul>
            <li>
              <Link to="/companies">Companies</Link> browse and create companies
            </li>
            <li>
              <Link to="/internships">Internships</Link> browse offers, create
              offers, apply
            </li>
            <li>
              <Link to="/applications">Applications</Link> view applications and
              update their status
            </li>
          </ul>
        </>
      ) : (
        <p>
          Please <Link to="/login">login</Link> or{" "}
          <Link to="/register">register</Link> to continue.
        </p>
      )}
    </div>
  );
}

export default HomePage;
