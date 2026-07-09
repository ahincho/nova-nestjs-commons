import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse } from '@nova/api-standard';

/**
 * Filtro global de excepciones que convierte errores no capturados
 * en respuestas con el formato estándar {@link ApiResponse}.
 *
 * - Para excepciones de tipo {@link HttpException}, extrae el código de estado
 *   y el mensaje de la excepción.
 * - Para excepciones desconocidas, retorna un error 500 con mensaje genérico.
 *
 * @example
 * ```typescript
 * // Excepción lanzada en un controlador:
 * throw new NotFoundException('Usuario no encontrado');
 * // Respuesta: { success: false, status: 404, errors: [{ code: "ERR_404", message: "Usuario no encontrado" }], ... }
 * ```
 */
@Catch()
export class ApiStandardExceptionFilter implements ExceptionFilter {
  /**
   * Captura la excepción y envía una respuesta de error estándar.
   *
   * @param exception - Excepción capturada.
   * @param host - Contexto de argumentos de NestJS.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message?.toString() ??
            exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor';
    }

    const apiResponse = ApiResponse.error(status, message);

    response.status(status).json(apiResponse);
  }
}
