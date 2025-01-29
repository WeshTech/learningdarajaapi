import z from 'zod';

// Phone number schema
export const PhoneNumberSchema = z.string()
  .regex(/^0(7|1)\d{8}$/, "Phone number must start with 07 or 01")
  .length(10, "Please provide a valid phone number");

// Amount schema
export const AmountSchema = z
  .string()
  .refine(value => !isNaN(Number(value)), { message: "Amount must be a valid number." }) // Ensure it's a number
  .transform(value => Number(value))
  .refine(value => value >= 1, { message: "Amount must be at least KES 1." })
  .refine(value => value <= 249999, { message: "Amount must be less than 250,000." })
  .transform(value => value.toString())
