import type { Payment } from "./payment.type";

export const OrderStatus = {
    PENDING_VERIFICATION: 1,
    PAYMENT_CONFIRMED: 2,
    PAYMENT_CANCELLED: 3,
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface OrderDetail {
    productId: number;
    productName: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface OrderPayment {
    paymentId: number;
    total: number;
    paymentStatus: number;
    img: string;
    dateCreate: string;
    details: OrderDetail[];
}

export interface Order {
    orderId: number;
    dateEmission: string;
    status: number;
    payment: OrderPayment;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_VERIFICATION]: "Pedido pendiente de verificación",
    [OrderStatus.PAYMENT_CONFIRMED]: "Pedido confirmado",
    [OrderStatus.PAYMENT_CANCELLED]: "Pedido cancelado",
};