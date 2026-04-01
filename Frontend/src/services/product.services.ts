
import type { GetAllProductsResponse, ProductFromApi } from "../types/product.type";

import type { CreateProductResponse } from "../types/product.type";
import { getAuthToken } from "./auth.services";



const API_URL = import.meta.env.VITE_API_URL;


export async function createProduct(formData: FormData): Promise<CreateProductResponse> {
    const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/products/create`, {
    method: "POST",
     headers: {
      Authorization: `Bearer ${token}`, 
    },
    body: formData, 
    
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Error al crear producto");
  }

  return res.json();
}



export async function getAllProducts(): Promise<GetAllProductsResponse> {
  
  const res = await fetch(`${API_URL}/api/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error al obtener los productos");
  }

  const json: GetAllProductsResponse = await res.json();
  return json;
}

export async function getProductById(id: number): Promise<ProductFromApi> {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error al obtener el producto");
  }

  const json: ProductFromApi = await res.json();
  return json;
}

export async function updateProduct(id: number, formData: FormData) {
    const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/products/update/${id}`, {
    
    method: "PUT",
     headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, 
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Error al actualizar producto");
  }

  return res.text();
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/api/products/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const message = await res.text(); 

  if (!res.ok) {
    throw new Error(message || "Error al eliminar producto");
  }

  return { message };
}


export async function getProducts(id: number): Promise<ProductFromApi> {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  const data = await readBody(res);

  if (!res.ok) {
    throw new Error("No se pudo cargar el producto");
  }

  return data as ProductFromApi; 
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

