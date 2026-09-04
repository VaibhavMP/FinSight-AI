import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  FileText,
  BarChart3,
  Shield,
  TrendingUp,
  CheckSquare,
  Square,
} from "lucide-react";
import { ChatMessage as ChatMessageType, ChatResponse, Document, Message, Source } from "@/types";
import { sendMessage, fetchDocuments, createConversation, fetchMessages } from "@/services/api";
import NightSkyBackground from "@/components/NightSkyBackground";
import AICore from "@/components/AICore";
import ActivityTrace from "@/components/ActivityTrace";
import SourceCard from "@/components/SourceCard";
import { AI_CORE_STATE } from "@/components/AICore";

const ChatPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentState, setAgentState] = useState<AI_CORE_STATE>("idle");
  const [activitySteps, setActivitySteps] = useState<string[] | undefined>();
  const [showReasoning, setShowReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load documents
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await fetchDocuments();
        const readyDocs = docs.filter((d) => d.processing_status === "completed");
        setDocuments(readyDocs);
        if (readyDocs.length > 0) {
          readyDocs.forEach((d) => setSelectedDocs((prev) => new Set([...prev, d.id])));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadDocs();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput("");
    setIsLoading(true);

    // AI agent state progression
    const stateSequence: AI_CORE_STATE[] = ["processing", "retrieval", "analysis", "generation", "complete"];
    let stepIdx = 0;
    setAgentState("processing");

    const stateInterval = setInterval(() => {
      if (stepIdx < stateSequence.length - 1) {
        stepIdx++;
        setAgentState(stateSequence[stepIdx]);
      }
    }, 800);

    try {
      const payload: ChatMessageType = {
        query,
        document_ids: Array.from(selectedDocs),
        show_reasoning: showReasoning,
        conversation_id: currentConvId || undefined,
      };

      const response: ChatResponse = await sendMessage(payload);

      if (response.conversation_id && !currentConvId) {
        setCurrentConvId(response.conversation_id);
      }

      // Add user message and AI response
      const now = new Date().toISOString();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          conversation_id: response.conversation_id || 0,
          question: query,
          answer: null,
          created_at: now,
        },
        {
          id: Date.now() + 1,
          conversation_id: response.conversation_id || 0,
          question: "",
          answer: response.answer,
          created_at: now,
        },
      ]);

      setActivitySteps(response.reasoning_steps);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          conversation_id: currentConvId || 0,
          question: query,
          answer: "I encountered an error processing your request. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
      setActivitySteps(["Error occurred during processing"]);
    } finally {
      clearInterval(stateInterval);
      setAgentState("idle");
      setIsLoading(false);
      setTimeout(() => setActivitySteps(undefined), 5000);
    }
  };

  const displayedMessages = messages.length > 0 ? messages : [
    {
      id: -1,
      conversation_id: 0,
      question: "",
      answer: "Hello! I'm FinSight AI, your financial research analyst. Upload documents and ask me questions about revenue, risks, financial metrics, and more.",
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0f1b] text-white">
      <NightSkyBackground />

      <div className="relative z-10 h-screen flex">
        {/* Document Selection Sidebar */}
        <div className="w-72 border-r border-cyan-400/20 overflow-y-auto">
          <div className="p-4 border-b border-cyan-400/10">
            <h2 className="text-sm font-semibold text-cyan-300 mb-3">
              Analyze Documents
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  No processed documents. Upload documents in the Document Library.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleDocToggle(doc.id)}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-cyan-400/5 cursor-pointer transition-colors"
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
                        {doc.company || "Unknown"} • {doc.page_count} pages
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-cyan-400/10">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReasoning}
                  onChange={(e) => setShowReasoning(e.target.checked)}
                  className="rounded border-gray-600 text-cyan-400 focus:ring-cyan-400"
                />
                Show reasoning steps
              </label>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-cyan-400/20">
            <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
              AI Financial Analyst
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {displayedMessages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User message */}
                {msg.question && msg.question !== "" && (
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-4 max-w-[70%]">
                      <div className="font-medium text-white">
                        {msg.question}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}

                {/* AI message */}
                {msg.answer && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#1a2030]/50 border border-gray-700 rounded-xl p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono">
                          {msg.answer}
                        </pre>
                      </div>

                      {/* Sources */}
                      {msg.question === "" && (
                        <div className="mt-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Sources
                          </h4>
                          <div className="max-h-64 overflow-y-auto">
                            {/* Sources will be rendered from the last AI response */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex-shrink-0 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <ActivityTrace
                    steps={activitySteps}
                    agentState={agentState}
                    isVisible={true}
                  />
                  <div className="bg-[#1a2030]/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-sm">FinSight AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-cyan-400/20">
            <div className="flex items-center gap-2 mb-2">
              <AICore state={agentState} size={70} autoPulse={false} />
              <span className="text-xs text-gray-500">
              </span>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                placeholder={
                  selectedDocs.size === 0
                    ? "Select documents to analyze..."
                    : "Ask FinSight AI about financial documents..."
                }
                className="flex-1 px-4 py-3 bg-[#1a2030]/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors"
                disabled={isLoading || selectedDocs.size === 0}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleSend}
                disabled={isLoading || !input.trim() || selectedDocs.size === 0}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:from-cyan-300 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              {selectedDocs.size} document(s) selected • Ask about revenue, risks, financial metrics, or comparison
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
