import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { getUserFromStorage, setAuthToken, setUserInStorage } from "@/services/api";
import { User } from "@/types";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Dashboard from "@/pages/Dashboard";
import DocumentLibrary from "@/pages/DocumentLibrary";
import ChatPage from "@/pages/ChatPage";
import ComparePage from "@/pages/ComparePage";
import Insights from "@/pages/Insights";
import SettingsPage from "@/pages/Settings";
import MainLayout from "@/layouts/MainLayout";

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const RequireAuth: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUserFromStorage());

  useEffect(() => {
    const stored = getUserFromStorage();
    if (stored) {
      setUser(stored);
      setAuthToken(localStorage.getItem("token"));
    }
  }, []);

  const login = (u: User, token: string) => {
    setUser(u);
    setUserInStorage(u);
    setAuthToken(token);
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<DocumentLibrary />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
