import { useMemo, useState } from "react";
import { AppLayout } from "../../layout/AppLayout";
import { PageHeader } from "../../layout/PageHeader";
import "./styleStream.css";

const DEFAULT_STREAM_URL = import.meta.env.VITE_ESP32_STREAM_URL || "http://192.168.1.50/stream";
const DEFAULT_CAPTURE_URL = import.meta.env.VITE_ESP32_CAPTURE_URL || "http://192.168.1.50/jpg";

export const StreamPage = () => {
  const [streamUrl, setStreamUrl] = useState(DEFAULT_STREAM_URL);
  const [captureUrl, setCaptureUrl] = useState(DEFAULT_CAPTURE_URL);
  const [reloadKey, setReloadKey] = useState(0);

  const origin = useMemo(() => {
    try {
      const url = new URL(streamUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      return "";
    }
  }, [streamUrl]);

  const applyIp = (ip) => {
    const clean = ip.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!clean) return;
    setStreamUrl(`http://${clean}/stream`);
    setCaptureUrl(`http://${clean}/jpg`);
    setReloadKey((v) => v + 1);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Stream ESP32-CAM"
        subtitle="Visualización en vivo y captura manual de la cámara del sistema vial."
      />

      <div className="grid stream-grid">
        <section className="card stream-card">
          <div className="stream-toolbar">
            <div>
              <h3>Vista en vivo</h3>
              <p>URL actual: <strong>{streamUrl}</strong></p>
            </div>
            <button className="btn btn-soft" onClick={() => setReloadKey((v) => v + 1)}>Recargar stream</button>
          </div>

          <div className="stream-frame">
            <img
              key={reloadKey}
              src={streamUrl}
              alt="Stream ESP32-CAM"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              onLoad={(e) => {
                e.currentTarget.style.display = "block";
              }}
            />
            <div className="stream-fallback">
              Si no ves video, revisa que la ESP32-CAM esté encendida, conectada a la misma red y que la URL sea correcta.
            </div>
          </div>
        </section>

        <aside className="card stream-settings">
          <h3>Configuración rápida</h3>
          <label>IP o host de la ESP32-CAM</label>
          <div className="form-row">
            <input
              className="input"
              placeholder="192.168.1.50"
              onKeyDown={(e) => {
                if (e.key === "Enter") applyIp(e.currentTarget.value);
              }}
            />
            <button className="btn btn-primary" onClick={(e) => {
              const input = e.currentTarget.parentElement.querySelector("input");
              applyIp(input.value);
            }}>Aplicar</button>
          </div>

          <label>URL stream</label>
          <input className="input" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} />

          <label>URL captura</label>
          <input className="input" value={captureUrl} onChange={(e) => setCaptureUrl(e.target.value)} />

          <div className="stream-actions">
            <a className="btn btn-soft" href={origin || streamUrl} target="_blank" rel="noreferrer">Abrir panel cámara</a>
            <a className="btn btn-primary" href={captureUrl} target="_blank" rel="noreferrer">Tomar captura</a>
          </div>

          <p className="hint">
            Recomendado: define <code>VITE_ESP32_STREAM_URL</code> y <code>VITE_ESP32_CAPTURE_URL</code> en tu archivo <code>.env</code>.
          </p>
        </aside>
      </div>
    </AppLayout>
  );
};
