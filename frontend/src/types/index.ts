export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Document {
  id: number;
  filename: string;
  company: string | null;
  document_type: string;
  upload_date: string;
  processing_status: string;
  page_count: number | null;
  file_size_bytes: number | null;
  chroma_collection_id: string | null;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  question: string;
  answer: string | null;
  created_at: string;
}

export interface Source {
  document: string;
  page: number | null;
  section: string | null;
  excerpt: string | null;
  chunk_id: string;
  document_id: number | null;
  company: string;
  document_type: string;
}

export interface ChatResponse {
  answer: string;
  agent_mode: string;
  sources: Source[];
  metrics: Record<string, unknown>[];
  conversation_id: number | null;
  reasoning_steps?: string[];
}

export interface ChatMessage {
  conversation_id?: number | null;
  query: string;
  document_ids?: number[] | null;
  show_reasoning?: boolean;
}

export type ProcessingStatus =
  | "uploaded"
  | "processing"
  | "extracting"
  | "chunking"
  | "embedding"
  | "indexing"
  | "completed"
  | "failed";

export type AgentMode =
  | "casual"
  | "rag"
  | "analysis"
  | "comparison"
  | "risk"
  | "metrics"
  | "unknown";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
