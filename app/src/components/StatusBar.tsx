import { useStationStore } from '../state/store';
import { STAGES } from '../data/stationData';
import { resolveWaterQuality } from '../logic/treatmentModel';

/**
 * Barra de leitura rápida: acompanha o cursor/toque sobre a estação e mostra o essencial do
 * módulo sem exigir clique — mesma função do app da fazenda, adaptada para etapas de tratamento.
 */
export function StatusBar() {
  const hoveredStageId = useStationStore((s) => s.hoveredStageId);
  const selectedStageId = useStationStore((s) => s.selectedStageId);
  const scenario = useStationStore((s) => s.scenario);

  const stageId = hoveredStageId ?? selectedStageId;
  const stage = STAGES.find((s) => s.id === stageId);

  if (!stage) {
    return (
      <div className="statusbar glass hint">
        <span className="label-long">
          Passe o cursor sobre a estação para ler os módulos · clique em um deles para abrir o diagnóstico
        </span>
        <span className="label-short">Toque em um módulo para ver o diagnóstico</span>
      </div>
    );
  }

  const { state, compliancePct } = resolveWaterQuality(scenario, stage.order);

  return (
    <div className="statusbar glass">
      <span className="status-plot">{stage.shortLabel}</span>
      <span className="status-sep" />
      <span className="status-crop">Etapa {stage.order} de 7</span>
      <span className="status-sep" />
      <span>pH <strong>{state.pH.toFixed(1)}</strong></span>
      <span>Turbidez <strong>{state.turbidez.toFixed(0)} uT</strong></span>
      <span>E. coli <strong data-risk={state.eColiIndex >= 1 ? 'alto' : 'ok'}>{state.eColiIndex < 1 ? 'ausente' : 'presente'}</strong></span>
      <span>
        Conformidade <strong data-risk={compliancePct < 90 ? 'alto' : 'ok'}>{compliancePct.toFixed(0)}%</strong>
      </span>
    </div>
  );
}
