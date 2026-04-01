import axios from "axios";
import type { Order } from "../types/order.type";
import { getAuthToken } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL;

class OrderService {

    async getMyOrders(): Promise<Order[]> {
        const token = getAuthToken();

        const response = await axios.get<Order[]>(
            `${API_URL}/api/orders/list`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    }

    async deleteMyOrder(orderId: number): Promise<void> {
        try {
            const token = getAuthToken();

            await axios.delete(
                `${API_URL}/api/orders/delete/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error: any) {
            console.error("Error al eliminar pedido:", error);
            const message = error.response?.data?.message 
                || error.response?.data 
                || error.message 
                || "Error al eliminar el pedido";
            throw new Error(message);
        }
    }

}

export default new OrderService();