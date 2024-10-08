import * as yup from "yup";

export const protocolDataSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required("Required field!")
        .max(200, 'Maximum number of characters for this field is 200!'),
    canId: yup
        .number()
        .required("Required field!")
        .min(1, "Minimum number for this field is 1!")
        .max(2048, "Maximum number for this field is 2048!"),
    startBit: yup
        .number()
        .required("Required field!")
        .min(0, "Minimum number for this field is 0!")
        .max(63, "Maximum number for this field is 63!"),
    numBits: yup
        .number()
        .required("Required field!")
        .min(1, "Minimum number for this field is 1!")
        .max(64, "Maximum value for this field is 64"),
    transmitInterval: yup
        .number()
        .required("Required field!")
        .min(1, "Minimum number for this field is 1!"),
    aggregationMethod: yup
        .string()
        .trim()
        .oneOf(["MIN", "MAX", "AVG", "SUM", "NONE"], "Invalid aggregation method")
        .required("Required field!"),
    mode: yup
        .string()
        .trim()
        .required("Required field!"),
    multiplier: yup
        .number()
        .required("Required field!")
        .test(
            'not-zero',
            'Value cannot be zero!',
            value => value !== 0
        ),
    divisor: yup
        .number()
        .required("Required field!")
        .test(
            'not-zero',
            'Value cannot be zero!',
            value => value !== 0
        ),
    offsetValue: yup
        .number()
        .required("Required field!"),
    unit: yup.string().trim()
});