import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

/** Every error response has this shape. Clients switch on `code`, show `message`. */
export interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

const CODE_BY_STATUS: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_FAILED',
  429: 'RATE_LIMITED',
};

/**
 * Normalises all errors into ErrorBody. Unexpected errors are logged with
 * full detail but the client only ever sees a generic message, so database
 * or stack details never leak.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.toResponse(exception);
    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack ?? exception.message : String(exception));
    }
    res.status(status).json(body);
  }

  private toResponse(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const p = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
      return {
        status,
        body: {
          error: {
            code: typeof p.code === 'string' ? p.code : CODE_BY_STATUS[status] ?? 'ERROR',
            message:
              typeof p.message === 'string' ? p.message : typeof payload === 'string' ? payload : exception.message,
            ...(p.details !== undefined && { details: p.details }),
          },
        },
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2025') {
        return { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Not found' } } };
      }
      if (exception.code === 'P2002') {
        return { status: 409, body: { error: { code: 'CONFLICT', message: 'That already exists' } } };
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' } },
    };
  }
}
