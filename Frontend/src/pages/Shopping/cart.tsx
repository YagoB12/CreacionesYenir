import { LockClosedIcon } from "@heroicons/react/24/solid";
import Navbar from "../../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import type { ShoppingCart } from "../../types/shoppingCart.type";
import { deleteProductCart, editQuantityProduct, getCart } from "../../services/cart.Service";
import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Alerts } from "../../utils/alerts";
import PaymentProofModal from "../../components/Modal/PaymentProofModal";
import InvoiceService from "../../services/invoice.service";
import type { ProductItem } from "../../services/invoice.service";

const Cart: React.FC = () => {
  const [cart, setCart] = useState<ShoppingCart>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleConfirmPurchase = async (file: File) => {
    if (!cart || cart.items.length === 0) return;

    try {
      const result = await Alerts.confirm(
        "Confirmar compra",
        "¿Deseas generar la factura con este comprobante?"
      );

      if (!result.isConfirmed) return;

      // Transformar carrito al formato esperado
      const products: ProductItem[] = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      //  Llamar servicio
      const invoice = await InvoiceService.createInvoiceFromPayment(
        products,
        file
      );

      await Alerts.success(
        "Factura generada con éxito",
        "Tu pago ha sido recibido y está en revisión. Recibirás una notificación por correo una vez sea confirmado."
      );

      setIsModalOpen(false);

      // Limpiar carrito visualmente
      const updatedCart = await getCart();
      setCart(updatedCart);

    } catch (error) {
      console.error(error);
      Alerts.error("Error al generar la factura");
    }
  };



  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCart(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCart();
  }, []);
  const handleQuantityChange = async (
    productId: number,
    quantity: number
  ) => {
    if (quantity <= 0) return;

    try {
      await editQuantityProduct(productId, quantity);

      // Refrescar carrito
      const updatedCart = await getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error(error);
      Alerts.error(error instanceof Error ? error.message : "Error al actualizar cantidad");
    }
  };

  //  Eliminar
  const deleteCart = async (productId: number) => {
    const result = await Alerts.confirm(
      "¿Quitar Producto?",
      `¿Seguro que quieres quitar este producto de tu carrito?`
    );

    if (!result.isConfirmed) return;
    try {
      await deleteProductCart(productId);

      const updatedCart = await getCart();
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <>
      <Navbar />
      <div className="container-fluid mt-5" style={{ paddingLeft: '50px', paddingRight: '50px', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="row justify-content-center">
          <div className="col-md-10 mt-5">
            <div className="mb-4" style={{ width: 'fit-content' }}>
              {!cart || (cart.items.length > 0 && (
                <Link to="/home" className="btn btn-dark px-4 py-2 rounded-pill fw-semibold">
                Regresar
              </Link>
              ))}
            </div>
            {!cart ||
              (cart.items.length > 0 && (
                <h2 className="mb-4 fw-bold text-center">Carrito</h2>
              ))}
          </div>
        </div>
        <div className="row justify-content-center">
          {/* PRODUCTOS */}
          {!cart || cart.items.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              {/* Ícono */}
              <div className="mb-4 position-relative">
                <ShoppingCartIcon style={{ width: 48, height: 48 }} />

                {/* Badge 0 */}
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark"
                  style={{ fontSize: "0.75rem" }}
                >
                  0
                </span>
              </div>

              {/* Texto */}
              <h4 className="fw-bold mb-4">El carrito está vacío</h4>

              {/* Botón */}
              <div className="px-5">
                <Link
                  to="/home"
                  className="btn btn-dark px-5 py-3 rounded-pill fw-semibold d-flex align-items-center"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          ) : (
            <div className="col-md-7">

              <table className="table align-middle">
                <thead className="border-bottom">
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {cart?.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex gap-3 align-items-center">
                          <Link to={`/products/view/${item.productId}`}>
                            <img
                              src={`${API_URL}/api/images/${item.productImage}`}
                              alt={item.productName}
                              className="rounded"
                              width={80}
                              height={80}
                              style={{ cursor: "pointer" }}
                            />
                          </Link>
                          <div>
                            <p className="mb-1 fw-semibold">
                              <Link to={`/products/view/${item.productId}`}>
                                {item.productName}
                              </Link>
                            </p>
                            <small className="text-muted">
                              {item.quantity} x  ₡ {item.unitPrice}
                            </small>
                            <br />
                            <small className="text-muted">
                              Total: ₡ {item.subtotal.toLocaleString("es-CR")}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td className="text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          className="form-control text-center mx-auto"
                          style={{ width: "70px" }}
                          onChange={(e) =>
                            handleQuantityChange(item.productId, Number(e.target.value))
                          }
                        />

                        <a
                          className="text-danger d-block mt-1" style={{ cursor: "pointer" }} onClick={() => deleteCart(item.productId)}> Quitar</a>

                      </td>

                      <td className="text-end fw-semibold">
                        ₡{" "}
                        {(item.unitPrice * item.quantity).toLocaleString("es-CR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          )}
          {/* RESUMEN */}
          {!cart ||
            (cart.items.length > 0 && (
              <div className="col-md-3">
                <div className="card shadow-sm p-4">
                  <h4>Total de carrito</h4>
                  <p className="text-muted mb-1">Subtotal</p>
                  <h5 className="fw-semibold mb-3">
                    ₡ {cart?.total.toLocaleString("es-CR")}
                  </h5>

                  <h4 className="fw-bold mb-3">Total</h4>
                  <p className="fw-bold fs-5">
                    ₡ {cart?.total.toLocaleString("es-CR")} CRC
                  </p>

                  <p className="text-muted small">
                    Impuesto incluido. Los gastos de envío se calculan en la
                    pantalla de pago.
                  </p>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-dark w-100 py-2 d-flex align-items-center justify-content-center gap-2 mt-3"
                  >
                    <LockClosedIcon className="menu-icon" />
                    Finalizar compra
                  </button>

                </div>
              </div>
            ))}
        </div>


      </div>
      <PaymentProofModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        total={cart?.total ?? 0}
      />

    </>
  );
};

export default Cart;
