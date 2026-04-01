const API_URL = import.meta.env.VITE_API_URL;

import type { CreateReviewPayload, ReviewListItem, UpdateReviewPayload, AdminReviewListItem } from "../types/review.types";


const getToken = () => localStorage.getItem("token");

export const createReview = async (payload: CreateReviewPayload) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/api/reviews/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {

    throw { status: res.status, data };
  }

  return data as { message: string; reviewId: number };
};

export const getReviewsByProduct = async (productId: number) => {
  const res = await fetch(`${API_URL}/api/reviews/product/${productId}`);

  if (res.status === 404) {
    return {
      count: 0,
      data: [] as ReviewListItem[],
    };
  }

  if (!res.ok) {
    throw new Error("Error al obtener reseñas");
  }

  return res.json() as Promise<{
    message: string;
    count: number;
    data: ReviewListItem[];
  }>;
};

export const updateReview = async (reviewId: number, payload: UpdateReviewPayload) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/api/reviews/update/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data as { message: string; reviewId: number };
};

export const deleteReview = async (reviewId: number) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/api/reviews/delete/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data as { message: string; reviewId: number };
};


export const getAllReviewsAdmin = async () => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/api/reviews`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // aquí me sacsa si no es admin o el token no sirve
    throw { status: res.status, data };
  }

  return data as {
    message: string;
    count: number;
    data: AdminReviewListItem[];
  };
};

export const deleteReviewByAdmin = async (reviewId: number) => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/api/reviews/admin/delete/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data as {
    message: string;
    reviewId: number;
    productId: number;
    userId: number;
  };
};
