import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createVehicle, deleteVehicle, getVehicles } from "../../services/api";
import { normalizeArray } from "../../utils/auth";

const backendMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.msg) return data.msg;
  if (Array.isArray(data?.errors)) return data.errors.map((e) => e.msg || e.message).join(" | ");
  if (data?.errors && typeof data.errors === "object") return Object.values(data.errors).flat().join(" | ");
  return fallback;
};

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getVehicles();
      setVehicles(normalizeArray(res.data, ["vehicles", "data"]));
    } catch (error) {
      toast.error(backendMessage(error, "Error al cargar vehículos"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeVehicle = async (plate) => {
    try {
      await deleteVehicle(plate);
      toast.success("Vehículo eliminado");
      await fetchVehicles();
    } catch (error) {
      toast.error(backendMessage(error, "Error al eliminar vehículo"));
    }
  };

  const addVehicle = async (data) => {
    try {
      await createVehicle({
        ...data,
        plate: String(data.plate || "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
        dpi_user: data.dpi_user ? Number(data.dpi_user) : undefined,
      });
      toast.success("Vehículo creado");
      await fetchVehicles();
      return true;
    } catch (error) {
      toast.error(backendMessage(error, "Error al crear vehículo"));
      return false;
    }
  };

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);
  return { vehicles, isLoading, removeVehicle, addVehicle, fetchVehicles };
};
