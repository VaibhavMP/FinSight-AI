import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import NightSkyBackground from "@/components/NightSkyBackground";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-[#0a0f1b] flex">
      <NightSkyBackground />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
