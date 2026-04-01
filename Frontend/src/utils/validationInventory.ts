export function validateInventoryName(name: string): string | null {
  if (!name.trim()) {
    return "El nombre es obligatorio.";
  }

  if (name.trim().length > 100) {
    return "El nombre debe tener máximo 100 caracteres.";
  }

  return null;
}

export function validateInventoryStock(stock: number): string | null {
  if (stock < 0) {
    return "El stock no puede ser negativo.";
  }
  return null;
}

export function validateInventoryDescription(description: string): string | null {
  if (description.trim().length > 500) {
    return "La descripción debe tener máximo 500 caracteres.";
  }
  return null;
}
