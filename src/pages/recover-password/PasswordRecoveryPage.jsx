import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForgotPassword, useResetPassword } from "../../shared/hooks";
import "./styleRecoverPassword.css";

export const PasswordRecoveryPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    requestReset,
    loading: loadingReset,
    response: responseReset,
    error: errorReset,
    clearMessages: clearResetMessages,
  } = useForgotPassword();

  const {
    submitNewPassword,
    loading: loadingChange,
    response: responseChange,
    error: errorChange,
    clearMessages: clearChangeMessages,
  } = useResetPassword();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    clearResetMessages();
    const res = await requestReset(email);
    if (!res?.error) setStep(2);
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    clearChangeMessages();
    const cleanToken = token.trim();
    if (cleanToken.length < 20) {
      alert("Token inválido. Copia el token completo enviado por el backend/correo.");
      return;
    }
    setToken(cleanToken);
    setStep(3);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearChangeMessages();

    if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    await submitNewPassword(token, password);
  };

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      setStep(3);
    }
  }, [searchParams]);

  useEffect(() => {
    if (responseChange) {
      const timer = setTimeout(() => navigate("/"), 1500);
      return () => clearTimeout(timer);
    }
  }, [responseChange, navigate]);

  return (
    <main className="recover-page">
      <div className="recover-bg" />
      <section className="recover-card">
        <div className="recover-info">
          <span className="welcome-kicker">Recuperación segura</span>
          <h1>Restablece tu acceso</h1>
          <p>
            Solicita el token de recuperación, valídalo y define una nueva contraseña para continuar usando el sistema.
          </p>
        </div>

        <div className="recover-form-wrap">
          <div className="stepper">
            {[1, 2, 3].map((n) => (
              <span key={n} className={step >= n ? "active" : ""}>{n}</span>
            ))}
          </div>

          {step === 1 && (
            <form className="auth-form" onSubmit={handleEmailSubmit}>
              <h2>¿Olvidaste tu contraseña?</h2>
              <p className="form-note">Ingresa el correo registrado para solicitar el token.</p>
              <input
                className="input"
                type="email"
                placeholder="Correo registrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={clearResetMessages}
                required
              />
              <button className="button" type="submit" disabled={loadingReset}>
                {loadingReset ? "Enviando..." : "Enviar token"}
              </button>
              {responseReset && <p className="success-msg">{responseReset}</p>}
              {errorReset && <p className="error-msg">{errorReset}</p>}
              <Link className="auth-link" to="/">Volver al login</Link>
            </form>
          )}

          {step === 2 && (
            <form className="auth-form" onSubmit={handleTokenSubmit}>
              <h2>Token de recuperación</h2>
              <p className="form-note">Copia el token recibido por correo o generado por tu backend.</p>
              <textarea
                className="textarea"
                placeholder="Token de recuperación"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
              <button className="button" type="submit">Validar token</button>
              <button className="btn btn-ghost" type="button" onClick={() => setStep(1)}>Volver</button>
            </form>
          )}

          {step === 3 && (
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <h2>Nueva contraseña</h2>
              <p className="form-note">Usa una contraseña segura de al menos 8 caracteres.</p>
              <input
                className="input"
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={clearChangeMessages}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button className="button" type="submit" disabled={loadingChange}>
                {loadingChange ? "Cambiando..." : "Cambiar contraseña"}
              </button>
              {responseChange && <p className="success-msg">{responseChange}</p>}
              {errorChange && <p className="error-msg">{errorChange}</p>}
              <button className="btn btn-ghost" type="button" onClick={() => setStep(1)}>Cancelar</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
