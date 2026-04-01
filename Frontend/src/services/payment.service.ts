import axios from "axios";
import type { PaymentApiResponse } from "../types/payment.type";
import { getAuthToken } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL;

class PaymentService {
    async getAllPayments() {
        const token = getAuthToken();

        return await axios.get<PaymentApiResponse>(
            `${API_URL}/api/payment`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    }

    async verifyPayment(paymentId: number, status: number) {
        const token = getAuthToken();

        return await axios.put(
            `${API_URL}/api/payment/verify/${paymentId}?status=${status}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    }

}

export default new PaymentService();