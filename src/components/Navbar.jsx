import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, userIsAuthenticated, userLogout } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    userLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <span className="brand">SIT Internships</span>
      <NavLink to="/">Home</NavLink>
      {userIsAuthenticated() ? (
        <>
          <NavLink to="/companies">Companies</NavLink>
          <NavLink to="/internships">Internships</NavLink>
          <NavLink to="/applications">Applications</NavLink>
          <span className="spacer" />
          <span className="user-email">{user && user.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <span className="spacer" />
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      )}
    </nav>
  );
}

export default Navbar;
