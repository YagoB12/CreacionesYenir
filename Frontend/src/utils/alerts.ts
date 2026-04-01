import Swal from "sweetalert2";
import "./alerts.css";

export const Alerts = {
  success(title = "Éxito", text = "") {
    return Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "Aceptar",
      background: "#f4f0fa",
      color: "#2d2d2d",
      confirmButtonColor: "#a855f7",
      customClass: {
        popup: "alert-popup",
        title: "alert-title",
        confirmButton: "alert-confirm",
      },
    });
  },

  error(title = "Error", text = "") {
    return Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "Aceptar",
      background: "#fff1f2",
      color: "#2d2d2d",
      confirmButtonColor: "#ef4444",
      customClass: {
        popup: "alert-popup",
        title: "alert-title",
        confirmButton: "alert-confirm",
      },
    });
  },
  alert(
    title="Alert",
    text="Alert",

  ){
    return Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonText: "Aceptar",
      background: "#fff1f2",
      color: "#2d2d2d",
      confirmButtonColor: "#a855f7",
      customClass: {
        popup: "alert-popup",
        title: "alert-title",
        confirmButton: "alert-confirm",
      },
    });
  } 
  ,

  

  confirm(
    title = "¿Estás seguro?",
    text = "Esta acción no se puede deshacer"
  ) {
    return Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "#a855f7",
      cancelButtonColor: "#f472b6",
      customClass: {
        popup: "alert-popup",
        title: "alert-title",
        confirmButton: "alert-confirm",
        cancelButton: "alert-cancel",
      },
    });
  },

  confirm2(
    title = "¿Estás seguro?",
    text = "Está seguro que quiere realizar los cambios."
  ) {
    return Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "#a855f7",
      cancelButtonColor: "#f472b6",
      customClass: {
        popup: "alert-popup",
        title: "alert-title",
        confirmButton: "alert-confirm",
        cancelButton: "alert-cancel",
      },
    });
  },
};