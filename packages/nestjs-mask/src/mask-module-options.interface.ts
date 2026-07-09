import { CountryCode } from '@nova/mask-utils';

/**
 * Opciones de configuración para el módulo de enmascaramiento.
 *
 * Permite habilitar/deshabilitar el enmascaramiento global y
 * definir el país por defecto para la resolución de estrategias.
 */
export interface MaskModuleOptions {
  /**
   * Indica si el enmascaramiento automático está habilitado.
   * Cuando es `false`, el interceptor retorna las respuestas sin modificar.
   * @default true
   */
  enabled?: boolean;

  /**
   * Código de país por defecto para la resolución de estrategias de enmascaramiento.
   * Se utiliza cuando no se especifica un país explícito en el decorador `@Masked`.
   * @default CountryCode.GENERIC
   */
  defaultCountry?: CountryCode;
}
