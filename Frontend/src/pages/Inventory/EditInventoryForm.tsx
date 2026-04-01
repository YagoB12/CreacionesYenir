import React, { useEffect, useState } from "react";
import type { Inventory } from "../../types/inventory.types";
import type { UpdateInventoryDTO } from "../../types/inventory.types";
import { Alerts } from "../../utils/alerts";
import { updateInventory } from "../../services/inventory.service";
import { validateInventoryName, validateInventoryStock, validateInventoryDescription } from "../../utils/validationInventory";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    inventory: Inventory;
    inventories: Inventory[]
    onSuccess: () => void;
};

const EditInventoryForm: React.FC<Props> = ({ isOpen, onClose, inventory, onSuccess }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    //cargar valores los datos
    useEffect(() => {
        if (!isOpen) return;
        setName(inventory.name ?? "");
        setDescription(inventory.descripcion ?? "");
        setStock(Number(inventory.stock ?? 0));
    }, [isOpen, inventory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        const nameError = validateInventoryName(name);
        if (nameError) {
            await Alerts.error("Validación", nameError);
            return;
        }

        const stockError = validateInventoryStock(stock);
        if (stockError) {
            await Alerts.error("Validación", stockError);
            return;
        }

        const descError = validateInventoryDescription(description);
        if (descError) {
            await Alerts.error("Validación", descError);
            return;
        }

        const confirm = await Alerts.confirm2("¿Guardar cambios?", "Se actualizará el material.");
        if (!confirm.isConfirmed) return;

        const payload: UpdateInventoryDTO = {
            name: name.trim(),
            description: description.trim(),
            stock,
        };

        try {
            setLoading(true);
            const resp = await updateInventory(inventory.id, payload);
            await Alerts.success("Actualizado", resp.message);
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "No se pudo actualizar el material";
            await Alerts.error("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <form onSubmit={handleSubmit}>
            <div className="field">
                <label className="label">Nombre</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="field">
                <label className="label">Descripción</label>
                <textarea className="input textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="field">
                <label className="label">Stock</label>
                <input className="input" type="number" value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                />
            </div>

            <div className="actions" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" className="btn" onClick={onClose} disabled={loading}>
                    Cancelar
                </button>
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar"}
                </button>
            </div>
        </form>
    );
};

export default EditInventoryForm;
