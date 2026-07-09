import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MaskEngine,
  MaskType,
  CountryCode,
  MaskPropertyMetadata,
  inferMaskType,
  MASK_METADATA_KEY,
  MASK_CLASS_METADATA_KEY,
  SKIP_MASK_METADATA_KEY,
} from '@nova/mask-utils';
import { MASK_MODULE_OPTIONS } from './constants';
import { MaskModuleOptions } from './mask-module-options.interface';

/**
 * Interceptor global que enmascara automáticamente campos sensibles en las respuestas.
 *
 * Recorre recursivamente las propiedades string del objeto de respuesta y aplica
 * enmascaramiento según la siguiente prioridad:
 *
 * 1. Si `enabled` es `false` → retorna la respuesta sin modificar.
 * 2. Para cada propiedad string (recursivo):
 *    a. Si la propiedad tiene `@SkipMasking` → omite.
 *    b. Si la propiedad tiene `@Masked` con tipo explícito → usa ese tipo/país.
 *    c. Si la clase tiene `@SkipMasking` → omite (salvo que la propiedad tenga `@Masked`).
 *    d. Si la clase tiene `@MaskedClass` → infiere tipo por nombre de campo.
 *    e. Si el nombre del campo coincide con el Mapa de Inferencia → enmascara.
 *    f. En caso contrario → omite.
 */
@Injectable()
export class MaskInterceptor implements NestInterceptor {
  constructor(
    @Inject(MASK_MODULE_OPTIONS)
    private readonly options: MaskModuleOptions,
  ) {}

  /**
   * Intercepta la respuesta del controlador y aplica enmascaramiento.
   *
   * @param context - Contexto de ejecución de NestJS.
   * @param next - Manejador de la cadena de interceptores.
   * @returns Observable con la respuesta enmascarada.
   */
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (!this.options.enabled) {
          return data;
        }
        return this.maskValue(data);
      }),
    );
  }

  /**
   * Procesa un valor de forma recursiva para enmascarar campos sensibles.
   *
   * @param data - Valor a procesar. Puede ser un objeto, array o primitivo.
   * @returns El valor procesado con campos sensibles enmascarados.
   */
  private maskValue(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskValue(item));
    }

    if (typeof data === 'object') {
      return this.maskObject(data as Record<string, unknown>);
    }

    return data;
  }

  /**
   * Enmascara las propiedades de un objeto según los decoradores y el Mapa de Inferencia.
   *
   * Lee los metadatos del prototipo de la clase (constructor) para determinar
   * qué decoradores están aplicados a cada propiedad.
   *
   * @param obj - Objeto cuyas propiedades se van a evaluar para enmascaramiento.
   * @returns Copia del objeto con los campos sensibles enmascarados.
   */
  private maskObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = { ...obj };
    const prototype = Object.getPrototypeOf(obj);
    const defaultCountry = this.options.defaultCountry ?? CountryCode.GENERIC;

    // Verificar metadatos a nivel de clase
    const classHasSkipMasking = prototype
      ? Reflect.getMetadata(SKIP_MASK_METADATA_KEY, prototype) === true
      : false;
    const classHasMaskedClass = prototype
      ? Reflect.getMetadata(MASK_CLASS_METADATA_KEY, prototype) === true
      : false;

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      // Recursión para objetos anidados y arrays
      if (value !== null && value !== undefined && typeof value === 'object') {
        result[key] = this.maskValue(value);
        continue;
      }

      // Solo procesar propiedades string
      if (typeof value !== 'string') {
        continue;
      }

      const maskAction = this.determineMaskAction(
        key,
        prototype,
        classHasSkipMasking,
        classHasMaskedClass,
      );

      if (!maskAction) {
        continue;
      }

      const country = maskAction.country ?? defaultCountry;

      try {
        const maskResult = MaskEngine.mask(value, maskAction.type, country);
        if (maskResult.applied) {
          result[key] = maskResult.maskedValue;
        }
      } catch {
        // Si ocurre un error de formato o estrategia no encontrada, se omite el enmascaramiento
      }
    }

    return result;
  }

  /**
   * Determina la acción de enmascaramiento para una propiedad específica.
   *
   * Evalúa los decoradores y el Mapa de Inferencia según el orden de prioridad
   * definido en la documentación del interceptor.
   *
   * @param propertyKey - Nombre de la propiedad.
   * @param prototype - Prototipo de la clase del objeto.
   * @param classHasSkipMasking - Si la clase tiene `@SkipMasking`.
   * @param classHasMaskedClass - Si la clase tiene `@MaskedClass`.
   * @returns Acción de enmascaramiento o `null` si no se debe enmascarar.
   */
  private determineMaskAction(
    propertyKey: string,
    prototype: object | null,
    classHasSkipMasking: boolean,
    classHasMaskedClass: boolean,
  ): { type: MaskType; country?: CountryCode } | null {
    // a. Si la propiedad tiene @SkipMasking → omitir
    if (prototype) {
      const propertySkip = Reflect.getMetadata(
        SKIP_MASK_METADATA_KEY,
        prototype,
        propertyKey,
      );
      if (propertySkip === true) {
        return null;
      }
    }

    // b. Si la propiedad tiene @Masked con tipo explícito → usar ese tipo/país
    if (prototype) {
      const maskedMeta: MaskPropertyMetadata | undefined = Reflect.getMetadata(
        MASK_METADATA_KEY,
        prototype,
        propertyKey,
      );
      if (maskedMeta) {
        if (maskedMeta.type) {
          return { type: maskedMeta.type, country: maskedMeta.country };
        }
        // @Masked sin tipo explícito → inferir del nombre del campo
        const inferred = inferMaskType(propertyKey);
        if (inferred) {
          return { type: inferred, country: maskedMeta.country };
        }
        return null;
      }
    }

    // c. Si la clase tiene @SkipMasking → omitir (salvo @Masked explícito, ya evaluado arriba)
    if (classHasSkipMasking) {
      return null;
    }

    // d. Si la clase tiene @MaskedClass → inferir tipo por nombre de campo
    if (classHasMaskedClass) {
      const inferred = inferMaskType(propertyKey);
      if (inferred) {
        return { type: inferred };
      }
      return null;
    }

    // e. Si el nombre del campo coincide con el Mapa de Inferencia → enmascarar
    const inferred = inferMaskType(propertyKey);
    if (inferred) {
      return { type: inferred };
    }

    // f. En caso contrario → omitir
    return null;
  }
}
