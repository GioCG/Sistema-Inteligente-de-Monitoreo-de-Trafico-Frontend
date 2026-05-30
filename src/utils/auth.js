export const ROLE_MAP = {
  1: "ADMIN_ROLE",
  2: "OPERATOR_ROLE",
  3: "SECURITY_ROLE",
  4: "CITIZEN_ROLE",
  5: "SYSTEM_ROLE",
};

export const ROLE_LABEL = {
  ADMIN_ROLE: "Administrador",
  OPERATOR_ROLE: "Operador",
  SECURITY_ROLE: "Seguridad",
  CITIZEN_ROLE: "Ciudadano",
  SYSTEM_ROLE: "Sistema",
};

export const ROLE_ID = Object.entries(ROLE_MAP).reduce((acc, [id, role]) => {
  acc[role] = Number(id);
  return acc;
}, {});

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const getRoleName = (role) => {
  if (!role) return "";
  if (typeof role === "string" && role.includes("_ROLE")) return role;
  return ROLE_MAP[Number(role)] || String(role);
};

export const getRoleLabel = (role) => ROLE_LABEL[getRoleName(role)] || "Sin rol";

export const canAccess = (allowedRoles = [], user = getStoredUser()) => {
  if (!user?.token) return false;
  if (!allowedRoles?.length) return true;
  return allowedRoles.includes(getRoleName(user.role));
};

export const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  const commonKeys = ["data", "rows", "items", "events", "evidences", "evidence", "vehicles", "fines", "requests", "users"];
  for (const key of commonKeys) {
    if (Array.isArray(payload[key])) return payload[key];
    if (payload[key] && typeof payload[key] === "object") {
      const nested = normalizeArray(payload[key], keys);
      if (nested.length) return nested;
    }
  }

  return [];
};

export const pick = (obj, keys, fallback = "—") => {
  if (!obj) return fallback;
  for (const key of keys) {
    const value = key.split(".").reduce((acc, part) => acc?.[part], obj);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
};

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

export const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `Q${amount.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


export const buildEvidenceUrl = (path, apiBaseUrl = "") => {
  if (!path || path === "—") return null;
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  const apiRoot = String(apiBaseUrl || "").replace(/\/traffic-control\/v1\/?$/i, "").replace(/\/$/, "");
  if (cleanPath.includes("configs/data")) return `${apiRoot}/${cleanPath}`;
  return `${apiRoot}/configs/data/evidence/${cleanPath}`;
};
