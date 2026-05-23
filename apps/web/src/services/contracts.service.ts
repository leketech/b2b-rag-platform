import { api } from "./api";

export const contractsService = {
  list: () => api.get("/contracts"),
  get: (id: string) => api.get(`/contracts/${id}`),
  create: (payload: unknown) => api.post("/contracts", payload),
};
