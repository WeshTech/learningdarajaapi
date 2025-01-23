import z from 'zod';
import { AmountSchema, PhoneNumberSchema } from './schema';

export const PaymentSchema = z.object({
    phoneNumber: PhoneNumberSchema,
    amount: AmountSchema
})