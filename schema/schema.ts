import z from 'zod';

// Phone number schema
export const PhoneNumberSchema = z.string()
  .regex(/^0(7|1)\d{8}$/, "Phone number must start with 07 or 01 and must be 10 digits.")
  .length(10);

// Amount schema
export const AmountSchema = z.number({
    invalid_type_error: "Amount must be a number.",
})
  .min(1, "Amount must be at least kes 1.")
  .max(249999, "Amount must be less than 250,000.")
  .int("Amount must be numbers.");