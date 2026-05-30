import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleLabel, getRoleName, getStoredUser } from "../../utils/auth";

export const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(getStoredUser());
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    setUserDetails(null);
    navigate("/");
  };

  const roleName = getRoleName(userDetails?.role);

  return {
    isLogged: Boolean(userDetails?.token),
    name: userDetails?.name ?? "Invitado",
    dpi: userDetails?.dpi ?? null,
    role: roleName,
    roleLabel: getRoleLabel(roleName),
    roleId: userDetails?.role,
    token: userDetails?.token ?? null,
    logout,
    setUserDetails,
    user: userDetails,
  };
};
