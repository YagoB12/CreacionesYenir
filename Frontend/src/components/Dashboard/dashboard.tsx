import React from "react";
import "./Dashboard.css";
import { 
  UserGroupIcon,
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  StarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowLeftStartOnRectangleIcon
} from '@heroicons/react/24/solid'

import logoImg from "../../assets/images/prototipo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../services/auth.services";

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
         {/* Logo */}
        <div className="logo-container">
          <img src={logoImg} alt="Logo" className="logo-img" />
          <span className="logo-text">Administrador</span>
        </div>

        <ul>
          <li className={isActive("/home") ? "active" : ""} onClick={() => navigate("/home")}>
            <HomeIcon className="menu-icon" />
            <span>Inicio</span>
          </li>
      {role=="ADMIN"?(
        <div>

       
        <li className={isActive("/listUser") ? "active" : ""} onClick={() => navigate("/listUser")}>
            <UserGroupIcon className="menu-icon" />
            <span>Usuarios</span>
          </li>
          
           <li className={isActive("/productos") ? "active" : ""} onClick={() => navigate("/products")}>
            <ShoppingBagIcon className="menu-icon" />
            <span>Productos</span>
          </li>
          <li className={isActive("/inventory") ? "active" : ""} onClick={() => navigate("/inventory")}>
            <ArchiveBoxIcon className="menu-icon" />
            <span>Inventario</span>
          </li>
          <li className={isActive("/payments") ? "active" : ""} onClick={() => navigate("/payments")}>
            <CreditCardIcon className="menu-icon" />
            <span>Pagos</span>
          </li>
          <li className={isActive("/invoices") ? "active" : ""} onClick={() => navigate("/invoices")}>
            <DocumentTextIcon className="menu-icon" />
            <span>Facturas</span>
          </li>
           </div>
      ):( 
      <div>
        <li className={isActive("/products/catalog") ? "active" : ""} onClick={() => navigate("/products/catalog")}>
            <ShoppingBagIcon className="menu-icon" />
            <span>Catalogos</span>
          </li>

           <li className={isActive("/carrito") ? "active" : ""} onClick={() => navigate("/listUser")}>
            <ShoppingCartIcon className="menu-icon" />
            <span>Carrito</span>
          </li>
           <li className={isActive("/pagos") ? "active" : ""} onClick={() => navigate("/listUser")}>
            <CreditCardIcon className="menu-icon" />
            <span>Pagos</span>
          </li>

         </div>
      )}
       

          <li className={isActive("/resenas") ? "active" : ""} onClick={() => navigate("/reviews")}>
            <StarIcon className="menu-icon" />
            <span>Reseñas</span>
          </li>

          <li
            onClick={() => {
               logout(); navigate("/login");
            }
             
            }
          >
            <ArrowLeftStartOnRectangleIcon className="menu-icon" />
            <span>Cerrar Sesión</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;
