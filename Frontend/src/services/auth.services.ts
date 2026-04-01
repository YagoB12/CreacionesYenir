import type { LoginPayload, LoginResponse, RegisterPayload } from "../types/auth.type";
import type { ModelStateErrorResponse } from "../types/api.types";

const API_URL = import.meta.env.VITE_API_URL;

function normalizeErrorMessage(data: unknown, fallback = "Ocurrió un error") {
  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const obj = data as ModelStateErrorResponse;

    if (obj.errors && typeof obj.errors === "object") {
      const msgs: string[] = [];
      for (const key of Object.keys(obj.errors)) {
        const arr = obj.errors[key];
        if (Array.isArray(arr)) msgs.push(...arr);
      }
      if (msgs.length) return msgs.join(" • ");
    }

    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
  }

  return fallback;
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function registerUser(payload: RegisterPayload): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log("API_URL:", API_URL);

  const data = await readBody(res);

  if (!res.ok) {
    throw new Error(normalizeErrorMessage(data, "No se pudo registrar"));
  }

  return typeof data === "string" ? data : "Usuario registrado correctamente";
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await readBody(res);

  if (!res.ok) {
    throw new Error(normalizeErrorMessage(data, "Credenciales inválidas"));
  }

  const loginData = data as LoginResponse;

  if (loginData.token) {
    localStorage.setItem("token", loginData.token);
    localStorage.setItem("user", JSON.stringify({
      userId: loginData.userId,
      email: loginData.email,
      name: loginData.name,
      role: loginData.role,
    }));
  }
console.log("TOKEN",loginData.token)
  return loginData;
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
