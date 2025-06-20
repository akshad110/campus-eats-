import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    name: string,
    role: string
  ) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    const storedToken = localStorage.getItem("auth_token");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
  }, []);

  // Store to localStorage when updated
  const storeSession = (user: User, token: string) => {
    localStorage.setItem("user_data", JSON.stringify(user));
    localStorage.setItem("auth_token", token);
    setUser(user);
    setToken(token);
  };

  const login = async (email: string, password: string, role: string) => {
    const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Login failed");
    }

    storeSession(data.data.user, data.data.token);
    return data.data.user;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string
  ) => {
    const res = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Registration failed");
    }

    storeSession(data.data.user, data.data.token);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem("user_data");
    localStorage.removeItem("auth_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
