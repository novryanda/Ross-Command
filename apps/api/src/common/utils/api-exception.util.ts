import { HttpException, HttpStatus } from '@nestjs/common';

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[] | Record<string, unknown>;
  };
  timestamp: string;
}

export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    code: string,
    message: string,
    details?: ApiErrorDetail[] | Record<string, unknown>,
  ) {
    const body: ApiErrorBody = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    };

    super(body, status);
  }
}
