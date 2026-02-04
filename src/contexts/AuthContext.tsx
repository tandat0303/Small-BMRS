import { createContext, useContext, useEffect, useState } from "react";
import type { User, AuthContextType } from "@/types";
import storage from "@/lib/storage";
import useInactivityLogout from "@/hooks/useInactivityLogout";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const forceLogout = () => {
    setToken(null);
    setUser(null);
    storage.remove("accessToken");
    storage.remove("user");
  };

  useEffect(() => {
    const storedUser = storage.get("user", null as any);
    const storedToken = storage.get("accessToken", "");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      forceLogout();
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      const storedToken = storage.get("accessToken", "");
      const storedUser = storage.get("user", null as any);

      if (!storedToken || !storedUser) {
        forceLogout();
      }
    };

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  const login = (newUser: User, newToken: string) => {
    setToken(newToken);
    setUser(newUser);

    storage.set("accessToken", newToken);
    storage.set("user", newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    storage.clear();
  };

  useInactivityLogout({ isAuthenticated, logout });

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: token,
        isAuthenticated: isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
