"use client";

import { Frown } from 'lucide-react';

interface FormErrorProps {
    message: string;
}

const FormError = ({
    message,
}: FormErrorProps) => {
    if (!message) return null;
    return (
        <div className="flex items-center gap-3 bg-red-300 text-red-600 w-full p-2 rounded-md">
            <Frown size={20} />
            <p>
                {message}
            </p>
        </div>
    )
}

export default FormError