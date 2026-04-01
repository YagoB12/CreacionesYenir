
import type { User } from "./user.types";
import type { ProductFromApi } from "./product.type";

export type Review = {
  id: number;

  userId: number;
  productId: number;

  comment: string;

  calification: number; // 1 a 5

  dateCreate: string; 
  
  user?: User | null;
  product?: ProductFromApi | null;
};


export type CreateReviewPayload = {
  productId: number;
  comment: string;
  calification: number; 
};

export type ReviewListItem = {
  id: number;
  userId: number;
  userName: string;
  comment: string;
  calification: number;
  dateCreate: string;
};

export type UpdateReviewPayload = {
  comment?: string | null;
  calification?: number | null; 
};

export type ApiMessageResponse = {
  message: string;
  reviewId: number;
};

export type AdminReviewListItem = {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  comment: string;
  calification: number;
  dateCreate: string;
};