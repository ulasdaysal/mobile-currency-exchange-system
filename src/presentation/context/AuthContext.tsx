import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { User } from "../../domain/entities/User";
import { authRepository } from "../../data/repositories/AuthRepository";
import { apiClient } from "../../data/api/ApiClient";
import { AppError } from "../../domain/errors/AppError";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const token = await authRepository.getStoredToken();
      if (token) {
        apiClient.setToken(token);
        const storedUser = await authRepository.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      }
    } catch {
      await authRepository.clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loggedInUser = await authRepository.login({ email, password });
      setUser(loggedInUser);
      setIsAuthenticated(true);
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : "Login failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newUser = await authRepository.register({ name, email, password });
      setUser(newUser);
      setIsAuthenticated(true);
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : "Registration failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authRepository.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authRepository.forgotPassword(email);
      return response;
    } catch (err) {
      const message =
        err instanceof AppError ? err.message : "Failed to send reset link.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authRepository.resetPassword(token, newPassword);
    } catch (err) {
      const message =
        err instanceof AppError ? err.message : "Failed to reset password.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        clearError,
      }}
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
