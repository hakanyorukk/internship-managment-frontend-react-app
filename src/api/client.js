import axios from "axios";

// Single axios instance for the whole app. All api modules import this so the
// auth-token interceptor is defined in exactly one place.
const client = axios.create({
  baseURL: "/api",
  // Tells Spring Security this is an AJAX call, so a 401 does not make the
  // browser show its own Basic-auth login popup.
  headers: { "X-Requested-With": "XMLHttpRequest" },
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

// 401 = token expired or backend restarted (it creates a new signing key on
// every start). Forget the stored user and send them back to the login page.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && error.config.url === "/auth/login";
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default client;
