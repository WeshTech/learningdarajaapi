"use client";

import { PaymentSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import FormError from "./form-error";
import FormSuccess from "./form-success";

type FormData = z.infer<typeof PaymentSchema>;

const HomePage = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // const [loading, startTransition] = useTransition<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Add reset function
  } = useForm<FormData>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      phoneNumber: "",
      amount: 1,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);
    // Reset form after successful submission (optional)

    setError("A fucking error occurred");
    setSuccess("Payment was successful");

    reset(); 
  };

  return (
    <div className="flex justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 bg-white">
      <div className="w-[600px] flex flex-col justify-center border-2 p-5 border-amber-700 rounded-xl space-y-7 shadow-lg">
        <h1 className="text-xl m-4 text-center">Daraja API integration</h1>

        {/* Form wrapper */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div className="flex flex-col gap-4 items-start w-full">
            {/* Phone number input */}
            <label htmlFor="phonenumber" className="">Phone Number</label>
            <div className="flex flex-col w-2/3">
              <input
                type="text"
                {...register("phoneNumber", { required: "Phone number is required" })}
                placeholder="Enter your phone number"
                className="px-4 py-2 text-md border rounded-lg shadow-sm focus:ring-2 focus:ring-amber-600 focus:outline-none focus:border-transparent border-gray-300 placeholder-gray-400"
              />
              {/* Display error message below the input */}
              {errors.phoneNumber && (
                <span className="text-red-500 mt-1">{errors.phoneNumber?.message}</span>
              )}
            </div>

            {/* Amount input */}
            <label htmlFor="amount" className="">Enter the Amount</label>
            <div className="flex flex-col w-2/3">
              <input
                type="text"
                {...register("amount", { required: "Amount is required" })}
                placeholder="Enter your phone number"
                className="px-4 py-2 text-md border rounded-lg shadow-sm focus:ring-2 focus:ring-amber-600 focus:outline-none focus:border-transparent border-gray-300 placeholder-gray-400"
              />
              {/* Display error message below the input */}
              {errors.amount && (
                <span className="text-red-500 mt-1">{errors.amount?.message}</span>
              )}
            </div>
          </div>

          {/* form error and form success */}
              {error && <FormError message={error} />}
              {success && <FormSuccess message={success} />}

          {/* Centering the button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="p-3 w-1/2 bg-amber-700 text-white rounded-2xl hover:bg-amber-800 transition"
            >
              Pay Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
