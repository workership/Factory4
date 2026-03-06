/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BasicConfig, ClientConfig, ServerConfig } from './types';

export const DEFAULT_BASIC_CONFIG: BasicConfig = {
  electricity: 0.70,
  water: 4.50,
  period: 3,
};

export const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  seedlings: 100, // Default value if not specified
  seedings_type: ["东农425", "东农428", "东农429"],
  selected_type: "东农425",
  area: 1000,
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  rice_seed_soaking: {
    flexible: {
      water_assumptions: 1.6,
      salt_assumptions: 0.004,
      seed_fee: 12,
    },
    fixed: {
      soaking_pool: 1000,
    },
    fixed_power: {
      soaking_pool_power: 40,
    },
    fixed_number: {
      soaking_pool_number: 4,
    },
  },
  soil_preparation_and_seeds: {
    flexible: {
      growing_medium: 12.0,
      electric_assumptions: 0.05,
      seeding_tray: 8.0,
      oil_preparation: 0.02,
    },
    fixed: {
      humidifier: 1250.00,
      thermostatic_system: 3500.00,
      mixer: 2800.00,
    },
    fixed_power: {
      humidifier_power: 150.0,
      thermostatic_system_power: 600.00,
      mixer_power: 500.0,
    },
    fixed_number: {
      humidifier_number: 1,
      thermostatic_system_number: 1,
      mixer_number: 1,
    },
  },
  seedling_nursery: {
    flexible: {
      moto_electric_assumptions: 0.15,
      hotair_assumptions: 1.25,
      lighting_assumptions: 0.45,
    },
    fixed: {
      heater: 545.31,
      grow_light: 65.00,
      nursing_frame: 50000.00,
    },
    fixed_power: {
      heater_power: 300,
      grow_light_power: 25,
      nursing_frame_power: 1000,
    },
    fixed_number: {
      heater_number: 1,
      grow_light_number: 1,
      nursing_frame_number: 1,
    },
  },
  conveying: {
    flexible: {
      electric_assumptions: 0.015,
    },
    fixed: {
      conveyor_belt: 4500,
    },
    fixed_power: {
      conveyor_belt_power: 800,
    },
    fixed_number: {
      conveyor_belt_number: 3,
    },
  },
};
