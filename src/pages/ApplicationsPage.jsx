import { useEffect, useState } from "react";
import { api } from "../api";
import { handleLogError, getErrorMessage, formatDate } from "../lib/helpers";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

// the backend only sends the student's id and faculty number (no name)
function studentLabel(application) {
  return application.studentFacultyNumber || `Student #${application.studentId}`;
}

function MotivationLetter({ text }) {
  if (!text) {
    return null;
  }
  return (
    <details>
      <summary>Read letter</summary>
      <p className="letter">{text}</p>
    </details>
  );
}

// COMPANY: one row with a status dropdown + comment to review the application
function ApplicationRow({ application, statuses, onStatusUpdated, onError }) {
  const [status, setStatus] = useState(application.status);
  const [comment, setComment] = useState(application.comment || "");

  const handleUpdate = async () => {
    try {
      const response = await api.updateApplicationStatus(application.id, {
        status,
        comment,
      });
      onStatusUpdated(response.data);
    } catch (error) {
      handleLogError(error);
      onError(getErrorMessage(error, "Could not update status."));
    }
  };

  return (
    <tr>
      <td>{application.internshipOfferTitle}</td>
      <td>{studentLabel(application)}</td>
      <td className="nowrap">{formatDate(application.applicationDate)}</td>
      <td>
        <MotivationLetter text={application.motivationLetter} />
      </td>
      <td>
        <StatusBadge value={application.status} />
      </td>
      <td>
        <div className="actions">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn-small" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </td>
    </tr>
  );
}

function ApplicationsPage() {
  const { user } = useAuth();
  const role = user.role;

  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // each role has its own endpoint:
  //   STUDENT -> own applications, ADMIN -> all applications,
  //   COMPANY -> applications of each of its own offers
  useEffect(() => {
    async function loadApplications() {
      try {
        if (role === "STUDENT") {
          const response = await api.getMyApplications();
          setApplications(response.data);
        } else if (role === "ADMIN") {
          const response = await api.getApplications();
          setApplications(response.data);
        } else {
          const offersResponse = await api.getMyInternships();
          const responses = await Promise.all(
            offersResponse.data.map((offer) => api.getOfferApplications(offer.id)),
          );
          setApplications(responses.flatMap((response) => response.data));
        }
      } catch (error) {
        handleLogError(error);
        setError(getErrorMessage(error, "Could not load applications."));
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, [role]);

  useEffect(() => {
    if (role !== "COMPANY") {
      return;
    }
    api
      .getApplicationStatuses()
      .then((response) => setStatuses(response.data))
      .catch(handleLogError);
  }, [role]);

  const handleStatusUpdated = (updated) => {
    setError("");
    setMessage(`Application for "${updated.internshipOfferTitle}" updated.`);
    setApplications((current) =>
      current.map((application) =>
        application.id === updated.id ? updated : application,
      ),
    );
  };

  const titles = {
    STUDENT: "My applications",
    COMPANY: "Applications to my offers",
    ADMIN: "All applications",
  };

  const subtitles = {
    STUDENT: "Follow the status of the internships you applied for.",
    COMPANY: "Review candidates, change the status and leave a comment for the student.",
    ADMIN: "Every application submitted on the platform.",
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{titles[role]}</h1>
          <p className="page-subtitle">{subtitles[role]}</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="empty">No applications yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Offer</th>
                {role !== "STUDENT" && <th>Student</th>}
                <th>Applied on</th>
                <th>Motivation letter</th>
                <th>Status</th>
                <th>{role === "COMPANY" ? "Review" : "Comment"}</th>
              </tr>
            </thead>
            <tbody>
              {role === "COMPANY"
                ? applications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      statuses={statuses}
                      onStatusUpdated={handleStatusUpdated}
                      onError={setError}
                    />
                  ))
                : applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.internshipOfferTitle}</td>
                      {role !== "STUDENT" && <td>{studentLabel(application)}</td>}
                      <td className="nowrap">{formatDate(application.applicationDate)}</td>
                      <td>
                        <MotivationLetter text={application.motivationLetter} />
                      </td>
                      <td>
                        <StatusBadge value={application.status} />
                      </td>
                      <td>{application.comment || <span className="muted">—</span>}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
