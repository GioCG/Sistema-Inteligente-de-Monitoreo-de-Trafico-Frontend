import { useRef, useState } from "react";
import { Login } from "../../components/Login";
import { Register } from "../../components/Register";
import "./styleAuth.css";

export const Auth = () => {
  const containerRef = useRef(null);
  const [isRegister, setIsRegister] = useState(false);

  const showLogin = () => {
    setIsRegister(false);
    containerRef.current?.classList.remove("toggle");
  };

  const showRegister = () => {
    setIsRegister(true);
    containerRef.current?.classList.add("toggle");
  };

  return (
    <main className="auth-page">
      <div className="auth-overlay" />
      <section className="auth-container" ref={containerRef} aria-label={isRegister ? "Registro" : "Inicio de sesión"}>
        <div className="container-form sign-in-container">
          <Login switchAuthHandler={showRegister} />
        </div>

        <div className="container-form sign-up-container">
          <Register switchAuthHandler={showLogin} />
        </div>

        <div className="container-welcome">
          <div className="welcome welcome-sign-up">
            <span className="welcome-kicker">Sistema inteligente</span>
            <h3>Monitoreo de tráfico</h3>
            <p>Accede al panel para consultar eventos, evidencias, multas y vehículos.</p>
            <button className="button ghost" onClick={showRegister}>Crear cuenta</button>
          </div>

          <div className="welcome welcome-sign-in">
            <span className="welcome-kicker">Control vial</span>
            <h3>¿Ya tienes cuenta?</h3>
            <p>Inicia sesión para continuar usando la plataforma.</p>
            <button className="button ghost" onClick={showLogin}>Iniciar sesión</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Auth;
