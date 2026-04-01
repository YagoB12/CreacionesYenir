import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { loginUser } from "../../services/auth.services";
import type { LoginPayload } from "../../types/auth.type";
import { Alerts } from "../../utils/alerts";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import "./login.css";
import prototipoImg from "../../assets/images/prototipo.png";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    email.trim() !== "" &&
    password.trim().length >= 8 &&
    !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      await Alerts.error("Campo requerido", "Debes ingresar tu correo");
      return;
    }

    if (!password.trim()) {
      await Alerts.error("Campo requerido", "Debes ingresar tu contraseña");
      return;
    }

    if (password.length < 8) {
      await Alerts.error(
        "Contraseña inválida",
        "Debe tener al menos 8 caracteres"
      );
      return;
    }

    const payload: LoginPayload = {
      email: email.trim(),
      password,
    };

    try {
      setLoading(true);
      await loginUser(payload);

      await Alerts.success("Bienvenido", "Inicio de sesión correcto");
      navigate(PATHS.HOME1);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al iniciar sesión";
      await Alerts.error("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-shell">

        {/* LADO IZQUIERDO - MARCA */}
        <div className="login-brand">
          <img src={prototipoImg} alt="Creaciones Yenir" className="login-image" />
          <h1 className="brand-title">Bienvenido nuevamente</h1>
          <p className="brand-subtitle">
            Accede a tu cuenta y continúa tu experiencia en nuestra tienda.
          </p>
        </div>

        {/* LADO DERECHO - FORM */}
        <form className="login-card" onSubmit={onSubmit}>
          <h2 className="login-heading">Iniciar sesión</h2>

          <div className="field">
            <label className="label">Correo electrónico</label>
            <input
              className="input"
              type="email"
              value={email}
              placeholder="ejemplo@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Contraseña</label>
            <div className="password-wrap">
              <input
                className="input"
                type={show ? "text" : "password"}
                value={password}
                minLength={8}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShow((v) => !v)}
              >
                {show ? (
                  <EyeSlashIcon width={20} />
                ) : (
                  <EyeIcon width={20} />
                )}
              </button>
            </div>
          </div>

          <button className="btn" type="submit" disabled={!canSubmit}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <p className="footer">
            ¿No tienes cuenta?{" "}
            <Link className="link strong" to={PATHS.REGISTER}>
              Crear cuenta
            </Link>
          </p>

          <div className="footer">
            <Link className="link" to={PATHS.HOME1}>
              Volver al inicio
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}