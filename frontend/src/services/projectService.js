// services/projectService.js - Project API calls

import api from "./api";

export const projectService = {
  getAll: (params) => api.get("/projects", { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};
