import { useState } from "react";
import { AppLayout } from "../../layout/AppLayout";
import { EmptyState } from "../../layout/EmptyState";
import { PageHeader } from "../../layout/PageHeader";
import { useRequests } from "../../shared/hooks/useRequests";
import { formatDate, pick } from "../../utils/auth";

const VEHICLE_TYPES = [
  { value: "automovil", label: "Automóvil" },
  { value: "motocicleta", label: "Motocicleta" },
  { value: "camion", label: "Camión" },
  { value: "bus", label: "Bus" },
  { value: "pickup", label: "Pickup" },
];

const getPayload = (request) => {
  const payload = request?.payload;
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  try { return JSON.parse(payload); } catch { return {}; }
};

export const Requests = () => {
  const { requests, isLoading, sendRegisterVehicle, sendClaimVehicle, handleResolve, isOperator, fetchRequests } = useRequests();
  const [form, setForm] = useState({ plate: "", type: "automovil", color: "" });
  const [claimPlate, setClaimPlate] = useState("");
  const [rejectReason, setRejectReason] = useState({});
  const [filter, setFilter] = useState("");

  const STATUS_CLASS = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
  };

  const submitRegister = async () => {
    if (!form.plate || !form.type || !form.color) return;
    const ok = await sendRegisterVehicle(form);
    if (ok) setForm({ plate: "", type: "automovil", color: "" });
  };

  const submitClaim = async () => {
    if (!claimPlate) return;
    const ok = await sendClaimVehicle({ plate: claimPlate });
    if (ok) setClaimPlate("");
  };

  return (
    <AppLayout>
      <PageHeader
        title="Solicitudes"
        subtitle={isOperator ? "Aprobación y rechazo de solicitudes ciudadanas." : "Envía solicitudes para registrar o reclamar vehículos."}
        actions={isOperator && (
          <select className="select" value={filter} onChange={(e) => { setFilter(e.target.value); fetchRequests(e.target.value); }}>
            <option value="">Todas</option>
            <option value="PENDING">Pendientes</option>
            <option value="APPROVED">Aprobadas</option>
            <option value="REJECTED">Rechazadas</option>
          </select>
        )}
      />

      {!isOperator && (
        <div className="grid grid-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginBottom: 18 }}>
          <div className="card">
            <h3>Registrar vehículo</h3>
            <p style={{ color: "var(--muted)", marginTop: 0 }}>El tipo debe coincidir con los valores permitidos por el backend.</p>
            <div className="grid">
              <input
                className="input"
                placeholder="Placa, ejemplo P123ABC"
                value={form.plate}
                maxLength={10}
                onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
              />
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input className="input" placeholder="Color" value={form.color} maxLength={20} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              <button className="btn btn-primary" onClick={submitRegister}>Enviar solicitud</button>
            </div>
          </div>
          <div className="card">
            <h3>Reclamar vehículo</h3>
            <div className="grid">
              <input className="input" placeholder="Placa del vehículo" value={claimPlate} maxLength={10} onChange={(e) => setClaimPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
              <button className="btn btn-primary" onClick={submitClaim}>Reclamar vehículo</button>
            </div>
          </div>
        </div>
      )}

      <div className="card table-wrap">
        {isLoading ? <EmptyState message="Cargando solicitudes..." /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Placa</th>
                <th>Vehículo</th>
                <th>Estado</th>
                <th>Solicitante</th>
                <th>Fecha</th>
                <th>{isOperator ? "Acciones" : "Motivo"}</th>
              </tr>
            </thead>
            <tbody>
              {requests.length ? requests.map((r) => {
                const id = pick(r, ["id", "request_id"]);
                const status = pick(r, ["status"], "PENDING");
                const payload = getPayload(r);
                const plate = pick(r, ["plate", "vehicle_plate"], payload.plate || "—");
                const type = payload.type || "—";
                const color = payload.color || "—";
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{pick(r, ["type", "request_type"])}</td>
                    <td><span className="badge info">{plate}</span></td>
                    <td>{type !== "—" || color !== "—" ? `${type} / ${color}` : "—"}</td>
                    <td><span className={`badge ${STATUS_CLASS[status] || "info"}`}>{status}</span></td>
                    <td>{pick(r, ["requester_name", "requested_by", "name", "dpi_user"])}</td>
                    <td>{formatDate(pick(r, ["created_at", "date"], null))}</td>
                    <td>
                      {isOperator && status === "PENDING" ? (
                        <div className="form-row">
                          <button className="btn btn-soft" onClick={() => handleResolve(id, "APPROVED")}>Aprobar</button>
                          <input className="input" style={{ maxWidth: 180 }} placeholder="Motivo rechazo" value={rejectReason[id] || ""} onChange={(e) => setRejectReason({ ...rejectReason, [id]: e.target.value })} />
                          <button className="btn btn-danger" onClick={() => handleResolve(id, "REJECTED", rejectReason[id])}>Rechazar</button>
                        </div>
                      ) : pick(r, ["reason", "comment"], "—")}
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan="8"><EmptyState message="No hay solicitudes registradas." /></td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};
