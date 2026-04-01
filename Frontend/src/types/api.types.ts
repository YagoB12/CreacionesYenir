export type ModelStateErrorResponse = {
  errors?: Record<string, string[]>;
  message?: string;
};

export type ApiError = {
  status?: number;
  message?: string;
  data?: unknown;
};