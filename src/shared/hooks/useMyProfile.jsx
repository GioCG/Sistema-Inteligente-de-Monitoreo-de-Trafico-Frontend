import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getFineHistoryByUser, getMyFines, getMyVehicles, getUserByDpi, updateUserProfile } from "../../services/api";
import { getStoredUser, normalizeArray } from "../../utils/auth";

export const useMyProfile = (dpi) => {
  const [vehicles, setVehicles] = useState([]);
  const [fines, setFines] = useState([]);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!dpi) return;
    setIsLoading(true);
    try {
      const [uRes, vRes, fRes, hRes] = await Promise.all([
        getUserByDpi(dpi),
        getMyVehicles(dpi),
        getMyFines(dpi),
        getFineHistoryByUser(dpi),
      ]);
      setProfile(uRes.data?.user || null);
      setVehicles(normalizeArray(vRes.data, ["vehicles", "data"]));
      setFines(normalizeArray(fRes.data, ["fines", "data"]));
      setHistory(normalizeArray(hRes.data, ["history", "fines", "data"]));
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data?.msg || "Error al cargar tu información");
    } finally {
      setIsLoading(false);
    }
  }, [dpi]);

  const saveProfile = async (data) => {
    try {
      const res = await updateUserProfile(dpi, data);
      const updated = res.data?.user;
      if (updated) {
        setProfile(updated);
        const current = getStoredUser() || {};
        localStorage.setItem("user", JSON.stringify({ ...current, ...updated, role: current.role, token: current.token }));
      }
      toast.success(res.data?.msg || "Perfil actualizado");
      await fetchData();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data?.msg || "Error al actualizar perfil");
      return false;
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return { vehicles, fines, history, profile, isLoading, saveProfile, fetchData };
};
