import { api } from "./api";

export const notificationsService = {
  list: () => api.get("/notifications"),
  createRule: (payload: unknown) => api.post("/notifications/rules", payload),
};

export const remindersService = {
  list: () => api.get("/reminders"),
  create: (payload: unknown) => api.post("/reminders", payload),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};
