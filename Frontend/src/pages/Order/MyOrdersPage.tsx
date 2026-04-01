import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import orderService from "../../services/order.service";
import { Alerts } from "../../utils/alerts";
import type { Order } from "../../types/order.type";
import {
  ORDER_STATUS_LABELS,
  OrderStatus,
} from "../../types/order.type";

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING_VERIFICATION:
      return "bg-warning";
    case OrderStatus.PAYMENT_CONFIRMED:
      return "bg-success";
    case OrderStatus.PAYMENT_CANCELLED:
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      Alerts.error("Error", "No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const result = await Alerts.confirm(
      "¿Está seguro?",
      "Si elimina este pedido, no podrá ver su estado. El administrador siempre tendrá acceso a la compra."
    );
    if (result.isConfirmed) {
      try {
        await orderService.deleteMyOrder(orderId);
        Alerts.success("Eliminado", "El pedido ha sido eliminado de su vista de pedidos");
        await fetchOrders();
      } catch (error: any) {
        console.error("Error al eliminar pedido:", error);
        Alerts.error("Error", error.message || "No se pudo eliminar el pedido");
      }
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading)
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <p>Cargando pedidos...</p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <h2 className="mb-4">Mis Pedidos</h2>

        {orders.length === 0 ? (
          <p>No tienes pedidos registrados.</p>
        ) : (
          <div className="accordion" id="ordersAccordion">
            {orders.map((order, index) => (
              <div
                key={order.orderId}
                className="accordion-item shadow-sm mb-3"
              >
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                  >
                    Pedido #{order.orderId} — ₡{" "}
                    {order.payment.total.toLocaleString()} —{" "}
                    {new Date(order.dateEmission).toLocaleDateString()}
                  </button>
                </h2>

                <div
                  id={`collapse${index}`}
                  className="accordion-collapse collapse"
                >
                  <div className="accordion-body">

                    <p>
                      <strong>Estado:</strong>{" "}
                      <span
                        className={`badge ${getStatusBadge(order.status as OrderStatus)}`}
                      >
                        {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                      </span>
                    </p>

                    <hr />

                    <h6>Productos:</h6>
                    <ul>
                      {order.payment.details.map((detail) => (
                        <li key={detail.productId}>
                          {detail.productName} — {detail.quantity} x ₡{" "}
                          {detail.unitPrice.toLocaleString()}
                        </li>
                      ))}
                    </ul>

                    {order.payment.img && (
                      <>
                        <hr />
                        <a
                          href={`${import.meta.env.VITE_API_URL}/api/images/${order.payment.img}`}
                          target="_blank"
                        >
                          Ver comprobante
                        </a>
                      </>
                    )}
                    <hr />
                    <div className="d-flex justify-start mt-2">
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ width: 'auto' }}
                        onClick={() => handleDeleteOrder(order.orderId)}
                      >
                        <i className="bi bi-trash"></i> Eliminar pedido
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrdersPage;