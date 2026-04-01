import React from "react";
import "./Modal.css";


type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-custom">
        {title && <h2>{title}</h2>}

        {children}

    
      </div>
    </div>
  );
};

export default Modal;
