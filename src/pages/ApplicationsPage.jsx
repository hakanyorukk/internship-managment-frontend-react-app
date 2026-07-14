import { useEffect, useState } from "react";
import { api } from "../api";
import { handleLogError, getErrorMessage } from "../lib/helpers";
//import { useAuth } from "../context/AuthContext";

function ApplicationRow({ application, statuses, onStatusUpdated, onError }) {
  const [status, setStatus] = useState(application.status);
  const [comment, setComment] = useState(application.comment || "");
  //const { user } = useAuth();

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
      <td>{application.id}</td>
      <td>{application.studentId}</td>
      <td>{application.studentFacultyNumber}</td>
      <td>
        {application.internshipOfferTitle} (#{application.internshipOfferId})
      </td>
      <td>{application.applicationDate}</td>
      <td>{application.motivationLetter}</td>
      <td>{application.status}</td>
      <td className="actions">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleUpdate}>Update</button>
      </td>
    </tr>
  );
}

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [studentIdFilter, setStudentIdFilter] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAll = async () => {
    try {
      const response = await api.getApplications();
      setApplications(response.data);
      setError("");
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not load applications."));
    }
  };

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await api.getApplications();
        setApplications(response.data);
      } catch (error) {
        handleLogError(error);
        setError(getErrorMessage(error, "Could not load applications."));
      }
    }
    fetchApplications();
  }, []);

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const response = await api.getApplicationStatuses();
        setStatuses(response.data);
      } catch (error) {
        handleLogError(error);
      }
    }
    fetchStatuses();
  }, []);

  const handleFilter = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentIdFilter) {
      loadAll();
      return;
    }

    try {
      const response = await api.getMyApplications(studentIdFilter);
      setApplications(response.data);
    } catch (error) {
      handleLogError(error);
      setError(getErrorMessage(error, "Could not load applications."));
    }
  };

  const handleStatusUpdated = (updated) => {
    setMessage(`Application #${updated.id} updated to ${updated.status}.`);
    setApplications((current) =>
      current.map((application) =>
        application.id === updated.id ? updated : application,
      ),
    );
  };

  return (
    <div className="page">
      <h1>Applications</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form className="form-inline" onSubmit={handleFilter}>
        <label>
          Filter by student profile id
          <input
            type="number"
            value={studentIdFilter}
            onChange={(e) => setStudentIdFilter(e.target.value)}
          />
        </label>
        <button type="submit">Load</button>
        <button
          type="button"
          onClick={() => {
            setStudentIdFilter("");
            loadAll();
          }}
        >
          Clear
        </button>
      </form>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Student id</th>
              <th>Faculty number</th>
              <th>Offer</th>
              <th>Date</th>
              <th>Motivation letter</th>
              <th>Status</th>
              <th>Update status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                statuses={statuses}
                onStatusUpdated={handleStatusUpdated}
                onError={setError}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ApplicationsPage;
