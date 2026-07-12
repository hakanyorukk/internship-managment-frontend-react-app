import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function readStoredUser() {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const userIsAuthenticated = () => {
    const storedUser = readStoredUser();
    if (!storedUser) {
      return false;
    }
    // token expired
    if (storedUser.exp && Date.now() > storedUser.exp * 1000) {
      return false;
    }
    return true;
  };

  const userLogin = (loggedInUser) => {
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const userLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const contextValue = { user, userIsAuthenticated, userLogin, userLogout };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
