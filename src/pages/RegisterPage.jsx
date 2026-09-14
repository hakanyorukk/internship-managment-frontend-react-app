import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { handleLogError, getErrorMessage } from "../lib/helpers";

function RegisterPage() {
  const Auth = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await api.getRoles();
        setRoles(response.data);
      } catch (error) {
        handleLogError(error);
      }
    }
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(firstName && lastName && email && password)) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await api.register({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      navigate("/login", { state: { registered: true } });
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Registration failed."));
    }
  };

  if (Auth.userIsAuthenticated()) {
    return <Navigate to="/" />;
  }

  return (
    <div className="page auth-page">
      <form className="form card" onSubmit={handleSubmit}>
        <div>
          <h1>Create an account</h1>
          <p className="muted">Students apply for internships, companies publish offers.</p>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <label>
            First name
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
            />
          </label>
          <label>
            Last name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
        </div>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Create account</button>
        <p className="muted small auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
