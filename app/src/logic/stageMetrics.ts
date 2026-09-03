import { resolveWaterQuality } from './treatmentModel';
import { totalHeavyMetalLoad } from './waterQualityModel';
import type { ScenarioId } from '../data/contaminationScenarios';

/** Achatado para consumo direto pelas camadas de cor da cena 3D (turbidez/metais/patógenos/pH). */
export interface WaterMetricSnapshot {
  turbidez: number;
  metaisTotal: number;
  eColiIndex: number;
  pH: number;
}

export function computeMetrics(scenario: ScenarioId, stageOrder: number): WaterMetricSnapshot {
  const { state } = resolveWaterQuality(scenario, stageOrder);
  return {
    turbidez: state.turbidez,
    metaisTotal: totalHeavyMetalLoad(state),
    eColiIndex: state.eColiIndex,
    pH: state.pH,
  };
}
