import React, { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const value = useMemo(
    () => ({
      token,
      setToken: (newToken) => {
        setToken(newToken || "");
        if (newToken) localStorage.setItem("token", newToken);
        else localStorage.removeItem("token");
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
