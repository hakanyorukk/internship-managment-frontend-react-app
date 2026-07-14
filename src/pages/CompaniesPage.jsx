import { useEffect, useState } from "react";
import { api } from "../api";
import { handleLogError, getErrorMessage } from "../lib/helpers";
import { useAuth } from "../context/AuthContext";

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // create form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const loadCompanies = async () => {
    try {
      const response = await api.getCompanies();
      setCompanies(response.data);
      setError("");
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not load companies."));
    }
  };

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await api.getCompanies();
        setCompanies(response.data);
      } catch (error) {
        handleLogError(error);
        setError(getErrorMessage(error, "Could not load companies."));
      }
    }
    fetchCompanies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name) {
      setError("Company name is required.");
      return;
    }

    try {
      await api.createCompany({
        name,
        description,
        city,
        contactEmail,
      });
      setMessage(`Company "${name}" created.`);
      setName("");
      setDescription("");
      setCity("");
      setContactEmail("");
      loadCompanies();
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not create company."));
    }
  };

  return (
    <div className="page">
      <h1>Companies</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <h2>All companies</h2>
      {companies.length === 0 ? (
        <p>No companies yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>City</th>
              <th>Contact email</th>
              <th>Website</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr key={index}>
                <td>{company.name}</td>
                <td>{company.description}</td>
                <td>{company.city}</td>
                <td>{company.contactEmail}</td>
                <td>{company.website}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isAdmin && (
        <>
          <h2>Create company</h2>

          <form className="form" onSubmit={handleCreate}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Description
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              City
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
            <label>
              Contact email
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </label>
            <button type="submit">Create</button>
          </form>
        </>
      )}
    </div>
  );
}

export default CompaniesPage;
