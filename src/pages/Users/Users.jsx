import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AppLayout } from "../../layout/AppLayout";
import { EmptyState } from "../../layout/EmptyState";
import { PageHeader } from "../../layout/PageHeader";
import { getRoles, getUsers, updateUserRole } from "../../services/api";
import { getRoleLabel, pick } from "../../utils/auth";
import "./styleUsers.css";

const cleanSearch = (value = "") => String(value).trim().toLowerCase();

const backendMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.msg) return data.msg;
  if (data?.error) return data.error;
  if (Array.isArray(data?.errors)) return data.errors.map((e) => e.msg || e.message).join(" | ");
  return fallback;
};

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingDpi, setSavingDpi] = useState(null);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersRes.data?.users || []);
      setRoles(rolesRes.data?.roles || []);
    } catch (error) {
      toast.error(backendMessage(error, "Error al cargar usuarios y roles"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredUsers = useMemo(() => {
    const q = cleanSearch(search);
    if (!q) return users;

    return users.filter((user) => {
      const text = [user.dpi, user.name, user.username, user.email, user.role_name, user.role_id]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [users, search]);

  const handleRoleChange = async (dpi, roleId) => {
    const confirmed = window.confirm("¿Confirmas cambiar el rol de este usuario?");
    if (!confirmed) return;

    setSavingDpi(dpi);
    try {
      const res = await updateUserRole(dpi, roleId);
      toast.success(res.data?.msg || "Rol actualizado correctamente");
      await fetchData();
    } catch (error) {
      toast.error(backendMessage(error, "Error al actualizar rol"));
    } finally {
      setSavingDpi(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Usuarios y roles"
        subtitle="Apartado exclusivo para administrador. Permite consultar usuarios y cambiar su rol en el sistema."
      />

      <div className="card users-toolbar">
        <div>
          <h3>Administración de roles</h3>
          <p>Busca por DPI, nombre, correo o rol. Luego selecciona el nuevo rol del usuario.</p>
        </div>
        <input
          className="input users-search"
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card table-wrap">
        {loading ? <EmptyState message="Cargando usuarios..." /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>DPI</th>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol actual</th>
                <th>Estado</th>
                <th>Cambiar rol</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? filteredUsers.map((user) => {
                const dpi = pick(user, ["dpi"]);
                const roleName = pick(user, ["role_name"], "");
                const roleId = Number(pick(user, ["role_id"], 0));
                const active = Boolean(pick(user, ["estate"], true));

                return (
                  <tr key={dpi}>
                    <td>{dpi}</td>
                    <td><strong>{pick(user, ["name"])}</strong></td>
                    <td>{pick(user, ["username"])}</td>
                    <td>{pick(user, ["email"])}</td>
                    <td><span className="badge info">{getRoleLabel(roleName || roleId)}</span></td>
                    <td><span className={`badge ${active ? "success" : "danger"}`}>{active ? "Activo" : "Inactivo"}</span></td>
                    <td>
                      <div className="role-change-box">
                        <select
                          className="select"
                          value={roleId || ""}
                          disabled={savingDpi === dpi}
                          onChange={(e) => handleRoleChange(dpi, e.target.value)}
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>{getRoleLabel(role.role)} ({role.role})</option>
                          ))}
                        </select>
                        {savingDpi === dpi && <small>Guardando...</small>}
                      </div>
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={7}><EmptyState message="No hay usuarios para mostrar." /></td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};
