import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createEvent, deleteEvent, getEvents } from "../../services/api";
import { normalizeArray } from "../../utils/auth";

const backendMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.msg) return data.msg;
  if (Array.isArray(data?.errors)) return data.errors.map((e) => e.msg || e.message).join(" | ");
  if (data?.errors && typeof data.errors === "object") return Object.values(data.errors).flat().join(" | ");
  return fallback;
};

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getEvents();
      setEvents(normalizeArray(res.data, ["events", "data"]));
    } catch (error) {
      toast.error(backendMessage(error, "Error al cargar eventos"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEvent = async (data) => {
    try {
      await createEvent(data);
      toast.success("Evento creado correctamente");
      await fetchEvents();
      return true;
    } catch (error) {
      toast.error(backendMessage(error, "Error al crear evento"));
      return false;
    }
  };

  const removeEvent = async (id) => {
    try {
      await deleteEvent(id);
      toast.success("Evento eliminado");
      await fetchEvents();
    } catch (error) {
      toast.error(backendMessage(error, "Error al eliminar evento"));
    }
  };

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  return { events, isLoading, fetchEvents, addEvent, removeEvent };
};
