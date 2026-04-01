import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReviewListItem } from "../types/review.types";
import type { ApiError, ModelStateErrorResponse } from "../types/api.types";
import { Alerts } from "../utils/alerts";
import { createReview, deleteReview, getReviewsByProduct, updateReview } from "../services/review.services";

//leer el userId del JWT (
function getMyUserIdFromToken(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    // base64url -> base64
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );

    const payload = JSON.parse(json) as Record<string, unknown>;

    const raw =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
      payload["nameid"] ??
      payload["sub"];

    if (raw == null) return null;

    const n = typeof raw === "number" ? raw : Number(String(raw));
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function useReviews(productId: number | null) {
  // estado principal
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);

  // estado para crear
  const [sendingReview, setSendingReview] = useState<boolean>(false);

  // estado para editar/borrar
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // auth info derivada
  const myUserId = useMemo(() => getMyUserIdFromToken(), []);
  const isLoggedIn = useMemo(() => Boolean(localStorage.getItem("token")), []);

  //cargar reseñas 
  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setReviews([]);
      setLoadingReviews(false);
      return;
    }

    setLoadingReviews(true);
    try {
      const resp = await getReviewsByProduct(productId);
      setReviews(resp.data);
    } catch (e) {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  //parseo de errores del backend  
  const parseApiError = (e: unknown, fallback: string): string => {
    const err = e as ApiError;

    if (err?.message === "NO_TOKEN" || err?.status === 401) {
      return "Debes iniciar sesión.";
    }

    if (typeof err?.data === "string") return err.data;

    if (err?.data && typeof err.data === "object" && "errors" in err.data) {
      const ms = err.data as ModelStateErrorResponse;
      return Object.values(ms.errors ?? {}).flat().join("\n") || fallback;
    }

    if (err?.data && typeof err.data === "object" && "message" in err.data) {
      return String((err.data as { message?: unknown }).message ?? fallback);
    }

    return fallback;
  };

  // crear reseña 
  const addReview = useCallback(
    async (comment: string, stars: number) => {
      if (!productId) return;

      if (!localStorage.getItem("token")) {
        await Alerts.error("Sesión", "Debes iniciar sesión para dejar una reseña.");
        return;
      }

      const clean = comment.trim();
      if (clean.length < 3) {
        await Alerts.error("Validación", "El comentario es muy corto.");
        return;
      }
      if (stars < 1 || stars > 5) {
        await Alerts.error("Validación", "La calificación debe ser entre 1 y 5.");
        return;
      }

      try {
        setSendingReview(true);
        const resp = await createReview({ productId, comment: clean, calification: stars });
        await Alerts.success("Listo", resp.message);
        await fetchReviews();
      } catch (e) {
        await Alerts.error("Error", parseApiError(e, "No se pudo crear la reseña."));
      } finally {
        setSendingReview(false);
      }
    },
    [productId, fetchReviews]
  );

  //editar reseña 
  const editReview = useCallback(
    async (reviewId: number, comment: string, stars: number) => {
      if (!localStorage.getItem("token")) {
        await Alerts.error("Sesión", "Debes iniciar sesión.");
        return;
      }

      const clean = comment.trim();
      if (clean.length < 3) {
        await Alerts.error("Validación", "El comentario es muy corto.");
        return;
      }
      if (stars < 1 || stars > 5) {
        await Alerts.error("Validación", "La calificación debe ser entre 1 y 5.");
        return;
      }

      try {
        setSavingEdit(true);
        const resp = await updateReview(reviewId, { comment: clean, calification: stars });
        await Alerts.success("Listo", resp.message);
        await fetchReviews();
      } catch (e) {
        await Alerts.error("Error", parseApiError(e, "No se pudo actualizar la reseña."));
      } finally {
        setSavingEdit(false);
      }
    },
    [fetchReviews]
  );

  // eliminar reseña 
  const removeReview = useCallback(
    async (reviewId: number) => {
      if (!localStorage.getItem("token")) {
        await Alerts.error("Sesión", "Debes iniciar sesión.");
        return;
      }

      try {
        setDeletingId(reviewId);
        const resp = await deleteReview(reviewId);
        await Alerts.success("Listo", resp.message);
        await fetchReviews();
      } catch (e) {
        await Alerts.error("Error", parseApiError(e, "No se pudo eliminar la reseña."));
      } finally {
        setDeletingId(null);
      }
    },
    [fetchReviews]
  );

  return {
    reviews,
    loadingReviews,
    fetchReviews,

    isLoggedIn,
    myUserId,

    sendingReview,
    savingEdit,
    deletingId,

    addReview,
    editReview,
    removeReview,
  };
}
