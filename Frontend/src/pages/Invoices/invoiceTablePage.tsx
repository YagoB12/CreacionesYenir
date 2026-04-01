import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { Alerts } from "../../utils/alerts";
import type { Invoice } from "../../types/invoice.type";
import { InvoiceStatusLabels } from "../../types/invoice.type";
import invoiceService from "../../services/invoice.service";
import "./invoiceTablePage.css";

const InvoicesTablePage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  const itemsPerPage = 10;

  // Filtrado en frontend
  const filteredInvoices =
    statusFilter === null
      ? invoices
      : invoices.filter(inv => inv.status === statusFilter);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentInvoices = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAllInvoices();

      if (response.data && Array.isArray(response.data.data)) {
        setInvoices(response.data.data);
      } else {
        setInvoices([]);
        Alerts.error("Error", "Formato de datos incorrecto");
      }
    } catch (error) {
      console.error(error);
      setInvoices([]);
      Alerts.error("Error", "No se pudieron cargar las facturas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatDate = (iso: Date | string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="dashboard-container">
          <div className="main-content">
            <div className="invoices-admin-container flat">
              <p>Cargando facturas...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="dashboard-container">
        <div className="main-content">
          <div className="invoices-admin-container flat">
            <h1>Administración de Facturas</h1>
            <p className="muted">Total: {filteredInvoices.length}</p>

            {/*BOTONES DE FILTRO */}
            <div className="invoice-filter-container">
              <button
                className="btn btn-warning invoice-filter-btn"
                onClick={() =>
                  setStatusFilter(statusFilter === 1 ? null : 1)
                }
              >
                {statusFilter === 1 ? "Ver todas" : "Ver solo pendientes"}
              </button>
            </div>

            <table className="invoices-admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>N° Factura</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Fecha Emisión</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {currentInvoices.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{invoice.numBill}</td>
                    <td>{invoice.nameClient}</td>
                    <td style={{ maxWidth: 250, whiteSpace: "normal" }}>
                      {invoice.addressClient}
                    </td>
                    <td>{formatDate(invoice.dateEmission)}</td>
                    <td>{formatCurrency(invoice.totalAmount)}</td>
                    <td>
                      <span
                        className={`badge ${invoice.status === 2
                            ? "bg-success"
                            : invoice.status === 3
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                      >
                        {InvoiceStatusLabels[invoice.status]}
                      </span>
                    </td>
                  </tr>
                ))}

                {currentInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty">
                      No hay facturas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINACIÓN */}
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

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default InvoicesTablePage;