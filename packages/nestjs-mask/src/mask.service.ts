import { Injectable, Inject } from '@nestjs/common';
import {
  MaskEngine,
  MaskType,
  CountryCode,
  MaskResult,
} from '@nova/mask-utils';
import { MASK_MODULE_OPTIONS } from './constants';
import { MaskModuleOptions } from './mask-module-options.interface';

/**
 * Servicio inyectable para enmascaramiento manual de datos sensibles.
 *
 * Delega las operaciones de enmascaramiento al {@link MaskEngine} de la
 * librería pura `@nova/mask-utils`. Utiliza el país por defecto
 * configurado en el módulo cuando no se especifica uno explícitamente.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly maskService: MaskService) {}
 *
 *   maskEmail(email: string): string {
 *     const result = this.maskService.mask(email, MaskType.EMAIL);
 *     return result.maskedValue;
 *   }
 * }
 * ```
 */
@Injectable()
export class MaskService {
  constructor(
    @Inject(MASK_MODULE_OPTIONS)
    private readonly options: MaskModuleOptions,
  ) {}

  /**
   * Enmascara un valor según el tipo de dato y país especificados.
   *
   * @param value - Valor a enmascarar.
   * @param type - Tipo de dato sensible.
   * @param country - Código de país. Si no se especifica, usa el país por defecto del módulo.
   * @returns Resultado de la operación de enmascaramiento.
   */
  mask(
    value: string,
    type: MaskType,
    country?: CountryCode,
  ): MaskResult {
    const resolvedCountry = country ?? this.options.defaultCountry ?? CountryCode.GENERIC;
    return MaskEngine.mask(value, type, resolvedCountry);
  }
}
