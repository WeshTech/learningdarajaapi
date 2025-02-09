"use client";

import { PaymentSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import FormError from "./form-error";
import FormSuccess from "./form-success";
import { Loader } from "lucide-react";
import { handlePayment } from "@/actions/payment";
import useMpesaStore from "@/store/mpesaStore";

type FormData = z.infer<typeof PaymentSchema>;

const HomePage = () => {
  const { status, message } = useMpesaStore();
  const [isPending, startTransition] = useTransition();
  const [ error, setError ] = useState<string>("")
  const [ success, setSuccess ] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      phoneNumber: "",
      amount: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    useMpesaStore.setState({ status: "pending", message: "Processing payment..." });
    console.log("📤 Sending payment request:", data);
    
    startTransition(() => {
      handlePayment(data)
        .then((data) => {
          if (data?.status == "failed" && data?.message) {
            setError(data.message)
          }
          if ( data?.status == "success" && data?.message ) {
            setSuccess(data.message);
          }
          
        })
    });

    console.log({ status, message });
  };

  return (
    <div className="flex justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 bg-white">
      <div className="w-[600px] flex flex-col justify-center border-2 p-5 border-amber-700 rounded-xl space-y-7 shadow-lg">
        <h1 className="text-xl m-4 text-center">Daraja API Integration</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div className="flex flex-col gap-4 items-start w-full">
            {/* Phone Number Input */}
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="flex flex-col w-2/3">
              <input
                type="text"
                {...register("phoneNumber", { required: "Phone number is required" })}
                placeholder="Enter your phone number"
                disabled={isPending}
                className="px-4 py-2 text-md border rounded-lg shadow-sm focus:ring-2 focus:ring-amber-600 focus:outline-none focus:border-transparent border-gray-300 placeholder-gray-400"
              />
              {errors.phoneNumber && (
                <span className="text-red-500 mt-1">{errors.phoneNumber.message}</span>
              )}
            </div>

            {/* Amount Input */}
            <label htmlFor="amount">Enter the Amount</label>
            <div className="flex flex-col w-2/3">
              <input
                type="text"
                {...register("amount", { required: "Amount is required" })}
                placeholder="Enter amount"
                disabled={isPending}
                className="px-4 py-2 text-md border rounded-lg shadow-sm focus:ring-2 focus:ring-amber-600 focus:outline-none focus:border-transparent border-gray-300 placeholder-gray-400"
              />
              {errors.amount && (
                <span className="text-red-500 mt-1">{errors.amount.message}</span>
              )}
            </div>
          </div>

          {/* Error & Success Messages */}
          {<FormError message={error} />}
          {<FormSuccess message={success} />}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isPending}
              className="p-3 w-1/2 bg-amber-700 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-800 transition"
            >
              Pay Now
              <Loader size={20} className={`${isPending ? "visible animate-spin" : "invisible"}`} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
