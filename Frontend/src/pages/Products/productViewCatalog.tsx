import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProducts } from "../../services/product.services";
import type { ProductFromApi } from "../../types/product.type";
import "./productViewCatalog.css";
import { Alerts } from "../../utils/alerts";
import Navbar from "../../components/Navbar/Navbar";
import type { ReviewListItem } from "../../types/review.types";
import { useReviews } from "../../hooks/useReviews";
import type { AddToCartDTO } from "../../types/shoppingCart.type";
import { addToCart } from "../../services/cart.Service";
import InvoiceService from "../../services/invoice.service";
import type { ProductItem } from "../../services/invoice.service";
import PaymentProofModal from "../../components/Modal/PaymentProofModal";





const API_URL = import.meta.env.VITE_API_URL;


const ProductViewCatalog: React.FC = () => {

  const { id } = useParams();

  // productId seguro 
  const productId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductFromApi>();

  const [reviewComment, setReviewComment] = useState("");
  const [reviewStars, setReviewStars] = useState<number>(5);

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editStars, setEditStars] = useState<number>(5);
  const navigate = useNavigate();

  const { reviews, loadingReviews, fetchReviews, isLoggedIn, myUserId, sendingReview, savingEdit, deletingId, addReview, editReview, removeReview } = useReviews(productId);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);

  const fetchProduct = async () => {
    if (!productId) return;
    const data = await getProducts(productId);
    setProduct(data);
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId, fetchReviews]);

  const increaseQty = () => {
    if (!product) return;
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = async () => {
    if (localStorage.getItem("user")) {
      try {
        const productDTO: AddToCartDTO = {
          productId: product?.id || 0,
          quantity: quantity
        };

        await addToCart(productDTO);

        Alerts.success(
          "Agregado",
          "Ha sido agregado correctamente al carrito de compras"
        );
      } catch (error: any) {
        Alerts.error("Error", error.message || "No se pudo agregar al carrito");
      }

    } else {
      navigate("/login");
      Alerts.alert(
        "Alerta",
        "Es necesario iniciar sesión",
      );
    }
  };


  const handleBuyNow = async () => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
      await Alerts.alert("Alerta", "Es necesario iniciar sesión");
      return;
    }

    if (!product) return;

    if (product.stock <= 0) {
      Alerts.error("Sin stock", "Este producto está agotado");
      return;
    }

    setIsBuyNowModalOpen(true);
  };


  const handleSendReview = async () => {
    if (!product) return;

    if (!isLoggedIn) {
      await Alerts.error("Sesión", "Debes iniciar sesión para dejar una reseña.");
      return;
    }

    await addReview(reviewComment, reviewStars);

    // limpiar UI si salió bien (si el hook lanza error, no llega acá)
    setReviewComment("");
    setReviewStars(5);
  };

  // iniciar edición 
  const startEdit = (r: ReviewListItem) => {
    setEditingReviewId(r.id);
    setEditComment(r.comment);
    setEditStars(r.calification);
  };

  // cancelar edición 
  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditComment("");
    setEditStars(5);
  };

  // guardar edición
  const saveEdit = async (reviewId: number) => {
    if (!isLoggedIn) {
      await Alerts.error("Sesión", "Debes iniciar sesión para editar una reseña.");
      return;
    }

    await editReview(reviewId, editComment, editStars);
    cancelEdit();
  };

  //  eliminar
  const onDelete = async (reviewId: number) => {
    if (!isLoggedIn) {
      await Alerts.error("Sesión", "Debes iniciar sesión para eliminar una reseña.");
      return;
    }

    const confirm = await Alerts.confirm("¿Eliminar reseña?", "Esta acción no se puede deshacer");
    if (!confirm.isConfirmed) return;

    await removeReview(reviewId);

    // si estoy editando esa reseña, cierro edición
    if (editingReviewId === reviewId) cancelEdit();
  };
  return (
    <div>
      <Navbar />

      <div className="product-page-container">
        <div className="product-layout">
          {/* Imagen del producto - IZQUIERDA */}
          <div className="product-image-section">
            <div className="product-image-container">
              <img
                src={`${API_URL}/api/images/${product?.img}`}
                alt={product?.name}
                className="product-main-image"
              />
            </div>

            <hr className="divider" />

            {/* Crear reseña  */}
            <div className="reviews-section">
              <h3 className="reviews-title">Dejar una reseña</h3>

              {!isLoggedIn ? (
                <p style={{ fontStyle: "italic", color: "#666" }}>
                  Inicia sesión para poder dejar una reseña.
                </p>
              ) : (
                <>

                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${reviewStars >= star ? "filled" : ""}`}
                        onClick={() => !sendingReview && setReviewStars(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="review-textarea"
                    placeholder="Escribe tu reseña..."
                    disabled={sendingReview}
                  />

                  <button
                    className="review-submit-btn"
                    onClick={handleSendReview}
                    disabled={sendingReview}
                  >
                    {sendingReview ? "Enviando..." : "Publicar reseña"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Información del producto - DERECHA */}

          <div className="center-container">


            <div className="product-info-section">
              <h1 className="product-title">{product?.name}</h1>

              <p className="product-description">{product?.description}</p>

              <p className="product-price">₡ {product?.price?.toLocaleString()}</p>

              <hr className="divider" />

              {/* Especificaciones */}
              <div className="product-specs">
                <div className="spec-item">
                  <span className="spec-label">Color:</span>
                  <span className="spec-value">{product?.color}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Material:</span>
                  <span className="spec-value">{product?.typeMaterial}</span>
                </div>

                {product?.category === "Clothing" && (
                  <>
                    <div className="spec-item">
                      <span className="spec-label">Tamaño:</span>
                      <span className="spec-value">{product.size}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Género:</span>
                      <span className="spec-value">{product.typeGender}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Tipo:</span>
                      <span className="spec-value">{product.typeClothes}</span>
                    </div>
                  </>
                )}

                {product?.category === "HomeAccessories" && (
                  <>
                    <div className="spec-item">
                      <span className="spec-label">Alto:</span>
                      <span className="spec-value">{product.height} cm</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Ancho:</span>
                      <span className="spec-value">{product.width} cm</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Largo:</span>
                      <span className="spec-value">{product.length} cm</span>
                    </div>
                  </>
                )}
              </div>

              <hr className="divider" />

              {/* Cantidad */}
              <div className="quantity-section">
                <span className="quantity-label">Cantidad:</span>
                <div className="qty-selector">
                  <button onClick={decreaseQty} className="qty-btn">−</button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={increaseQty} className="qty-btn">+</button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="action-buttons">
                <button className="btn-add-cart" onClick={handleAddToCart}>
                  Añadir al carrito
                </button>
                <button className="btn-buy-now" onClick={handleBuyNow}>
                  Comprar ahora
                </button>
              </div>

              {/* Stock disponible */}
              {product?.stock && (
                <p className="stock-info">
                  {product.stock > 0
                    ? `${product.stock} unidades disponibles`
                    : "Agotado"}
                </p>
              )}


              <hr className="divider" />

              <div className="reviews-list">
                <h3>Reseñas</h3>

                {loadingReviews && <p>Cargando reseñas...</p>}

                {!loadingReviews && reviews.length === 0 && (
                  <p>Este producto aún no tiene reseñas.</p>
                )}

                {reviews.map((r) => {
                  const isMine = isLoggedIn && myUserId !== null && r.userId === myUserId;
                  const isEditing = editingReviewId === r.id;

                  return (
                    <div key={r.id} className="review-item">
                      <div className="review-header">
                        <strong>{r.userName}</strong>

                        {!isEditing ? (
                          <span className="review-stars">
                            {"★".repeat(r.calification)}
                            {"☆".repeat(5 - r.calification)}
                          </span>
                        ) : (
                          <div className="review-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`star ${editStars >= star ? "filled" : ""}`}
                                onClick={() => !savingEdit && setEditStars(star)}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {!isEditing ? (
                        <p className="review-comment">{r.comment}</p>
                      ) : (
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="review-textarea"
                          disabled={savingEdit}
                        />
                      )}

                      <small className="review-date">
                        {new Date(r.dateCreate).toLocaleDateString()}
                      </small>

                      {/* solo si es mi reseña */}
                      {isMine && (
                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                          {!isEditing ? (
                            <>
                              <button
                                className="review-submit-btn"
                                onClick={() => startEdit(r)}
                              >
                                Editar
                              </button>

                              <button
                                className="review-submit-btn"
                                onClick={() => onDelete(r.id)}
                                disabled={deletingId === r.id}
                              >
                                {deletingId === r.id ? "Eliminando..." : "Eliminar"}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="review-submit-btn"
                                onClick={() => saveEdit(r.id)}
                                disabled={savingEdit}
                              >
                                {savingEdit ? "Guardando..." : "Guardar"}
                              </button>

                              <button
                                className="review-submit-btn"
                                onClick={cancelEdit}
                                disabled={savingEdit}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentProofModal
        isOpen={isBuyNowModalOpen}
        onClose={() => setIsBuyNowModalOpen(false)}
        total={(product?.price ?? 0) * quantity}
        onConfirm={async (file) => {
          try {
            const products: ProductItem[] = [
              {
                productId: product!.id,
                quantity: quantity,
              },
            ];

            const invoice = await InvoiceService.createInvoiceFromPayment(
              products,
              file
            );

            await Alerts.success(
              "Compra realizada",
                "Tu pago ha sido recibido y está en revisión. Recibirás una notificación por correo una vez sea confirmado."
            );

            setIsBuyNowModalOpen(false);

            navigate("/home");

          } catch (error) {
            console.error(error);
            Alerts.error("Error", "No se pudo procesar la compra");
          }
        }}
      />
    </div>

  );
};
export default ProductViewCatalog;