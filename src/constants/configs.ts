/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BasicConfig, ClientConfig, ServerConfig } from '../types';

export const DEFAULT_BASIC_CONFIG: any = {
  laborRate: 45, // 45 CNY/hour
  energyRate: 0.8, // 0.8 CNY/kWh
  machineBaseCost: 120, // 120 CNY/unit
};

export const DEFAULT_CLIENT_CONFIG: any = {
  orderQuantity: 5000,
  targetDays: 7,
  priority: 'Medium',
};

export const DEFAULT_SERVER_CONFIG: any = {
  machineCount: 12,
  laborCount: 24,
  energyBuffer: 1.15, // 15% buffer
  safetyFactor: 1.1, // 10% safety factor
};
