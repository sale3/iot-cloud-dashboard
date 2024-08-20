import * as yup from "yup";

export const protocolSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required("Required field!")
        .max(200, 'Maximum 200 characters!')
});