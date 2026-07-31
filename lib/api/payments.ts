import { api } from "@/lib/api/axios";

export interface TransactionResponse {
  _id: string;
  booking_id: string;
  user_id: string;
  purohit_id: string;
  total_amount: number;
  platform_fee: number;
  purohit_amount: number;
  status: "PENDING" | "PAID" | "PAYOUT_PROCESSING" | "PAYOUT_SUCCESS" | "REFUNDED";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpayx_payout_id?: string;
}

export async function getTransactions() {
  const { data } = await api.get<TransactionResponse[]>("/payments/transactions");
  return data;
}
