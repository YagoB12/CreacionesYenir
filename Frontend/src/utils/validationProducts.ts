export type ProductValidationResult = {
    valid: boolean;
    message?: string;
    field?: string;
};

type BaseLike = {
    name: string;
    description: string;
    color: string;
    price: number;
    stock: number;
    typeMaterial: string;
    img: File | null;
};

type ClothesLike = {
    size: string;
    typeClothes: string;
    typeGender: string;
};

type HomeLike = {
    height: number;
    length: number;
    width: number;
};

type Category = 0 | 1;

const isEmpty = (v: string) => v.trim().length === 0;

export const validateProductForm = (args: {
    category: Category;
    base: BaseLike;
    clothes: ClothesLike;
    home: HomeLike;
    isEdit?: boolean;
}): ProductValidationResult => {
    const { category, base, clothes, home, isEdit = false } = args;

    if (isEmpty(base.name)) return { valid: false, field: "name", message: "El nombre es obligatorio." };
    if (isEmpty(base.description)) return { valid: false, field: "description", message: "La descripción es obligatoria." };
    if (isEmpty(base.color)) return { valid: false, field: "color", message: "El color es obligatorio." };
    if (isEmpty(base.typeMaterial)) return { valid: false, field: "typeMaterial", message: "El tipo de material es obligatorio." };

    if (!Number.isFinite(base.price) || base.price <= 0) {
        return { valid: false, field: "price", message: "El precio debe ser mayor a cero." };
    }
    if (!Number.isFinite(base.stock) || base.stock <= 0) {
        return { valid: false, field: "stock", message: "La cantidad debe ser mayor a cero." };
    }

    if (!isEdit && !base.img) {
        return {
            valid: false,
            field: "img",
            message: "Debes seleccionar una imagen.",
        };
    }

    if (category === 0) {
        if (isEmpty(clothes.size)) return { valid: false, field: "size", message: "La talla es obligatoria." };
        if (isEmpty(clothes.typeClothes)) return { valid: false, field: "typeClothes", message: "El tipo de ropa es obligatorio." };
        if (isEmpty(clothes.typeGender)) return { valid: false, field: "typeGender", message: "El género es obligatorio." };

        const allowed = ["Masculino", "Femenino", "Otro"] as const;
        if (!allowed.includes(clothes.typeGender as (typeof allowed)[number])) {
            return { valid: false, field: "typeGender", message: "El género debe ser Masculino, Femenino u Otro." };
        }
    } else {
        if (!Number.isFinite(home.height) || home.height <= 0)
            return { valid: false, field: "height", message: "La altura debe ser mayor a cero." };

        if (!Number.isFinite(home.length) || home.length <= 0)
            return { valid: false, field: "length", message: "El largo debe ser mayor a cero." };

        if (!Number.isFinite(home.width) || home.width <= 0)
            return { valid: false, field: "width", message: "El ancho debe ser mayor a cero." };
    }

    return { valid: true };
};
