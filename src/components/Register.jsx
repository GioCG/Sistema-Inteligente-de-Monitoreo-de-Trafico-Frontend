import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useRegister } from "../shared/hooks/useRegister";
import iconEmail from "../assets/icons/3.png";
import iconUser from "../assets/icons/4.png";
import iconPassword from "../assets/icons/5.png";

const registerSchema = yup.object().shape({
  dpi: yup.string().matches(/^\d{13}$/, "El DPI debe tener 13 dígitos").required("El DPI es obligatorio"),
  name: yup.string().required("El nombre es obligatorio"),
  username: yup.string().required("El usuario es obligatorio"),
  email: yup.string().email("Debe ser un email válido").required("El email es obligatorio"),
  password: yup.string().min(8, "Mínimo 8 caracteres").required("La contraseña es obligatoria"),
  address: yup.string().required("La dirección es obligatoria"),
});

export const Register = ({ switchAuthHandler }) => {
  const { register: registerUser, isLoading } = useRegister();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(registerSchema) });

  const onSubmit = async (data) => {
    const ok = await registerUser({ ...data, role_id: 4 });
    if (ok) {
      reset();
      switchAuthHandler?.();
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Crear cuenta</h2>
      <p className="form-note">Registro ciudadano para consultar vehículos, solicitudes y multas.</p>

      <div className="container-input"><img src={iconUser} alt="" className="input-icon" /><input placeholder="DPI" {...register("dpi")} /></div>
      {errors.dpi && <p className="form-error">{errors.dpi.message}</p>}

      <div className="container-input"><img src={iconUser} alt="" className="input-icon" /><input placeholder="Nombre completo" {...register("name")} /></div>
      {errors.name && <p className="form-error">{errors.name.message}</p>}

      <div className="container-input"><img src={iconUser} alt="" className="input-icon" /><input placeholder="Usuario" {...register("username")} /></div>
      {errors.username && <p className="form-error">{errors.username.message}</p>}

      <div className="container-input"><img src={iconEmail} alt="" className="input-icon" /><input type="email" placeholder="Correo electrónico" {...register("email")} /></div>
      {errors.email && <p className="form-error">{errors.email.message}</p>}

      <div className="container-input"><img src={iconPassword} alt="" className="input-icon" /><input type="password" placeholder="Contraseña" {...register("password")} /></div>
      {errors.password && <p className="form-error">{errors.password.message}</p>}

      <div className="container-input"><input placeholder="Dirección" {...register("address")} /></div>
      {errors.address && <p className="form-error">{errors.address.message}</p>}

      <button type="submit" className="button" disabled={isLoading}>{isLoading ? "Registrando..." : "Registrarme"}</button>
      <button type="button" className="auth-switch-mobile" onClick={switchAuthHandler}>Ya tengo cuenta</button>
    </form>
  );
};
