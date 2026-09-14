import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { parseJwt, handleLogError } from "../lib/helpers";

function LoginPage() {
  const Auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state && location.state.registered;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(email && password)) {
      setError("Please fill in email and password.");
      return;
    }

    try {
      const response = await api.login(email, password);
      const token = response.data; // backend returns the raw JWT string

      const claims = parseJwt(token);
      Auth.userLogin({
        email: (claims && claims.sub) || email,
        role: claims && claims.role,
        token,
        exp: claims && claims.exp,
      });
      navigate("/");
    } catch (error) {
      handleLogError(error);
      setError("Login failed. Check your email and password.");
    }
  };

  if (Auth.userIsAuthenticated()) {
    return <Navigate to="/" />;
  }

  return (
    <div className="page auth-page">
      <form className="form card" onSubmit={handleSubmit}>
        <div>
          <h1>Log in</h1>
          <p className="muted">Use the email and password you registered with.</p>
        </div>
        {justRegistered && !error && (
          <p className="success">Account created. You can log in now.</p>
        )}
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Log in</button>
        <p className="muted small auth-switch">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
