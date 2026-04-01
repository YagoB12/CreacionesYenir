import { useState } from "react";
import { Alerts } from "../../utils/alerts";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
  total: number;
}

const PaymentProofModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  total,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFile = e.target.files[0];

    // Validar tamaño (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      Alerts.error("El archivo no puede superar los 5MB");
      return;
    }

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      Alerts.error("Solo se permiten imágenes JPG, PNG o PDF");
      return;
    }

    setFile(selectedFile);

    // Preview solo si es imagen
    if (selectedFile.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      Alerts.error("Debe subir un comprobante de pago");
      return;
    }

    onConfirm(file);
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-white p-4 rounded shadow-lg">

        {/* Título */}
        <h4 className="fw-bold mb-3 text-center">
          Finalizar Compra
        </h4>

        {/* Total */}
        <div className="text-center mb-3">
          <p className="mb-1 text-muted">Total a pagar</p>
          <h3 className="fw-bold">₡ {total.toLocaleString("es-CR")}</h3>
        </div>

        {/* Datos bancarios */}
        <div className="bg-light p-3 rounded mb-3">
          <p className="fw-semibold mb-1">Datos para transferencia:</p>
          <small>
            Banco Popular<br />
            Cuenta: 123-456-789<br />
            SINPE: 8518-2008<br />
            Titular: Aurora Baltodano Cordero
          </small>
        </div>

        {/* Instrucciones */}
        <div className="mb-3">
          <small className="text-muted">
            - Realiza la transferencia por el monto indicado.<br />
            - Sube el comprobante en formato JPG, PNG o PDF.<br />
            - Máximo 5MB.
          </small>
        </div>

        {/* Input */}
        <input
          type="file"
          className="form-control mb-3"
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />

        {/* Preview */}
        {preview && (
          <div className="text-center mb-3">
            <img
              src={preview}
              alt="Preview"
              className="img-fluid rounded"
              style={{ maxHeight: "200px" }}
            />
          </div>
        )}

        {/* Botones */}
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn btn-dark"
            disabled={!file}
            onClick={handleSubmit}
          >
            Confirmar compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofModal;
