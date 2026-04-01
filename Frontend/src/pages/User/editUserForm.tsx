import React, { useState, useEffect } from "react";
import "./EditUserForm.css";
import type { User, UserError } from "../../types/user.types";
import { Alerts } from "../../utils/alerts";
import { editUser} from "../../services/userService";
import { getCantonesByProvincia, getDistritosByCanton, getProvincias } from "../../services/apiUbication";
import type { Canton, Distrito, Provincia } from "../../types/geo.type";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void; // para rSecargar la tabla
};

const EditUserForm: React.FC<Props> = ({ isOpen, onClose, user, onSuccess }) => {
  const [form, setForm] = useState<User | null>(null);
  const [error, setError] = useState<UserError>({
    name: "", lastName: "", birthDay: "", phoneNumber: "", exactAddress: ""
  });


  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);


  useEffect(() => {
    if (user) {
      setForm(user);
      console.log(user)
      // Si el usuario ya tiene provincia, cargamos cascada
      console.log("ROLE VALUE:", user.role, "TYPE:", typeof user.role);

      if (user.province) {
        const provinciaSeleccionada = provincias.find(p => p.descripcion === user.province);

        if (provinciaSeleccionada) {
          getCantonesByProvincia(provinciaSeleccionada.idProvincia).then(cantonesData => {
            setCantones(cantonesData);

            const cantonSeleccionado = cantonesData.find(c => c.descripcion === user.canton);
            if (cantonSeleccionado) {
              getDistritosByCanton(cantonSeleccionado.idCanton).then(setDistritos);
            }
          });
        }
      }
    }
  }, [user, provincias]);


  useEffect(() => {
    if (isOpen) {
      getProvincias().then(setProvincias);
    }
  }, [isOpen]);


  if (!isOpen || !form) return null;
  const validateField = (name: string, value: string) => {
    let message = "";

    if (name === "name" || name === "lastName") {
      if (!value.trim()) {
        message = "Este campo es obligatorio";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
        message = "No puede contener números ni símbolos";
      }
    }

    if (name === "birthDay") {
      if (!value) {
        message = "Fecha obligatoria";
      } else {
        const date = new Date(value);
        const today = new Date();

        const year = date.getFullYear();
        if (year < 1900) {
          message = "La fecha no puede ser menor a 1900";
        } else if (date > today) {
          message = "No puede ser mayor a hoy";
        } else {
          const age = today.getFullYear() - year;
          if (age < 12) {
            message = "Debe ser mayor de 12 años";
          }
        }
      }
    }

    if (name === "phoneNumber") {
      if (!value.trim()) {
        message = "Teléfono obligatorio";
      } else if (!/^[0-9]+$/.test(value)) {
        message = "Solo números";
      } else if (value.length < 3 || value.length > 11) {
        message = "Debe tener entre 3 y 11 dígitos";
      }
    }

    if (name === "exactAddress") {
      if (!value.trim()) {
        message = "La dirección no puede estar vacía";
      }
    }

    setError((prev) => ({
      ...prev,
      [name]: message
    }));

    return message === "";
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    validateField(name, value);

    setForm({
      ...form!,
      [name]: value
    });
  };

  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({
      ...form!,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid =
      validateField("name", form.name) &&
      validateField("lastName", form.lastName) &&
      validateField("lastName", form.lastName) &&
      validateField("birthDay", form.birthDay) &&
      validateField("phoneNumber", form.phoneNumber) &&
      validateField("exactAddress", form.exactAddress);

    if (!isValid) {
      await Alerts.error("Formulario inválido", "Corrige los errores antes de guardar");
      return;
    }

    try {
      const result = await Alerts.confirm2(
        "¿Guardar cambios?",
        "¿Está seguro que quiere realizar los cambios?"
      );
      console.log(result.isConfirmed);
      if (!result.isConfirmed) {
        return;
      }
      const response = await editUser(
        form.id, form
      )
      if (!response.ok) {
        await Alerts.error("Error", "No se pudo actualizar correctamente");


        return;
      }
      await Alerts.success("Actualizado", "Se realizaron los cambios correctamente");

      onSuccess(); // recarga tabla
      onClose();   // cierra modal
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };
  const handleCancel = () => {
    setForm(user)
    onClose()
  }

  const handleProvinciaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinciaNombre = e.target.value;

    setForm({
      ...form!,
      province: provinciaNombre,
      canton: "",
      district: ""
    });

    const provincia = provincias.find(p => p.descripcion === provinciaNombre);
    if (!provincia) return;

    const cantonesData = await getCantonesByProvincia(provincia.idProvincia);
    setCantones(cantonesData);
    setDistritos([]);
  };

  const handleCantonChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cantonNombre = e.target.value;

    setForm({
      ...form!,
      canton: cantonNombre,
      district: ""
    });

    const canton = cantones.find(c => c.descripcion === cantonNombre);
    if (!canton) return;

    const distritosData = await getDistritosByCanton(canton.idCanton);
    setDistritos(distritosData);
  };

  const handleDistritoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({
      ...form!,
      district: e.target.value
    });
  };


  return (
    <div>
      <form >

        <div>
          <label>Nombre</label>
          <input name="name" value={form.name} onChange={handleChange} />
          {error.name && <span className="error-text">{error.name}</span>}

        </div>

        <div>
          <label>Apellido</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} />
          {error.lastName && <span className="error-text">{error.lastName}</span>}

        </div>

        <div>
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            name="birthDay"
            value={form.birthDay.split("T")[0]}
            onChange={handleChange}
          />
          {error.birthDay && <span className="error-text">{error.birthDay}</span>}

        </div>

        <div>
          <label>Teléfono</label>
          <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
          {error.phoneNumber && <span className="error-text">{error.phoneNumber}</span>}

        </div>

        <div>
          <label>Género</label>
          <select name="gender" value={form.gender} onChange={handleChangeSelect} >
            <option value={"Masculino"}>Masculino</option>
            <option value={"Femenino"}>Femenino</option>
            <option value={"Ninguno"}>Ninguno</option>
          </select>
        </div>

        <div>
          <label>Provincia</label>
          <select value={form.province} onChange={handleProvinciaChange}>
            <option value="">Seleccione provincia</option>
            {provincias.map((p) => (
              <option key={p.idProvincia} value={p.descripcion}>
                {p.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Cantón</label>
          <select value={form.canton} onChange={handleCantonChange} disabled={!cantones.length}>
            <option value="">Seleccione cantón</option>
            {cantones.map((c) => (
              <option key={c.idCanton} value={c.descripcion}>
                {c.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Distrito</label>
          <select value={form.district} onChange={handleDistritoChange} disabled={!distritos.length}>
            <option value="">Seleccione distrito</option>
            {distritos.map((d) => (
              <option key={d.idDistrito} value={d.descripcion}>
                {d.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label>Dirección exacta</label>
          <input
            name="exactAddress"
            value={form.exactAddress}
            onChange={handleChange}
          />
          {error.exactAddress && <span className="error-text">{error.exactAddress}</span>}

        </div>

        <button className="btn" onClick={handleSubmit} >Guardar</button>
        <button className="btn" onClick={handleCancel}>Cancelar</button>



      </form>

    </div>

  );
};

export default EditUserForm;
