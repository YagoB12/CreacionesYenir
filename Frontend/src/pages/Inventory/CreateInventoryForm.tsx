import React, { useState } from "react";
import "./createInventoryForm.css"; 
import type { CreateInventoryDTO, Inventory } from "../../types/inventory.types";
import { Alerts } from "../../utils/alerts";
import { createInventory } from "../../services/inventory.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  inventories: Inventory[]; 

};

const CreateInventoryForm: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  inventories,

}) => {
  const [form, setForm] = useState<CreateInventoryDTO>({
    name: "",
    description: "",
    stock: 0,
  });

  const [error, setError] = useState({
  name: "",
  stock: "",
  description: "",
});


  if (!isOpen) return null;

 const validateField = (name: string, value: string | number) => {
  let message = "";

  if (name === "name") {
    if (!value || value.toString().trim() === "") {
      message = "El nombre es obligatorio";
    }
  }

  if (name === "stock") {
    if (value === "" || value === null) {
      message = "El stock es obligatorio";
    } else if (Number(value) <= 0) {
      message = "El stock debe ser mayor a 0";
    }
  }

  if (name === "description") {
    if (!value || value.toString().trim() === "") {
      message = "La descripción es obligatoria";
    }
  }

  setError((prev) => ({
    ...prev,
    [name]: message,
  }));

  return message === "";
};


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    validateField(name, value);

    setForm({
      ...form,
      [name]: name === "stock" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  const isValid =
  validateField("name", form.name) &&
  validateField("stock", form.stock) &&
  validateField("description", form.description);


    if (!isValid) {
      await Alerts.alert(
        "Formulario inválido",
        "Corrige los errores antes de guardar"
      );
      return;
    }
    // Validar nombre duplicado en frontend
const exists = inventories.some(
  (item) =>
    item.name.toLowerCase().trim() === form.name.toLowerCase().trim()
);

if (exists) {
  await Alerts.alert("Alerta", "Ya existe un material con ese nombre");
  return;
}


    try {
      const confirm = await Alerts.confirm2(
        "¿Crear inventario?",
        "¿Desea guardar este item?"
      );

      if (!confirm.isConfirmed) return;

      const response = await createInventory(form);
      console.log(response.json)
      if (!response.ok) {
        await Alerts.error("Error", "No se pudo crear el inventario");
        return;
      }

      await Alerts.success(
        "Creado",
        "Inventario agregado correctamente"
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      await Alerts.error("Error", "Error de conexión");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          {error.name && <span className="error-text">{error.name}</span>}
        </div>

        
        <div>
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
          />
          {error.stock && <span className="error-text">{error.stock}</span>}
        </div>
        <div>
        <label>Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />
        {error.description && (
          <span className="error-text">{error.description}</span>
        )}
      </div>
        <div>
          
        </div>
        <button type="submit" className="btn">
          Guardar
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default CreateInventoryForm;
