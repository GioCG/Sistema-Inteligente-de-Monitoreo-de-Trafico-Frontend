import { useMemo, useState } from "react";
import { AppLayout } from "../../layout/AppLayout";
import { EmptyState } from "../../layout/EmptyState";
import { PageHeader } from "../../layout/PageHeader";
import { API_BASE_URL } from "../../services/api";
import { useEvidences } from "../../shared/hooks/useEvidences";
import { canAccess, formatDate, getStoredUser, pick } from "../../utils/auth";

const buildImageUrl = (path) => {
  if (!path || path === "—") return null;
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  const apiRoot = API_BASE_URL.replace(/\/traffic-control\/v1$/i, "");
  if (cleanPath.includes("configs/data")) return `${apiRoot}/${cleanPath}`;
  return `${apiRoot}/configs/data/evidence/${cleanPath}`;
};

export const Evidences = () => {
  const { evidences, isLoading, addEvidence, removeEvidence } = useEvidences();
  const user = getStoredUser();
  const canCreate = canAccess(["ADMIN_ROLE", "OPERATOR_ROLE", "SECURITY_ROLE"], user);
  const canDelete = canAccess(["ADMIN_ROLE", "OPERATOR_ROLE"], user);
  const [form, setForm] = useState({ event_id: "", description: "", images: null });

  const selectedNames = useMemo(() => Array.from(form.images || []).map((file) => file.name).join(", "), [form.images]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ok = await addEvidence(form);
    if (ok) setForm({ event_id: "", description: "", images: null });
  };

  return (
    <AppLayout>
      <PageHeader title="Evidencias" subtitle="Imágenes capturadas por la ESP32-CAM y evidencias asociadas a eventos." />

      {canCreate && (
        <form className="card form-row" onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
          <div className="form-field"><input className="input" placeholder="ID del evento" value={form.event_id} onChange={(e) => setForm({ ...form, event_id: e.target.value })} required /></div>
          <div className="form-field"><input className="input" placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-field">
            <input className="input" type="file" accept="image/*" multiple onChange={(e) => setForm({ ...form, images: e.target.files })} required />
            {selectedNames && <small style={{ color: "var(--muted)" }}>{selectedNames}</small>}
          </div>
          <button className="btn btn-primary" type="submit">Subir evidencia</button>
        </form>
      )}

      <div className="card table-wrap">
        {isLoading ? <EmptyState message="Cargando evidencias..." /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Evento</th>
                <th>Imagen</th>
                <th>Placa</th>
                <th>Fecha</th>
                <th>Descripción</th>
                {canDelete && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {evidences.length ? evidences.map((ev) => {
                const id = pick(ev, ["id", "evidence_id"]);
                const imagePath = pick(ev, ["image", "image_path", "path", "file", "filename", "url"], null);
                const imageUrl = buildImageUrl(imagePath);
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{pick(ev, ["event_id", "id_event"])}</td>
                    <td>{imageUrl ? <a href={imageUrl} target="_blank" rel="noreferrer"><img className="preview-img" src={imageUrl} alt="Evidencia" /></a> : "—"}</td>
                    <td><span className="badge info">{pick(ev, ["plate", "event_plate", "vehicle_plate"])}</span></td>
                    <td>{formatDate(pick(ev, ["created_at", "date"], null))}</td>
                    <td>{pick(ev, ["description", "details", "comment"])}</td>
                    {canDelete && <td><button className="btn btn-danger" onClick={() => removeEvidence(id)}>Eliminar</button></td>}
                  </tr>
                );
              }) : <tr><td colSpan={canDelete ? 7 : 6}><EmptyState message="No hay evidencias registradas." /></td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};
