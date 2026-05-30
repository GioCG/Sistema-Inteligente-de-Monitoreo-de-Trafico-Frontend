import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../services/api";
import { AppLayout } from "../../layout/AppLayout";
import { EmptyState } from "../../layout/EmptyState";
import { PageHeader } from "../../layout/PageHeader";
import { useMyProfile } from "../../shared/hooks/useMyProfile";
import { useUserDetails } from "../../shared/hooks/useUserDetails";
import { buildEvidenceUrl, formatDate, formatMoney, getRoleName, pick } from "../../utils/auth";
import "./styleProfile.css";

const EvidenceLink = ({ item }) => {
  const url = buildEvidenceUrl(pick(item, ["evidence_path", "image_path", "url"], null), API_BASE_URL);
  return url ? <a className="btn btn-soft" href={url} target="_blank" rel="noreferrer">Ver evidencia</a> : "—";
};

const ProfileEditPanel = ({ profile, user, roleLabel, saveProfile }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile?.name || user?.name || "",
      username: profile?.username || user?.username || "",
      email: profile?.email || user?.email || "",
      address: profile?.address || "",
    });
  }, [profile, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const ok = await saveProfile(form);
    setSaving(false);
    if (ok) setOpen(false);
  };

  return (
    <section className="profile-editor-card profile-inline-editor">
      <div className="profile-editor-header profile-editor-actions">
        <div>
          <span className="profile-kicker">Cuenta de usuario</span>
          <h2>Datos personales</h2>
          <p>Rol actual: {roleLabel}. Desde aquí puedes actualizar nombre, usuario, correo electrónico y dirección.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? "Ocultar formulario" : "Actualizar datos"}
        </button>
      </div>

      {open && (
        <form className="profile-form-grid profile-form-collapsible" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Nombre</label>
            <input className="input dark-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Usuario</label>
            <input className="input dark-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Correo electrónico</label>
            <input className="input dark-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Dirección</label>
            <input className="input dark-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        </form>
      )}
    </section>
  );
};

export const MyProfile = () => {
  const { user, roleLabel } = useUserDetails();
  const roleName = getRoleName(user?.role);
  const isCitizen = roleName === "CITIZEN_ROLE";
  const { vehicles, fines, history, profile, isLoading, saveProfile } = useMyProfile(user?.dpi);
  const totalPaid = history.reduce((acc, f) => acc + Number(pick(f, ["amount", "monto"], 0)), 0);

  return (
    <AppLayout>
      <PageHeader title="Mi perfil" subtitle={`${profile?.name || user?.name || "Usuario"} — ${roleLabel} — DPI: ${user?.dpi || "Sin DPI"}`} />

      <ProfileEditPanel profile={profile} user={user} roleLabel={roleLabel} saveProfile={saveProfile} />

      {isCitizen ? (
        <>
          <section className="citizen-profile-hero" style={{ marginBottom: 18, marginTop: 18 }}>
            <div>
              <span className="profile-kicker">Portal ciudadano</span>
              <h2>{profile?.name || user?.name || "Ciudadano"}</h2>
              <p>Consulta tus vehículos, multas pendientes, evidencias asociadas e historial de pagos.</p>
            </div>
            <div className="citizen-profile-data">
              <strong>Correo</strong><span>{profile?.email || user?.email || "—"}</span>
              <strong>Usuario</strong><span>{profile?.username || user?.username || "—"}</span>
              <strong>Dirección</strong><span>{profile?.address || "—"}</span>
            </div>
          </section>

          <div className="grid grid-3" style={{ marginBottom: 18 }}>
            <div className="stat-card citizen-stat"><p className="stat-label">Vehículos registrados</p><p className="stat-value">{isLoading ? "..." : vehicles.length}</p></div>
            <div className="stat-card citizen-stat"><p className="stat-label">Multas pendientes</p><p className="stat-value">{isLoading ? "..." : fines.length}</p></div>
            <div className="stat-card citizen-stat"><p className="stat-label">Total pagado</p><p className="stat-value">{isLoading ? "..." : formatMoney(totalPaid)}</p></div>
          </div>

          <section className="card citizen-panel" style={{ marginBottom: 18 }}>
            <h2>Mis vehículos</h2>
            <p className="panel-help">Estos son los vehículos registrados o aprobados para tu DPI.</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Placa</th><th>Tipo</th><th>Color</th></tr></thead>
                <tbody>
                  {vehicles.length ? vehicles.map((v) => (
                    <tr key={pick(v, ["plate", "vehicle_plate"])}>
                      <td><span className="badge info">{pick(v, ["plate", "vehicle_plate"])}</span></td>
                      <td>{pick(v, ["type", "vehicle_type"])}</td>
                      <td>{pick(v, ["color"])}</td>
                    </tr>
                  )) : <tr><td colSpan="3"><EmptyState message="No tienes vehículos registrados." /></td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card citizen-panel" style={{ marginBottom: 18 }}>
            <h2>Mis multas pendientes</h2>
            <p className="panel-help">Puedes revisar la evidencia asociada desde el enlace de cada multa.</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Evento</th><th>Placa</th><th>Monto</th><th>Descripción</th><th>Evidencia</th><th>Fecha</th></tr></thead>
                <tbody>
                  {fines.length ? fines.map((f) => (
                    <tr key={pick(f, ["id", "fine_id"])}>
                      <td>{pick(f, ["event_id", "id_event"])}</td>
                      <td><span className="badge info">{pick(f, ["plate", "vehicle_plate", "event_plate"])}</span></td>
                      <td><strong>{formatMoney(pick(f, ["amount", "monto"], 0))}</strong></td>
                      <td>{pick(f, ["description", "details"])}</td>
                      <td><EvidenceLink item={f} /></td>
                      <td>{formatDate(pick(f, ["created_at", "date", "event_date"], null))}</td>
                    </tr>
                  )) : <tr><td colSpan="6"><EmptyState message="No tienes multas pendientes." /></td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card citizen-panel">
            <h2>Historial de pagos</h2>
            <p className="panel-help">Aquí quedan registradas las multas pagadas con el sistema ficticio.</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Referencia</th><th>Evento</th><th>Placa</th><th>Monto</th><th>Evidencia</th><th>Fecha pago</th></tr></thead>
                <tbody>
                  {history.length ? history.map((f) => (
                    <tr key={pick(f, ["id", "history_id"])}>
                      <td>{pick(f, ["payment_reference"])}</td>
                      <td>{pick(f, ["event_id"])}</td>
                      <td><span className="badge success">{pick(f, ["plate"])}</span></td>
                      <td><strong>{formatMoney(pick(f, ["amount"], 0))}</strong></td>
                      <td><EvidenceLink item={f} /></td>
                      <td>{formatDate(pick(f, ["paid_at"], null))}</td>
                    </tr>
                  )) : <tr><td colSpan="6"><EmptyState message="Aún no tienes pagos registrados." /></td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="staff-profile-hero" style={{ marginTop: 18 }}>
            <div className="staff-card-main">
              <span className="profile-kicker">Panel interno</span>
              <h2>{roleLabel}</h2>
              <p>Este perfil pertenece a un usuario administrativo o de operación. Desde el menú lateral puedes revisar eventos, evidencias, stream, multas y solicitudes según tus permisos.</p>
            </div>
            <div className="staff-card-side">
              <strong>DPI</strong><span>{user?.dpi || "—"}</span>
              <strong>Correo</strong><span>{profile?.email || user?.email || "—"}</span>
              <strong>Usuario</strong><span>{profile?.username || user?.username || "—"}</span>
            </div>
          </div>

          <div className="grid grid-3" style={{ marginTop: 18 }}>
            <div className="stat-card staff-stat"><p className="stat-label">Alcance</p><p className="stat-value">Operativo</p></div>
            <div className="stat-card staff-stat"><p className="stat-label">Rol</p><p className="stat-value small-stat">{roleLabel}</p></div>
            <div className="stat-card staff-stat"><p className="stat-label">Estado</p><p className="stat-value small-stat">Activo</p></div>
          </div>
        </>
      )}
    </AppLayout>
  );
};
