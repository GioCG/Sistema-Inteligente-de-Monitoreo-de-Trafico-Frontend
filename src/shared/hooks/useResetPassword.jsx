import { useState } from "react";
import toast from "react-hot-toast";
import { resetPassword } from "../../services/api";

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const submitNewPassword = async (token, newPassword) => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await resetPassword(token, newPassword);
      const msg = res.data?.msg || res.data?.message || "Contraseña actualizada correctamente";
      setResponse(msg);
      toast.success(msg);
      return { ok: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || "Error al restablecer contraseña";
      setError(msg);
      toast.error(msg);
      return { error: true, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setResponse(null);
  };

  return { submitNewPassword, loading, response, error, clearMessages };
};
