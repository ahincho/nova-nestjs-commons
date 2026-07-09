/**
 * @nova/nestjs-api-standard
 *
 * Módulo NestJS de envelope estándar para respuestas REST.
 * Integra la librería pura `@nova/api-standard` con el ciclo de vida de NestJS,
 * proporcionando un interceptor global y un filtro de excepciones.
 *
 * @packageDocumentation
 */

/* Módulo */
export { ApiStandardModule } from './api-standard.module';

/* Interceptor */
export { ApiStandardInterceptor } from './api-standard.interceptor';

/* Filtro de excepciones */
export { ApiStandardExceptionFilter } from './api-standard-exception.filter';
