import { useState } from "react";
import type { Payment } from "../../types/payment.type";
import paymentService from "../../services/payment.service";
import { Alerts } from "../../utils/alerts";
import "./paymentDetailModal.css";

interface Props {
  payment: Payment | null;
  onClose: () => void;
  onVerified: () => void;
}

const PaymentDetailsModal: React.FC<Props> = ({ // esto es un componente modal para mostrar los detalles de un pago,
// con opciones para aprobar o rechazar el pago, y una vista ampliada de la imagen del comprobante.
  payment,
  onClose,
  onVerified,
}) => {
  const [zoomImage, setZoomImage] = useState(false);

  if (!payment) return null;

  const handleVerify = async (status: number) => {
    const result = await Alerts.confirm(
      status === 2 ? "¿Aprobar pago?" : "¿Rechazar pago?",
      "Esta acción no se puede deshacer"
    );

    if (!result.isConfirmed) return;

    try {
      await paymentService.verifyPayment(payment.id, status);

      await Alerts.success(
        status === 2 ? "Pago aprobado" : "Pago rechazado",
        "Operación realizada correctamente"
      );

      onVerified();
      onClose();
    } catch (error) {
      console.error(error);
      Alerts.error("Error", "No se pudo procesar el pago");
    }
  };

  return (
    <>
      {/* Overlay principal */}
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Detalle del Pago</h2>

          <p>
            <strong>Cliente:</strong>{" "}
            {payment.user.name} {payment.user.lastName}
          </p>

          <p>
            <strong>Total:</strong> $
            {payment.totalPrice.toLocaleString()}
          </p>

          <p>
            <strong>Factura:</strong>{" "}
            {payment.bill?.numBill ?? "Sin factura"}
          </p>

          <h4>Productos:</h4>
          <ul>
            {payment.details.map(detail => (
              <li key={detail.id}>
                {detail.productName} — {detail.quantity} x $
                {detail.unitePrice.toLocaleString()}
              </li>
            ))}
          </ul>

          <h4>Comprobante:</h4>
          <img
            src={`${import.meta.env.VITE_API_URL}/api/images/${payment.img}`}
            alt="Comprobante"
            className="payment-proof-img"
            onClick={() => setZoomImage(true)}
          />

          {/* BOTONES */}
          <div className="modal-actions">

            <button
              className="modal-btn approve"
              disabled={payment.status !== 1}
              onClick={() => handleVerify(2)}
            >
              Aprobar
            </button>

            <button
              className="modal-btn reject"
              disabled={payment.status !== 1}
              onClick={() => handleVerify(3)}
            >
              Rechazar
            </button>

            <button
              className="modal-btn close"
              onClick={onClose}
            >
              Cerrar
            </button>

          </div>
        </div>
      </div>

      {/* VISOR DE IMAGEN AMPLIADA */}
      {zoomImage && (
        <div
          className="image-zoom-overlay"
          onClick={() => setZoomImage(false)}
        >
          <img
            src={`${import.meta.env.VITE_API_URL}/api/images/${payment.img}`}
            alt="Zoom comprobante"
            className="image-zoom"
          />
        </div>
      )}
    </>
  );
};

export default PaymentDetailsModal;