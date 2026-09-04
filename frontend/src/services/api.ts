import axios from "axios";
import {
  ChatMessage,
  ChatResponse,
  Conversation,
  Document,
  Message,
  User,
} from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getUserFromStorage = (): User | null => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};

export const setUserInStorage = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Auth
export const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ access_token: string; user_id: number }> => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const res = await api.post("/api/auth/register", { name, email, password });
  const loginRes = await api.post("/api/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  setAuthToken(loginRes.data.access_token);
  setUserInStorage({ id: loginRes.data.user_id, name, email, role: "user", created_at: new Date().toISOString() });
  return loginRes.data;
};

export const login = async (
  email: string,
  password: string
): Promise<{ access_token: string; user_id: number; name: string; email: string }> => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const res = await api.post("/api/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  setAuthToken(res.data.access_token);
  setUserInStorage({
    id: res.data.user_id,
    name: res.data.name,
    email: res.data.email,
    role: "user",
    created_at: new Date().toISOString(),
  });
  return res.data;
};

export const logout = () => {
  setAuthToken(null);
  localStorage.removeItem("user");
};

// Documents
export const fetchDocuments = async (): Promise<Document[]> => {
  const res = await api.get("/api/documents/");
  return res.data;
};

export const uploadDocument = async (
  file: File,
  company: string,
  document_type: string
): Promise<Document> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("company", company);
  formData.append("document_type", document_type);
  const res = await api.post("/api/documents/upload", formData);
  return res.data;
};

export const processDocument = async (docId: number): Promise<any> => {
  const res = await api.post(`/api/documents/${docId}/process`);
  return res.data;
};

export const deleteDocument = async (docId: number): Promise<any> => {
  const res = await api.delete(`/api/documents/${docId}`);
  return res.data;
};

// Conversations
export const fetchConversations = async (): Promise<Conversation[]> => {
  const res = await api.get("/api/conversations/");
  return res.data;
};

export const createConversation = async (title = "New Conversation"): Promise<Conversation> => {
  const res = await api.post("/api/conversations/", { title });
  return res.data;
};

export const fetchMessages = async (convId: number): Promise<Message[]> => {
  const res = await api.get(`/api/conversations/${convId}/messages`);
  return res.data;
};

// Chat
export const sendMessage = async (
  payload: ChatMessage
): Promise<ChatResponse> => {
  const res = await api.post("/api/chat/", payload);
  return res.data;
};

// Compare
export const compareDocuments = async (
  document_ids: number[],
  metrics: string[]
): Promise<ChatResponse> => {
  const res = await api.post("/api/compare/", { document_ids, metrics });
  return res.data;
};

// Health
export const healthCheck = async (): Promise<any> => {
  const res = await api.get("/api/health");
  return res.data;
};

export default api;
