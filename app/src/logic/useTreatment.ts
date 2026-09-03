import { useMemo } from 'react';
import { useStationStore } from '../state/store';
import { resolveWaterQuality, type StageResult } from './treatmentModel';

/** Estado da água no ponto do tratamento (cenário + estágio) selecionado na UI. */
export function useTreatment(): StageResult {
  const scenario = useStationStore((s) => s.scenario);
  const stageIndex = useStationStore((s) => s.stageIndex);
  return useMemo(() => resolveWaterQuality(scenario, stageIndex), [scenario, stageIndex]);
}
