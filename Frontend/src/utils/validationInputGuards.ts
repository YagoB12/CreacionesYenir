import React from "react";

/**
 * Permite SOLO letras, espacios y acentos.
 * Bloquea números y caracteres especiales.
 */
export const onlyLetters = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
  ];

  if (allowedKeys.includes(e.key)) return;

  const regex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]$/;

  if (!regex.test(e.key)) {
    e.preventDefault();
  }
};
