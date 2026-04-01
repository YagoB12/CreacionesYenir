import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import paymentService from "../../services/payment.service";
import type { Payment } from "../../types/payment.type";
import { Alerts } from "../../utils/alerts";
import PaymentDetailsModal from "./paymentDetailsModal";
import "./paymentTablePage.css";

const STATUS_LABELS: Record<number, string> = {
  1: "Pendiente",
  2: "Confirmado",
  3: "Rechazado",
};

const PaymentsTablePage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtros
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDate, setFilterDate] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPayments();

      if (response.data && Array.isArray(response.data.data)) {
        setPayments(response.data.data);
      } else {
        setPayments([]);
        Alerts.error("Error", "Formato incorrecto");
      }
    } catch (error) {
      console.error(error);
      Alerts.error("Error", "No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterClient, filterStatus, filterDate]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const fullName = `${p.user.name} ${p.user.lastName}`.toLowerCase();
      const matchClient = filterClient === "" || fullName.includes(filterClient.toLowerCase());
      const matchStatus = filterStatus === "" || p.status === Number(filterStatus);
      const matchDate =
        filterDate === "" ||
        new Date(p.dateCreate).toLocaleDateString("en-CA") === filterDate;
      return matchClient && matchStatus && matchDate;
    });
  }, [payments, filterClient, filterStatus, filterDate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const clearFilters = () => {
    setFilterClient("");
    setFilterStatus("");
    setFilterDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters = filterClient !== "" || filterStatus !== "" || filterDate !== "";

  if (loading) return <p>Cargando pagos...</p>;

  return (
    <AppLayout>
      <div className="dashboard-container">
        <div className="main-content">
          <div className="admin-container flat">
            <h1>Administración de Pagos</h1>

        {/* ── BARRA DE FILTROS ── */}
        <div className="payments-filter-bar">
          <div className="payments-filter-group">
            <label className="payments-filter-label">Cliente</label>
            <input
              type="text"
              className="payments-filter-input"
              placeholder="Buscar por nombre..."
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
          </div>

          <div className="payments-filter-group">
            <label className="payments-filter-label">Estado</label>
            <select
              className="payments-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="1">Pendiente</option>
              <option value="2">Confirmado</option>
              <option value="3">Rechazado</option>
            </select>
          </div>

          <div className="payments-filter-group">
            <label className="payments-filter-label">Fecha</label>
            <input
              type="date"
              className="payments-filter-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <button className="payments-filter-clear" onClick={clearFilters}>
              ✕ Limpiar
            </button>
          )}
        </div>

            <p className="muted">
              Mostrando <strong>{filteredPayments.length}</strong> de {payments.length} pagos
            </p>

            <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Factura</th>
              <th>Estado</th>
              <th>Detalles</th>
            </tr>
          </thead>

              <tbody>
                {currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">
                    No se encontraron pagos con los filtros aplicados.
                  </td>
                </tr>
                ) : (
                  currentPayments.map((payment, index) => (
                    <tr key={payment.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{new Date(payment.dateCreate).toLocaleDateString()}</td>
                      <td>
                        {payment.user.name} {payment.user.lastName}
                      </td>
                      <td>{payment.bill ? payment.bill.numBill : "Sin factura"}</td>
                      <td>
                        <span
                          className={`badge ${
                            payment.status === 2
                              ? "bg-success"
                              : payment.status === 3
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {STATUS_LABELS[payment.status] ?? "Desconocido"}
                        </span>
                      </td>
                      <td>
                        <div className="actions-vertical">
                          <button
                            className="btn"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            Ver detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="pagination-container">
              <button
                className="btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ⬅
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                ➡
              </button>
            </div>

            {/* Modal separado */}
            <PaymentDetailsModal
              payment={selectedPayment}
              onClose={() => setSelectedPayment(null)}
              onVerified={fetchPayments}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentsTablePage;