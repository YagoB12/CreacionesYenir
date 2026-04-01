import React from "react";
import Modal from "../../components/Modal/Modal";
import type { Inventory } from "../../types/inventory.types";
import EditInventoryForm from "./EditInventoryForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory | null;
  onSuccess: () => void;
};

const EditInventoryModal: React.FC<Props> = ({ isOpen, onClose, inventory, onSuccess }) => {
  if (!inventory) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Inventario">
      <EditInventoryForm
        isOpen={isOpen}
        onClose={onClose}
        inventory={inventory}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default EditInventoryModal;
