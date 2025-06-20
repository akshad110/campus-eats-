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
  register: (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(
  undefined,
);

export const SimpleAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: string) => {
    // Always use demo mode for now since database is not available
    console.warn("🔄 Using demo mode (backend/database unavailable)");
    const demoUser: User = {
      id: `demo_${Date.now()}`,
      email,
      name: email.split("@")[0],
      role: role as User["role"],
    };
    setUser(demoUser);
    localStorage.setItem("simple_user", JSON.stringify(demoUser));
    localStorage.setItem("auth_token", `demo_token_${Date.now()}`);
    console.log("✅ Demo login successful:", demoUser.name);
    return;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        // Try to parse error response for database connection issues
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.includes("ECONNREFUSED")) {
            console.warn("Database connection failed, using demo registration");
            const demoUser: User = {
              id: `demo_${Date.now()}`,
              email,
              name,
              role: role as User["role"],
            };
            setUser(demoUser);
            localStorage.setItem("simple_user", JSON.stringify(demoUser));
            localStorage.setItem("auth_token", `demo_token_${Date.now()}`);
            return;
          }
        } catch (parseError) {
          // Continue to fallback if we can't parse the error
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        if (data.error && data.error.includes("ECONNREFUSED")) {
          console.warn("Database connection failed, using demo registration");
          const demoUser: User = {
            id: `demo_${Date.now()}`,
            email,
            name,
            role: role as User["role"],
          };
          setUser(demoUser);
          localStorage.setItem("simple_user", JSON.stringify(demoUser));
          localStorage.setItem("auth_token", `demo_token_${Date.now()}`);
          return;
        }
        throw new Error(data.error || "Registration failed");
      }

      const user = data.data.user;
      setUser(user);
      localStorage.setItem("simple_user", JSON.stringify(user));
      localStorage.setItem("auth_token", data.data.token);
    } catch (error) {
      console.error("Registration error:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.warn("🔄 Backend not available, switching to demo mode...");
        const demoUser: User = {
          id: `demo_${Date.now()}`,
          email,
          name,
          role: role as User["role"],
        };
        setUser(demoUser);
        localStorage.setItem("simple_user", JSON.stringify(demoUser));
        localStorage.setItem("auth_token", `demo_token_${Date.now()}`);
        console.log("✅ Demo registration successful:", demoUser.name);
        return; // Successfully handled with demo registration
      }
      // Only throw error if it's not a network issue that we can handle
      throw new Error("Registration failed. Please try again.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("simple_user");
    localStorage.removeItem("auth_token");
  };

  const isAuthenticated = !!user;

  return (
    <SimpleAuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated }}
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
