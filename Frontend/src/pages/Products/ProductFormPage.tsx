import { useMemo, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { Alerts } from "../../utils/alerts";
import { createProduct } from "../../services/product.services";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { validateProductForm } from "../../utils/validationProducts";
import type { Category, ClothesFields, HomeAccessoriesFields, ProductBaseFields, } from "../../types/product.type";
import "./productForm.css";
import { onlyLetters } from "../../utils/validationInputGuards";


const baseInitial: ProductBaseFields = {
  name: "",
  description: "",
  color: "",
  price: 0,
  stock: 0,
  typeMaterial: "",
  img: null,
};

const clothesInitial: ClothesFields = {
  size: "",
  typeClothes: "",
  typeGender: "",
};

const homeInitial: HomeAccessoriesFields = {
  height: 0,
  length: 0,
  width: 0,
};

export default function ProductFormPage() {
  const [category, setCategory] = useState<Category>(0);
  const [base, setBase] = useState<ProductBaseFields>(baseInitial);
  const [clothes, setClothes] = useState<ClothesFields>(clothesInitial);
  const [home, setHome] = useState<HomeAccessoriesFields>(homeInitial);
  const navigate = useNavigate();


  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);

  const setBaseField = <K extends keyof ProductBaseFields>(key: K, value: ProductBaseFields[K]) =>
    setBase((prev) => ({ ...prev, [key]: value }));

  const setClothesField = <K extends keyof ClothesFields>(key: K, value: ClothesFields[K]) =>
    setClothes((prev) => ({ ...prev, [key]: value }));

  const setHomeField = <K extends keyof HomeAccessoriesFields>(key: K, value: HomeAccessoriesFields[K]) =>
    setHome((prev) => ({ ...prev, [key]: value }));

  const extraTitle = useMemo(() => (category === 0 ? "Campos específicos de ropa" : "Medidas del accesorio"), [category]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setBaseField("img", file);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBaseField("img", null);
    setFileKey((k) => k + 1);
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("Name", base.name);
    fd.append("Description", base.description);
    fd.append("Color", base.color);
    fd.append("Price", String(base.price));
    fd.append("Stock", String(base.stock));
    fd.append("TypeMaterial", base.typeMaterial);
    fd.append("Category", String(category));

    if (base.img) fd.append("Image", base.img);

    if (category === 0) {
      fd.append("Size", clothes.size);
      fd.append("TypeClothes", clothes.typeClothes);
      fd.append("TypeGender", clothes.typeGender);
    } else {
      fd.append("Height", String(home.height));
      fd.append("Length", String(home.length));
      fd.append("Width", String(home.width));
    }

    return fd;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const check = validateProductForm({ category, base, clothes, home });

    if (!check.valid) {
      const msg = check.message ?? "Revisa el formulario.";
      await Alerts.error("Formulario inválido", msg);
      return;
    }

    const confirm = await Alerts.confirm("¿Agregar producto?", "¿Seguro que deseas guardar este producto?");
    if (!confirm.isConfirmed) return;

    try {
      const formData = buildFormData();
      const result = await createProduct(formData);
      await Alerts.success("Creado", result.message);
      navigate(PATHS.PRODUCTS);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear el producto";
      await Alerts.error("Error", msg);
    }
  };

  const onReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setBase(baseInitial);
    setClothes(clothesInitial);
    setHome(homeInitial);
    setCategory(0);
    setPreviewUrl(null);
    setFileKey((k) => k + 1);
  };

  return (
    <AppLayout>
      <div className="dashboard-container">
        <div className="main-content">
          <div className="admin-container flat">

            <h1>Agregar Productos</h1>
            <br />

            <form className="product-form" onSubmit={onSubmit} noValidate>
              <div className="form-grid-2">
                <div className="field">
                  <label htmlFor="name">Nombre</label>
                  <input id="name" className="input" value={base.name}
                    onChange={(e) => setBaseField("name", e.target.value)}  onKeyDown={onlyLetters}

                  />
                </div>

                <div className="field">
                  <label htmlFor="category">Categoría</label>
                  <select id="category" className="input" value={category}
                    onChange={(e) => setCategory(Number(e.target.value) as Category)}
                  >
                    <option value={0}>Ropa</option>
                    <option value={1}>Accesorios de casa</option>
                  </select>
                </div>

                <div className="field form-col-span-2">
                  <label htmlFor="description">Descripción</label>
                  <textarea id="description" className="input textarea" value={base.description}
                    onChange={(e) => setBaseField("description", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="color">Color</label>
                  <input id="color" className="input" value={base.color}
                    onChange={(e) => setBaseField("color", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="typeMaterial">Tipo de material</label>
                  <input id="typeMaterial" className="input" value={base.typeMaterial}
                    onChange={(e) => setBaseField("typeMaterial", e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="price">Precio</label>
                  <input id="price" className="input" type="number" min={1}
                    step={1} value={base.price}
                    onChange={(e) => setBaseField("price", Number(e.target.value))}
                  />
                </div>

                <div className="field">
                  <label htmlFor="stock">Cantidad</label>
                  <input id="stock" className="input" type="number"
                    min={1}
                    step={1}
                    value={base.stock}
                    onChange={(e) => setBaseField("stock", Number(e.target.value))}
                  />
                </div>

                <div className="field form-col-span-2">
                  <label>Imagen</label>
                  <div className="file-row">
                    <div className="input-file">
                      <span className="file-hint">
                        {base.img ? `Seleccionada: ${base.img.name}` : "Selecciona una imagen"}
                      </span>
                      <input key={fileKey} type="file" accept="image/*" onChange={handleImageChange} required />
                    </div>

                    <button type="button" className="btn small danger-soft" onClick={handleRemoveImage}
                      disabled={!base.img}
                    >
                      Quitar imagen
                    </button>
                  </div>

                  {previewUrl && (
                    <div className="preview-wrap">
                      <img className="preview-img" src={previewUrl} alt="Vista previa" />
                      <div className="preview-footer">
                        <span>Vista previa</span>
                        <span>{base.img ? `${(base.img.size / 1024).toFixed(1)} KB` : ""}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <hr className="divider" />
              <h2 className="section-title">{extraTitle}</h2>

              {/* Campos específicos según categoría */}
              {category === 0 ? (
                <div className="form-grid-3">
                  <div className="field">
                    <label htmlFor="size">Talla</label>
                    <input id="size" className="input" value={clothes.size} onChange={(e) => setClothesField("size", e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="typeClothes">Tipo de ropa</label>
                    <input id="typeClothes" className="input" value={clothes.typeClothes} onChange={(e) => setClothesField("typeClothes", e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="typeGender">Género</label>
                    <select id="typeGender" className="input" value={clothes.typeGender} onChange={(e) => setClothesField("typeGender", e.target.value)}
                    >
                      <option value="" disabled>Selecciona…</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="form-grid-3">
                  <div className="field">
                    <label htmlFor="height">Altura</label>
                    <input id="height" className="input" type="number" min={0} step={1} value={home.height} onChange={(e) => setHomeField("height", Number(e.target.value))} required />
                  </div>
                  <div className="field">
                    <label htmlFor="length">Largo</label>
                    <input id="length" className="input" type="number" min={0} step={1} value={home.length} onChange={(e) => setHomeField("length", Number(e.target.value))} required />
                  </div>
                  <div className="field">
                    <label htmlFor="width">Ancho</label>
                    <input id="width" className="input" type="number" min={0} step={1} value={home.width} onChange={(e) => setHomeField("width", Number(e.target.value))} required />
                  </div>
                </div>
              )}

              <div className="actions">
                <button type="button" className="btn" onClick={onReset}>
                  Limpiar
                </button>

                <button type="button" className="btn" onClick={() => navigate(PATHS.PRODUCTS)}>
                  Cancelar
                </button>

                <button type="submit" className="btn">
                  Guardar producto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
