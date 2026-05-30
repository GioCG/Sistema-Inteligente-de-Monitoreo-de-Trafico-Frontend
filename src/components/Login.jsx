import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLogin } from "../shared/hooks/useLogin";
import iconEmail from "../assets/icons/3.png";
import iconPassword from "../assets/icons/5.png";

export const Login = ({ switchAuthHandler }) => {
  const { login, isLoading } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    await login({ email: data.email, password: data.password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>Iniciar sesión</h2>
      <p className="form-note">Ingresa al sistema de monitoreo de tráfico.</p>

      <div className="container-input">
        <img src={iconEmail} alt="" className="input-icon" />
        <input type="email" placeholder="Correo electrónico" {...register("email", { required: "El correo es obligatorio" })} />
      </div>
      {errors.email && <p className="form-error">{errors.email.message}</p>}

      <div className="container-input">
        <img src={iconPassword} alt="" className="input-icon" />
        <input type="password" placeholder="Contraseña" {...register("password", { required: "La contraseña es obligatoria" })} />
      </div>
      {errors.password && <p className="form-error">{errors.password.message}</p>}

      <Link className="auth-link" to="/recover-password">¿Olvidaste tu contraseña?</Link>

      <button type="submit" className="button" disabled={isLoading}>{isLoading ? "Validando..." : "Ingresar"}</button>
      <button type="button" className="auth-switch-mobile" onClick={switchAuthHandler}>Crear una cuenta</button>
    </form>
  );
};
