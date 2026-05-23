import { api } from "./api";

export const meetingsService = {
  list: () => api.get("/meetings"),
  schedule: (payload: unknown) => api.post("/meetings", payload),
};
