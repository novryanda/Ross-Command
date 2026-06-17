import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { ApiException } from '../utils/api-exception.util';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ApiException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (exception instanceof ZodError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input tidak valid',
          details: exception.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      const status =
        exception.code === 'P2002'
          ? HttpStatus.CONFLICT
          : HttpStatus.BAD_REQUEST;

      response.status(status).json({
        success: false,
        error: {
          code: status === HttpStatus.CONFLICT ? 'CONFLICT' : 'DATABASE_ERROR',
          message:
            status === HttpStatus.CONFLICT
              ? 'Data duplikat terdeteksi'
              : 'Operasi database gagal diproses',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();

      if (typeof raw === 'object' && raw !== null) {
        response.status(status).json(raw);
        return;
      }

      response.status(status).json({
        success: false,
        error: {
          code: status === 401 ? 'UNAUTHORIZED' : 'ERROR',
          message: String(raw),
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan internal pada server',
      },
      timestamp: new Date().toISOString(),
    });
  }
}
