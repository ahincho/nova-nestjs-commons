/**
 * Interfaces de configuración resuelta (todas las propiedades requeridas).
 * Representan el estado final de la configuración después de aplicar defaults.
 */

/**
 * Opciones OTLP resueltas — todas las propiedades son requeridas.
 */
export interface ResolvedOtlpOptions {
  /** URL base del OpenTelemetry Collector */
  endpoint: string;

  /** Protocolo de exportación OTLP */
  protocol: 'http/protobuf' | 'http/json';

  /** Timeout de exportación en milisegundos */
  timeout: number;

  /** Headers adicionales para las peticiones al Collector */
  headers: Record<string, string>;
}

/**
 * Opciones de métricas resueltas — todas las propiedades son requeridas.
 */
export interface ResolvedMetricsOptions {
  /** Indica si la exportación de métricas está activa */
  enabled: boolean;

  /** Indica si el registro automático de Four Golden Signals está activo */
  goldenSignals: boolean;

  /** Intervalo de exportación de métricas en milisegundos */
  exportIntervalMs: number;

  /** Prefijo para los nombres de métricas Golden Signals */
  prefix: string;
}

/**
 * Opciones de trazas resueltas — todas las propiedades son requeridas.
 */
export interface ResolvedTracesOptions {
  /** Indica si la generación de trazas está activa */
  enabled: boolean;

  /** Ratio de sampling (0.0 a 1.0) */
  samplingRatio: number;
}

/**
 * Opciones de logs resueltas — todas las propiedades son requeridas.
 */
export interface ResolvedLogsOptions {
  /** Indica si la correlación de logs está activa */
  enabled: boolean;

  /** Indica si se exportan logs al Collector vía OTLP */
  exportToOtlp: boolean;
}

/**
 * Opciones de filtrado resueltas — todas las propiedades son requeridas.
 */
export interface ResolvedFilterOptions {
  /** Rutas excluidas del registro de métricas */
  excludePaths: string[];

  /** Indica si se normalizan URIs con path patterns de controladores */
  normalizeIds: boolean;
}

/**
 * Configuración completa resuelta del módulo de observabilidad.
 * Todas las propiedades son requeridas — resultado de aplicar defaults sobre opciones parciales.
 */
export interface ResolvedObservabilityOptions {
  /** Indica si el módulo está activo */
  enabled: boolean;

  /** Nombre del servicio para el resource de OpenTelemetry */
  serviceName: string;

  /** Namespace del servicio (equipo, dominio) */
  serviceNamespace: string;

  /** Ambiente de ejecución (dev, staging, production) */
  environment: string;

  /** Configuración de exportación OTLP resuelta */
  otlp: ResolvedOtlpOptions;

  /** Configuración de métricas resuelta */
  metrics: ResolvedMetricsOptions;

  /** Configuración de trazas resuelta */
  traces: ResolvedTracesOptions;

  /** Configuración de logs resuelta */
  logs: ResolvedLogsOptions;

  /** Configuración de filtrado resuelta */
  filter: ResolvedFilterOptions;
}
