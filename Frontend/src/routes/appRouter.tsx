import { Routes, Route, Navigate } from "react-router-dom";
import { PATHS } from "./paths";

import LoginPage from "../pages/Login/loginPage";
import RegisterPage from "../pages/Register/registerPage";
import HomePage from "../pages/Home/home";
import TableUser from "../pages/User/tableUser";

import ProductsTablePage from "../pages/Products/ProductsTablesPage";
import ProductFormPage from "../pages/Products/ProductFormPage";
import CatalogProduct from "../pages/Products/productCatalog";
import ProductViewCatalog from "../pages/Products/productViewCatalog";
import NoAccess from "../pages/ErrorPage/ErrorPage";
import RequireRole from "../components/RequiredRole/requiredRole";
import Cart from "../pages/Shopping/cart";
import TableInventory from "../pages/Inventory/TableInventory";
import ReviewsTablePage from "../pages/Reviews/ReviewsTablePage";
import InvoicesTablePage from "../pages/Invoices/invoiceTablePage";
import PaymentsTablePage from "../pages/Payment/paymentTablePage";
import MyOrdersPage from "../pages/Order/MyOrdersPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path={PATHS.HOME} element={<Navigate to={PATHS.HOME1} replace />} />
      <Route path={PATHS.LOGIN} element={<LoginPage />} />
      <Route path={PATHS.HOME1} element={<HomePage />} />

      <Route path={PATHS.REGISTER} element={<RegisterPage />} />
      <Route path="*" element={<Navigate to={PATHS.LOGIN} replace />} />
      <Route path={PATHS.LISTUSER} element={<TableUser />} />

      <Route path={PATHS.PRODUCTS} element={
        <RequireRole roleRequired="ADMIN">
          <ProductsTablePage />
        </RequireRole>
      } />
      <Route path={PATHS.PRODUCT_ADD} element={
        <RequireRole roleRequired="ADMIN">
          <ProductFormPage />
        </RequireRole>
      } />
      <Route path={PATHS.PRODUCT_EDIT} element={
        <RequireRole roleRequired="ADMIN">
          <ProductFormPage />
        </RequireRole>

      } />
      <Route path={PATHS.INVENTORY} element={
        <RequireRole roleRequired="ADMIN">
          <TableInventory />
        </RequireRole>
      } />
      <Route path={PATHS.INVOICES} element={
        <RequireRole roleRequired="ADMIN">
          <InvoicesTablePage />
        </RequireRole>
      } />
      <Route
        path={PATHS.PAYMENTS}
        element={
          <RequireRole roleRequired="ADMIN">
            <PaymentsTablePage />
          </RequireRole>
        }/>
      <Route
        path={PATHS.REVIEWS}
        element={
          <RequireRole roleRequired="ADMIN">
            <ReviewsTablePage />
          </RequireRole>
        }
      />

      <Route path={PATHS.ORDER} element={
        <RequireRole roleRequired="CLIENT">
        <MyOrdersPage />
        </RequireRole>
      }/>

      <Route path={PATHS.CART} element={
        <RequireRole roleRequired="CLIENT">
          <Cart />
        </RequireRole>

      } />


      <Route path={PATHS.PRODUCT_CATALOG} element={
        <CatalogProduct />
      } />
      <Route path={PATHS.PRODUCT_VIEW} element={
        <ProductViewCatalog />

      } />

      <Route path={PATHS.ERROR_NOACCESS} element={<NoAccess />} />




    </Routes>
  );
}
