import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  BarChart3,
  CheckSquare,
  FileText,
  GitCompare,
  PieChart,
  Square,
  TrendingUp,
} from "lucide-react";
import {
  BarChart as BarChartComp,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Document, ChatResponse } from "@/types";
import { fetchDocuments, compareDocuments } from "@/services/api";
import NightSkyBackground from "@/components/NightSkyBackground";
import AICore from "@/components/AICore";
import { AI_CORE_STATE } from "@/components/AICore";

const METRIC_OPTIONS = [
  "revenue", "revenue_growth", "gross_profit", "operating_income",
  "operating_margin", "ebitda", "net_income", "net_profit_margin",
  "eps", "assets", "liabilities", "debt", "equity",
  "cash_flow", "operating_cash_flow", "free_cash_flow",
];

const ComparePage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set());
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());
  const [aiResponse, setAiResponse] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agentState, setAgentState] = useState<AI_CORE_STATE>("idle");

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await fetchDocuments();
        const ready = docs.filter((d) => d.processing_status === "completed");
        setDocuments(ready);
      } catch (e) {
        console.error(e);
      }
    };
    loadDocs();
  }, []);

  const handleDocToggle = (docId: number) => {
    setSelectedDocs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(metric)) {
        newSet.delete(metric);
      } else {
        newSet.add(metric);
      }
      return newSet;
    });
  };

  const handleCompare = async () => {
    if (selectedDocs.size < 2 || selectedMetrics.size === 0) return;

    setIsLoading(true);
    setAgentState("processing");

    try {
      const response = await compareDocuments(
        Array.from(selectedDocs),
        Array.from(selectedMetrics)
      );
      setAiResponse(response);
    } catch (e: any) {
      console.error(e);
      setAiResponse({
        answer: "Failed to compare documents. Please try again.",
        agent_mode: "comparison",
        sources: [],
        metrics: [],
        conversation_id: null,
      });
    } finally {
      setIsLoading(false);
      setAgentState("idle");
    }
  };

  // Generate mock chart data based on selected documents
  const chartData = documents
    .filter((d) => selectedDocs.has(d.id))
    .map((doc) => ({
      name: doc.company || doc.filename.substring(0, 20),
      revenue: Math.floor(Math.random() * 50000) + 10000,
      netIncome: Math.floor(Math.random() * 10000) + 1000,
      debt: Math.floor(Math.random() * 20000) + 5000,
      margin: (Math.random() * 20 + 5).toFixed(1),
    }));

  return (
    <div className="relative min-h-screen bg-[#0a0f1b] text-white">
      <NightSkyBackground />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="h-6 w-6 text-cyan-400" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
              Company Comparison
            </h1>
          </div>
          <p className="text-gray-400">
            Select multiple documents to compare financial metrics side-by-side
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Document Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-5"
          >
            <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Select Documents
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No processed documents available.</p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleDocToggle(doc.id)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-cyan-400/5 cursor-pointer transition-colors"
                  >
                    <button
                      className="mt-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocToggle(doc.id);
                      }}
                    >
                      {selectedDocs.has(doc.id) ? (
                        <CheckSquare className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white truncate">
                        {doc.filename}
                      </div>
                      <div className="text-xs text-gray-500">
                        {doc.company || "Unknown company"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Metric Selection */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Select Metrics
            </h2>
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {METRIC_OPTIONS.map((metric) => (
                <button
                  key={metric}
                  onClick={() => handleMetricToggle(metric)}
                  className={`text-xs py-1.5 px-2 rounded-lg transition-all ${
                    selectedMetrics.has(metric)
                      ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                      : "bg-gray-800/30 text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {metric.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </motion.div>

          {/* AI Core */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-5 flex flex-col items-center"
          >
            <AICore state={agentState} size={120} autoPulse={false} />
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <button
            onClick={handleCompare}
            disabled={selectedDocs.size < 2 || selectedMetrics.size === 0 || isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? "Comparing..." : "Compare Documents"}
          </button>
        </motion.div>

        {/* Results */}
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-cyan-300">
              Comparison Results
            </h2>

            {/* Chart */}
            {selectedDocs.size >= 2 && chartData.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase">
                  Financial Comparison
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChartComp data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334159" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a2030",
                        border: "1px solid #334159",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#00c8ff" name="Revenue ($K)" />
                    <Bar dataKey="netIncome" fill="#8a2be2" name="Net Income ($K)" />
                  </BarChartComp>
                </ResponsiveContainer>
              </div>
            )}

            {/* AI Explanation */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase">
                AI Analysis
              </h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono">
                {aiResponse.answer}
              </pre>
            </div>

            {/* Sources */}
            {aiResponse.sources && aiResponse.sources.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">
                  Sources
                </h3>
                <div className="space-y-2">
                  {aiResponse.sources.map((source, i) => (
                    <div key={i} className="glass-card p-3 text-sm">
                      <div className="font-medium text-cyan-300">
                        {source.document}
                      </div>
                      <div className="text-gray-400">
                        {source.page && `Page: ${source.page}`}
                        {source.section && ` • Section: ${source.section}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
