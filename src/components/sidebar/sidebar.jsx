import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  IconCamera,
  IconCar,
  IconClipboardList,
  IconDashboard,
  IconFileDollar,
  IconFileText,
  IconLogout,
  IconMenu2,
  IconShieldCheck,
  IconUser,
  IconUsers,
  IconVideo,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import { useUserDetails } from "../../shared/hooks/useUserDetails";
import { getRoleName } from "../../utils/auth";
import "./sidebar.css";

const NAV_BY_ROLE = {
  ADMIN_ROLE: [
    { label: "Inicio", path: "/dashboard", icon: IconDashboard },
    { label: "Vehículos", path: "/vehicles", icon: IconCar },
    { label: "Eventos", path: "/events", icon: IconClipboardList },
    { label: "Evidencias", path: "/evidences", icon: IconCamera },
    { label: "Multas", path: "/fines", icon: IconFileDollar },
    { label: "Reclamos multas", path: "/fine-claims", icon: IconAlertCircle },
    { label: "Stream ESP32-CAM", path: "/stream", icon: IconVideo },
    { label: "Solicitudes", path: "/requests", icon: IconFileText },
    { label: "Usuarios y roles", path: "/users", icon: IconUsers },
  ],
  OPERATOR_ROLE: [
    { label: "Inicio", path: "/dashboard", icon: IconDashboard },
    { label: "Vehículos", path: "/vehicles", icon: IconCar },
    { label: "Eventos", path: "/events", icon: IconClipboardList },
    { label: "Evidencias", path: "/evidences", icon: IconCamera },
    { label: "Multas", path: "/fines", icon: IconFileDollar },
    { label: "Stream ESP32-CAM", path: "/stream", icon: IconVideo },
    { label: "Solicitudes", path: "/requests", icon: IconFileText },
  ],
  SECURITY_ROLE: [
    { label: "Inicio", path: "/dashboard", icon: IconDashboard },
    { label: "Eventos", path: "/events", icon: IconClipboardList },
    { label: "Evidencias", path: "/evidences", icon: IconCamera },
    { label: "Multas", path: "/fines", icon: IconFileDollar },
    { label: "Stream ESP32-CAM", path: "/stream", icon: IconVideo },
  ],
  CITIZEN_ROLE: [
    { label: "Inicio", path: "/dashboard", icon: IconDashboard },
    { label: "Mi perfil", path: "/profile", icon: IconUser },
    { label: "Mis multas", path: "/fines", icon: IconFileDollar },
    { label: "Mis reclamos", path: "/fine-claims", icon: IconAlertCircle },
    { label: "Mis solicitudes", path: "/requests", icon: IconFileText },
  ],
  SYSTEM_ROLE: [
    { label: "Inicio", path: "/dashboard", icon: IconDashboard },
    { label: "Eventos", path: "/events", icon: IconClipboardList },
    { label: "Evidencias", path: "/evidences", icon: IconCamera },
    { label: "Revisar reclamos", path: "/fine-claims", icon: IconAlertCircle },
    { label: "Stream ESP32-CAM", path: "/stream", icon: IconVideo },
  ],
};

export function SidebarDemo({ onCollapseChange }) {
  const { logout, role, roleLabel, name } = useUserDetails();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleName = getRoleName(role);
  const links = NAV_BY_ROLE[roleName] || NAV_BY_ROLE.CITIZEN_ROLE;

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      onCollapseChange?.(!prev);
      return !prev;
    });
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <>
      <button className="mobile-sidebar-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
        <IconMenu2 size={22} />
      </button>

      <aside className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-top">
          <button className="sidebar-brand" onClick={() => navigate("/dashboard")}>
            <span className="brand-icon"><IconShieldCheck size={26} /></span>
            {!collapsed && <span>SIMIT</span>}
          </button>

          <button className="sidebar-toggle desktop-only" onClick={toggleCollapsed} aria-label="Contraer menú">
            <IconMenu2 size={20} />
          </button>
          <button className="sidebar-toggle mobile-only" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
            <IconX size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={21} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-user sidebar-user-button" onClick={() => navigate("/profile")} title="Ver mi perfil">
          <div className="user-avatar">{String(name || "U").charAt(0).toUpperCase()}</div>
          {!collapsed && (
            <div className="user-meta">
              <strong>{name}</strong>
              <span>{roleLabel}</span>
            </div>
          )}
        </button>

        <button className="sidebar-logout" onClick={handleLogout}>
          <IconLogout size={21} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </aside>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
