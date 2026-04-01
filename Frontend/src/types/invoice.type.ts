export const InvoiceStatus = {
  PENDING_VERIFICATION: 0,
  PAYMENT_CONFIRMED: 1,
  PAYMENT_CANCELLED: 2
} as const;

export type InvoiceStatusType = typeof InvoiceStatus[keyof typeof InvoiceStatus];

export const InvoiceStatusLabels: Record<number, string> = {
  1: 'Pendiente de verificación',
  2: 'Pago confirmado',
  3: 'Pago cancelado'
};

export interface PaymentReceipt {
  id: string;
  imageUrl: string;
  uploadedAt: Date;
  fileName?: string;
}

export interface Payment {
  id: number;
  dateCreate: string;
  status: number;
  totalPrice: number;
  img: string;
  userId: number;
}

export interface Invoice {
  id: number;
  numBill: string;
  nameClient: string;
  addressClient: string;
  dateEmission: string;
  totalAmount: number;
  status: number;
  payment?: Payment;
}

export interface InvoiceApiResponse {
  message: string;
  count: number;
  data: Invoice[];
}

export interface InvoiceFilters {
  searchTerm?: string; 
  status?: number;
  sortBy?: 'nameClient' | 'dateEmission';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateInvoiceDTO {
  paymentId: number;
  clientId: number;
  numBill: string;
  nameClient: string;
  addressClient: string;
  dateEmission: string;
  totalAmount: number;
  status: number;
}

export interface UpdateInvoiceDTO {
  paymentId?: number;
  clientId?: number;
  numBill?: string;
  nameClient?: string;
  addressClient?: string;
  dateEmission?: string;
  totalAmount?: number;
  status?: number;
}