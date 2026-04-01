import "./Home.css";
import Dashboard from "../../components/Dashboard/dashboard";
import CatalogProduct from "../Products/productCatalog";
import Navbar from "../../components/Navbar/Navbar";
import img1 from "../../assets/imageCarrucel/image1.jpg";
import img2 from "../../assets/imageCarrucel/ropa.jpg";
import img3 from "../../assets/imageCarrucel/image5.jpg";
import img4 from "../../assets/imageCarrucel/image2.webp";
import img5 from "../../assets/imageCarrucel/image3.webp";
import img6 from "../../assets/imageCarrucel/tualla.jpg";
import imgBebe from "../../assets/imageCarrucel/bebe.avif";

// ─── Datos editables de la empresa ──────────────────────────────────────────
const COMPANY_INFO = {
  name: "Creaciones Yenir",
  tagline: "Estilo, calidad y amor en cada creación",
  description:
    "Somos una empresa familiar dedicada a ofrecer los mejores productos textiles y accesorios para el hogar. Cada producto está seleccionado con cuidado para brindarte la mejor calidad al mejor precio.",
  founded: "2015",
  mission:
    "Brindar productos de alta calidad que embellezcan tus espacios y vistan a tu familia con amor y estilo.",
  vision:
    "Ser la tienda de confianza de cada hogar costarricense, reconocida por la calidad de nuestros productos y la calidez de nuestro servicio.",
  phone: "+506 0000 0000",
  email: "creacionesyenir@gmail.com",
  address: "Costa Rica",
  stats: {
    years: "#+",
    products: "#+",
    clients: "#+",
    satisfaction: "#%",
  },
};

const CATEGORIES = [
  {
    title: "Ropa & Moda",
    description: "Las últimas tendencias en moda para ti y tu familia.",
    icon: "👗",
    color: "#f7d6e0",
  },
  {
    title: "Colección Infantil",
    description: "Prendas suaves, cómodas y seguras para los más pequeños.",
    icon: "🌟",
    color: "#e7c6ff",
  },
  {
    title: "Accesorios del Hogar",
    description: "Toallas, cobijas y textiles que decoran tu hogar.",
    icon: "🏠",
    color: "#cceaea",
  },
  {
    title: "Textiles & Cobijas",
    description: "Comodidad y calidez para cada rincón de tu espacio.",
    icon: "🛋️",
    color: "#fde8b8",
  },
  {
    title: "Nueva Colección",
    description: "Descubre los productos más recientes recién llegados.",
    icon: "✨",
    color: "#d4f0c0",
  },
  {
    title: "Ofertas Especiales",
    description: "Los mejores descuentos y promociones del mes.",
    icon: "🏷️",
    color: "#ffd6e0",
  },
];

const VALUES = [
  {
    icon: "✨",
    title: "Calidad Garantizada",
    text: "Cada producto pasa por un riguroso control de calidad antes de llegar a tus manos.",
  },
  {
    icon: "💖",
    title: "Hecho con Amor",
    text: "Seleccionamos cada artículo pensando en el bienestar y la satisfacción de nuestros clientes.",
  },
  {
    icon: "🚀",
    title: "Envío Rápido",
    text: "Llevamos tus productos hasta la puerta de tu casa de forma segura y oportuna.",
  },
  {
    icon: "🤝",
    title: "Confianza Total",
    text: "Más de 9 años acompañando a familias colombianas con productos de confianza.",
  },
];

const HOME_CAROUSEL_IMAGES = [img4, img2, img3, img5];
const HOME_ITEMS_IMAGES = [img6, imgBebe, img1];

// ─── Componente principal ────────────────────────────────────────────────────
export default function HomePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  return role === "ADMIN" ? (
    <div className="home-container">
      <Dashboard />
      <div className="home-background"></div>
    </div>
  ) : (
    <div className="hy-root">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hy-hero">
        <div
          id="heroCarousel"
          className="carousel slide carousel-fade hy-hero__carousel"
          data-bs-ride="carousel"
          data-bs-interval="4500"
        >
          <div className="carousel-inner h-100">
            {HOME_CAROUSEL_IMAGES.map((src, i) => (
              <div
                key={i}
                className={`carousel-item h-100${i === 0 ? " active" : ""}`}
              >
                <img
                  src={src}
                  className="d-block w-100 hy-hero__img"
                  alt={`Slide ${i + 1}`}
                />
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>

        {/* Overlay de texto */}
        <div className="hy-hero__overlay">
          <div className="hy-hero__content">
            <span className="hy-hero__badge">Bienvenidos a nuestra tienda</span>
            <h1 className="hy-hero__title">{COMPANY_INFO.name}</h1>
            <p className="hy-hero__tagline">{COMPANY_INFO.tagline}</p>
            <div className="hy-hero__actions">
              <a href="#catalog" className="hy-btn hy-btn--primary">
                Ver Catálogo
              </a>
              <a href="#us" className="hy-btn hy-btn--outline">
                Quiénes Somos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── ESTADÍSTICAS ─────────────────────────────────────────────────── */}
      <section className="hy-stats">
        <div className="container-fluid px-4">
          <div className="row g-0 justify-content-center">
            {[
              { value: COMPANY_INFO.stats.years, label: "Años de experiencia" },
              { value: COMPANY_INFO.stats.products, label: "Productos disponibles" },
              { value: COMPANY_INFO.stats.clients, label: "Clientes satisfechos" },
              { value: COMPANY_INFO.stats.satisfaction, label: "Satisfacción" },
            ].map((stat, i) => (
              <div key={i} className="col-6 col-md-3 hy-stat-card">
                <span className="hy-stat-card__value">{stat.value}</span>
                <span className="hy-stat-card__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ───────────────────────────────────────────────────── */}
      <section className="hy-section hy-section--light">
        <div className="container">
          <div className="hy-section-header">
            <span className="hy-section-header__chip">Explora</span>
            <h2 className="hy-section-header__title">Nuestras Categorías</h2>
            <p className="hy-section-header__sub">
              Encuentra todo lo que necesitas para tu familia y tu hogar
            </p>
          </div>
          <div className="row g-3 justify-content-center">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-2">
                <div
                  className="hy-cat-card"
                  style={{ "--cat-color": cat.color } as React.CSSProperties}
                >
                  <span className="hy-cat-card__icon">{cat.icon}</span>
                  <h5 className="hy-cat-card__title">{cat.title}</h5>
                  <p className="hy-cat-card__desc">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARRUSEL ACCESORIOS & HOGAR ──────────────────────────────────── */}
      <section className="hy-section hy-section--gradient">
        <div className="container">
          <div className="hy-section-header hy-section-header--dark">
            <span className="hy-section-header__chip hy-section-header__chip--dark">
              Destacados
            </span>
            <h2 className="hy-section-header__title">Accesorios & Hogar</h2>
            <p className="hy-section-header__sub">
              Toallas, cobijas y textiles para embellecer cada rincón de tu hogar
            </p>
          </div>

          <div
            id="itemsCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="3500"
          >
            <div className="carousel-indicators hy-carousel-indicators">
              {HOME_ITEMS_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  data-bs-target="#itemsCarousel"
                  data-bs-slide-to={i}
                  className={i === 0 ? "active" : ""}
                  aria-current={i === 0 ? "true" : undefined}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="carousel-inner hy-items-carousel__inner">
              {HOME_ITEMS_IMAGES.map((src, i) => (
                <div
                  key={i}
                  className={`carousel-item${i === 0 ? " active" : ""}`}
                >
                  <img
                    src={src}
                    className="d-block w-100 hy-items-carousel__img"
                    alt={`Accesorio ${i + 1}`}
                  />
                  <div className="carousel-caption hy-carousel-caption">
                    <span className="hy-carousel-caption__badge">
                      Nueva Colección
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#itemsCarousel"
              data-bs-slide="prev"
            >
              <span className="hy-carousel-arrow hy-carousel-arrow--prev" aria-hidden="true">‹</span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#itemsCarousel"
              data-bs-slide="next"
            >
              <span className="hy-carousel-arrow hy-carousel-arrow--next" aria-hidden="true">›</span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── SOBRE NOSOTROS ───────────────────────────────────────────────── */}
      <section className="hy-section hy-section--light" id="us">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="hy-about__img-wrap">
                <img
                  src={imgBebe}
                  alt="Creaciones Yenir"
                  className="hy-about__img"
                />
                <div className="hy-about__badge">
                  <span className="hy-about__badge-value">{COMPANY_INFO.stats.years}</span>
                  <span className="hy-about__badge-label">Años de<br />experiencia</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <span className="hy-section-header__chip">Nuestra Historia</span>
              <h2 className="hy-about__title mt-2">
                Somos <strong>{COMPANY_INFO.name}</strong>
              </h2>
              <p className="hy-about__text">{COMPANY_INFO.description}</p>

              <div className="hy-about__pillars">
                <div className="hy-pillar">
                  <span className="hy-pillar__icon">🎯</span>
                  <div>
                    <strong>Misión</strong>
                    <p className="mb-0 text-secondary small">{COMPANY_INFO.mission}</p>
                  </div>
                </div>
                <div className="hy-pillar">
                  <span className="hy-pillar__icon">🌟</span>
                  <div>
                    <strong>Visión</strong>
                    <p className="mb-0 text-secondary small">{COMPANY_INFO.vision}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALORES ──────────────────────────────────────────────────────── */}
      <section className="hy-section hy-section--values">
        <div className="container">
          <div className="hy-section-header">
            <span className="hy-section-header__chip">¿Por qué elegirnos?</span>
            <h2 className="hy-section-header__title">Nuestros Valores</h2>
          </div>
          <div className="row g-4 justify-content-center">
            {VALUES.map((v, i) => (
              <div key={i} className="col-10 col-sm-6 col-md-3">
                <div className="hy-value-card">
                  <span className="hy-value-card__icon">{v.icon}</span>
                  <h6 className="hy-value-card__title">{v.title}</h6>
                  <p className="hy-value-card__text">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATÁLOGO ─────────────────────────────────────────────────────── */}
      <section className="hy-section hy-section--catalog" id="catalog">
        <div className="container-fluid px-3 px-lg-4">
          <div className="hy-section-header">
            <span className="hy-section-header__chip">Tienda</span>
            <h2 className="hy-section-header__title">Catálogo de Productos</h2>
            <p className="hy-section-header__sub">
              Explora nuestra colección completa de productos
            </p>
          </div>
          {/* ── Productos ── */}
          <CatalogProduct />
        </div>
      </section>

      {/* ── CONTACTO / CTA ───────────────────────────────────────────────── */}
      <section className="hy-cta">
        <div className="container text-center">
          <h2 className="hy-cta__title">¿Tienes alguna pregunta?</h2>
          <p className="hy-cta__sub">
            Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
          </p>
          <div className="hy-cta__contacts">
            <a href={`tel:${COMPANY_INFO.phone}`} className="hy-cta__link">
              📞 {COMPANY_INFO.phone}
            </a>
            <a href={`mailto:${COMPANY_INFO.email}`} className="hy-cta__link">
              ✉️ {COMPANY_INFO.email}
            </a>
            <span className="hy-cta__link">📍 {COMPANY_INFO.address}</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="hy-footer">
        <div className="container text-center">
          <p className="hy-footer__text mb-1">
            © {new Date().getFullYear()} <strong>{COMPANY_INFO.name}</strong>. Todos los derechos reservados.
          </p>
          <p className="hy-footer__sub">Hecho con 💖 en Costa Rica</p>
        </div>
      </footer>
    </div>
  );
}
