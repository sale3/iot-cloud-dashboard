import * as yup from "yup";

export const protocolDataSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required("Required field!")
        .max(200, 'Maximum 200 characters!'),
    canId: yup
        .number()
        .required("Required field!")
        .min(1, "Minimum number for this field is 1!"),
    startBit: yup
        .number()
        .required("Required field!")
        .min(0, "Minimum number for this field is 0!"),
    numBits: yup
        .number()
        .required("Required field!")
        .min(1, "Minimum number for this field is 1!"),
    transmitInterval: yup
        .number()
        .required("Required field!")
        .min(1, "Minimum number for this field is 1!"),
    aggregationMethod: yup
        .string()
        .trim()
        .required("Required field!"),
    mode: yup
        .string()
        .trim()
        .required("Required field!"),
    multiplier: yup
        .number()
        .required("Required field!")
        .min(1, "Minimum number for this field is 1!"),
    divisor: yup
        .number()
        .required("Required field!")
        .min(1, "Minimum number for this field is 1!"),
    offsetValue: yup
        .number()
        .required("Required field!"),
    unit: yup.string().trim()
});