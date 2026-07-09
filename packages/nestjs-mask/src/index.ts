/**
 * @nova/nestjs-mask
 *
 * Módulo NestJS de enmascaramiento automático de datos sensibles.
 * Integra la librería pura `@nova/mask-utils` con el ciclo de vida de NestJS,
 * proporcionando un interceptor global, un servicio inyectable y soporte para decoradores.
 *
 * @packageDocumentation
 */

/* Módulo */
export { MaskModule } from './mask.module';

/* Constantes */
export { MASK_MODULE_OPTIONS } from './constants';

/* Opciones */
export { MaskModuleOptions } from './mask-module-options.interface';

/* Servicio */
export { MaskService } from './mask.service';

/* Interceptor */
export { MaskInterceptor } from './mask.interceptor';
