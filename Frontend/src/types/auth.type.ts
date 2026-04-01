export type RegisterPayload = {
  name: string;
  lastName: string;
  birthDay: string; 
  email: string;
  password: string; 
  phoneNumber: string;
  gender: string;
  province: string;
  canton: string;
  district: string;
  exactAddress: string;
};

export type LoginPayload = {
  email: string;
  password: string; 
};

export type LoginResponse = {
  message: string;
  userId?: number;
  email?: string;
  name?: string;
  role?: string;
  token?: string;
};
