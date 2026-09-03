import { STAGES, type StageDef } from '../data/stationData';
import type { ContaminationScenario } from '../data/contaminationScenarios';

// Cálculo de vazão, dimensionamento hidráulico e tradução do resultado técnico em impacto
// humano e custo — o mesmo espírito do impactModel.ts do app da fazenda (toda conta exposta,
// toda premissa declarada), aplicado a fórmulas reais de engenharia sanitária:
//
//   V = Q × t         (volume de um tanque, dado vazão e tempo de retenção)
//   Dose = I × t       (dose UV-C, dado intensidade e tempo de exposição)
//
// Estimativas de custo são ORDEM DE GRANDEZA (elaboração própria a partir de referências de
// mercado para equipamentos de saneamento no Brasil), não orçamento de engenharia — declarado
// em toda parte onde aparecem.

export const STATION_PROFILE = {
  name: 'Unidade ESTAS modular (protótipo de referência)',
  /** Perda de água ao longo do processo (lavagem de filtros, lodo retirado, purga da cascata). */
  processLossFraction: 0.05,
  /** Litros/pessoa/dia — padrão humanitário mínimo de emergência (não é o consumo doméstico de rotina). */
  emergencyLitersPerPersonDay: 15,
  /** Litros/pessoa/dia — padrão doméstico de rotina, para contraste. */
  routineLitersPerPersonDay: 110,
};

export const COST_ASSUMPTIONS = {
  // R$ por m³ de VOLUME DE TANQUE/CÂMARA necessário (obra civil + estrutura), ordem de grandeza.
  civilCostPerM3: 3200,
  // Custo fixo por módulo (equipamento: grades, eletroímãs, dosadores, lâmpadas, sensores etc.).
  equipmentCostByStage: {
    filtracao: 85000,
    biossorcao: 140000,
    desgaseificacao: 60000,
    desinfeccao: 120000,
    remineralizacao: 45000,
    monitoramento: 95000,
    armazenamento: 70000,
  } as Record<StageDef['id'], number>,
  // R$/mês de operação (energia, insumos — biossurfactante, quitosana — manutenção, equipe).
  opexPerMonth: 38000,
  // Custo médio de referência do m³ tratado numa ETA convencional brasileira, para contraste.
  conventionalCostPerM3: 1.4,
};

export function tankVolumeM3(inflowLps: number, retentionMinutes: number): number {
  return (inflowLps * retentionMinutes * 60) / 1000;
}

export function uvExposureSeconds(doseMjCm2: number, intensityMwCm2: number): number {
  // mJ/cm² dividido por mW/cm² = segundos (1 mW por 1 s entrega 1 mJ).
  return doseMjCm2 / intensityMwCm2;
}

export interface StageHydraulics {
  stage: StageDef;
  volumeM3: number;
  retentionMinutes: number;
  civilCost: number;
  equipmentCost: number;
}

export function computeStationHydraulics(scenario: ContaminationScenario): StageHydraulics[] {
  return STAGES.map((stage) => {
    const retentionMinutes = stage.uv
      ? uvExposureSeconds(stage.uv.doseMjCm2, stage.uv.assumedIntensityMwCm2) / 60
      : stage.retentionMinutes;
    const volumeM3 = tankVolumeM3(scenario.inflowLps, retentionMinutes);
    return {
      stage,
      volumeM3,
      retentionMinutes,
      civilCost: volumeM3 * COST_ASSUMPTIONS.civilCostPerM3,
      equipmentCost: COST_ASSUMPTIONS.equipmentCostByStage[stage.id],
    };
  });
}

export interface StationImpact {
  outflowLps: number;
  treatedM3PerDay: number;
  peopleServedEmergency: number;
  peopleServedRoutine: number;
  totalVolumeM3: number;
  totalCivilCost: number;
  totalEquipmentCost: number;
  totalCapex: number;
  monthlyOpex: number;
  costPerM3: number;
  conventionalCostPerM3: number;
}

export function computeStationImpact(scenario: ContaminationScenario): StationImpact {
  const hydraulics = computeStationHydraulics(scenario);
  const outflowLps = scenario.inflowLps * (1 - STATION_PROFILE.processLossFraction);
  const treatedM3PerDay = (outflowLps * 86400) / 1000;

  const totalVolumeM3 = hydraulics.reduce((s, h) => s + h.volumeM3, 0);
  const totalCivilCost = hydraulics.reduce((s, h) => s + h.civilCost, 0);
  const totalEquipmentCost = hydraulics.reduce((s, h) => s + h.equipmentCost, 0);
  const totalCapex = totalCivilCost + totalEquipmentCost;

  // Custo por m³ ao longo de 10 anos de operação (vida útil de referência para amortizar o CAPEX).
  const lifetimeYears = 10;
  const lifetimeM3 = treatedM3PerDay * 365 * lifetimeYears;
  const lifetimeOpex = COST_ASSUMPTIONS.opexPerMonth * 12 * lifetimeYears;
  const costPerM3 = (totalCapex + lifetimeOpex) / lifetimeM3;

  return {
    outflowLps,
    treatedM3PerDay,
    peopleServedEmergency: (outflowLps * 86400) / STATION_PROFILE.emergencyLitersPerPersonDay,
    peopleServedRoutine: (outflowLps * 86400) / STATION_PROFILE.routineLitersPerPersonDay,
    totalVolumeM3,
    totalCivilCost,
    totalEquipmentCost,
    totalCapex,
    monthlyOpex: COST_ASSUMPTIONS.opexPerMonth,
    costPerM3,
    conventionalCostPerM3: COST_ASSUMPTIONS.conventionalCostPerM3,
  };
}

export const formatInt = (n: number) => Math.round(n).toLocaleString('pt-BR');
export const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
