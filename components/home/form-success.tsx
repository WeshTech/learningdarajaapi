"use client";

import { CircleCheckBig } from 'lucide-react';

interface FormSuccessProps {
    message: string;
}

const FormSuccess = ({
    message,
}: FormSuccessProps) => {
    if (!message) return null;
    return (
        <div className="flex items-center gap-3 bg-green-300 text-green-600 w-full p-2 rounded-md">
            <CircleCheckBig size={20} />
            <p>
                {message}
            </p>
        </div>
    )
}

export default FormSuccess