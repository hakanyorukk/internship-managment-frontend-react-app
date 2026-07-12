import axios from "axios";

// Single axios instance for the whole app. All api modules import this so the
// auth-token interceptor is defined in exactly one place.
const client = axios.create({
  baseURL: "/api",
});

// Attach the JWT token to every request if the user is logged in
client.interceptors.request.use((config) => {
  const stored = localStorage.getItem("user");
  if (stored) {
    const user = JSON.parse(stored);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

export default client;
