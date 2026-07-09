/**
 * Configuración de Jest para @nova/nestjs-api-standard.
 * Extiende la configuración base del Parent.
 */
import type { Config } from 'jest';

/* eslint-disable @typescript-eslint/no-require-imports */
const baseConfig = require('@nova/nestjs-parent/jest.config.base.ts').default;

const config: Config = {
  ...baseConfig,
};

export default config;
