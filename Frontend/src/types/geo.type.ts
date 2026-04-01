export interface Provincia {
  idProvincia: number;
  descripcion: string;
}

export interface Canton {
  idCanton: number;
  idProvincia: number;
  descripcion: string;
}

export interface Distrito {
  idDistrito: number;
  idCanton: number;
  descripcion: string;
}

export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}
