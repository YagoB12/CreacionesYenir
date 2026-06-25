export interface PaymentDetail {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitePrice: number;
  totalPrice: number;
}

export interface PaymentUser {
  userId: number;
  name: string;
  lastName: string;
  email: string;
}

export interface PaymentBill {
  id: number;
  numBill: string;
  dateEmission: string;
  status: number;
  totalAmount: number;
}

export interface PaymentSinpeInfo {
  bank: string;
  referenceNumber: string | null;
  amount: number | null;
  transferDate: string | null;
  transferTime: string | null;
  destinationName: string | null;
  destinationPhone: string | null;
  validationScore: number | null;
}


export interface Payment {
  id: number;
  dateCreate: string;
  status: number;
  totalPrice: number;
  img: string;
  user: PaymentUser;
  bill: PaymentBill | null;
  details: PaymentDetail[];
  sinpeInfo: PaymentSinpeInfo | null;
}

export interface PaymentApiResponse {
  message: string;
  count: number;
  data: Payment[];
}