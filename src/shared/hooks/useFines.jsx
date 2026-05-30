import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { claimFine, createFine, deleteFine, getFineHistory, getFineHistoryByUser, getFines, getMyFines, payFine } from "../../services/api";
import { getRoleName, getStoredUser, normalizeArray } from "../../utils/auth";

const backendMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.msg) return data.msg;
  if (Array.isArray(data?.errors)) return data.errors.map((e) => e.msg || e.message).join(" | ");
  if (data?.errors && typeof data.errors === "object") return Object.values(data.errors).flat().join(" | ");
  return fallback;
};

export const useFines = () => {
  const [fines, setFines] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = getStoredUser();
  const isCitizen = getRoleName(user?.role) === "CITIZEN_ROLE";

  const fetchFines = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        isCitizen ? getMyFines(user?.dpi) : getFines(),
        isCitizen ? getFineHistoryByUser(user?.dpi) : getFineHistory(),
      ]);
      setFines(normalizeArray(pendingRes.data, ["fines", "data"]));
      setHistory(normalizeArray(historyRes.data, ["history", "fines", "data"]));
    } catch (error) {
      toast.error(backendMessage(error, "Error al cargar multas"));
    } finally {
      setIsLoading(false);
    }
  }, [isCitizen, user?.dpi]);

  const addFine = async (data) => {
    try {
      const payload = {
        amount: Number(data.amount),
        description: data.description,
        event_id: Number(data.event_id),
      };
      await createFine(payload);
      toast.success("Multa creada correctamente");
      await fetchFines();
      return true;
    } catch (error) {
      toast.error(backendMessage(error, "Error al crear multa"));
      return false;
    }
  };

  const payFineById = async (id, data = {}) => {
    try {
      const res = await payFine(id, data);
      toast.success(res.data?.msg || "Pago realizado correctamente");
      await fetchFines();
      return true;
    } catch (error) {
      toast.error(backendMessage(error, "Error al pagar multa"));
      return false;
    }
  };

  const claimFineById = async (id, reason) => {
    try {
      await claimFine(id, { reason });
      toast.success("Reclamo enviado al rol sistema para revisión");
      await fetchFines();
      return true;
    } catch (error) {
      toast.error(backendMessage(error, "Error al enviar reclamo"));
      return false;
    }
  };

  const removeFine = async (id) => {
    try {
      await deleteFine(id);
      toast.success("Multa eliminada");
      await fetchFines();
    } catch (error) {
      toast.error(backendMessage(error, "Error al eliminar multa"));
    }
  };

  useEffect(() => { fetchFines(); }, [fetchFines]);
  return { fines, history, isLoading, addFine, removeFine, payFineById, claimFineById, fetchFines };
};
