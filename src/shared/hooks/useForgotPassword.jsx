import { useState } from "react";
import toast from "react-hot-toast";
import { forgotPassword } from "../../services/api";

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const requestReset = async (email) => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await forgotPassword(email);
      const msg = res.data?.msg || res.data?.message || "Solicitud enviada. Revisa tu correo o el token generado por el backend.";
      setResponse(msg);
      toast.success(msg);
      return { ok: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || "Error al solicitar recuperación";
      setError(msg);
      toast.error(msg);
      return { error: true, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setResponse(null);
    setError(null);
  };

  return { requestReset, loading, response, error, clearMessages };
};
