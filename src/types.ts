/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ShiftMode {
  TWO_SHIFT = 'TWO_SHIFT',
  THREE_SHIFT = 'THREE_SHIFT',
}

export enum MaintenanceStrategy {
  REACTIVE = 'REACTIVE',
  PREVENTIVE = 'PREVENTIVE',
  PREDICTIVE = 'PREDICTIVE',
}

export enum InterferenceLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface UserPreference {
  efficiencyWeight: number;
  energyWeight: number;
  costWeight: number;
  interferenceLevel: InterferenceLevel;
  personnelLoadLimit: number;
  shiftMode: ShiftMode;
  maintenanceStrategy: MaintenanceStrategy;
}

export interface KPI {
  throughput: number;
  energy: number;
  unitCost: number;
  load: number;
  oee: number;
  robustness: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface Scenario {
  id: string;
  name: string;
  type: 'EFFICIENT' | 'ENERGY_SAVING' | 'BALANCED';
  description: string;
  kpis: KPI;
  tags: string[];
  isRecommended?: boolean;
}

export interface SimulationResult {
  scenarios: Scenario[];
  aiRecommendation: string;
  systemTimestamp: string;
}

// New Config Types based on YAML
export interface BasicConfig {
  electricity: number;
  water: number;
  period: number;
}

export interface ClientConfig {
  seedlings: number;
  seedings_type: string[];
  selected_type: string;
  area: number;
}

export interface ServerConfigSection {
  flexible: Record<string, number>;
  fixed: Record<string, number>;
  fixed_power: Record<string, number>;
  fixed_number: Record<string, number>;
}

export interface ServerConfig {
  rice_seed_soaking: ServerConfigSection;
  soil_preparation_and_seeds: ServerConfigSection;
  seedling_nursery: ServerConfigSection;
  conveying: ServerConfigSection;
}

export interface Task {
  id: string;
  seedlings: number;
  type: string;
  area: number;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
  timestamp: string;
  totalCost: number;
  details: {
    water: number;
    electricity: number;
    seeds: number;
    soil: number;
    oil: number;
    fixed: number;
  };
}

export interface FeedbackMessage {
  id: string;
  hash: string;
  ip: string;
  content: string;
  timestamp: string;
  hasTask: boolean;
}
