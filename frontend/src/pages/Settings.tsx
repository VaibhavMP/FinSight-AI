import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Bell, Shield } from "lucide-react";
import NightSkyBackground from "@/components/NightSkyBackground";
import { getUserFromStorage } from "@/services/api";

const Settings: React.FC = () => {
  const user = getUserFromStorage();

  return (
    <div className="relative min-h-screen bg-[#0a0f1b] text-white">
      <NightSkyBackground />

      <div className="relative z-10 p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
            Settings
          </h1>
          <p className="text-gray-400 mt-1">Manage your account and preferences</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ""}
                  className="w-full px-3 py-2 bg-[#1a2030]/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  className="w-full px-3 py-2 bg-[#1a2030]/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-[#1a2030]/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-[#1a2030]/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-[#1a2030]/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm">
                Update Password
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Email notifications</span>
                <input type="checkbox" className="rounded border-gray-600 text-cyan-400" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Analysis complete alerts</span>
                <input type="checkbox" className="rounded border-gray-600 text-cyan-400" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Document processing updates</span>
                <input type="checkbox" className="rounded border-gray-600 text-cyan-400" />
              </label>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
