import { useEffect, useState } from "react";
import { api } from "../api";
import {
  handleLogError,
  getErrorMessage,
  formatEnum,
  formatDate,
} from "../lib/helpers";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

const emptyOffer = {
  title: "",
  description: "",
  requiredSkills: "",
  location: "",
  type: "ON_SITE",
  deadline: "",
};

const emptyFilters = { keyword: "", city: "", type: "", skill: "" };

// case-insensitive "text contains search"; an empty search matches everything
function contains(text, search) {
  return (text || "").toLowerCase().includes(search.trim().toLowerCase());
}

// the backend requires a deadline in the future, so the earliest is tomorrow
function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString("en-CA"); // local date as YYYY-MM-DD
}

function InternshipsPage() {
  const { user } = useAuth();
  const isStudent = user.role === "STUDENT";
  const isCompany = user.role === "COMPANY";

  const [offers, setOffers] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState(emptyFilters);

  // student: the offer currently being applied to
  const [applyOfferId, setApplyOfferId] = useState(null);
  const [motivationLetter, setMotivationLetter] = useState("");

  // company: create / edit form (editingId is null when creating)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyOffer);

  // increase this number to load the offers again (e.g. after a change)
  const [reloadCount, setReloadCount] = useState(0);

  // companies only see their own offers; students and admins see all
  useEffect(() => {
    async function loadOffers() {
      try {
        const response = isCompany
          ? await api.getMyInternships()
          : await api.getInternships();
        setOffers(response.data);
      } catch (error) {
        handleLogError(error);
        setError(getErrorMessage(error, "Could not load internships."));
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, [isCompany, reloadCount]);

  const reload = () => setReloadCount((count) => count + 1);

  useEffect(() => {
    api
      .getWorkTypes()
      .then((response) => setWorkTypes(response.data))
      .catch(handleLogError);
  }, []);

  const showResult = (successText, errorText) => {
    setMessage(successText || "");
    setError(errorText || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // students only see active offers; everyone can use the filters
  const visibleOffers = offers.filter(
    (offer) =>
      (!isStudent || offer.status === "ACTIVE") &&
      (contains(offer.title, filters.keyword) ||
        contains(offer.description, filters.keyword) ||
        contains(offer.companyName, filters.keyword)) &&
      contains(offer.location, filters.city) &&
      (!filters.type || offer.type === filters.type) &&
      contains(offer.requiredSkills, filters.skill),
  );

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---- student actions

  const handleApply = async (e, offer) => {
    e.preventDefault();
    try {
      await api.createApplication({
        internshipOfferId: offer.id,
        motivationLetter,
      });
      setApplyOfferId(null);
      setMotivationLetter("");
      showResult(
        `Applied to "${offer.title}". You can follow its status on the Applications page.`,
      );
    } catch (error) {
      handleLogError(error);
      showResult(null, getErrorMessage(error, "Could not apply."));
    }
  };

  // ---- company actions

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyOffer);
    setShowForm(true);
  };

  const startEdit = (offer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description || "",
      requiredSkills: offer.requiredSkills || "",
      location: offer.location || "",
      type: offer.type,
      deadline: offer.deadline || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyOffer);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateInternship(editingId, form);
        showResult(`Offer "${form.title}" updated.`);
      } else {
        await api.createInternship(form);
        showResult(`Offer "${form.title}" created.`);
      }
      closeForm();
      reload();
    } catch (error) {
      handleLogError(error);
      showResult(null, getErrorMessage(error, "Could not save offer."));
    }
  };

  const handleDelete = async (offer) => {
    if (!window.confirm(`Delete the offer "${offer.title}"?`)) {
      return;
    }
    try {
      await api.deleteInternship(offer.id);
      showResult(`Offer "${offer.title}" deleted.`);
      reload();
    } catch (error) {
      handleLogError(error);
      showResult(null, getErrorMessage(error, "Could not delete offer."));
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{isCompany ? "My internship offers" : "Internship offers"}</h1>
          <p className="page-subtitle">
            {isStudent && "Find an internship that fits you and apply with a short motivation letter."}
            {isCompany && "Create and manage the internships your company offers."}
            {!isStudent && !isCompany && "All internship offers published on the platform."}
          </p>
        </div>
        {isCompany && !showForm && <button onClick={startCreate}>New offer</button>}
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {isCompany && showForm && (
        <section className="card">
          <h2>{editingId ? "Edit offer" : "New offer"}</h2>
          <form className="form" onSubmit={handleSave}>
            <label>
              Title
              <input name="title" value={form.title} onChange={handleFormChange} required />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Required skills (comma separated)
              <input
                name="requiredSkills"
                placeholder="Java, Spring, SQL"
                value={form.requiredSkills}
                onChange={handleFormChange}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Work type
                <select name="type" value={form.type} onChange={handleFormChange}>
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
                  name="deadline"
                  min={tomorrow()}
                  value={form.deadline}
                  onChange={handleFormChange}
                  required
                />
              </label>
            </div>
            <div className="form-buttons">
              <button type="submit">{editingId ? "Save changes" : "Create offer"}</button>
              <button type="button" className="btn-secondary" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {!isCompany && (
        <div className="toolbar">
          <input
            type="search"
            name="keyword"
            placeholder="Search by title, company or description"
            value={filters.keyword}
            onChange={handleFilterChange}
          />
          <input
            name="city"
            placeholder="City"
            value={filters.city}
            onChange={handleFilterChange}
          />
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">Any work type</option>
            {workTypes.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
          <input
            name="skill"
            placeholder="Skill, e.g. Java"
            value={filters.skill}
            onChange={handleFilterChange}
          />
          <button className="btn-text" onClick={() => setFilters(emptyFilters)}>
            Clear filters
          </button>
        </div>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : visibleOffers.length === 0 ? (
        <p className="empty">
          {offers.length === 0 ? "No internship offers yet." : "No offers match your filters."}
        </p>
      ) : (
        <>
          <p className="result-count">
            {visibleOffers.length} {visibleOffers.length === 1 ? "offer" : "offers"}
          </p>
          <div className="offer-grid">
            {visibleOffers.map((offer) => (
              <article className="offer-card" key={offer.id}>
                <div className="offer-head">
                  <div>
                    <h3>{offer.title}</h3>
                    <div className="offer-company">
                      {offer.companyName} · {offer.location}
                    </div>
                  </div>
                  {/* students only see active offers, so the badge is only useful for the others */}
                  {!isStudent && <StatusBadge value={offer.status} />}
                </div>

                {offer.description && (
                  <p className="offer-description">{offer.description}</p>
                )}

                {offer.requiredSkills && (
                  <div className="chips">
                    {offer.requiredSkills.split(",").map((skill) => (
                      <span className="chip" key={skill}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {isStudent && applyOfferId === offer.id ? (
                  <form className="form apply-form" onSubmit={(e) => handleApply(e, offer)}>
                    <label>
                      Motivation letter
                      <textarea
                        rows="4"
                        placeholder="Why are you a good fit for this internship?"
                        value={motivationLetter}
                        onChange={(e) => setMotivationLetter(e.target.value)}
                        required
                        autoFocus
                      />
                    </label>
                    <div className="form-buttons">
                      <button type="submit">Send application</button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setApplyOfferId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="offer-footer">
                    <span className="offer-meta">
                      {formatEnum(offer.type)} · Apply by {formatDate(offer.deadline)}
                    </span>
                    {isStudent && (
                      <button
                        className="btn-small"
                        onClick={() => {
                          setApplyOfferId(offer.id);
                          setMotivationLetter("");
                        }}
                      >
                        Apply
                      </button>
                    )}
                    {isCompany && (
                      <div className="form-buttons">
                        <button className="btn-small btn-secondary" onClick={() => startEdit(offer)}>
                          Edit
                        </button>
                        <button className="btn-small btn-danger" onClick={() => handleDelete(offer)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default InternshipsPage;
