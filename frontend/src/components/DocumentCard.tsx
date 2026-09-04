import React from "react";
import { motion } from "framer-motion";
import { FileText, MoreVertical, Trash2 } from "lucide-react";
import { Document } from "@/types";

interface DocumentCardProps {
  document: Document;
  onSelect?: (doc: Document) => void;
  selected?: boolean;
  onDelete?: (doc: Document) => void;
  hideActions?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  uploaded: "bg-yellow-500/20 text-yellow-300",
  processing: "bg-blue-500/20 text-blue-300",
  extracting: "bg-blue-500/20 text-blue-300",
  chunking: "bg-blue-500/20 text-blue-300",
  embedding: "bg-blue-500/20 text-blue-300",
  indexing: "bg-blue-500/20 text-blue-300",
  completed: "bg-green-500/20 text-green-300",
  failed: "bg-red-500/20 text-red-300",
};

const TYPE_ICONS: Record<string, string> = {
  annual_report: "📊",
  quarterly_report: "📈",
  investor_presentation: "📊",
  balance_sheet: "📉",
  income_statement: "💰",
  cash_flow: "💵",
  research_report: "🔍",
  other: "📄",
};

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onSelect,
  selected = false,
  onDelete,
  hideActions = false,
}) => {
  const statusColor = STATUS_COLORS[document.processing_status] || STATUS_COLORS.uploaded;
  const typeIcon = TYPE_ICONS[document.document_type] || "📄";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-card p-5 transition-all duration-200 ${
        selected
          ? "border-cyan-400 bg-cyan-400/5"
          : "border-gray-600 hover:border-cyan-400/30"
      } ${
        onSelect ? "cursor-pointer" : ""
      }`}
      onClick={onSelect ? () => onSelect(document) : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{typeIcon}</div>
          <div>
            <div className="font-medium text-white text-sm">
              {document.filename}
            </div>
            <div className="text-xs text-gray-500">
              {document.company || "No company"} • {document.document_type.replace("_", " ")}
            </div>
          </div>
        </div>

        {!hideActions && (
          <div className="flex items-center gap-1">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(document);
                }}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
              title="More"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2 py-1 text-xs rounded-full ${statusColor}`}
        >
          {document.processing_status}
        </span>
        <span className="text-xs text-gray-500">
          {document.page_count ? `${document.page_count} pages` : "— pages"}
        </span>
      </div>

      <div className="text-xs text-gray-500">
        Uploaded: {new Date(document.upload_date).toLocaleDateString()}
      </div>

      {document.processing_status === "completed" && onSelect && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-gray-700"
        >
          <div className="text-xs text-cyan-400">✓ Ready for analysis</div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DocumentCard;
