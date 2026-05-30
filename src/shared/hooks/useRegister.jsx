import { useState } from "react";
import { register as registerRequest } from "../../services";
import toast from "react-hot-toast";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);

  const register = async (data) => {
    setIsLoading(true);
    try {
      const response = await registerRequest({
        ...data,
        dpi: Number(data.dpi),
        role_id: Number(data.role_id || 4),
      });

      const payload = response.data || {};
      const ok = payload.success ?? payload.estado ?? payload.ok ?? true;
      if (!ok) {
        toast.error(payload.msg || payload.message || "Error al registrar");
        return false;
      }

      toast.success(payload.msg || payload.message || "Usuario registrado correctamente");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.msg || error?.response?.data?.message || "Error al registrar");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading };
};
