import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "../lib/api";
import {
  clearAuthSession,
  getAccessToken,
  getStoredAuthUser,
  saveAuthSession,
  type AuthUser,
} from "../lib/auth";

type AuthContextValue = {
  authUser: AuthUser | null;
  isAuthReady: boolean;
  setSession: (input: {
    accessToken: string;
    user: { id: string; name: string; email: string }
  }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [isAuthReady, setIsAuthReady] = useState(false);

  const setSession = useCallback((input: { accessToken: string; user: AuthUser }) => {
    saveAuthSession(input);
    setAuthUser(input.user);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthUser(null);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();

      if (!token) {
        clearAuthSession();
        setAuthUser(null);
        setIsAuthReady(true);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          clearAuthSession();
          setAuthUser(null);
          setIsAuthReady(true);
          return;
        }

        const data = (await response.json()) as {
          user: AuthUser;
        };

        saveAuthSession({
          accessToken: token,
          user: data.user,
        });

        setAuthUser(data.user);
      } catch {
        clearAuthSession();
        setAuthUser(null);
      } finally {
        setIsAuthReady(true);
      }
    };

    void restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      authUser,
      isAuthReady,
      setSession,
      logout,
    }),
    [authUser, isAuthReady, logout, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
