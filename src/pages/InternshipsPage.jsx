import { useEffect, useState } from "react";
import { api } from "../api";
import { handleLogError, getErrorMessage } from "../lib/helpers";
import { useAuth } from "../context/AuthContext";

function InternshipsPage() {
  const [offers, setOffers] = useState([]);
  const [companyIdFilter, setCompanyIdFilter] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // apply form (shown when the user clicks "Apply" on an offer)
  const [applyOffer, setApplyOffer] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [motivationLetter, setMotivationLetter] = useState("");

  // applications of one offer (shown when the user clicks "Applications")
  const [applicationsOffer, setApplicationsOffer] = useState(null);
  const [offerApplications, setOfferApplications] = useState([]);

  // create offer form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("ON_SITE");
  const [deadline, setDeadline] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [workTypes, setWorkTypes] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";
  const isCompany = user?.role === "COMPANY";

  const loadOffers = async (filterCompanyId) => {
    try {
      const response = await api.getInternships(filterCompanyId);
      setOffers(response.data);
      setError("");
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not load internships."));
    }
  };

  useEffect(() => {
    async function fetchOffers() {
      try {
        const response = await api.getInternships();
        setOffers(response.data);
      } catch (error) {
        handleLogError(error);
        setError(getErrorMessage(error, "Could not load internships."));
      }
    }
    fetchOffers();
  }, []);

  useEffect(() => {
    async function fetchWorkTypes() {
      try {
        const response = await api.getWorkTypes();
        setWorkTypes(response.data);
      } catch (error) {
        handleLogError(error);
      }
    }
    fetchWorkTypes();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadOffers(companyIdFilter || undefined);
  };

  const handleDelete = async (offer) => {
    setError("");
    setMessage("");
    try {
      await api.deleteInternship(offer.id);
      setMessage(`Offer "${offer.title}" deleted.`);
      loadOffers(companyIdFilter || undefined);
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not delete offer."));
    }
  };

  const handleShowApplications = async (offer) => {
    setError("");
    setApplyOffer(null);
    try {
      const response = await api.getOfferApplications(offer.id);
      setApplicationsOffer(offer);
      setOfferApplications(response.data);
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not load applications."));
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!studentId) {
      setError("Student profile id is required to apply.");
      return;
    }

    try {
      await api.createApplication({
        studentId: Number(studentId),
        internshipOfferId: applyOffer.id,
        motivationLetter,
      });
      setMessage(`Applied to "${applyOffer.title}".`);
      setApplyOffer(null);
      setStudentId("");
      setMotivationLetter("");
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not apply."));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!(title && companyId)) {
      setError("Title and company id are required.");
      return;
    }

    try {
      await api.createInternship({
        title,
        description,
        requiredSkills,
        location,
        type,
        deadline: deadline || null,
        companyId: Number(companyId),
      });
      setMessage(`Offer "${title}" created.`);
      setTitle("");
      setDescription("");
      setRequiredSkills("");
      setLocation("");
      setType("ON_SITE");
      setDeadline("");
      setCompanyId("");
      loadOffers(companyIdFilter || undefined);
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not create offer."));
    }
  };

  return (
    <div className="page">
      <h1>Internships</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form className="form-inline" onSubmit={handleFilter}>
        <label>
          Filter by company id
          <input
            type="number"
            value={companyIdFilter}
            onChange={(e) => setCompanyIdFilter(e.target.value)}
          />
        </label>
        <button type="submit">Load</button>
        <button
          type="button"
          onClick={() => {
            setCompanyIdFilter("");
            loadOffers();
          }}
        >
          Clear
        </button>
      </form>

      <h2>All offers</h2>
      {offers.length === 0 ? (
        <p>No internship offers yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Type</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Required skills</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.id}</td>
                <td>{offer.title}</td>
                <td>
                  {offer.companyName} (#{offer.companyId})
                </td>
                <td>{offer.location}</td>
                <td>{offer.type}</td>
                <td>{offer.deadline}</td>
                <td>{offer.status}</td>
                <td>{offer.requiredSkills}</td>
                <td className="actions">
                  {isStudent && (
                    <>
                      <button
                        onClick={() => {
                          setApplicationsOffer(null);
                          setApplyOffer(offer);
                        }}
                      >
                        Apply
                      </button>
                    </>
                  )}

                  {isCompany && (
                    <>
                      <button onClick={() => handleDelete(offer)}>
                        Delete
                      </button>
                      <button onClick={() => handleShowApplications(offer)}>
                        Applications
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {applyOffer && (
        <>
          <h2>
            Apply to &quot;{applyOffer.title}&quot; (offer #{applyOffer.id})
          </h2>
          <form className="form" onSubmit={handleApply}>
            <label>
              Student profile id
              <input
                type="number"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </label>
            <label>
              Motivation letter
              <textarea
                rows="4"
                value={motivationLetter}
                onChange={(e) => setMotivationLetter(e.target.value)}
              />
            </label>
            <div className="form-buttons">
              <button type="submit">Submit application</button>
              <button type="button" onClick={() => setApplyOffer(null)}>
                Cancel
              </button>
            </div>
          </form>
        </>
      )}

      {applicationsOffer && (
        <>
          <h2>
            Applications for &quot;{applicationsOffer.title}&quot; (offer #
            {applicationsOffer.id})
          </h2>
          {offerApplications.length === 0 ? (
            <p>No applications for this offer.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Student id</th>
                  <th>Faculty number</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Motivation letter</th>
                </tr>
              </thead>
              <tbody>
                {offerApplications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.id}</td>
                    <td>{application.studentId}</td>
                    <td>{application.studentFacultyNumber}</td>
                    <td>{application.applicationDate}</td>
                    <td>{application.status}</td>
                    <td>{application.motivationLetter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button onClick={() => setApplicationsOffer(null)}>Close</button>
        </>
      )}
      {isAdmin && (
        <>
          <h2>Create offer</h2>
          <form className="form" onSubmit={handleCreate}>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              Description
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              Required skills
              <input
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
              />
            </label>
            <label>
              Location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
            <label>
              Work type
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {workTypes.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Deadline
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </label>
            <label>
              Company id
              <input
                type="number"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              />
            </label>
            <button type="submit">Create</button>
          </form>
        </>
      )}
    </div>
  );
}

export default InternshipsPage;
