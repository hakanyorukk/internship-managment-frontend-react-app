import client from "./client";

export const api = {
  // -- auth
  login: (email, password) => client.post("/auth/login", { email, password }),
  register: (user) => client.post("/auth/register", user),

  // -- companies
  getCompanies: () => client.get("/companies"),
  createCompany: (company) => client.post("/companies", company),

  // -- internships
  getInternships: (companyId) =>
    client.get("/internships", { params: companyId ? { companyId } : {} }),
  createInternship: (offer) => client.post("/internships", offer),
  deleteInternship: (id) => client.delete(`/internships/${id}`),
  getOfferApplications: (id) => client.get(`/internships/${id}/applications`),

  // -- applications
  getApplications: () => client.get("/applications"),
  getMyApplications: (studentId) =>
    client.get("/applications/my", { params: { studentId } }),
  createApplication: (application) => client.post("/applications", application),
  updateApplicationStatus: (id, statusUpdate) =>
    client.patch(`/applications/${id}/status`, statusUpdate),

  // -- enums (each returns [{ value, label }])
  getWorkTypes: () => client.get("/enums/work-types"),
  getRoles: () => client.get("/enums/roles"),
  getApplicationStatuses: () => client.get("/enums/application-statuses"),
};
