export type RegisterValidationResult = {
    valid: boolean;
    message?: string;
    field?: string; // opcional para saber qué campo falló
};

type RegisterFormLike = {
    name: string;
    lastName: string;
    birthDay: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    gender: string;
    province: string;
    canton: string;
    district: string;
    exactAddress: string;
};

const isEmpty = (value: string) => value.trim().length === 0;

export const validateRegisterForm = (
    form: RegisterFormLike
): RegisterValidationResult => {


    if (isEmpty(form.name)) return { valid: false, field: "name", message: "El nombre es obligatorio." };
    const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

    if (!nameRegex.test(form.name)) {
        return {
            valid: false,
            field: "name",
            message: "El nombre solo puede contener letras y espacios.",
        };
    }

    if (form.name.trim().length < 2) {
        return {
            valid: false,
            field: "name",
            message: "El nombre debe tener al menos 2 letras.",
        };
    }

    if (isEmpty(form.lastName)) return { valid: false, field: "lastName", message: "Los apellidos son obligatorios." };

    if (!nameRegex.test(form.lastName)) {
        return {
            valid: false,
            field: "lastName",
            message: "Los apellidos solo pueden contener letras y espacios.",
        };
    }

    if (form.lastName.trim().length < 2) {
        return {
            valid: false,
            field: "lastName",
            message: "El apellido debe tener al menos 2 letras.",
        };
    }

    if (isEmpty(form.birthDay)) return { valid: false, field: "birthDay", message: "La fecha de nacimiento es obligatoria." };
    const birthDate = new Date(form.birthDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
        return {
            valid: false,
            field: "birthDay",
            message: "La fecha de nacimiento no puede ser una fecha futura.",
        };
    }

    if (isEmpty(form.phoneNumber)) return { valid: false, field: "phoneNumber", message: "El teléfono es obligatorio." };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
        return { valid: false, field: "email", message: "El correo no tiene un formato válido." };
    }

    if (isEmpty(form.email)) return { valid: false, field: "email", message: "El correo es obligatorio." };
    if (isEmpty(form.gender)) return { valid: false, field: "gender", message: "El género es obligatorio." };
    if (isEmpty(form.province)) return { valid: false, field: "province", message: "La provincia es obligatoria." };
    if (isEmpty(form.canton)) return { valid: false, field: "canton", message: "El cantón es obligatorio." };
    if (isEmpty(form.district)) return { valid: false, field: "district", message: "El distrito es obligatorio." };
    if (isEmpty(form.exactAddress)) return { valid: false, field: "exactAddress", message: "La dirección exacta es obligatoria." };

    if (isEmpty(form.password) || isEmpty(form.confirmPassword)) {
        return { valid: false, field: "password", message: "La contraseña y su confirmación son obligatorias." };
    }

    if (form.password.length < 8) {
        return { valid: false, field: "password", message: "La contraseña debe tener al menos 8 caracteres." };
    }

    if (!/[a-z]/.test(form.password)) {
        return { valid: false, field: "password", message: "La contraseña debe incluir al menos una letra minúscula." };
    }

    if (!/[A-Z]/.test(form.password)) {
        return { valid: false, field: "password", message: "La contraseña debe incluir al menos una letra mayúscula." };
    }

    if (!/\d/.test(form.password)) {
        return { valid: false, field: "password", message: "La contraseña debe incluir al menos un número." };
    }

    if (form.password !== form.confirmPassword) {
        return { valid: false, field: "confirmPassword", message: "Las contraseñas no coinciden." };
    }

    return { valid: true };
};
