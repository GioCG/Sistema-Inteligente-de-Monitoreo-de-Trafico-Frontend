import { useEffect, useState } from "react";
import { AppLayout } from "../../layout/AppLayout";
import { PageHeader } from "../../layout/PageHeader";
import { useMyProfile } from "../../shared/hooks/useMyProfile";
import { useUserDetails } from "../../shared/hooks/useUserDetails";
import "./styleProfile.css";

export const ProfileUpdate = () => {
  const { user, roleLabel } = useUserDetails();
  const { profile, saveProfile } = useMyProfile(user?.dpi);
  const [form, setForm] = useState({ name: "", username: "", email: "", address: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        username: profile.username || "",
        email: profile.email || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveProfile(form);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Actualizar datos"
        subtitle="Modifica tu nombre, usuario, correo electrónico y dirección."
      />

      <section className="profile-editor-card profile-update-page">
        <div className="profile-editor-header">
          <div>
            <span className="profile-kicker">Cuenta de usuario</span>
            <h2>Datos personales</h2>
            <p>Rol actual: {roleLabel}. Estos datos se usan para identificarte dentro del sistema.</p>
          </div>
        </div>

        <form className="profile-form-grid" onSubmit={handleSubmit}>
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
          <button className="btn btn-primary" type="submit">Guardar cambios</button>
        </form>
      </section>
    </AppLayout>
  );
};
