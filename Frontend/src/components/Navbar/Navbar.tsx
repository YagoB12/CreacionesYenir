"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../assets/images/prototipo2.jpg";
import {
  ShoppingCartIcon
} from '@heroicons/react/24/solid'
import { logout } from "../../services/auth.services";
import './Navbar.css';


export default function Navbar() {
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(
    null,
  );
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrolly, setLastScrolly] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrolly = window.scrollY;

      if (currentScrolly < lastScrolly || currentScrolly < 10) {
        setIsVisible(true);
      } else if (currentScrolly > lastScrolly && currentScrolly > 100){
        setIsVisible(false);
      }
      setLastScrolly(currentScrolly);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrolly]);

  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    logout(); navigate("/login");

  };

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top shadow ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}
      style={{ backgroundColor: "#e9a7cb" }}
    >
      <div className="container-fluid px-3 position-relative">
        {/* Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 logo-container1"
        >
          <img src={logoImg} alt="Logo" className="logo-img1" />
        </Link>


        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Content */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarMain">
          {/* Right Side */}
          <ul className="navbar-nav align-items-center gap-2">
            {/* Cart (non-admin) */}
            {/* Cart (non-admin) */}
            {!isAdmin && (
              <li className="nav-item">
                <Link to="/cart" className="nav-link px-2">
                  <ShoppingCartIcon
                    style={{ width: "24px", height: "24px", color: "black" }}
                  />
                </Link>
              </li>
            )}

            {/* User Dropdown */}
            {user ? (
              <li className="nav-item dropdown">
                <a
                  href="#"
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                    style={{ width: "32px", height: "32px", fontSize: "14px" }}
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="d-none d-lg-inline">
                    {user.name || "Usuario"}
                  </span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu">
                  <li>
                    <div className="dropdown-item-text">
                      <div className="fw-semibold">
                        {user.name || "Usuario"}
                      </div>
                    </div>
                  </li>
                  {!isAdmin && (
                    <li>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => navigate("/orders")}
                      >
                        <i className="bi bi-receipt me-2"></i>
                        Mis Pedidos
                      </button>
                    </li>
                  )}


                  <li>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>

                </ul>

              </li>

            ) : (
              <li className="nav-item">
                <Link to="/login" className="btn btn-primary btn-sm">
                  Iniciar Sesión
                </Link>
              </li>

            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}
