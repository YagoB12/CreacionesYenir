import React, { useEffect, useMemo, useState } from "react";
import CardProduct from "../../components/Card/cardProduct";
import "./productCatalog.css";
import type { ProductFromApi } from "../../types/product.type";
import { getAllProducts } from "../../services/product.services";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

// ── Etiquetas de categoría ───────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  Clothing: "Ropa & Moda",
  HomeAccessories: "Accesorios del Hogar",
};
const CATEGORY_ICONS: Record<string, string> = {
  Clothing: "👗",
  HomeAccessories: "🏠",
};
const CATEGORY_ORDER = ["Clothing", "HomeAccessories"];

const getCategoryLabel = (cat: string) => CATEGORY_LABELS[cat] ?? cat;
const getCategoryIcon  = (cat: string) => CATEGORY_ICONS[cat] ?? "📦";

// ────────────────────────────────────────────────────────────────────────────
const CatalogProduct: React.FC = () => {
  const [products, setProducts]               = useState<ProductFromApi[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // filtros
  const [visible,   setVisible]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("");
  const [size,      setSize]      = useState("");
  const [color,     setColor]     = useState("");
  const [material,  setMaterial]  = useState("");
  const [minPrice,  setMinPrice]  = useState("");
  const [maxPrice,  setMaxPrice]  = useState("");

  const nav = useNavigate();

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { applyFilters(); }, [search, category, size, color, material, minPrice, maxPrice, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err: any) {
      setError(err.message || "Error cargando productos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];
    if (search)    result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category)  result = result.filter((p) => p.category === category);
    if (size)      result = result.filter((p) => p.size === size);
    if (color)     result = result.filter((p) => p.color === color);
    if (material)  result = result.filter((p) => p.typeMaterial === material);
    if (minPrice)  result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice)  result = result.filter((p) => p.price <= Number(maxPrice));
    setFilteredProducts(result);
  };

  const handleSelectProduct = (product: ProductFromApi) => {
    nav(`/products/view/${product.id}`);
  };

  // ── Agrupar productos por categoría ─────────────────────────────────────
  const groupedProducts = useMemo(() => {
    const groups: Record<string, ProductFromApi[]> = {};
    filteredProducts.forEach((p) => {
      const cat = p.category || "Otros";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [filteredProducts]);

  // Orden: categorías conocidas primero, luego las demás
  const categoryKeys = useMemo(() => {
    const keys  = Object.keys(groupedProducts);
    const known = CATEGORY_ORDER.filter((k) => keys.includes(k));
    const rest  = keys.filter((k) => !CATEGORY_ORDER.includes(k));
    return [...known, ...rest];
  }, [groupedProducts]);

  if (loading) return <p className="text-center py-4">Cargando productos...</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="screen">

      {/* ── FILTROS ─────────────────────────────────────────────────────── */}
      <div>
        <div
          className="card shadow-sm border-0"
          style={{ background: "linear-gradient(135deg, #f7d6e0, #e7c6ff)" }}
        >
          {/* Buscador */}
          <div className="d-flex justify-content-center mb-4 mt-4">
            <div className="d-flex align-items-center gap-2 w-100" style={{ maxWidth: "900px" }}>
              <div className="position-relative" style={{ flex: 1 }}>
                <MagnifyingGlassIcon
                  className="position-absolute top-50 start-0 translate-middle-y ms-3"
                  style={{ width: 18, height: 18, opacity: 0.6 }}
                />
                <input
                  type="text"
                  className="form-control form-control-lg ps-5"
                  placeholder="Buscar producto por nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                className="btn btn-outline-secondary btn-sm px-3"
                style={{ whiteSpace: "nowrap", height: "46px", width: "90px" }}
                onClick={() => setVisible(!visible)}
              >
                Filtros
              </button>
            </div>
          </div>

          {/* Filtros avanzados */}
          {visible && (
            <div className="row g-3 mt-3 px-3 pb-3">
              <div className="col-6 col-md-3">
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Categorías</option>
                  <option value="Clothing">Ropa</option>
                  <option value="HomeAccessories">Accesorios</option>
                </select>
              </div>
              <div className="col-6 col-md-2">
                <select className="form-select" value={size} onChange={(e) => setSize(e.target.value)}>
                  <option value="">Talla</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>
              <div className="col-6 col-md-2">
                <input type="text" className="form-control" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div className="col-6 col-md-2">
                <input type="text" className="form-control" placeholder="Material" value={material} onChange={(e) => setMaterial(e.target.value)} />
              </div>
              <div className="col-6 col-md-1">
                <input type="number" className="form-control" placeholder="Min ₡" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              </div>
              <div className="col-6 col-md-1">
                <input type="number" className="form-control" placeholder="Max ₡" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCTOS ─────────────────────────────────── */}
      <div
        className="container-fluid"
        style={{ paddingTop: "1.5%" }}
      >
        {categoryKeys.length === 0 ? (
          <p className="text-center text-secondary py-5">
            No se encontraron productos.
          </p>
        ) : (
          categoryKeys.map((cat) => (
            <div key={cat} className="catalog-section">
              {/* Encabezado de sección */}
              <div className="catalog-section__header">
                <span className="catalog-section__icon">{getCategoryIcon(cat)}</span>
                <h3 className="catalog-section__title">{getCategoryLabel(cat)}</h3>
                <span className="catalog-section__count">
                  {groupedProducts[cat].length} productos
                </span>
              </div>

              {/* Fila horizontal con scroll */}
              <div className="catalog-row">
                {groupedProducts[cat].map((p) => (
                  <div key={p.id} className="catalog-row__item">
                    <CardProduct product={p} onSelect={handleSelectProduct} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CatalogProduct;
