import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { login as loginApi } from "../api/login";
import { logout as logoutApi } from "../api/logout";
import { getCurrentUser } from "../api/getCurrentUser";
import { type User } from "../types/auth.types";
import { registerUser } from "../api/generated/endpoints/auth/auth";

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
        const me = await getCurrentUser();
        setUser(me);
      } catch {
        // Not logged in. Don't throw any error, this is perfectly fine if no user is logged in
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const user = await loginApi(username, password);
    setUser(user);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    // await registerApi(username, email, password);
    await registerUser({ username, email, password });
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
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
