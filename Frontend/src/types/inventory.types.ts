
export interface Inventory {
  id: number;
  name: string;
  descripcion: string;
  stock: number;
}

export interface CreateInventoryDTO {
  name: string;
  description: string;
  stock: number;
}
export interface UpdateInventoryDTO {
  name?: string;
  description?: string | null;
  stock?: number;
}
