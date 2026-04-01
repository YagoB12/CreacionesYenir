import React, { useState } from "react";
import type {
  ProductBaseFields,
  ProductFromApi,
} from "../../types/product.type";
import "./CardProduct.css";
import { Alerts } from "../../utils/alerts";
import type { AddToCartDTO, ShoppingCart } from "../../types/shoppingCart.type";
import { addToCart } from "../../services/cart.Service";
import { useNavigate } from "react-router-dom";

type CardProductProps = {
  product: ProductFromApi;
  onSelect?: (product: ProductFromApi) => void;
};
const API_URL = import.meta.env.VITE_API_URL;

const CardProduct: React.FC<CardProductProps> = ({ product, onSelect }) => {
  const isOutOfStock = product.stock <= 0;
  const navigate = useNavigate();

  const handleClick = () => {
    if (isOutOfStock) return;
    onSelect?.(product);
  };

  const handleAddToCart = async () => {
    try {
      const productDTO: AddToCartDTO = {
        productId: product.id,
        quantity: 1,
      };
      if (localStorage.getItem("user")) {
        await addToCart(productDTO);

        Alerts.success(
          "Agregado",
          "Ha sido agregado correctamente al carrito de compras",
        );
      } else {
        navigate("/login");
         Alerts.alert(
          "Alerta",
          "Es necesario iniciar sesión",
        );
      }
    } catch (error: any) {
      Alerts.error("Error", error.message || "No se pudo agregar al carrito");
    }
  };

  return (
    <div className={`card-product ${isOutOfStock ? "out-of-stock" : ""}`}>
      <div onClick={handleClick}>
        <div className="card-image">
          <img
            src={`${API_URL}/api/images/${product.img}`}
            alt={product.name}
          />
        </div>

        <div className="card-info">
          <div className="card-name">{product.name}</div>
          <div className="card-price">₡ {product.price.toLocaleString()}</div>

          {isOutOfStock && <div className="card-badge">Agotado</div>}
        </div>
      </div>

      <div>
        {!isOutOfStock && (
          <button className="btn add-to-cart" onClick={handleAddToCart}>
            🛒 Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
};

export default CardProduct;
