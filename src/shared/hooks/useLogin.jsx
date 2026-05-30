import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login as loginRequest } from "../../services";

const extractLoginData = (payload) => {
  const user = payload?.user || payload?.usuario || payload?.data?.user || payload?.data || {};
  const token = payload?.token || payload?.jwt || payload?.data?.token || user?.token;
  return { user, token };
};

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (data) => {
    setIsLoading(true);

    try {
      const response = await loginRequest({ email: data.email, password: data.password });
      const payload = response.data || {};
      const ok = payload.success ?? payload.estado ?? payload.ok ?? true;

      if (!ok) {
        toast.error(payload.msg || payload.message || "Credenciales incorrectas");
        return;
      }

      const { user, token } = extractLoginData(payload);
      if (!token) {
        toast.error("Login correcto, pero el backend no devolvió token.");
        return;
      }

      localStorage.setItem("user", JSON.stringify({
        dpi: user.dpi,
        name: user.name || user.username || data.email,
        username: user.username,
        email: user.email || data.email,
        role: user.role ?? user.role_id,
        token,
      }));

      toast.success(payload.msg || payload.message || "Sesión iniciada correctamente");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.msg || error?.response?.data?.message || error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};
