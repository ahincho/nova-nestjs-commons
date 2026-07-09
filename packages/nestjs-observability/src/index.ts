/**
 * @nova/nestjs-observability
 *
 * Módulo NestJS de observabilidad con OpenTelemetry para el ecosistema Nova Platform.
 * Proporciona integración completa con Four Golden Signals, trazas distribuidas,
 * correlación de logs y exportación OTLP.
 */

// Interfaces de configuración
export {
  ObservabilityModuleOptions,
  OtlpOptions,
  MetricsOptions,
  TracesOptions,
  LogsOptions,
  FilterOptions,
} from './interfaces/observability-module-options.interface';

export {
  ResolvedObservabilityOptions,
  ResolvedOtlpOptions,
  ResolvedMetricsOptions,
  ResolvedTracesOptions,
  ResolvedLogsOptions,
  ResolvedFilterOptions,
} from './interfaces/resolved-options.interface';

// Configuración y defaults
export { DEFAULT_OBSERVABILITY_OPTIONS } from './config/defaults';
export { resolveOptions } from './config/resolve-options';
