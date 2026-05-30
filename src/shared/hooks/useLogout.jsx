import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");

    toast.success("Sesión cerrada");
    navigate("/auth");
  };

  return { logout };
};