/**
 * Función de resolución de configuración del módulo de observabilidad.
 * Realiza deep merge de opciones parciales con los valores por defecto,
 * aplica variables de entorno y valida el resultado.
 */

import { ObservabilityModuleOptions } from '../interfaces/observability-module-options.interface';
import { ResolvedObservabilityOptions } from '../interfaces/resolved-options.interface';
import { DEFAULT_OBSERVABILITY_OPTIONS } from './defaults';

/**
 * Valida que una cadena tenga formato de URL válida (http o https).
 *
 * @param endpoint - Cadena a validar como URL
 * @throws Error si el formato de URL es inválido
 */
function validateEndpointUrl(endpoint: string): void {
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(
        `El endpoint OTLP debe usar protocolo http o https. Recibido: "${endpoint}"`,
      );
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `El endpoint OTLP tiene un formato de URL inválido. Recibido: "${endpoint}"`,
      );
    }
    throw error;
  }
}

/**
 * Resuelve la configuración completa del módulo de observabilidad.
 * Realiza deep merge de las opciones parciales proporcionadas con los valores por defecto,
 * aplica variables de entorno estándar de OpenTelemetry y valida el resultado.
 *
 * Variables de entorno soportadas:
 * - `OTEL_EXPORTER_OTLP_ENDPOINT`: URL del Collector (sobreescribe otlp.endpoint)
 * - `OTEL_SERVICE_NAME`: Nombre del servicio (sobreescribe serviceName)
 * - `OTEL_SERVICE_NAMESPACE`: Namespace del servicio (sobreescribe serviceNamespace)
 *
 * @param partial - Opciones parciales proporcionadas por el usuario (puede ser undefined)
 * @returns Configuración completa con todos los campos definidos
 * @throws Error si el endpoint OTLP tiene formato de URL inválido
 */
export function resolveOptions(
  partial?: ObservabilityModuleOptions,
): ResolvedObservabilityOptions {
  const defaults = DEFAULT_OBSERVABILITY_OPTIONS;

  const resolved: ResolvedObservabilityOptions = {
    enabled: partial?.enabled ?? defaults.enabled,
    serviceName: partial?.serviceName ?? defaults.serviceName,
    serviceNamespace: partial?.serviceNamespace ?? defaults.serviceNamespace,
    environment: partial?.environment ?? defaults.environment,
    otlp: {
      endpoint: partial?.otlp?.endpoint ?? defaults.otlp.endpoint,
      protocol: partial?.otlp?.protocol ?? defaults.otlp.protocol,
      timeout: partial?.otlp?.timeout ?? defaults.otlp.timeout,
      headers: partial?.otlp?.headers ?? { ...defaults.otlp.headers },
    },
    metrics: {
      enabled: partial?.metrics?.enabled ?? defaults.metrics.enabled,
      goldenSignals: partial?.metrics?.goldenSignals ?? defaults.metrics.goldenSignals,
      exportIntervalMs: partial?.metrics?.exportIntervalMs ?? defaults.metrics.exportIntervalMs,
      prefix: partial?.metrics?.prefix ?? defaults.metrics.prefix,
    },
    traces: {
      enabled: partial?.traces?.enabled ?? defaults.traces.enabled,
      samplingRatio: partial?.traces?.samplingRatio ?? defaults.traces.samplingRatio,
    },
    logs: {
      enabled: partial?.logs?.enabled ?? defaults.logs.enabled,
      exportToOtlp: partial?.logs?.exportToOtlp ?? defaults.logs.exportToOtlp,
    },
    filter: {
      excludePaths: partial?.filter?.excludePaths ?? [...defaults.filter.excludePaths],
      normalizeIds: partial?.filter?.normalizeIds ?? defaults.filter.normalizeIds,
    },
  };

  // Aplicar variables de entorno (tienen prioridad sobre opciones programáticas)
  const envEndpoint = process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];
  if (envEndpoint) {
    resolved.otlp.endpoint = envEndpoint;
  }

  const envServiceName = process.env['OTEL_SERVICE_NAME'];
  if (envServiceName) {
    resolved.serviceName = envServiceName;
  }

  const envServiceNamespace = process.env['OTEL_SERVICE_NAMESPACE'];
  if (envServiceNamespace) {
    resolved.serviceNamespace = envServiceNamespace;
  }

  // Validar formato de URL del endpoint
  validateEndpointUrl(resolved.otlp.endpoint);

  return resolved;
}
