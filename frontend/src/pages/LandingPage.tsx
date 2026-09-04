import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, FileText, MessageSquare } from "lucide-react";
import NightSkyBackground from "@/components/NightSkyBackground";
import AICore from "@/components/AICore";
import { healthCheck } from "@/services/api";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthCheck();
        setBackendHealthy(true);
      } catch {
        setBackendHealthy(false);
      }
    };
    checkHealth();
    const stored = localStorage.getItem("token");
    if (stored) setBackendHealthy(true);
  }, []);

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  const handleExplore = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0f1b] text-white overflow-hidden">
      <NightSkyBackground />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center min-h-screen pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              FinSight AI
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto mb-2">
            Agentic RAG-Based Financial Document Intelligence &amp; Analysis Platform
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Upload financial reports. Ask complex questions. Discover evidence-backed
            insights with document-level citations.
          </p>
        </motion.div>

        {/* AI Core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-12"
        >
          <AICore state="idle" size={220} autoPulse />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-lg hover:scale-105 transition-transform flex items-center gap-2"
          >
            Start Analyzing
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={handleExplore}
            className="px-8 py-4 rounded-xl border border-cyan-400/30 text-cyan-300 font-semibold text-lg hover:bg-cyan-400/10 transition-colors flex items-center gap-2"
          >
            Explore FinSight
          </button>
        </motion.div>

        {/* Health indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-8 text-sm"
        >
          <span className={`flex items-center gap-2 ${
            backendHealthy === true ? "text-green-400" :
            backendHealthy === false ? "text-red-400" : "text-gray-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              backendHealthy === true ? "bg-green-400" :
              backendHealthy === false ? "bg-red-400" : "bg-gray-400"
            } animate-pulse`}></span>
            {backendHealthy === true ? "Backend online" :
             backendHealthy === false ? "Backend offline" : "Checking backend..."}
          </span>
        </motion.div>
      </div>

      {/* Features Section */}
      <div
        id="features"
        className="relative z-10 max-w-6xl mx-auto py-20 px-6 mt-auto"
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
          Core Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FileText className="h-8 w-8 text-cyan-400" />,
              title: "Financial Document Processing",
              desc: "PDF, DOCX, TXT — automatic chunking, embedding, and indexing into Chroma vector DB.",
            },
            {
              icon: <MessageSquare className="h-8 w-8 text-purple-400" />,
              title: "Agentic RAG Intelligence",
              desc: "AI agent routes queries intelligently, with memory, query reformulation, and grounded answers.",
            },
            {
              icon: <BarChart3 className="h-8 w-8 text-blue-400" />,
              title: "Financial Analytics",
              desc: "Revenue, margins, cash flow, risk extraction, and multi-document comparison with citations.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 text-center group"
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
