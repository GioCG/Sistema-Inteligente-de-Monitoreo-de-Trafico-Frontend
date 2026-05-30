import { useState } from "react";
import { AppLayout } from "../../layout/AppLayout";
import { EmptyState } from "../../layout/EmptyState";
import { PageHeader } from "../../layout/PageHeader";
import { API_BASE_URL } from "../../services/api";
import { useFines } from "../../shared/hooks/useFines";
import { buildEvidenceUrl, canAccess, formatDate, formatMoney, getStoredUser, pick } from "../../utils/auth";

const OPERATOR_FINE_TYPES = [
  "Parqueo en línea roja",
  "Estacionamiento en zona prohibida",
  "Parqueo en doble fila",
  "Obstrucción de entrada o salida",
  "Parqueo sobre paso peatonal",
  "Parqueo sobre acera",
];

export const Fines = () => {
  const { fines, history, isLoading, addFine, removeFine, payFineById, claimFineById } = useFines();
  const user = getStoredUser();
  const isOperator = canAccess(["OPERATOR_ROLE"], user);
  const canCreate = canAccess(["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE"], user);
  const canDelete = canAccess(["ADMIN_ROLE", "OPERATOR_ROLE"], user);
  const canPay = canAccess(["CITIZEN_ROLE", "ADMIN_ROLE", "OPERATOR_ROLE"], user);
  const canClaim = canAccess(["CITIZEN_ROLE"], user);
  const [form, setForm] = useState({ event_id: "", amount: "500", description: OPERATOR_FINE_TYPES[0] });
  const [payment, setPayment] = useState({ fineId: null, payer_name: "", card_number: "", payment_method: "Pago ficticio" });
  const [claim, setClaim] = useState({ fineId: null, reason: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ok = await addFine({ event_id: form.event_id, amount: form.amount, description: form.description });
    if (ok) setForm({ event_id: "", amount: "500", description: OPERATOR_FINE_TYPES[0] });
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    const ok = await payFineById(payment.fineId, payment);
    if (ok) setPayment({ fineId: null, payer_name: "", card_number: "", payment_method: "Pago ficticio" });
  };

  const submitClaim = async (event) => {
    event.preventDefault();
    const ok = await claimFineById(claim.fineId, claim.reason);
    if (ok) setClaim({ fineId: null, reason: "" });
  };

  const EvidenceLink = ({ item }) => {
    const imagePath = pick(item, ["evidence_path", "image_path", "evidence", "url"], null);
    const url = buildEvidenceUrl(imagePath, API_BASE_URL);
    return url ? (
      <a className="evidence-mini-link" href={url} target="_blank" rel="noreferrer" title="Abrir evidencia">
        <img className="preview-img mini" src={url} alt="Evidencia" />
        <span>Ver evidencia</span>
      </a>
    ) : <span>Sin evidencia</span>;
  };

  return (
    <AppLayout>
      <PageHeader title="Multas" subtitle={isOperator ? "Multas manuales de estacionamiento/parqueo sobre eventos creados por ti." : "Consulta multas pendientes, evidencia asociada y pagos ficticios."} />

      {canCreate && (
        <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
          <div className="form-row">
            <div className="form-field">
              <label>ID del evento</label>
              <input className="input" placeholder="Ejemplo: 15" value={form.event_id} onChange={(e) => setForm({ ...form, event_id: e.target.value })} required />
            </div>
            <div className="form-field"><label>Monto</label><input className="input" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
            <div className="form-field">
              <label>{isOperator ? "Tipo de multa permitido" : "Descripción"}</label>
              {isOperator ? (
                <select className="select" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required>
                  {OPERATOR_FINE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              ) : (
                <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              )}
              {isOperator && <small>Solo puedes crear multas de estacionamiento/parqueo. Las multas de semáforo y velocidad las genera seguridad/cámara.</small>}
            </div>
            <button className="btn btn-primary" type="submit">Crear multa</button>
          </div>
        </form>
      )}

      {payment.fineId && (
        <form className="card" onSubmit={submitPayment} style={{ marginBottom: 18 }}>
          <h3 style={{ marginTop: 0 }}>Pago ficticio de multa #{payment.fineId}</h3>
          <div className="form-row">
            <div className="form-field"><label>Nombre del pagador</label><input className="input" value={payment.payer_name} onChange={(e) => setPayment({ ...payment, payer_name: e.target.value })} required /></div>
            <div className="form-field"><label>Número de tarjeta ficticia</label><input className="input" value={payment.card_number} onChange={(e) => setPayment({ ...payment, card_number: e.target.value })} placeholder="4111 1111 1111 1111" required /></div>
            <button className="btn btn-primary" type="submit">Confirmar pago</button>
            <button className="btn btn-ghost" type="button" onClick={() => setPayment({ fineId: null, payer_name: "", card_number: "", payment_method: "Pago ficticio" })}>Cancelar</button>
          </div>
          <small>Este pago es de demostración. No procesa dinero real.</small>
        </form>
      )}

      {claim.fineId && (
        <form className="card" onSubmit={submitClaim} style={{ marginBottom: 18 }}>
          <h3 style={{ marginTop: 0 }}>Reclamo de multa #{claim.fineId}</h3>
          <p style={{ color: "var(--muted)", marginTop: 0 }}>Describe por qué consideras que la multa es errónea. El rol sistema revisará la evidencia.</p>
          <div className="form-row">
            <div className="form-field" style={{ minWidth: 280, flex: 1 }}>
              <label>Motivo del reclamo</label>
              <textarea className="input" rows="3" value={claim.reason} onChange={(e) => setClaim({ ...claim, reason: e.target.value })} placeholder="Ejemplo: el vehículo no estaba estacionado en línea roja / la placa no corresponde" required />
            </div>
            <button className="btn btn-primary" type="submit">Enviar reclamo</button>
            <button className="btn btn-ghost" type="button" onClick={() => setClaim({ fineId: null, reason: "" })}>Cancelar</button>
          </div>
        </form>
      )}

      <section className="card table-wrap" style={{ marginBottom: 18 }}>
        <h2>Multas pendientes {user?.role === 1 ? "del sistema" : ""}</h2>
        {isLoading ? <EmptyState message="Cargando multas..." /> : (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Evento</th><th>Placa</th><th>Propietario</th><th>Monto</th><th>Descripción</th><th>Evidencia</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {fines.length ? fines.map((fine) => {
                const id = pick(fine, ["id", "fine_id"]);
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{pick(fine, ["event_id", "id_event"])}</td>
                    <td><span className="badge info">{pick(fine, ["plate", "vehicle_plate", "event_plate"])}</span></td>
                    <td>{pick(fine, ["owner_name", "name", "user_name", "owner_dpi"], "—")}</td>
                    <td><strong>{formatMoney(pick(fine, ["amount", "monto"], 0))}</strong></td>
                    <td>{pick(fine, ["description", "details"])} </td>
                    <td><EvidenceLink item={fine} /></td>
                    <td>{formatDate(pick(fine, ["created_at", "date", "event_date"], null))}</td>
                    <td className="form-row">
                      {canPay && <button className="btn btn-primary" onClick={() => setPayment({ ...payment, fineId: id })}>Pagar</button>}
                      {canClaim && <button className="btn btn-soft" onClick={() => setClaim({ fineId: id, reason: "" })}>Reclamar</button>}
                      {canDelete && <button className="btn btn-danger" onClick={() => removeFine(id)}>Eliminar</button>}
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan="9"><EmptyState message="No hay multas pendientes." /></td></tr>}
            </tbody>
          </table>
        )}
      </section>

      <section className="card table-wrap">
        <h2>Historial de multas pagadas {user?.role === 1 ? "del sistema" : ""}</h2>
        {isLoading ? <EmptyState message="Cargando historial..." /> : (
          <table className="data-table">
            <thead>
              <tr><th>Historial</th><th>Multa original</th><th>Evento</th><th>Placa</th><th>Monto</th><th>Referencia</th><th>Evidencia</th><th>Pagado</th></tr>
            </thead>
            <tbody>
              {history.length ? history.map((fine) => (
                <tr key={pick(fine, ["id", "history_id"])}>
                  <td>{pick(fine, ["id", "history_id"])}</td>
                  <td>{pick(fine, ["fine_id"])}</td>
                  <td>{pick(fine, ["event_id"])}</td>
                  <td><span className="badge success">{pick(fine, ["plate"])}</span></td>
                  <td><strong>{formatMoney(pick(fine, ["amount"], 0))}</strong></td>
                  <td>{pick(fine, ["payment_reference"])}</td>
                  <td><EvidenceLink item={fine} /></td>
                  <td>{formatDate(pick(fine, ["paid_at"], null))}</td>
                </tr>
              )) : <tr><td colSpan="8"><EmptyState message="Aún no hay pagos en historial." /></td></tr>}
            </tbody>
          </table>
        )}
      </section>
    </AppLayout>
  );
};
