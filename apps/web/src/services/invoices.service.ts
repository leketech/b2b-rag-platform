import { api } from "./api";

export const invoicesService = {
  list: () => api.get("/invoices"),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (payload: unknown) => api.post("/invoices", payload),
};
