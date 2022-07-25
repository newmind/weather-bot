import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

const { compilerOptions } = require('./tsconfig.json');

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testRegex: '\\.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['dist', 'coverage'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s',
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/coverage/**"],
  coverageDirectory: 'coverage',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  testTimeout: 600000,
  collectCoverage: true,
  // coverageProvider: 'v8',
};

export default config;
