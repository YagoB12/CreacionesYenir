import { useState } from "react";
import type { Payment } from "../../types/payment.type";
import paymentService from "../../services/payment.service";
import { Alerts } from "../../utils/alerts";
import "./paymentDetailModal.css";
import ScoreGauge from "../../components/Modal/ScoreGauge";

interface Props {
  payment: Payment | null;
  onClose: () => void;
  onVerified: () => void;
}

 const STATUS_LABELS: Record<number, { text: string; className: string }> = {
    1: { text: "Revisión manual", className: "validation-revision" },
    2: { text: "Aprobado", className: "validation-aprobado" },
    3: { text: "Rechazado", className: "validation-rechazado" },
  };

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

          {(() => {
            const statusInfo = STATUS_LABELS[payment.status];
            const score = payment.sinpeInfo?.validationScore;

            if (!statusInfo) return null;

            return (
              <div className="validation-section">
                {score != null && <ScoreGauge score={score} />}

                <div className={`validation-text ${statusInfo.className}`}>
                  <strong>Estado de validación:</strong> {statusInfo.text}
                </div>
              </div>
            );
          })()}

          <p>
            <strong>Cliente:</strong>{" "}
            {payment.user.name} {payment.user.lastName}
          </p>

          <p>
            <strong>Total:</strong> ₡
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
                {detail.productName} — {detail.quantity} x ₡
                {detail.unitePrice.toLocaleString()}
              </li>
            ))}
          </ul>

          {payment.sinpeInfo && (
  <>
    <h4>Datos del comprobante (OCR):</h4>
    <ul className="sinpe-info-list">
      <li><strong>Banco:</strong> {payment.sinpeInfo.bank || "No detectado"}</li>
      <li><strong>Referencia:</strong> {payment.sinpeInfo.referenceNumber ?? "No detectado"}</li>
      <li>
        <strong>Monto transferido:</strong>{" "}
        {payment.sinpeInfo.amount != null
          ? `₡${payment.sinpeInfo.amount.toLocaleString()}`
          : "No detectado"}
      </li>
      <li>
        <strong>Fecha de transferencia:</strong>{" "}
        {payment.sinpeInfo.transferDate
          ? new Date(payment.sinpeInfo.transferDate).toLocaleDateString()
          : "No detectada"}
      </li>
      <li><strong>Hora:</strong> {payment.sinpeInfo.transferTime ?? "No detectada"}</li>
      <li><strong>Nombre destino:</strong> {payment.sinpeInfo.destinationName ?? "No detectado"}</li>
      <li><strong>Teléfono destino:</strong> {payment.sinpeInfo.destinationPhone ?? "No detectado"}</li>
    </ul>
  </>
)}

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