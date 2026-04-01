export type UserRole = 0 | 1 | "CLIENT" | "ADMIN";


export type User = {
  id: number;
  name: string;
  lastName: string;
  birthDay: string;
  phoneNumber: string;
  gender: string;
  province: string;
  canton: string;
  district: string;
  exactAddress: string;
  email:string;
  role:UserRole;
};
export type UserError = {
  name: string;
  lastName: string;
  birthDay: string;
  phoneNumber: string;
  exactAddress: string;
};

//Respuesta del backend 
export type PromiseUser = {
  message:string;
  count:number;
  data:User[];
};

