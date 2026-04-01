import React, { useState, useEffect } from "react";
import "./tableUser.css";
import { deleteUser, getUsers, updateUserRole } from "../../services/userService";
import type { User } from "../../types/user.types";
import AppLayout from "../../layout/AppLayout";
import { changeDate } from "../../utils/validationDate";
import EditUserModal from "../User/editUserModal";
import ViewAddressModal from "./ViewAddresModal";
import { Alerts } from "../../utils/alerts";


type RoleValue = 0 | 1 | "CLIENT" | "ADMIN";

const isAdminRole = (role: RoleValue): boolean => role === 1 || role === "ADMIN";

const toRoleNumber = (role: RoleValue): 0 | 1 => (isAdminRole(role) ? 1 : 0);


const TableUser: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  /*
  const mockUsers: User[] = [
    {
      id: 1,
      name: "Ana",
      lastName: "Pérez",
      birthDay: "2000-05-10",
      phoneNumber: "8888-1111",
      gender: "F",
      province: "San José",
      canton: "Central",
      district: "Carmen",
      exactAddress: "Casa roja",
      email: "ana@gmail.com",
      role: "Admin",
    },
    {
      id: 2,
      name: "Luis",
      lastName: "Gómez",
      birthDay: "1998-03-20",
      phoneNumber: "8888-2222",
      gender: "M",
      province: "Alajuela",
      canton: "Central",
      district: "San José",
      exactAddress: "Frente al parque",
      email: "luis@gmail.com",
      role: "User",
    },
    {
      id: 3,
      name: "María",
      lastName: "Rodríguez",
      birthDay: "2001-11-02",
      phoneNumber: "8888-3333",
      gender: "F",
      province: "Cartago",
      canton: "Central",
      district: "Oriental",
      exactAddress: "Casa azul",
      email: "maria@gmail.com",
      role: "User",
    }
      
  ];
  */
  const [persons, setPerson] = useState<User[]>([
  ])

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = persons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(persons.length / itemsPerPage);


  const fetchUsers = async () => {
    try {
      const dataResult = await getUsers();
      setPerson(dataResult.data);
      // setPerson(mockUsers);

    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const currentUserId = currentUser.userId;


  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const openAddressModal = (user: User) => {
    setSelectedUser(user);
    setIsAddressModalOpen(true);
  };
  const handleDelete = async (user: User) => {
    const result = await Alerts.confirm(
      "¿Eliminar usuario?",
      `¿Seguro que quieres eliminar a ${user.name} ${user.lastName}?`
    );

    if (!result.isConfirmed) return;

    try {
      await deleteUser(user.id);

      await Alerts.success("Eliminado", "Usuario eliminado correctamente");

      fetchUsers(); // recarga la tabla
    } catch (error) {
      console.error(error);
      Alerts.error("Error", "No se pudo eliminar el usuario");
    }
  };

  const handleToggleRoleFromList = async (user: User) => {
    if (user.id === currentUserId){
      await Alerts.error(
        "Acción no permitida",
        "No puedes cambiar tu propio rol de administrador"
      );
      return;
    }
    const currentRoleNum = toRoleNumber(user.role as RoleValue);
    const nextRole: 0 | 1 = currentRoleNum === 1 ? 0 : 1;

    const result = await Alerts.confirm2(
      "Cambiar rol",
      `¿Cambiar a ${nextRole === 1 ? "Administrador" : "Cliente"}?`
    );


    if (!result.isConfirmed) return;

    setPerson((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
    );

    try {
      const { message } = await updateUserRole(user.id, nextRole);
      await Alerts.success("Listo", message || "Rol actualizado correctamente");
    } catch {
      // rollback si falla
      setPerson((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: currentRoleNum } : u))
      );
      await Alerts.error("Error", "No se pudo actualizar el rol");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <AppLayout>


      <div className="dashboard-container">

        {/* Sidebar */}
        {/* Contenido derecho */}
        <div className="main-content">
          <div className="admin-container flat">
            <h1>Administración de Usuarios</h1>

            <table className="admin-table">
              <thead>
                <tr> <th>
                  #
                </th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Fecha Nacimiento</th>
                  <th>Email</th>
                  <th>Administrador</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((p, index) => (
                  <tr key={p.id}> <td>{indexOfFirstItem + index + 1}</td>

                    <td>{p.name}</td>
                    <td>{p.lastName}</td>
                    <td>{changeDate(p.birthDay)}</td>
                    <td>{p.email}</td>
                    <td>

                      <div className="role-switch">
                        <button
                          type="button"
                          className={`role-toggle ${isAdminRole(p.role as RoleValue) ? "on" : "off"}`}
                          onClick={() => handleToggleRoleFromList(p)}
                          aria-pressed={isAdminRole(p.role as RoleValue)}
                          disabled={p.id === currentUserId && isAdminRole(p.role as RoleValue)}
                          style={{
                            opacity: p.id === currentUserId && isAdminRole(p.role as RoleValue) ? 0.5 : 1,
                            cursor: p.id === currentUserId && isAdminRole(p.role as RoleValue) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <span className="track" />
                          <span className="thumb" />
                        </button>

                      </div>
                    </td>


                    <td>
                      <div className="actions-vertical">
                        <button className="btn" onClick={() => openEditModal(p)}>Editar</button>
                        <button className="btn" onClick={() => openAddressModal(p)}>Ver dirección</button>
                        {
                          p.role!="ADMIN"&&(
                            <button className="btn" onClick={() => handleDelete(p)}>
                             Eliminar
                        </button>
                          )
                        }
                        
                      </div>


                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
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
              <EditUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onSuccess={fetchUsers}  // tu función que recarga la tabla
              />
            </div>
          </div>

        </div>

        <ViewAddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          user={selectedUser}
        />


      </div>
    </AppLayout>
  );

};

export default TableUser;
