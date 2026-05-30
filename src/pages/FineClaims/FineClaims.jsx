import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppLayout } from "../../layout/AppLayout";
import { EmptyState } from "../../layout/EmptyState";
import { PageHeader } from "../../layout/PageHeader";
import { API_BASE_URL, getFineClaims, resolveFineClaim } from "../../services/api";
import { buildEvidenceUrl, canAccess, formatDate, pick } from "../../utils/auth";

const backendMessage = (error, fallback) => {
  const data = error?.response?.data;
  return data?.msg || data?.message || data?.error || fallback;
};

export const FineClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState({});
  const isSystem = canAccess(["SYSTEM_ROLE", "ADMIN_ROLE"], undefined);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await getFineClaims();
      setClaims(res.data?.claims || res.data?.data || []);
    } catch (error) {
      toast.error(backendMessage(error, "Error al cargar reclamos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClaims(); }, []);

  const resolve = async (id, action) => {
    try {
      await resolveFineClaim(id, { action, resolution: resolution[id] || "Revisión realizada por sistema" });
      toast.success(action === "APPROVED" ? "Reclamo aprobado y multa cancelada" : "Reclamo rechazado");
      await loadClaims();
    } catch (error) {
      toast.error(backendMessage(error, "Error al resolver reclamo"));
    }
  };

  const EvidenceLink = ({ item }) => {
    const imagePath = pick(item, ["evidence_path", "image_path", "evidence", "url"], null);
    const url = buildEvidenceUrl(imagePath, API_BASE_URL);
    return url ? <a href={url} target="_blank" rel="noreferrer"><img className="preview-img mini" src={url} alt="Evidencia" /> Ver evidencia</a> : <span>Sin evidencia</span>;
  };

  return (
    <AppLayout>
      <PageHeader
        title="Reclamos de multas"
        subtitle={isSystem ? "Revisa reclamos ciudadanos y aprueba o rechaza según la evidencia." : "Consulta el estado de tus reclamos de multas."}
      />

      <div className="card table-wrap">
        {loading ? <EmptyState message="Cargando reclamos..." /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Multa</th><th>Evento</th><th>Placa</th><th>Ciudadano</th><th>Motivo</th><th>Estado</th><th>Evidencia</th><th>Fecha</th>{isSystem && <th>Revisión</th>}
              </tr>
            </thead>
            <tbody>
              {claims.length ? claims.map((claim) => {
                const id = pick(claim, ["id", "claim_id"]);
                const status = pick(claim, ["status"], "PENDING");
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{pick(claim, ["fine_id"]) || "Cancelada"}</td>
                    <td>{pick(claim, ["event_id"])}</td>
                    <td><span className="badge info">{pick(claim, ["plate"], "—")}</span></td>
                    <td>{pick(claim, ["claimant_name", "claimant_dpi"], "—")}</td>
                    <td>{pick(claim, ["reason"], "—")}</td>
                    <td><span className={`badge ${status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : "warning"}`}>{status}</span></td>
                    <td><EvidenceLink item={claim} /></td>
                    <td>{formatDate(pick(claim, ["created_at"], null))}</td>
                    {isSystem && <td>
                      {status === "PENDING" ? (
                        <div className="grid" style={{ minWidth: 260 }}>
                          <input className="input" placeholder="Comentario de revisión" value={resolution[id] || ""} onChange={(e) => setResolution({ ...resolution, [id]: e.target.value })} />
                          <div className="form-row">
                            <button className="btn btn-soft" onClick={() => resolve(id, "APPROVED")}>Aprobar</button>
                            <button className="btn btn-danger" onClick={() => resolve(id, "REJECTED")}>Rechazar</button>
                          </div>
                        </div>
                      ) : pick(claim, ["resolution"], "—")}
                    </td>}
                  </tr>
                );
              }) : <tr><td colSpan={isSystem ? 10 : 9}><EmptyState message="No hay reclamos registrados." /></td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};
