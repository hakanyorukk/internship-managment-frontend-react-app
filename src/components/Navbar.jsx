import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatEnum } from "../lib/helpers";

function Navbar() {
  const { user, userIsAuthenticated, userLogout } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    userLogout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          SIT Internships
        </NavLink>
        {userIsAuthenticated() ? (
          <>
            <nav className="nav-links">
              <NavLink to="/internships">Internships</NavLink>
              <NavLink to="/applications">Applications</NavLink>
              <NavLink to="/companies">Companies</NavLink>
              {user.role === "STUDENT" && <NavLink to="/profile">My profile</NavLink>}
            </nav>
            <div className="nav-user">
              <div className="user-info">
                <span className="user-email">{user.email}</span>
                <span className="user-role">{formatEnum(user.role)}</span>
              </div>
              <button className="btn-small btn-secondary" onClick={logout}>
                Log out
              </button>
            </div>
          </>
        ) : (
          <div className="nav-user">
            <NavLink to="/login" className="btn-small btn-link btn-secondary">
              Log in
            </NavLink>
            <NavLink to="/register" className="btn-small btn-link">
              Register
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
