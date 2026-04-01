import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { CreateInvoiceDTO, UpdateInvoiceDTO, Invoice, InvoiceApiResponse } from '../types/invoice.type';
import { getAuthToken } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL;

export interface ProductItem {
    productId: number;
    quantity: number;
}

class InvoiceService {

    async createInvoiceFromPayment(
        products: ProductItem[],
        paymentReceiptFile: File
    ): Promise<Invoice> {
        try {
            const token = getAuthToken();
            const formData = new FormData();

            products.forEach((product, index) => {
                formData.append(`orderPayment[${index}].ProductId`, product.productId.toString());
                formData.append(`orderPayment[${index}].Quantity`, product.quantity.toString());
            });

            formData.append('Img', paymentReceiptFile);

            const response: AxiosResponse<Invoice> = await axios.post(
                `${API_URL}/api/bills/create`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error al crear factura desde pago:', error);
            throw error;
        }
    }

    async getAllInvoices(): Promise<AxiosResponse<InvoiceApiResponse>> {
        try {
            const token = getAuthToken();
            const response = await axios.get<InvoiceApiResponse>(
                `${API_URL}/api/bills`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response;
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            throw error;
        }
    }


    async getPendingInvoices(): Promise<any[]> {
    try {
        const token = getAuthToken();

        const response = await axios.get(
            `${API_URL}/api/bills/pending`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error al obtener facturas pendientes:', error);
        throw error;
    }
}
}
export default new InvoiceService();