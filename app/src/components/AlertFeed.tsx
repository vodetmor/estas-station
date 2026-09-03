import { useMemo, useState } from 'react';
import { useStationStore } from '../state/store';
import { STAGES } from '../data/stationData';
import { resolveWaterQuality } from '../logic/treatmentModel';
import { generateAlerts, rankAlerts } from '../logic/waterQualityModel';

/**
 * Alertas do módulo selecionado: todo parâmetro que ainda está fora do VMP na saída daquela
 * etapa, em cartões de uma linha que só se abrem quando a pessoa toca — mesmo padrão do app da
 * fazenda, adaptado de "por talhão" para "por parâmetro monitorado".
 */
export function AlertFeed() {
  const selectedStageId = useStationStore((s) => s.selectedStageId);
  const scenario = useStationStore((s) => s.scenario);
  const [expanded, setExpanded] = useState<number | null>(0);

  const stage = STAGES.find((s) => s.id === selectedStageId) ?? null;

  const alerts = useMemo(() => {
    if (!stage) return [];
    const { state } = resolveWaterQuality(scenario, stage.order);
    return rankAlerts(generateAlerts(state, stage));
  }, [stage, scenario]);

  if (!stage) {
    return (
      <div className="empty-block">
        <strong>Nenhum módulo selecionado</strong>
        <p>Selecione um módulo na estação para ver os parâmetros que ainda estão fora do padrão de potabilidade naquele ponto.</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="empty-block ok">
        <strong>Nenhum alerta ativo</strong>
        <p>Todos os parâmetros monitorados já estão dentro do VMP da Portaria GM/MS 888/2021 na saída de {stage.shortLabel.toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <>
      <p className="panel-subtitle">
        {alerts.length} parâmetro(s) fora do padrão na saída de {stage.shortLabel.toLowerCase()}
      </p>
      <div className="alert-list">
        {alerts.map((alert, i) => {
          const open = expanded === i;
          return (
            <article key={i} className="alert-card" data-severity={alert.severity} data-open={open}>
              <button type="button" className="alert-head" onClick={() => setExpanded(open ? null : i)}>
                <span className="alert-dot" data-severity={alert.severity} />
                <span className="alert-title-text">{alert.title}</span>
                <span className="alert-caret">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="alert-detail">
                  <p>{alert.message}</p>
                  <p className="alert-action">{alert.action}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
