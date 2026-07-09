import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@nova/api-standard';

/**
 * Interceptor global que envuelve las respuestas exitosas de los controladores
 * en el envelope estándar {@link ApiResponse}.
 *
 * - Si el código de estado HTTP es 201, envuelve con `ApiResponse.created(data)`.
 * - Para otros códigos exitosos, envuelve con `ApiResponse.ok(data)`.
 * - Si la respuesta ya es una instancia de {@link ApiResponse}, la retorna sin modificar.
 *
 * @example
 * ```typescript
 * // Controlador retorna un objeto plano:
 * @Get()
 * findAll() { return [{ id: 1 }]; }
 * // Respuesta: { success: true, status: 200, data: [{ id: 1 }], ... }
 * ```
 */
@Injectable()
export class ApiStandardInterceptor implements NestInterceptor {
  /**
   * Intercepta la respuesta y la envuelve en ApiResponse si es necesario.
   *
   * @param context - Contexto de ejecución de NestJS.
   * @param next - Manejador de la cadena de interceptores.
   * @returns Observable con la respuesta envuelta en ApiResponse.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        // No envolver si ya es una instancia de ApiResponse
        if (data instanceof ApiResponse) {
          return data;
        }

        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse();
        const statusCode: number = response.statusCode ?? 200;

        if (statusCode === 201) {
          return ApiResponse.created(data);
        }

        return ApiResponse.ok(data);
      }),
    );
  }
}
