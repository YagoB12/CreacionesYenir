import type { AddToCartDTO } from "../types/shoppingCart.type";
import { getAuthToken } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL;

export const getCart = async () => {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/shoppingcart`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error en la petición");
  }

  return await res.json();
};



export const addToCart = async (data: AddToCartDTO) => {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/shoppingcart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return await res.text(); // "Producto agregado al carrito"
};


export const editQuantityProduct = async (
  productId: number,
  quantity: number
) => {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/shoppingcart/editquantity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return await res.text();
};


export const deleteProductCart = async (id: number) => {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/shoppingcart/delete/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(res)
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return await res.text(); // "Producto agregado al carrito"
};