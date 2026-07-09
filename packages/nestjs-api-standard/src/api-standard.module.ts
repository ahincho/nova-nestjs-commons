import { DynamicModule, Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ApiStandardInterceptor } from './api-standard.interceptor';
import { ApiStandardExceptionFilter } from './api-standard-exception.filter';

/**
 * Módulo dinámico global de NestJS para el envelope estándar de respuestas REST.
 *
 * Registra el {@link ApiStandardInterceptor} como interceptor global para envolver
 * respuestas exitosas en {@link ApiResponse}, y el {@link ApiStandardExceptionFilter}
 * como filtro global para convertir excepciones en respuestas de error estándar.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [ApiStandardModule.forRoot()],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class ApiStandardModule {
  /**
   * Registra el módulo de API estándar como módulo global.
   *
   * @returns Módulo dinámico configurado con interceptor y filtro de excepciones.
   */
  static forRoot(): DynamicModule {
    return {
      module: ApiStandardModule,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ApiStandardInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: ApiStandardExceptionFilter,
        },
      ],
    };
  }
}
