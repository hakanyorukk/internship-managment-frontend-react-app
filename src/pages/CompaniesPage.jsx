import { useEffect, useState } from "react";
import { api } from "../api";
import { handleLogError, getErrorMessage } from "../lib/helpers";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

const emptyCompany = {
  name: "",
  description: "",
  website: "",
  city: "",
  contactEmail: "",
};

function CompaniesPage() {
  const { user } = useAuth();
  const isAdmin = user.role === "ADMIN";
  const isCompany = user.role === "COMPANY";

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyCompany);
  // increase this number to load the list again (e.g. after a change)
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await api.getCompanies();
        setCompanies(response.data);
      } catch (error) {
        handleLogError(error);
        setError(getErrorMessage(error, "Could not load companies."));
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, [reloadCount]);

  const reload = () => setReloadCount((count) => count + 1);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // COMPANY: register the company profile for the logged-in user
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.createCompany(form);
      setMessage(
        `Company "${form.name}" registered. An admin must approve it before you can post offers.`,
      );
      setForm(emptyCompany);
      reload();
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not register company."));
    }
  };

  // ADMIN: accept or reject a company registration
  const handleRegistration = async (company, status) => {
    setError("");
    setMessage("");
    try {
      await api.updateCompanyRegistration(company.id, status);
      setMessage(`Company "${company.name}" is now ${status.toLowerCase()}.`);
      reload();
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not update company."));
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Companies</h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Approve new companies so they can start publishing offers."
              : "Companies that offer internships on the platform."}
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {isCompany && (
        <section className="card">
          <h2>Register your company</h2>
          <p className="muted card-intro">
            You need an approved company profile before you can publish
            internship offers.
          </p>
          <form className="form" onSubmit={handleCreate}>
            <div className="form-row">
              <label>
                Name
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                City
                <input name="city" value={form.city} onChange={handleChange} required />
              </label>
            </div>
            <div className="form-row">
              <label>
                Website
                <input
                  name="website"
                  placeholder="www.example.com"
                  value={form.website}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Contact email
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />
            </label>
            <div>
              <button type="submit">Register company</button>
            </div>
          </form>
        </section>
      )}

      {isCompany && <h2>All companies</h2>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : companies.length === 0 ? (
        <p className="empty">No companies yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Website</th>
                <th>Contact email</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <strong>{company.name}</strong>
                    {company.description && (
                      <div className="muted small">{company.description}</div>
                    )}
                  </td>
                  <td>{company.city}</td>
                  <td>{company.website}</td>
                  <td>{company.contactEmail}</td>
                  <td>
                    <StatusBadge value={company.registrationStatus} />
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="actions">
                        {company.registrationStatus !== "ACCEPTED" && (
                          <button
                            className="btn-small"
                            onClick={() => handleRegistration(company, "ACCEPTED")}
                          >
                            Accept
                          </button>
                        )}
                        {company.registrationStatus !== "REJECTED" && (
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleRegistration(company, "REJECTED")}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CompaniesPage;
