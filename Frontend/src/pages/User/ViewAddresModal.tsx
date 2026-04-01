import React from "react";
import type { User } from "../../types/user.types";
import "./EditUserForm.css"; 
import Modal from "../../components/Modal/Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
};

const ViewAddressModal: React.FC<Props> = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dirección del usuario">
      <div className="address-info">
        <div><b>Provincia:</b> {user.province || "-"}</div>
        <div><b>Cantón:</b> {user.canton || "-"}</div>
        <div><b>Distrito:</b> {user.district || "-"}</div>
        <div><b>Dirección exacta:</b> {user.exactAddress || "-"}</div>
      </div>

      <div className="buttons">
        <button className="btn" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
};

export default ViewAddressModal;
