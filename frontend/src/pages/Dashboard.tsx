import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import NightSkyBackground from "@/components/NightSkyBackground";
import AICore from "@/components/AICore";
import { fetchDocuments, fetchConversations } from "@/services/api";
import { Document, Conversation } from "@/types";

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [docs, convs] = await Promise.all([
          fetchDocuments(),
          fetchConversations(),
        ]);
        setDocuments(docs);
        setConversations(convs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const completedDocs = documents.filter(
    (d) => d.processing_status === "completed"
  ).length;
  const pendingDocs = documents.filter(
    (d) => d.processing_status !== "completed" && d.processing_status !== "failed"
  ).length;

  const statCards = [
    {
      title: "Documents",
      value: documents.length,
      icon: <FileText className="h-5 w-5 text-cyan-400" />,
      change: `${completedDocs} ready`,
    },
    {
      title: "Total Analyses",
      value: conversations.length,
      icon: <MessageSquare className="h-5 w-5 text-purple-400" />,
      change: "This session",
    },
    {
      title: "Companies",
      value: new Set(documents.map((d) => d.company).filter(Boolean)).size || 0,
      icon: <Users className="h-5 w-5 text-blue-400" />,
      change: "Unique companies",
    },
    {
      title: "Conversations",
      value: conversations.length,
      icon: <BarChart3 className="h-5 w-5 text-emerald-400" />,
      change: "Active chats",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0f1b] text-white">
      <NightSkyBackground />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Welcome back — your financial intelligence hub
          </p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center group"
            >
              <div className="mb-3 flex justify-center">{stat.icon}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.title}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* AICore + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 flex justify-center">
            <AICore state="idle" size={180} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-cyan-300">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: "Upload Document", path: "/documents", icon: "📄" },
                { name: "AI Analyst", path: "/chat", icon: "🤖" },
                { name: "Compare Companies", path: "/compare", icon: "📊" },
                { name: "Financial Insights", path: "/insights", icon: "📈" },
                { name: "Document Library", path: "/documents", icon: "📁" },
                { name: "Settings", path: "/settings", icon: "⚙️" },
              ].map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="glass-card p-4 flex flex-col items-center justify-center text-center hover:bg-cyan-400/10 transition-colors group"
                >
                  <span className="text-2xl mb-1">{action.icon}</span>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-300">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-cyan-300 mb-4">
            Recent Documents
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-[#1a2030]/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No documents uploaded yet.</p>
              <Link
                to="/documents"
                className="text-cyan-400 hover:text-cyan-300 mt-2 inline-block"
              >
                Upload your first document
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-white">
                      {doc.filename}
                    </div>
                    <div className="text-sm text-gray-400">
                      {doc.company || "Unknown company"} • {doc.page_count || "?"} pages
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        doc.processing_status === "completed"
                          ? "bg-green-500/20 text-green-300"
                          : doc.processing_status === "failed"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {doc.processing_status}
                    </span>
                    <Link
                      to="/chat"
                      className="text-cyan-400 hover:text-cyan-300 text-xs px-2 py-1 border border-cyan-400/30 rounded"
                    >
                      Analyze
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Conversations */}
        {conversations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">
              Recent Conversations
            </h2>
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv) => (
                <Link
                  key={conv.id}
                  to="/chat"
                  className="glass-card p-4 block hover:bg-cyan-400/5 transition-colors"
                >
                  <div className="font-medium text-white">{conv.title}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
