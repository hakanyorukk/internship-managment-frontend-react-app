import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api";
import { handleLogError, getErrorMessage } from "../lib/helpers";
import { useAuth } from "../context/AuthContext";

// STUDENT only: view and edit the student profile that the backend
// creates automatically at registration.
function ProfilePage() {
  const { user } = useAuth();
  const isStudent = user.role === "STUDENT";

  const [form, setForm] = useState({
    facultyNumber: "",
    specialty: "",
    course: "",
    skills: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isStudent) {
      return;
    }
    api
      .getMyProfile()
      .then((response) => {
        const profile = response.data;
        setForm({
          facultyNumber: profile.facultyNumber || "",
          specialty: profile.specialty || "",
          course: profile.course || "",
          skills: profile.skills || "",
        });
      })
      .catch((error) => {
        handleLogError(error);
        setError(getErrorMessage(error, "Could not load your profile."));
      })
      .finally(() => setLoading(false));
  }, [isStudent]);

  if (!isStudent) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.updateMyProfile({
        ...form,
        course: form.course === "" ? null : Number(form.course),
      });
      setMessage("Profile saved.");
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not save your profile."));
    }
  };

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <h1>My profile</h1>
          <p className="page-subtitle">
            Companies see your faculty number when you apply, so keep it up to date.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <form className="form card" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={user.email} disabled />
          </label>
          <div className="form-row">
            <label>
              Faculty number
              <input
                name="facultyNumber"
                value={form.facultyNumber}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Course (year)
              <input
                type="number"
                name="course"
                min="1"
                max="6"
                value={form.course}
                onChange={handleChange}
              />
            </label>
          </div>
          <label>
            Specialty
            <input
              name="specialty"
              placeholder="Software and Internet Technologies"
              value={form.specialty}
              onChange={handleChange}
            />
          </label>
          <label>
            Skills (comma separated)
            <textarea
              name="skills"
              rows="3"
              placeholder="Java, React, SQL"
              value={form.skills}
              onChange={handleChange}
            />
          </label>
          <div>
            <button type="submit">Save profile</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
