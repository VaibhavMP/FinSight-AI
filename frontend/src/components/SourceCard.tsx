import React from "react";
import { motion } from "framer-motion";
import { Source } from "@/types";

interface SourceCardProps {
  source: Source;
}

const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-3 mb-2 text-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
          <span className="text-cyan-400 text-xs font-bold">
            {source.document.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-cyan-300">
            {source.document}
          </div>
          <div className="text-gray-400 text-xs mt-1 space-y-0.5">
            {source.page && <span>Page {source.page}</span>}
            {source.section && <span>Section: {source.section}</span>}
            {source.company && <span>Company: {source.company}</span>}
          </div>
          {source.excerpt && (
            <div className="text-gray-400 text-xs mt-2 italic line-clamp-2">
              "{source.excerpt}"
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SourceCard;
