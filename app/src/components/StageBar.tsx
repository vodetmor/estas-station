import { useStationStore } from '../state/store';
import { STAGES, STAGE_ZONES } from '../data/stationData';
import { useTreatment } from '../logic/useTreatment';

/**
 * Linha do tempo do tratamento: da água bruta (0) até depois da Etapa VII (7). Ao contrário do
 * app da fazenda (confiança que CAI com a distância), aqui o indicador de conformidade SOBE
 * conforme a água avança pelas etapas — o mesmo controle, sentido pedagógico invertido.
 */
export function StageBar() {
  const stageIndex = useStationStore((s) => s.stageIndex);
  const setStageIndex = useStationStore((s) => s.setStageIndex);
  const { compliancePct } = useTreatment();

  const current = stageIndex === 0 ? null : STAGES[stageIndex - 1];
  const zoneLabel = current ? STAGE_ZONES[current.zone].label : 'Antes de qualquer tratamento';

  return (
    <div className="timeline glass">
      <div className="timeline-head">
        <div>
          <span className="timeline-label">Ponto do tratamento</span>
          <strong className="timeline-date">{current ? current.shortLabel : 'Água bruta'}</strong>
          <span className="timeline-sub">· {zoneLabel}</span>
        </div>
        <div className="timeline-meta">
          <span
            className="pill confidence"
            data-level={compliancePct >= 90 ? 'alta' : compliancePct >= 50 ? 'media' : 'baixa'}
          >
            conformidade {compliancePct.toFixed(0)}%
          </span>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={STAGES.length}
        step={1}
        value={stageIndex}
        onChange={(e) => setStageIndex(Number(e.target.value))}
        aria-label="Ponto do tratamento"
        className="timeline-range"
      />

      <div className="timeline-ticks">
        <button type="button" className="tick" data-active={stageIndex === 0} onClick={() => setStageIndex(0)}>
          bruta
        </button>
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="tick"
            data-active={stageIndex === s.order}
            onClick={() => setStageIndex(s.order)}
          >
            {s.order}
          </button>
        ))}
      </div>
    </div>
  );
}
