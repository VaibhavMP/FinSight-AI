import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, RefreshCw } from "lucide-react";
import { Document } from "@/types";
import DocumentCard from "@/components/DocumentCard";
import DocumentUploader from "@/components/DocumentUploader";
import NightSkyBackground from "@/components/NightSkyBackground";
import { fetchDocuments, deleteDocument } from "@/services/api";

const DocumentLibrary: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (doc: Document) => {
    try {
      await deleteDocument(doc.id);
      setDocuments(documents.filter((d) => d.id !== doc.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadComplete = (doc: Document) => {
    setShowUploader(false);
    loadDocuments();
  };

  const completedDocs = documents.filter(
    (d) => d.processing_status === "completed"
  );

  return (
    <div className="relative min-h-screen bg-[#0a0f1b] text-white">
      <NightSkyBackground />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
            Document Library
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowUploader(!showUploader)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Upload Document
          </motion.button>
        </div>

        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <DocumentUploader onUploadComplete={handleUploadComplete} />
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-[#1a2030]/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-4">No documents uploaded yet</p>
            <button
              onClick={() => setShowUploader(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold"
            >
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {completedDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">
              Ready for Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  selected={false}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DocumentLibrary;
