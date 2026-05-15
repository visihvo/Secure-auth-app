import * as Yup from "yup";

/**
 * Registration validation schema
 * 
 * Security:
 * - Ensures consistent validation rules
 * - Prevents invalid data from reaching backend
 * - Password strength is checked
 */
export const registerSchema = Yup.object({
    username: Yup.string()
    .min(3)
    .max(40)
    .matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores")
    .required(),

    email: Yup.string()
        .email("Invalid email format")
        .required(),

    password: Yup.string()
        .min(12, "Minimum 12 characters")
        .matches(/[A-Z]/, "Must include uppercase")
        .matches(/[a-z]/, "Must include lowercase")
        .matches(/[0-9]/, "Must include number")
        .matches(/[^A-Za-z0-9]/, "Must include special character")
        .required(),

    password2: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
});