import client from "./client";

export const api = {
  // -- auth
  login: (email, password) => client.post("/auth/login", { email, password }),
  register: (user) => client.post("/auth/register", user),

  // -- companies
  getCompanies: () => client.get("/companies"),
  createCompany: (company) => client.post("/companies", company),
  updateCompanyRegistration: (id, status) =>
    client.patch(`/companies/${id}/registration`, null, { params: { status } }),

  // -- internships
  getInternships: () => client.get("/internships"),
  getMyInternships: () => client.get("/internships/my"),
  createInternship: (offer) => client.post("/internships", offer),
  updateInternship: (id, offer) => client.put(`/internships/${id}`, offer),
  deleteInternship: (id) => client.delete(`/internships/${id}`),
  getOfferApplications: (id) => client.get(`/internships/${id}/applications`),

  // -- applications
  getApplications: () => client.get("/applications"),
  getMyApplications: () => client.get("/applications/my"),
  createApplication: (application) => client.post("/applications", application),
  updateApplicationStatus: (id, statusUpdate) =>
    client.patch(`/applications/${id}/status`, statusUpdate),

  // -- student profile
  getMyProfile: () => client.get("/students/me"),
  updateMyProfile: (profile) => client.put("/students/me", profile),

  // -- admin
  getStatistics: () => client.get("/admin/statistics"),

  // -- enums (each returns [{ value, label }])
  getWorkTypes: () => client.get("/enums/work-types"),
  getRoles: () => client.get("/enums/roles"),
  getApplicationStatuses: () => client.get("/enums/application-statuses"),
};
