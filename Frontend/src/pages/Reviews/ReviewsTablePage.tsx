import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { Alerts } from "../../utils/alerts";
import { getAllReviewsAdmin, deleteReviewByAdmin } from "../../services/review.services";
import type { AdminReviewListItem } from "../../types/review.types"

const ReviewsTablePage: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReviewListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const fetchReviews = async () => {
    try {
      const res = await getAllReviewsAdmin();
      setReviews(res.data);
    } catch (error) {
      console.error(error);

      Alerts.error("Error", "No se pudieron cargar las reseñas");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (r: AdminReviewListItem) => {
    const result = await Alerts.confirm("¿Eliminar reseña?",`¿Seguro que deseas eliminar la reseña de "${r.userName}" en "${r.productName}"?`);

    if (!result.isConfirmed) return;

    try {
      await deleteReviewByAdmin(r.id);
      await Alerts.success("Eliminada", "Reseña eliminada correctamente");
      fetchReviews();
    } catch (error) {
      console.error(error);
      Alerts.error("Error", "No se pudo eliminar la reseña");
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  return (
    <AppLayout>
      <div className="dashboard-container">
        <div className="main-content">
          <div className="admin-container flat">
            <h1>Administración de Reseñas</h1>
            <p className="muted">Total: {reviews.length}</p>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Usuario</th>
                  <th>Calificación</th>
                  <th>Comentario</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentReviews.map((r, index) => (
                  <tr key={r.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{r.productName}</td>
                    <td>{r.userName}</td>
                    <td>{r.calification}</td>
                    <td style={{ maxWidth: 420, whiteSpace: "normal" }}>
                      {r.comment || "-"}
                    </td>
                    <td>{formatDate(r.dateCreate)}</td>

                    <td>
                      <div className="actions-vertical">
                        <button className="btn" onClick={() => handleDelete(r)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentReviews.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty">
                      No hay reseñas registradas.
                    </td>
                  </tr>
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReviewsTablePage;
