import type { ApiResponse, Canton, Distrito, Provincia } from "../types/geo.type";

const BASE_URL = "https://api-geo-cr.vercel.app";

export const getProvincias = async (): Promise<Provincia[]> => {
  const response = await fetch(`${BASE_URL}/provincias?limit=7&page=1`);
  if (!response.ok) throw new Error("Error al obtener provincias");

  const result: ApiResponse<Provincia[]> = await response.json();
  return result.data;
};

export const getCantonesByProvincia = async (
  idProvincia: number
): Promise<Canton[]> => {
  const response = await fetch(
    `${BASE_URL}/provincias/${idProvincia}/cantones?limit=50&page=1`
  );
  if (!response.ok) throw new Error("Error al obtener cantones");

  const result: ApiResponse<Canton[]> = await response.json();
  return result.data;
};

// NUEVO: obtener distritos por cantón
export const getDistritosByCanton = async (
  idCanton: number
): Promise<Distrito[]> => {
  const response = await fetch(
    `${BASE_URL}/cantones/${idCanton}/distritos?limit=50&page=1`
  );
  if (!response.ok) throw new Error("Error al obtener distritos");

  const result: ApiResponse<Distrito[]> = await response.json();
  return result.data;
};
