import type { PromiseUser, User, UserRole } from "../types/user.types";
import { getAuthToken } from "./auth.services";


const API_URL = import.meta.env.VITE_API_URL;



export async function getUsers(): Promise<PromiseUser> {
  /* const email = "dilan@gmail.com";
   const password = "23251316Dilan";*/

  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json", Authorization: `Bearer ${token}`,
    },
  });
  console.log("Aqui", res)

  if (!res.ok) {
    throw new Error("Error en la petición");
  }

  const json: PromiseUser = await res.json();
  return json;
}

export async function editUser(id: number, form: User) {

  const token = getAuthToken();

  const response = await fetch(`${API_URL}/api/users/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", Authorization: `Bearer ${token}`,

    },
    body: JSON.stringify(form)
  });
  return response

}
export async function deleteUser(id: number) {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/api/users/delete/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json", Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al eliminar usuario");
  }
  return response.json();
}

export async function updateUserRole(id: number, role: UserRole) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/users/updateRole/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ Role: role }),
  });
  console.log("Test 1 "+ role)
  const message = await res.text();

  if (!res.ok) {
    throw new Error(message || "Error al actualizar rol");
  }

  return { message };
}


