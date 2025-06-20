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
    // Simple mock login without API calls
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split("@")[0],
      role: role as User["role"],
    };

    setUser(mockUser);
    localStorage.setItem("simple_user", JSON.stringify(mockUser));
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
