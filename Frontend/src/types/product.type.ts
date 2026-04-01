export type Category = 0 | 1; 

export type ProductBaseFields = {
  id?: number;
  name: string;
  description: string;
  color: string;
  price: number;
  stock: number;
  img: File | null;
  typeMaterial: string;
};

export type ClothesFields = {
  size: string;
  typeClothes: string;
  typeGender: string;
};

export type HomeAccessoriesFields = {
  height: number;
  length: number;
  width: number;
};

  export type ProductFormState =
   | (ProductBaseFields & { category: 0 } & ClothesFields)
  | (ProductBaseFields & { category: 1 } & HomeAccessoriesFields);

  export type ProductFromApi = {
  id: number;
  name: string;
  description: string | null;
  category: string; 
  color: string | null;
  price: number;
  stock: number;
  img: string | null;
  typeMaterial: string | null;

  size: string | null;
  typeClothes: string | null;
  typeGender: string | null;

  height: number | null;
  length: number | null;
  width: number | null;

  createdAt: string;
};

export type GetAllProductsResponse = {
  message: string;
  count: number;
  data: ProductFromApi[];
};
export type GetProductsResponse = {
  message: string;
  count: number;
  data: ProductFromApi;
};

export type CreateProductResponse = {
  message: string;
  productId: number;
  imageUrl: string;
};
