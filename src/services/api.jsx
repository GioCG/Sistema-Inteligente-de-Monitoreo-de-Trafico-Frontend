import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.3:3000/traffic-control/v1/";

const apiClient = axios.create({
  baseURL,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const userDetails = localStorage.getItem("user");
    if (userDetails) {
      try {
        const token = JSON.parse(userDetails).token;
        if (token) config.headers["x-token"] = token;
      } catch {
        localStorage.removeItem("user");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("user");
      if (window.location.pathname !== "/") window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const api = apiClient;
export const API_BASE_URL = baseURL.replace(/\/$/, "");

// Auth
export const login = (data) => apiClient.post("auth/login", data);
export const register = (data) => apiClient.post("auth/register", data);
export const forgotPassword = (email) => apiClient.post("auth/forgot-password", { email });
export const resetPassword = (token, password) => apiClient.post("auth/reset-password", { token, password });

// Vehicles
export const getVehicles = () => apiClient.get("vehicles/");
export const getVehicleByPlate = (plate) => apiClient.get(`vehicles/search/${String(plate || "").toUpperCase().replace(/[^A-Z0-9]/g, "")}`);
export const getMyVehicles = (dpi) => apiClient.get(`vehicles/user/${dpi}`);
export const createVehicle = (data) => apiClient.post("vehicles/", data);
export const updateVehicle = (plate, data) => apiClient.put(`vehicles/${plate}`, data);
export const deleteVehicle = (plate) => apiClient.delete(`vehicles/${plate}`);

// Traffic lights
export const getTrafficLights = () => apiClient.get("traffic-lights/");

// Users / Roles
export const getUsers = () => apiClient.get("users/");
export const getRoles = () => apiClient.get("users/roles");
export const updateUserRole = (dpi, role_id) => apiClient.patch(`users/${dpi}/role`, { role_id: Number(role_id) });
export const getUserByDpi = (dpi) => apiClient.get(`users/${dpi}`);
export const updateUserProfile = (dpi, data) => apiClient.patch(`users/${dpi}/profile`, data);

// Events
export const getEvents = () => apiClient.get("events/");
export const getEventsByUser = (dpi) => apiClient.get(`events/${dpi}`);
export const createEvent = (data) => apiClient.post("events/", data);
export const updateEvent = (id, data) => apiClient.put(`events/${id}`, data);
export const deleteEvent = (id) => apiClient.delete(`events/${id}`);

// Evidence
export const getEvidences = () => apiClient.get("evidence/");
export const createEvidence = (formData) => apiClient.post("evidence/", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteEvidence = (id) => apiClient.delete(`evidence/${id}`);

// Fines
export const getFines = () => apiClient.get("fines/");
export const getMyFines = (dpi) => apiClient.get(`fines/user/${dpi}`);
export const createFine = (data) => apiClient.post("fines/", data);
export const updateFine = (id, data) => apiClient.put(`fines/${id}`, data);
export const deleteFine = (id) => apiClient.delete(`fines/${id}`);
export const payFine = (id, data) => apiClient.post(`fines/${id}/pay`, data);
export const claimFine = (id, data) => apiClient.post(`fines/${id}/claim`, data);
export const getFineClaims = () => apiClient.get("fines/claims");
export const resolveFineClaim = (id, data) => apiClient.put(`fines/claims/${id}/resolve`, data);
export const getFineHistory = () => apiClient.get("fines/history");
export const getFineHistoryByUser = (dpi) => apiClient.get(`fines/history/user/${dpi}`);

// OCR / Plates
export const detectPlate = (formData) => apiClient.post("plates/detect", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// Requests
export const getRequests = (status) => apiClient.get("requests/", { params: status ? { status } : {} });
export const getMyRequests = () => apiClient.get("requests/my-requests");
export const requestRegisterVehicle = (data) => apiClient.post("requests/register-vehicle", data);
export const requestClaimVehicle = (data) => apiClient.post("requests/claim-vehicle", data);
export const resolveRequest = (id, data) => apiClient.put(`requests/${id}/resolve`, data);
