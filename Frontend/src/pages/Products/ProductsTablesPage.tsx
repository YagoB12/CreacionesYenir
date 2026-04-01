import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";

import { deleteProduct, getAllProducts } from "../../services/product.services";
import type { ProductFromApi } from "../../types/product.type";
import EditProductModal from "./editProductModal";
import { Alerts } from "../../utils/alerts";
import { PATHS } from "../../routes/paths";

import "./productsTable.css";

const API_URL = import.meta.env.VITE_API_URL;

const ProductsTablePage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductFromApi | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      Alerts.error("Error", "No se pudieron cargar los productos");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEditModal = (product: ProductFromApi) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const deleteImageByPath = async (imagePath: string) => {
    const res = await fetch(`${API_URL}/api/images/${imagePath}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Error al eliminar la imagen");
    }
  };

  const handleDelete = async (product: ProductFromApi) => {
    const result = await Alerts.confirm("¿Eliminar producto?",`¿Seguro que deseas eliminar "${product.name}"?`);

    if (!result.isConfirmed) return;

    try {
      if (product.img) {
        try {
          await deleteImageByPath(product.img);
        } catch (err) {
          console.warn("No se pudo eliminar la imagen:", err);
        }
      }

      await deleteProduct(product.id);
      await Alerts.success("Eliminado", "Producto eliminado correctamente");
      fetchProducts();
    } catch (error) {
      console.error(error);
      Alerts.error("Error", "No se pudo eliminar el producto");
    }
  };

  const categoryLabel = (category: string) =>
    category === "Clothing" ? "Ropa" : "Accesorios";

  return (
    <AppLayout>
      <div className="dashboard-container">
        <div className="main-content">
          <div className="admin-container flat">
            <h1>Administración de Productos</h1>
            <p className="muted">Total: {products.length}</p>

            <button
              className="btn btn-add"
              onClick={() => navigate(PATHS.PRODUCT_ADD)}
            >
              Agregar producto
            </button>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Color</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Material</th>
                  <th>Extra</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentProducts.map((p, index) => (
                  <tr key={p.id}>
                    <td>{indexOfFirstItem + index + 1}</td>

                    <td>
                      {p.img ? (
                        <img
                          src={`${API_URL}/api/images/${p.img}`}
                          alt={p.name}
                          className="product-img"
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>{p.name}</td>
                    <td>{categoryLabel(p.category)}</td>
                    <td>{p.color ?? "-"}</td>
                    <td>{p.price}</td>
                    <td>{p.stock}</td>
                    <td>{p.typeMaterial ?? "-"}</td>

                    <td>
                      {p.category === "Clothing"
                        ? `Talla: ${p.size ?? "-"} • ${p.typeClothes ?? "-"} • ${p.typeGender ?? "-"}`
                        : `H:${p.height ?? "-"} • L:${p.length ?? "-"} • W:${p.width ?? "-"}`}
                    </td>

                    <td>
                      <div className="actions-vertical">
                        <button
                          className="btn"
                          onClick={() => openEditModal(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleDelete(p)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentProducts.length === 0 && (
                  <tr>
                    <td colSpan={10} className="empty">
                      No hay productos registrados.
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

            <EditProductModal
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              product={selectedProduct}
              onSuccess={fetchProducts}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductsTablePage;
