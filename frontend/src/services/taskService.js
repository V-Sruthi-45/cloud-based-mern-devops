// services/taskService.js - Task API calls

import api from "./api";

export const taskService = {
  getAll: (params) => api.get("/tasks", { params }),
  getStats: () => api.get("/tasks/stats"),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};
