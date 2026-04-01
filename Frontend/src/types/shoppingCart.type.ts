export interface ShoppingCartItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ShoppingCart {
  id: number;
  userId: number;
  total: number;
  items: ShoppingCartItem[];
}
export interface AddToCartDTO {
  productId: number;
  quantity: number;
}