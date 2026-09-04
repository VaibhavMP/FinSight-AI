import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/App";

const sidebarItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "AI Analyst", path: "/chat", icon: MessageSquare },
  { name: "Documents", path: "/documents", icon: FileText },
  { name: "Companies", path: "/compare", icon: Users },
  { name: "Financial Insights", path: "/insights", icon: BarChart3 },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-gradient-to-b from-[#0f172a]/90 via-[#111827]/90 to-[#0a0f1b]/90 border-r border-cyan-400/20 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-400/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex-shrink-0 animate-pulse">
              <div className="w-full h-full rounded-full bg-cyan-400/30" />
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              FinSight AI
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-cyan-400/60 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-cyan-400/10 text-cyan-300 border border-cyan-400/30"
                  : "text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/5"
              }`}
              title={item.name}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-cyan-300" : ""}`} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Recent conversations placeholder */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-cyan-400/10">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Recent
          </div>
          <div className="space-y-1 text-sm text-gray-400">
            <div className="truncate">Revenue analysis</div>
            <div className="truncate">Risk assessment</div>
          </div>
        </div>
      )}

      {/* User / Logout */}
      <div className="p-4 border-t border-cyan-400/10">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
          title="Logout"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
