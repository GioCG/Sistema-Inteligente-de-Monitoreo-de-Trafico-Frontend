import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AppLayout } from "../../layout/AppLayout";
import { EmptyState } from "../../layout/EmptyState";
import { PageHeader } from "../../layout/PageHeader";
import { getVehicleByPlate } from "../../services/api";
import { useVehicles } from "../../shared/hooks/useVehicles";
import { canAccess, getStoredUser, pick } from "../../utils/auth";
import "./styleVehicles.css";

const cleanPlate = (value = "") => value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const VEHICLE_TYPES = [
  { value: "automovil", label: "Automóvil" },
  { value: "motocicleta", label: "Motocicleta" },
  { value: "camion", label: "Camión" },
  { value: "bus", label: "Bus" },
  { value: "pickup", label: "Pickup" },
];

export const Vehicles = () => {
  const { vehicles, isLoading, removeVehicle, addVehicle } = useVehicles();
  const user = getStoredUser();
  const canManage = canAccess(["ADMIN_ROLE", "OPERATOR_ROLE"], user);
  const [form, setForm] = useState({ plate: "", type: "automovil", color: "", dpi_user: "" });
  const [searchPlate, setSearchPlate] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  const filteredVehicles = useMemo(() => {
    const q = cleanPlate(searchPlate);
    if (!q) return vehicles;
    return vehicles.filter((v) => String(pick(v, ["plate", "vehicle_plate"], "")).toUpperCase().includes(q));
  }, [vehicles, searchPlate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await addVehicle(form);
    if (ok) setForm({ plate: "", type: "automovil", color: "", dpi_user: "" });
  };

  const handleSearchOwner = async () => {
    const plate = cleanPlate(searchPlate);
    if (plate.length < 6) {
      toast.error("Ingresa una placa válida para buscar usuario/propietario.");
      return;
    }

    try {
      setSearching(true);
      const res = await getVehicleByPlate(plate);
      setSearchResult(res.data?.vehicle || null);
      toast.success("Placa encontrada");
    } catch (error) {
      setSearchResult(null);
      toast.error(error?.response?.data?.message || "No se encontró vehículo con esa placa");
    } finally {
      setSearching(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Vehículos" subtitle="Administración de placas y propietarios registrados." />

      <div className="card vehicle-search-card" style={{ marginBottom: 18 }}>
        <div>
          <h3>Buscar usuario por placa</h3>
          <p style={{ color: "var(--muted)", marginTop: 0 }}>Ingresa una placa para ver el propietario asociado al vehículo.</p>
        </div>
        <div className="form-row">
          <input className="input" placeholder="Ejemplo P123ABC" value={searchPlate} onChange={(e) => setSearchPlate(cleanPlate(e.target.value))} />
          <button className="btn btn-primary" type="button" onClick={handleSearchOwner} disabled={searching}>{searching ? "Buscando..." : "Buscar propietario"}</button>
        </div>
        {searchResult && (
          <div className="vehicle-owner-result">
            <span className="badge info">{searchResult.plate}</span>
            <strong>{searchResult.owner_name || "Usuario sin nombre"}</strong>
            <span>DPI: {searchResult.dpi_user || "N/A"}</span>
            <span>Email: {searchResult.owner_email || "N/A"}</span>
            <span>Vehículo: {searchResult.type || "N/A"} / {searchResult.color || "N/A"}</span>
          </div>
        )}
      </div>

      {canManage && (
        <form className="card form-row" onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
          <div className="form-field"><label>Placa</label><input className="input" placeholder="Placa" value={form.plate} onChange={(e) => setForm({ ...form, plate: cleanPlate(e.target.value) })} required /></div>
          <div className="form-field">
            <label>Tipo</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
              {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-field"><label>Color</label><input className="input" placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required /></div>
          <div className="form-field"><label>DPI del usuario</label><input className="input" placeholder="DPI del usuario" value={form.dpi_user} onChange={(e) => setForm({ ...form, dpi_user: e.target.value.replace(/[^0-9]/g, "") })} required /></div>
          <button className="btn btn-primary" type="submit">Agregar</button>
        </form>
      )}

      <div className="card table-wrap">
        {isLoading ? <EmptyState message="Cargando vehículos..." /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Color</th>
                <th>Propietario</th>
                <th>DPI</th>
                <th>Email</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length ? filteredVehicles.map((v) => {
                const plate = pick(v, ["plate", "vehicle_plate"]);
                return (
                  <tr key={plate}>
                    <td><span className="badge info">{plate}</span></td>
                    <td>{pick(v, ["type", "vehicle_type"])}</td>
                    <td>{pick(v, ["color"])} </td>
                    <td>{pick(v, ["owner_name", "owner", "name", "user_name"], "—")} </td>
                    <td>{pick(v, ["dpi_user", "dpi"], "—")}</td>
                    <td>{pick(v, ["owner_email", "email"], "—")}</td>
                    {canManage && <td><button className="btn btn-danger" onClick={() => removeVehicle(plate)}>Eliminar</button></td>}
                  </tr>
                );
              }) : <tr><td colSpan={canManage ? 7 : 6}><EmptyState message="No hay vehículos registrados." /></td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};
