import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

import type { RegisterPayload } from "../../types/auth.type";
import { registerUser } from "../../services/auth.services";
import { Alerts } from "../../utils/alerts";
import { validateRegisterForm } from "../../utils/validationRegister";
import { onlyLetters } from "../../utils/validationInputGuards";


import "./register.css";

type FormState = RegisterPayload & { confirmPassword: string };

const initialState: FormState = {
  name: "",
  lastName: "",
  birthDay: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  gender: "",
  province: "",
  canton: "",
  district: "",
  exactAddress: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onChange =
    (key: keyof FormState) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      ) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
      };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const check = validateRegisterForm(form);

    if (!check.valid) {
      const msg = check.message ?? "Revisa los datos del formulario.";
      setError(msg);
      await Alerts.error("Formulario inválido", msg);
      return;
    }

    try {
      setLoading(true);

      const payload: RegisterPayload = {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        birthDay: form.birthDay,
        email: form.email.trim(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim(),
        gender: form.gender,
        province: form.province.trim(),
        canton: form.canton.trim(),
        district: form.district.trim(),
        exactAddress: form.exactAddress.trim(),
      };

      const msg = await registerUser(payload);

      setSuccess(msg);
      await Alerts.success("¡Cuenta creada! ", msg);

      setTimeout(() => navigate(PATHS.LOGIN), 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al registrar";

      setError(message);

      await Alerts.error("No se pudo registrar", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <form className="register-card" onSubmit={onSubmit}noValidate>
        <h1 className="register-title">Crear cuenta</h1>
        <p className="register-subtitle">Completa los datos para registrarte</p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert ok">{success}</div>}

        <div className="grid-2">
          <div className="field">
            <label className="label">Nombre</label>
            <input className="input" value={form.name} onChange={onChange("name")}   onKeyDown={onlyLetters}
/>
          </div>

          <div className="field">
            <label className="label">Apellidos</label>
            <input className="input" value={form.lastName} onChange={onChange("lastName")}   onKeyDown={onlyLetters}
/>
          </div>

          <div className="field">
            <label className="label">Fecha de nacimiento</label>
            <input className="input" type="date" value={form.birthDay} onChange={onChange("birthDay")} max={new Date().toISOString().split("T")[0]}/>
          </div>

          <div className="field">
            <label className="label">Teléfono</label>
            <input className="input" value={form.phoneNumber} onChange={onChange("phoneNumber")}/>
          </div>

          <div className="field">
            <label className="label">Correo</label>
            <input className="input" type="email" value={form.email} onChange={onChange("email")}/>
          </div>

          <div className="field">
            <label className="label">Género</label>
            <select className="input" value={form.gender} onChange={onChange("gender")}>
              <option value="" disabled>Selecciona…</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="label">Contraseña</label>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={onChange("password")}
              minLength={8}
            />
          </div>

          <div className="field">
            <label className="label">Confirmar contraseña</label>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={onChange("confirmPassword")}
              minLength={8}
            />
          </div>
        </div>

        <div className="field">
          <button
            type="button"
            className="ghost"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Ocultar contraseñas" : "Ver contraseñas"}
          </button>
        </div>


        <div className="grid-3">
          <div className="field">
            <label className="label">Provincia</label>
            <input className="input" value={form.province} onChange={onChange("province")}   onKeyDown={onlyLetters}
/>
          </div>
          <div className="field">
            <label className="label">Cantón</label>
            <input className="input" value={form.canton} onChange={onChange("canton")}   onKeyDown={onlyLetters}
/>
          </div>
          <div className="field">
            <label className="label">Distrito</label>
            <input className="input" value={form.district} onChange={onChange("district")}/>
          </div>
        </div>

        <div className="field">
          <label className="label">Dirección exacta</label>
          <textarea className="input textarea" value={form.exactAddress} onChange={onChange("exactAddress")}/>
        </div>

        <button className="btn" type="submit">
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        <p className="footer">
          ¿Ya tienes cuenta?{" "}
          <Link className="link strong" to={PATHS.LOGIN}>
            Volver al login
          </Link>
        </p>
      </form>
    </div>
  );
}
