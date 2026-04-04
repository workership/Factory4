/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BasicConfig, ClientConfig, ServerConfig, Task } from '../types';

export function calculateTaskResults(
  basic: BasicConfig,
  client: ClientConfig,
  server: ServerConfig
) {
  const S = client.seedlings; // kg of seeds
  const periodDays = (basic.period || 5) * 365; // Default 5 years if not set
  
  // Depreciation calculation: (Asset Value / Total Days) * (Production Scale Factor)
  // We assume a standard daily capacity of 500kg for the whole plant.
  const scaleFactor = Math.max(1, S / 500);
  const getDepreciation = (value: number, count: number) => {
    return ((value * count) / periodDays) * scaleFactor;
  };

  // 1. Soaking (浸种)
  const soaking = server.rice_seed_soaking;
  const waterUsed = S * soaking.flexible.water_assumptions;
  const waterCost = (waterUsed / 1000) * basic.water;
  const saltUsed = S * soaking.flexible.salt_assumptions;
  const saltCost = saltUsed * 2.5; // 2.5 yuan/kg for salt
  const seedCost = S * soaking.flexible.seed_fee;
  const soakingFixed = getDepreciation(soaking.fixed.soaking_pool, soaking.fixed_number.soaking_pool_number);

  // 2. Soil & Seeds (播种合盘)
  const soil = server.soil_preparation_and_seeds;
  // 假设 1kg 约等于 40000 枚水稻种子
  const SEEDS_PER_KG = 40000;
  const soilUsed = S * soil.flexible.growing_medium;
  const soilCost = soilUsed * 0.8; // 0.8 yuan/kg for soil
  const trayAmount = (S * SEEDS_PER_KG) / (soil.flexible.seeding_rack_capacity || 4000);
  const trayCost = trayAmount * 0.5; // 0.5 yuan/tray (depreciation/cleaning)
  const oilUsed = S * soil.flexible.oil_preparation;
  const oilCost = oilUsed * 7.8; 
  const prepElec = S * soil.flexible.electric_assumptions;
  const prepElecCost = prepElec * basic.electricity;
  const soilFixed = getDepreciation(soil.fixed.humidifier, soil.fixed_number.humidifier_number) +
                    getDepreciation(soil.fixed.thermostatic_system, soil.fixed_number.thermostatic_system_number) +
                    getDepreciation(soil.fixed.mixer, soil.fixed_number.mixer_number);

  // 3. Nursery (育秧)
  const nursery = server.seedling_nursery;
  const nurseryElec = S * (nursery.flexible.moto_electric_assumptions + 
                           nursery.flexible.hotair_assumptions + 
                           nursery.flexible.lighting_assumptions);
  const nurseryElecCost = nurseryElec * basic.electricity;
  const nurseryFixed = getDepreciation(nursery.fixed.heater, nursery.fixed_number.heater_number) +
                       getDepreciation(nursery.fixed.grow_light, nursery.fixed_number.grow_light_number) +
                       getDepreciation(nursery.fixed.nursing_frame, nursery.fixed_number.nursing_frame_number);

  // 4. Conveying (传送)
  const conveying = server.conveying;
  const conveyingElec = S * conveying.flexible.electric_assumptions;
  const conveyingElecCost = conveyingElec * basic.electricity;
  const conveyingFixed = getDepreciation(conveying.fixed.conveyor_belt, conveying.fixed_number.conveyor_belt_number);

  // Totals
  const totalElec = prepElec + nurseryElec + conveyingElec;
  const totalFixedDepreciation = soakingFixed + soilFixed + nurseryFixed + conveyingFixed;
  
  // Total Cost = Variable Costs + Fixed Depreciation
  const totalCost = waterCost + saltCost + seedCost + soilCost + trayCost + oilCost + (totalElec * basic.electricity) + totalFixedDepreciation;

  return {
    totalCost,
    stages: {
      soaking: {
        cost: waterCost + saltCost + seedCost + soakingFixed,
        water: waterUsed,
        seeds: S,
        fixed: soakingFixed
      },
      preparation: {
        cost: soilCost + trayCost + oilCost + prepElecCost + soilFixed,
        soil: soilUsed,
        oil: oilUsed,
        elec: prepElec,
        fixed: soilFixed
      },
      nursery: {
        cost: nurseryElecCost + nurseryFixed,
        elec: nurseryElec,
        fixed: nurseryFixed
      },
      conveying: {
        cost: conveyingElecCost + conveyingFixed,
        elec: conveyingElec,
        fixed: conveyingFixed
      }
    },
    details: {
      water: waterCost,
      electricity: totalElec * basic.electricity,
      seeds: seedCost + saltCost,
      soil: soilCost + trayCost,
      oil: oilCost,
      fixed: totalFixedDepreciation,
    },
    resources: {
      waterAmount: waterUsed,
      elecAmount: totalElec,
      soilAmount: soilUsed,
      oilAmount: oilUsed,
      trayAmount: trayAmount
    }
  };
}
