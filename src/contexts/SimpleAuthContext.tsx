import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "shopkeeper" | "developer";
}

interface SimpleAuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(
  undefined,
);

export const SimpleAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }

      const user = data.data.user;
      setUser(user);
      localStorage.setItem("simple_user", JSON.stringify(user));
      localStorage.setItem("auth_token", data.data.token);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed. Please check your credentials.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("simple_user");
  };

  const isAuthenticated = !!user;

  return (
    <SimpleAuthContext.Provider
      value={{ user, login, logout, isAuthenticated }}
    >
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  return context;
};
