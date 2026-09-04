import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, BarChart3, PieChart, DollarSign } from "lucide-react";
import NightSkyBackground from "@/components/NightSkyBackground";
import AICore from "@/components/AICore";

interface MetricData {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}

const Insights: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder — in production these come from the backend's financial analysis
    setTimeout(() => {
      setMetrics([
        { label: "Revenue Growth", value: "+12.5%", icon: <TrendingUp />, trend: "up" },
        { label: "Net Profit Margin", value: "8.3%", icon: <PieChart />, trend: "up" },
        { label: "Debt-to-Equity", value: "0.45", icon: <BarChart3 />, trend: "neutral" },
        { label: "Operating Cash Flow", value: "$2.4B", icon: <DollarSign />, trend: "up" },
        { label: "Risk Level", value: "Medium", icon: <Shield />, trend: "neutral" },
      ]);
      setLoading(false);
    }, 500);
  }, []);

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
            Financial Insights
          </h1>
          <p className="text-gray-400 mt-1">
            AI-generated insights from your uploaded financial documents
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-[#1a2030]/50 rounded-xl animate-pulse" />
            ))
          ) : (
            metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center group"
              >
                <div className="mb-3 flex justify-center text-cyan-400">
                  {metric.icon}
                </div>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className="text-sm text-gray-400 mt-1">{metric.label}</div>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h2 className="text-xl font-semibold text-cyan-300 mb-4">
            Ask a Financial Question
          </h2>
          <p className="text-gray-400 mb-4">
            Go to the AI Analyst tab to ask questions about your documents.
            Examples: "What are the major risks?", "Compare revenue of my documents",
            "Extract all financial metrics", "What was the EBITDA?"
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.assign("/chat")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold"
          >
            Go to AI Analyst
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <AICore state="idle" size={150} />
        </motion.div>
      </div>
    </div>
  );
};

export default Insights;
