import React, { useState, useEffect } from "react";
import "./tableInventor.css";
import AppLayout from "../../layout/AppLayout";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import type { Inventory } from "../../types/inventory.types";
import { getAllInventory, deleteInventory } from "../../services/inventory.service";
import { useNavigate } from "react-router-dom";
import CreateInventoryForm from "./CreateInventoryForm";
import Modal from "../../components/Modal/Modal";
import { Alerts } from "../../utils/alerts";
import EditInventoryModal from "./EditInventoryModal";


const TableInventory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockOrder, setStockOrder] = useState<"asc" | "desc" | "">("");

  const [inventories, setInventory] = useState<Inventory[]>([]);

  const [filteredInventories, setFilteredInventories] =
    useState<Inventory[]>(inventories);


  // estados para editar
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);


  const [search, setSearch] = useState("");
  const fetchInventory = async () => {
    try {
      const response = await getAllInventory();
      setInventory(response.data);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    }
  };

  //  FILTRO POR NOMBRE
  useEffect(() => {
    let result = [...inventories];

    //  Filtro por nombre
    if (search) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    //  Orden por stock
    if (stockOrder === "asc") {
      result.sort((a, b) => a.stock - b.stock);
    } else if (stockOrder === "desc") {
      result.sort((a, b) => b.stock - a.stock);
    }

    setFilteredInventories(result);
    setCurrentPage(1);
  }, [search, inventories, stockOrder]);

  useEffect(() => {
    fetchInventory();
  }, []);

  // abrir modal editar 
  const openEditModal = (item: Inventory) => {
    setSelectedInventory(item);
    setIsEditOpen(true);
  };

  const handleDelete = async (item: Inventory) => {
    const result = await Alerts.confirm("¿Eliminar material?", `¿Seguro que deseas eliminar "${item.name}"?`);
    if (!result.isConfirmed) return;

    try {
      const resp = await deleteInventory(item.id);
      await Alerts.success("Eliminado", resp);
      fetchInventory();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "No se pudo eliminar el material";
      await Alerts.error("Error", msg);
    }
  };


  //  PAGINACIÓN
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventories.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredInventories.length / itemsPerPage);

  return (
    <AppLayout>
      <div className="dashboard-container">
        <div className="main-content">
          <div className="admin-container flat">
            <h1>Administración de Inventario</h1>

            {/*  BUSCADOR */}
            <div
              className="d-flex align-items-center mb-3"
              style={{ maxWidth: "400px" }}
            >
              <div className="position-relative w-100">
                <MagnifyingGlassIcon
                  className="position-absolute top-50 start-0 translate-middle-y ms-3"
                  style={{ width: 18, height: 18, opacity: 0.6 }}
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Buscar por nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-add"
              onClick={() => setIsModalOpen(true)}
              style={{ marginBottom: 16 }}
            >
              Agregar Inventario
            </button>
            {/* TABLA */}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th style={{ cursor: "pointer" }}
                    onClick={() =>
                      setStockOrder(stockOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    Stock {stockOrder === "asc" ? "⬆" : stockOrder === "desc" ? "⬇" : ""}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.descripcion}</td>
                    <td>
                      {item.stock === 0 ? (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          {item.stock} (No hay materiales )
                        </span>
                      ) : (
                        item.stock
                      )}
                    </td>
                    <td>
                      <div className="actions-vertical">
                        <button className="btn" onClick={() => openEditModal(item)}>
                          Editar
                        </button>

                        <button className="btn" onClick={() => handleDelete(item)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      No se encontraron productos
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Inventario"
      >
        <CreateInventoryForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inventories={inventories}   // 👈 NUEVO
          onSuccess={() => {
            fetchInventory();
            setIsModalOpen(false);
          }}
        />

      </Modal>

      <EditInventoryModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        inventory={selectedInventory}
        onSuccess={fetchInventory}
      />

    </AppLayout>
  );
};

export default TableInventory;
