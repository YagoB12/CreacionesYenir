import type { CreateInventoryDTO, UpdateInventoryDTO} from "../types/inventory.types";
import { getAuthToken } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL;

export async function getAllInventory() {
    const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/inventory`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener el inventario");
  }

  return await res.json();
}


//--------------Create inventory-------------


export async function createInventory(data: CreateInventoryDTO) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/inventory/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res;
}

export async function updateInventory(id: number, data: UpdateInventoryDTO) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/inventory/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar el material");
  }

  return await res.json();
}

// ---------------- DELETE ----------------
export async function deleteInventory(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/inventory/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al eliminar el material");
  }

  return await res.text();
}
