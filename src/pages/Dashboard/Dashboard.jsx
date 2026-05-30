import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppLayout } from "../../layout/AppLayout";
import { PageHeader } from "../../layout/PageHeader";
import { getEvents, getEvidences, getFines, getMyFines, getRequests, getVehicles } from "../../services/api";
import { formatMoney, getRoleLabel, getRoleName, getStoredUser, normalizeArray, pick } from "../../utils/auth";
import "./styleDashboard.css";

const fetchSafe = async (fn, keys) => {
  try {
    const res = await fn();
    return normalizeArray(res.data, keys);
  } catch {
    return [];
  }
};

export const DashboardPage = () => {
  const user = getStoredUser();
  const roleName = getRoleName(user?.role);
  const [data, setData] = useState({ events: [], vehicles: [], evidences: [], fines: [], requests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [events, vehicles, evidences, fines, requests] = await Promise.all([
          fetchSafe(getEvents, ["events", "data"]),
          ["ADMIN_ROLE", "OPERATOR_ROLE"].includes(roleName) ? fetchSafe(getVehicles, ["vehicles", "data"]) : Promise.resolve([]),
          ["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "SYSTEM_ROLE"].includes(roleName) ? fetchSafe(getEvidences, ["evidences", "data"]) : Promise.resolve([]),
          roleName === "CITIZEN_ROLE" ? fetchSafe(() => getMyFines(user?.dpi), ["fines", "data"]) : ["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE"].includes(roleName) ? fetchSafe(getFines, ["fines", "data"]) : Promise.resolve([]),
          ["ADMIN_ROLE", "OPERATOR_ROLE"].includes(roleName) ? fetchSafe(getRequests, ["requests", "data"]) : Promise.resolve([]),
        ]);
        setData({ events, vehicles, evidences, fines, requests });
      } catch {
        toast.error("No se pudo cargar el resumen");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roleName]);

  const totalFines = data.fines.reduce((acc, fine) => acc + Number(pick(fine, ["amount", "monto"], 0)), 0);
  const violations = data.events.filter((event) => String(pick(event, ["violation", "infraction", "is_violation"], "")).toLowerCase() !== "false").length;
  const recentEvents = data.events.slice(0, 6);

  const cards = [
    { label: "Eventos", value: data.events.length, visible: true },
    { label: "Infracciones", value: violations, visible: true },
    { label: "Vehículos", value: data.vehicles.length, visible: ["ADMIN_ROLE", "OPERATOR_ROLE"].includes(roleName) },
    { label: "Evidencias", value: data.evidences.length, visible: ["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "SYSTEM_ROLE"].includes(roleName) },
    { label: "Multas pendientes", value: data.fines.length, visible: ["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "CITIZEN_ROLE"].includes(roleName) },
    { label: "Monto pendiente", value: formatMoney(totalFines), visible: ["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE", "CITIZEN_ROLE"].includes(roleName) },
    { label: "Solicitudes", value: data.requests.length, visible: ["ADMIN_ROLE", "OPERATOR_ROLE"].includes(roleName) },
  ].filter((card) => card.visible);

  return (
    <AppLayout>
      <PageHeader title="Inicio" subtitle={`Bienvenido, ${user?.name || "usuario"}. Rol actual: ${getRoleLabel(roleName)}.`} />

      <section className="home-hero card">
        <div>
          <span className="home-kicker">Sistema inteligente de monitoreo de tráfico</span>
          <h1>Control de eventos, evidencias y multas en tiempo real</h1>
          <p>Desde esta plataforma puedes consultar infracciones, revisar evidencias capturadas por la ESP32-CAM, administrar vehículos, realizar pagos ficticios y consultar el historial.</p>
        </div>
        <div className="home-tips">
          <strong>Para usar en LAN</strong>
          <span> Abre desde otro dispositivo: <code>http://192.168.1.3:5173</code>.</span>
        </div>
      </section>

      <div className="grid grid-4 dashboard-stats">
        {cards.map((card) => <div className="stat-card" key={card.label}><p className="stat-label">{card.label}</p><p className="stat-value">{loading ? "..." : card.value}</p></div>)}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card info-card"><h3>Usuarios ciudadanos</h3><p>Registran vehículos, consultan multas y pueden pagar multas pendientes con el sistema ficticio.</p></div>
        <div className="card info-card"><h3>Operadores y seguridad</h3><p>Gestionan eventos, evidencias y multas. Las evidencias muestran el enlace directo a la imagen capturada.</p></div>
        <div className="card info-card"><h3>Administrador</h3><p>Puede cambiar roles de usuarios y revisar el estado general del sistema.</p></div>
      </div>

      <section className="card dashboard-section">
        <h2>Últimos eventos</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Placa</th><th>Velocidad</th><th>Semáforo</th><th>Fecha</th></tr></thead>
            <tbody>
              {recentEvents.length ? recentEvents.map((event) => (
                <tr key={pick(event, ["id", "event_id"])}>
                  <td>{pick(event, ["id", "event_id"])}</td>
                  <td><span className="badge info">{pick(event, ["plate", "vehicle_plate", "event_plate"])}</span></td>
                  <td>{pick(event, ["speed", "speed_kmh", "velocity"])} km/h</td>
                  <td>{pick(event, ["traffic_light_status", "semaphore", "light_status"])}</td>
                  <td>{new Date(pick(event, ["date", "created_at", "event_date"], Date.now())).toLocaleString()}</td>
                </tr>
              )) : <tr><td colSpan="5" className="empty-state">Sin eventos recientes.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
};
