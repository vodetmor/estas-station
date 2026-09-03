import { STAGES } from '../data/stationData';
import { CONTAMINATION_SCENARIOS, type ScenarioId, type RawWaterProfile } from '../data/contaminationScenarios';
import type { ParamId } from '../data/waterQualityStandards';

// Motor da simulação: aplica as 7 etapas em cascata sobre o perfil de água bruta do cenário
// escolhido. Cada etapa consome o estado da anterior (reduce), exatamente como a água real
// flui de módulo em módulo por gravidade — não existe "atalho" que pule uma etapa.

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface WaterState extends RawWaterProfile {
  /** Proxy 0-100 de carga biológica de E. coli (100 = presente/alta carga; <1 = "ausente" na prática). */
  eColiIndex: number;
}

export interface StageResult {
  stageIndex: number; // 0 = água bruta, 1..7 = após a etapa correspondente
  state: WaterState;
  /** % dos parâmetros monitorados dentro do VMP nesse ponto do processo. */
  compliancePct: number;
}

function rawToState(raw: RawWaterProfile): WaterState {
  return { ...raw, eColiIndex: raw.eColiPresente ? 100 : 0 };
}

const REMOVABLE_KEYS: (keyof WaterState)[] = [
  'turbidez', 'corAparente', 'tds', 'dureza', 'cianobacterias',
  'chumbo', 'mercurio', 'cadmio', 'arsenio', 'cromo', 'cobre', 'niquel', 'bario',
  'aluminio', 'ferro', 'manganes', 'cloreto', 'sulfato', 'amonia', 'sulfeto', 'gasesDissolvidos',
];

/** Aplica uma única etapa sobre um estado, devolvendo o novo estado. */
export function applyStage(state: WaterState, stageOrder: number): WaterState {
  const stage = STAGES[stageOrder - 1];
  const next: WaterState = { ...state };

  for (const key of REMOVABLE_KEYS) {
    const removal = stage.removal[key as ParamId];
    if (removal) {
      (next[key] as number) = (state[key] as number) * (1 - removal);
    }
  }

  const eColiRemoval = stage.removal.eColi;
  if (eColiRemoval) {
    next.eColiIndex = state.eColiIndex * (1 - eColiRemoval);
  }

  if (stage.phPull) {
    next.pH = state.pH + (stage.phPull.target - state.pH) * stage.phPull.fraction;
  }

  if (stage.mineralBoostMgL) {
    next.tds = next.tds + stage.mineralBoostMgL;
    next.dureza = next.dureza + stage.mineralBoostMgL * 0.6;
  }

  return next;
}

/** Série completa: água bruta (índice 0) até depois da etapa `uptoOrder` (1-7). */
export function computeStageSeries(scenarioId: ScenarioId, uptoOrder: number): StageResult[] {
  const scenario = CONTAMINATION_SCENARIOS[scenarioId];
  let state = rawToState(scenario.raw);
  const series: StageResult[] = [{ stageIndex: 0, state, compliancePct: complianceOf(state) }];

  for (let i = 1; i <= uptoOrder; i++) {
    state = applyStage(state, i);
    series.push({ stageIndex: i, state, compliancePct: complianceOf(state) });
  }
  return series;
}

export function resolveWaterQuality(scenarioId: ScenarioId, stageOrder: number): StageResult {
  const series = computeStageSeries(scenarioId, stageOrder);
  return series[series.length - 1];
}

import { WATER_QUALITY_STANDARDS, isWithinLimit } from '../data/waterQualityStandards';

const MONITORED: ParamId[] = [
  'pH', 'turbidez', 'corAparente', 'tds', 'dureza', 'cianobacterias',
  'chumbo', 'mercurio', 'cadmio', 'arsenio', 'cromo', 'cobre', 'niquel', 'bario',
  'aluminio', 'ferro', 'manganes', 'cloreto', 'sulfato', 'amonia', 'sulfeto',
];

export function complianceOf(state: WaterState): number {
  let ok = 0;
  const total = MONITORED.length + 1; // +1 pelo E. coli
  for (const id of MONITORED) {
    if (isWithinLimit(id, state[id as keyof WaterState] as number)) ok++;
  }
  if (state.eColiIndex < 1) ok++;
  return clamp01(ok / total) * 100;
}

export interface ComplianceRow {
  id: ParamId | 'eColi';
  label: string;
  unit: string;
  value: number;
  vmpLabel: string;
  withinLimit: boolean;
  source: string;
}

export function complianceRows(state: WaterState): ComplianceRow[] {
  const rows: ComplianceRow[] = MONITORED.map((id) => {
    const std = WATER_QUALITY_STANDARDS[id];
    const value = state[id as keyof WaterState] as number;
    return {
      id,
      label: std.label,
      unit: std.unit,
      value,
      vmpLabel: std.vmpMin !== undefined ? `${std.vmpMin}–${std.vmpMax}` : `≤ ${std.vmp}`,
      withinLimit: isWithinLimit(id, value),
      source: std.source,
    };
  });
  rows.push({
    id: 'eColi',
    label: 'Escherichia coli',
    unit: '',
    value: state.eColiIndex,
    vmpLabel: 'ausência em 100 mL',
    withinLimit: state.eColiIndex < 1,
    source: 'Portaria GM/MS nº 888/2021',
  });
  return rows;
}
