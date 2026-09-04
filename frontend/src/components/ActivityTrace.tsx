import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AI_CORE_STATE } from "@/components/AICore";

interface ActivityTraceProps {
  steps: string[] | undefined;
  agentState: AI_CORE_STATE;
  isVisible: boolean;
}

const ACTIVITY_LABELS: Record<AI_CORE_STATE, string> = {
  idle: "Ready to analyze",
  processing: "Understanding your question...",
  retrieval: "Searching financial documents...",
  analysis: "Analyzing financial evidence...",
  generation: "Preparing grounded response...",
  complete: "Analysis complete",
};

const ActivityTrace: React.FC<ActivityTraceProps> = ({
  steps,
  agentState,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-4"
      >
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{ACTIVITY_LABELS[agentState]}</span>
        </div>

        {steps && steps.length > 0 && (
          <div className="space-y-1">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-xs text-gray-400"
              >
                <span className="text-cyan-400">✓</span>
                <span>{step}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ActivityTrace;
