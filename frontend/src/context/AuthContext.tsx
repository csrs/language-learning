import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../api/generated/endpoints/auth/auth";
import { type User } from "../api/generated/types";
import { getCurrentUser } from "../api/generated/endpoints/me/me";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await getCurrentUser();
        if (response.status === 200) setUser(response.data);
      } catch {
        // Not logged in. Don't throw any error, this is perfectly fine if no user is logged in
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await loginUser({ username, password });
    if (response.status === 200) {
      setUser(response.data);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    await registerUser({ username, email, password });
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Wrap your component with <AuthProvider>.",
    );
  }

  return context;
};
