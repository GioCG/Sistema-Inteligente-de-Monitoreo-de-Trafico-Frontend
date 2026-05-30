import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMyRequests,
  getRequests,
  requestClaimVehicle,
  requestRegisterVehicle,
  resolveRequest,
} from "../../services/api";
import { getStoredUser, normalizeArray } from "../../utils/auth";

export const useRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = getStoredUser() || {};
  const isOperator = [1, 2].includes(Number(user.role));

  const fetchRequests = useCallback(async (status) => {
    setIsLoading(true);
    try {
      const res = isOperator ? await getRequests(status) : await getMyRequests();
      setRequests(normalizeArray(res.data, ["requests", "data"]));
    } catch (error) {
      toast.error(error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || "Error al cargar solicitudes");
    } finally {
      setIsLoading(false);
    }
  }, [isOperator]);

  const sendRegisterVehicle = async (data) => {
    try {
      await requestRegisterVehicle({
        plate: String(data.plate || "").trim().toUpperCase(),
        type: String(data.type || "").trim().toLowerCase(),
        color: String(data.color || "").trim(),
      });
      toast.success("Solicitud enviada");
      await fetchRequests();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || "Error al enviar solicitud");
      return false;
    }
  };

  const sendClaimVehicle = async (data) => {
    try {
      await requestClaimVehicle({ ...data, plate: String(data.plate || "").toUpperCase() });
      toast.success("Solicitud de reclamo enviada");
      await fetchRequests();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || "Error al enviar reclamo");
      return false;
    }
  };

  const handleResolve = async (id, action, reason = "") => {
    try {
      await resolveRequest(id, { action, reason });
      toast.success(`Solicitud ${action === "APPROVED" ? "aprobada" : "rechazada"}`);
      await fetchRequests();
    } catch (error) {
      toast.error(error?.response?.data?.msg || error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || "Error al resolver solicitud");
    }
  };

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  return { requests, isLoading, sendRegisterVehicle, sendClaimVehicle, handleResolve, fetchRequests, isOperator };
};
