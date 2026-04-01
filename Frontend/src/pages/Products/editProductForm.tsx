import React, { useEffect, useMemo, useState } from "react";
import "./editProductForm.css";
import { Alerts } from "../../utils/alerts";
import { updateProduct, getProductById } from "../../services/product.services";
import type { Category, ClothesFields, HomeAccessoriesFields, ProductBaseFields, ProductFromApi } from "../../types/product.type";
import { validateProductForm } from "../../utils/validationProducts";
import { onlyLetters } from "../../utils/validationInputGuards";



const API_URL = import.meta.env.VITE_API_URL;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product: ProductFromApi;
  onSuccess: () => void;
};

type EditBaseState = Omit<ProductBaseFields, "img"> & { img: File | null };

const baseInitial: EditBaseState = {
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

const toCategoryNumber = (cat: string): Category => (cat === "Clothing" ? 0 : 1);
const categoryLabel = (cat: Category) => (cat === 0 ? "Ropa" : "Accesorios de casa");

const EditProductForm: React.FC<Props> = ({ isOpen, onClose, product, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState<Category>(0);
  const [base, setBase] = useState<EditBaseState>(baseInitial);
  const [clothes, setClothes] = useState<ClothesFields>(clothesInitial);
  const [home, setHome] = useState<HomeAccessoriesFields>(homeInitial);

  // imagen actual del producto (URL al backend)
  const [currentImg, setCurrentImg] = useState<string | null>(null);

  // preview cuando seleccionas un archivo nuevo
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // para resetear el input file sin resetear todo el form
  const [fileKey, setFileKey] = useState(0);

  const extraTitle = useMemo(() => {
    return category === 0 ? "Campos específicos de ropa" : "Medidas del accesorio";
  }, [category]);

  const setBaseField = <K extends keyof EditBaseState>(key: K, value: EditBaseState[K]) =>
    setBase((prev) => ({ ...prev, [key]: value }));

  const setClothesField = <K extends keyof ClothesFields>(key: K, value: ClothesFields[K]) =>
    setClothes((prev) => ({ ...prev, [key]: value }));

  const setHomeField = <K extends keyof HomeAccessoriesFields>(key: K, value: HomeAccessoriesFields[K]) =>
    setHome((prev) => ({ ...prev, [key]: value }));

  // Cargar el producto completo al abrir modal
  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      try {
        const full = await getProductById(product.id);
        const cat = toCategoryNumber(full.category);

        setCategory(cat);

        setBase({
          name: full.name ?? "",
          description: full.description ?? "",
          color: full.color ?? "",
          price: Number(full.price ?? 0),
          stock: Number(full.stock ?? 0),
          typeMaterial: full.typeMaterial ?? "",
          img: null,
        });

        setCurrentImg(full.img ? `${API_URL}/api/images/${full.img}` : null);

        setClothes({
          size: full.size ?? "",
          typeClothes: full.typeClothes ?? "",
          typeGender: full.typeGender ?? "",
        });

        setHome({
          height: Number(full.height ?? 0),
          length: Number(full.length ?? 0),
          width: Number(full.width ?? 0),
        });

        // limpiar selección previa del file si re-abro modal
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setFileKey((k) => k + 1);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al cargar producto";
        await Alerts.error("Error", msg);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product.id]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // liberar preview anterior
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setBaseField("img", file);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    // quita SOLO la seleccionada (no borra la actual del producto)
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBaseField("img", null);
    setFileKey((k) => k + 1);
  };

  const validate = (): string | null => {
    if (!base.name.trim()) return "El nombre es obligatorio";
    if (base.price <= 0) return "El precio debe ser mayor a 0";
    if (base.stock < 0) return "El stock no puede ser negativo";

    if (category === 0) {
      if (!clothes.size.trim() || !clothes.typeClothes.trim() || !clothes.typeGender.trim()) {
        return "En ropa debes completar talla, tipo de ropa y género";
      }
    } else {
      if (home.height <= 0 || home.length <= 0 || home.width <= 0) {
        return "En accesorios debes completar alto, largo y ancho (mayores a 0)";
      }
    }
    return null;
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

    // solo enviamos Image si seleccionó una nueva
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const check = validateProductForm({ category, base, clothes, home, isEdit: true, });

    const errorMsg = validate();
    if (errorMsg) {
      await Alerts.error("Formulario inválido", errorMsg);
      return;
    }

    if (!check.valid) {
      const msg = check.message ?? "Revisa el formulario.";
      await Alerts.error("Formulario inválido", msg);
      return;
    }

    const confirm = await Alerts.confirm2("¿Guardar cambios?", "Se actualizará el producto.");
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const fd = buildFormData();
      await updateProduct(product.id, fd);

      await Alerts.success("Actualizado", "Producto actualizado correctamente");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar el producto";
      await Alerts.error("Error", msg);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  // si hay imagen nueva, se ve esa. Si no, la actual.
  const displayImage = previewUrl || currentImg;

  return (
    <form className="product-form product-form--in-modal" onSubmit={handleSubmit}>
      <div className="form-grid-2">
        <div className="form-col-span-2">
          <p className="admin-subtitle">
            Categoría seleccionada: <strong>{categoryLabel(category)}</strong>
          </p>
        </div>
      </div>
      <div className="form-grid-2">
        <div className="field">
          <label className="label" htmlFor="name">Nombre</label>
          <input id="name" className="input" value={base.name}
            onChange={(e) => setBaseField("name", e.target.value)} onKeyDown={onlyLetters}

          />
        </div>

        <div className="field">
          <label className="label" htmlFor="category">Categoría</label>
          <select id="category" className="input" value={category}
            onChange={(e) => setCategory(Number(e.target.value) as Category)}
          >
            <option value={0}>Ropa</option>
            <option value={1}>Accesorios de casa</option>
          </select>
        </div>

        <div className="field form-col-span-2">
          <label className="label" htmlFor="description">Descripción</label>
          <textarea id="description" className="input textarea" value={base.description}
            onChange={(e) => setBaseField("description", e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="color">Color</label>
          <input id="color" className="input"
            value={base.color}
            onChange={(e) => setBaseField("color", e.target.value)}   onKeyDown={onlyLetters}

          />
        </div>

        <div className="field">
          <label className="label" htmlFor="typeMaterial">Tipo de material</label>
          <input id="typeMaterial" className="input"
            value={base.typeMaterial}
            onChange={(e) => setBaseField("typeMaterial", e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="price">Precio</label>
          <input id="price" className="input" type="number" step={1}
            value={base.price}
            onChange={(e) => setBaseField("price", Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="stock">Cantidad</label>
          <input id="stock" className="input" type="number" step={1}
            value={base.stock}
            onChange={(e) => setBaseField("stock", Number(e.target.value))}
          />
        </div>

        <div className="field form-col-span-2">
          <label className="label">Imagen (opcional)</label>

          <div className="file-row">
            <div className="input-file">
              <span className="file-hint">
                {base.img
                  ? `Seleccionada: ${base.img.name}`
                  : "Selecciona una imagen (opcional)"}
              </span>

              <input key={fileKey} type="file" accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <button type="button" className="btn small danger-soft" onClick={handleRemoveImage}
              disabled={!base.img}
              title="Quitar imagen seleccionada"
            >
              Quitar imagen
            </button>
          </div>

          {displayImage && (
            <div className="preview-wrap">
              <img className="preview-img" src={displayImage} alt="Vista previa" />

              <div className="preview-footer">
                <span>{base.img ? "Vista previa (nueva)" : "Imagen actual"}</span>
                <span>
                  {base.img ? `${(base.img.size / 1024).toFixed(1)} KB` : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="divider" />

      <h2 className="section-title">{extraTitle}</h2>

      {category === 0 ? (
        <div className="form-grid-3">
          <div className="field">
            <label className="label" htmlFor="size">Talla</label>
            <input id="size" className="input" value={clothes.size}
              onChange={(e) => setClothesField("size", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="typeClothes">Tipo de ropa</label>
            <input id="typeClothes" className="input" value={clothes.typeClothes}
              onChange={(e) => setClothesField("typeClothes", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="typeGender">Género</label>
            <select id="typeGender" className="input" value={clothes.typeGender}
              onChange={(e) => setClothesField("typeGender", e.target.value)}
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
            <label className="label" htmlFor="height">Altura</label>
            <input id="height" className="input" type="number" step={1}
              value={home.height}
              onChange={(e) => setHomeField("height", Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="length">Largo</label>
            <input id="length" className="input" type="number" step={1}
              value={home.length}
              onChange={(e) => setHomeField("length", Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="width">Ancho</label>
            <input id="width" className="input" type="number" step={1}
              value={home.width}
              onChange={(e) => setHomeField("width", Number(e.target.value))}
            />
          </div>
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn" onClick={onClose} disabled={loading}>
          Cancelar
        </button>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;
