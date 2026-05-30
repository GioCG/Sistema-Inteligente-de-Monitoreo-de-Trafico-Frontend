import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AppLayout } from "../../layout/AppLayout";
import { EmptyState } from "../../layout/EmptyState";
import { PageHeader } from "../../layout/PageHeader";
import { getVehicleByPlate } from "../../services/api";
import { useEvents } from "../../shared/hooks/useEvents";
import { canAccess, formatDate, getStoredUser, pick } from "../../utils/auth";

const cleanPlate = (value = "") => value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const OPERATOR_FINE_TYPES = [
  "Parqueo en línea roja",
  "Estacionamiento en zona prohibida",
  "Parqueo en doble fila",
  "Obstrucción de entrada o salida",
  "Parqueo sobre paso peatonal",
  "Parqueo sobre acera",
];

export const Events = () => {
  const { events, isLoading, addEvent, removeEvent } = useEvents();
  const user = getStoredUser();
  const isOperator = canAccess(["OPERATOR_ROLE"], user);
  const canCreate = canAccess(["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE"], user);
  const canDelete = canAccess(["ADMIN_ROLE", "OPERATOR_ROLE"], user);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [searchingPlate, setSearchingPlate] = useState(false);
  const [form, setForm] = useState({
    plate: "",
    speed: "0",
    traffic_light_status: isOperator ? "NO_APLICA" : "RED",
    traffic_light_id: "1",
    location: "Punto de monitoreo principal",
    violation: true,
    manual_reason: OPERATOR_FINE_TYPES[0],
  });

  const normalizedPlate = useMemo(() => cleanPlate(form.plate), [form.plate]);

  useEffect(() => {
    setVehicleInfo(null);
    if (normalizedPlate.length < 6) return;

    const timer = setTimeout(async () => {
      try {
        setSearchingPlate(true);
        const res = await getVehicleByPlate(normalizedPlate);
        setVehicleInfo(res.data?.vehicle || null);
      } catch {
        setVehicleInfo(null);
      } finally {
        setSearchingPlate(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [normalizedPlate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!vehicleInfo) {
      toast.error("Primero debes ingresar una placa registrada en vehículos.");
      return;
    }

    const payload = {
      plate: normalizedPlate,
      speed: isOperator ? 0 : Number(form.speed),
      traffic_light_status: isOperator ? "NO_APLICA" : form.traffic_light_status,
      traffic_light_id: Number(form.traffic_light_id || 1),
      location: form.location,
      violation: true,
      manual_reason: form.manual_reason,
    };

    const ok = await addEvent(payload);
    if (ok) {
      setForm({ plate: "", speed: "0", traffic_light_status: isOperator ? "NO_APLICA" : "RED", traffic_light_id: "1", location: "Punto de monitoreo principal", violation: true, manual_reason: OPERATOR_FINE_TYPES[0] });
      setVehicleInfo(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Eventos de tráfico" subtitle={isOperator ? "Eventos manuales de estacionamiento/parqueo creados por el operador." : "Registro de infracciones, velocidad detectada y estado del semáforo."} />

      {canCreate && (
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
          <div className="form-row">
            <div className="form-field">
              <label>Placa registrada</label>
              <input className="input" placeholder="Ejemplo P123ABC" value={form.plate} onChange={(e) => setForm({ ...form, plate: cleanPlate(e.target.value) })} required />
              {searchingPlate && <small>Buscando propietario...</small>}
              {normalizedPlate.length >= 6 && !searchingPlate && vehicleInfo && (
                <small className="success">Propietario: {vehicleInfo.owner_name || "Sin nombre"} | DPI: {vehicleInfo.dpi_user || "N/A"}</small>
              )}
              {normalizedPlate.length >= 6 && !searchingPlate && !vehicleInfo && (
                <small className="error">No se encontró vehículo con esta placa.</small>
              )}
            </div>
            {!isOperator && (
              <>
                <div className="form-field"><label>Velocidad km/h</label><input className="input" type="number" min="0" step="0.01" placeholder="Velocidad km/h" value={form.speed} onChange={(e) => setForm({ ...form, speed: e.target.value })} required /></div>
                <div className="form-field">
                  <label>Semáforo</label>
                  <select className="select" value={form.traffic_light_status} onChange={(e) => setForm({ ...form, traffic_light_status: e.target.value })}>
                    <option value="GREEN">Verde</option>
                    <option value="YELLOW">Amarillo</option>
                    <option value="RED">Rojo</option>
                  </select>
                </div>
                <div className="form-field"><label>ID semáforo</label><input className="input" type="number" min="1" placeholder="1" value={form.traffic_light_id} onChange={(e) => setForm({ ...form, traffic_light_id: e.target.value })} required /></div>
              </>
            )}
            {isOperator && <input type="hidden" value="NO_APLICA" readOnly />}
            <div className="form-field"><label>Ubicación</label><input className="input" placeholder="Ubicación" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="form-field">
              <label>{isOperator ? "Tipo de evento permitido" : "Motivo manual"}</label>
              {isOperator ? (
                <select className="select" value={form.manual_reason} onChange={(e) => setForm({ ...form, manual_reason: e.target.value })}>
                  {OPERATOR_FINE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              ) : (
                <input className="input" placeholder="Parqueo en línea roja" value={form.manual_reason} onChange={(e) => setForm({ ...form, manual_reason: e.target.value })} />
              )}
              {isOperator && <small>El operador no puede crear eventos de semáforo o velocidad; solo estacionamiento/parqueo.</small>}
            </div>
            <button className="btn btn-primary" type="submit">Crear evento</button>
          </div>
        </form>
      )}

      <div className="card table-wrap">
        {isLoading ? <EmptyState message="Cargando eventos..." /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Placa</th>
                <th>Velocidad</th>
                <th>Semáforo</th>
                <th>Ubicación</th>
                <th>Motivo</th>
                <th>Fecha</th>
                <th>Infracción</th>
                {canDelete && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {events.length ? events.map((e) => {
                const id = pick(e, ["id", "event_id"]);
                const violation = pick(e, ["violation", "infraction", "is_violation"], true);
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td><span className="badge info">{pick(e, ["plate", "vehicle_plate", "event_plate"])}</span></td>
                    <td>{pick(e, ["speed", "speed_kmh", "velocity"])} km/h</td>
                    <td>{pick(e, ["traffic_light_status", "semaphore", "light_status"])}</td>
                    <td>{pick(e, ["location", "description", "place", "traffic_light_location"])}</td>
                    <td>{pick(e, ["manual_reason"], "—")}</td>
                    <td>{formatDate(pick(e, ["date", "created_at", "event_date"], null))}</td>
                    <td><span className={`badge ${String(violation).toLowerCase() === "false" ? "success" : "danger"}`}>{String(violation).toLowerCase() === "false" ? "No" : "Sí"}</span></td>
                    {canDelete && <td><button className="btn btn-danger" onClick={() => removeEvent(id)}>Eliminar</button></td>}
                  </tr>
                );
              }) : <tr><td colSpan={canDelete ? 9 : 8}><EmptyState message="No hay eventos registrados." /></td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};
