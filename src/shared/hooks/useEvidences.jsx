import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createEvidence, deleteEvidence, getEvidences } from "../../services/api";
import { normalizeArray } from "../../utils/auth";

export const useEvidences = () => {
  const [evidences, setEvidences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvidences = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getEvidences();
      setEvidences(normalizeArray(res.data, ["evidences", "evidence", "data"]));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error al cargar evidencias");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEvidence = async ({ event_id, images, description }) => {
    try {
      const formData = new FormData();
      if (event_id) formData.append("event_id", event_id);
      if (description) formData.append("description", description);
      Array.from(images || []).slice(0, 3).forEach((file) => {
        formData.append("images", file);
      });
      await createEvidence(formData);
      toast.success("Evidencia subida correctamente");
      await fetchEvidences();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data?.msg || "Error al subir evidencia");
      return false;
    }
  };

  const removeEvidence = async (id) => {
    try {
      await deleteEvidence(id);
      toast.success("Evidencia eliminada");
      await fetchEvidences();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error al eliminar evidencia");
    }
  };

  useEffect(() => { fetchEvidences(); }, [fetchEvidences]);
  return { evidences, isLoading, addEvidence, removeEvidence, fetchEvidences };
};
