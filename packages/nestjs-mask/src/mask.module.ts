import { DynamicModule, Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CountryCode } from '@nova/mask-utils';
import { MaskModuleOptions } from './mask-module-options.interface';
import { MaskService } from './mask.service';
import { MaskInterceptor } from './mask.interceptor';
import { MASK_MODULE_OPTIONS } from './constants';

/**
 * Módulo dinámico global de NestJS para enmascaramiento automático de datos sensibles.
 *
 * Registra el {@link MaskInterceptor} como interceptor global y provee
 * el {@link MaskService} para enmascaramiento manual.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [MaskModule.forRoot({ enabled: true, defaultCountry: CountryCode.PE })],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class MaskModule {
  /**
   * Registra el módulo de enmascaramiento como módulo global.
   *
   * @param options - Opciones de configuración. Si no se proporcionan,
   *   se usan valores por defecto: `enabled: true`, `defaultCountry: GENERIC`.
   * @returns Módulo dinámico configurado con interceptor y servicio.
   */
  static forRoot(options?: MaskModuleOptions): DynamicModule {
    const resolvedOptions: MaskModuleOptions = {
      enabled: options?.enabled ?? true,
      defaultCountry: options?.defaultCountry ?? CountryCode.GENERIC,
    };

    return {
      module: MaskModule,
      providers: [
        {
          provide: MASK_MODULE_OPTIONS,
          useValue: resolvedOptions,
        },
        MaskService,
        MaskInterceptor,
        {
          provide: APP_INTERCEPTOR,
          useExisting: MaskInterceptor,
        },
      ],
      exports: [MaskService, MASK_MODULE_OPTIONS],
    };
  }
}
