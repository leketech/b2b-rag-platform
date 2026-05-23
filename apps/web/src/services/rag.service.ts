import { api } from "./api";

export const ragService = {
  documents: () => api.get("/rag/documents"),
  search: (query: string) => api.post("/rag/search", { query }),
  upload: (payload: FormData) => api.post("/rag/upload", payload),
};
