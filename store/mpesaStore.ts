import { create } from "zustand";

interface MpesaState {
    status: "iddle" | "pending" | "success" | "failed";
    message: string | null;
    setTransactionMessage: (status: MpesaState["status"], message: string) => void;
}

const useMpesaStore = create<MpesaState>((set) => ({
    status: "iddle",
    message: null,
    setTransactionMessage: (status, message) => set(() => ({ status, message })),
}));

export default useMpesaStore;