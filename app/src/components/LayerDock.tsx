import { useStationStore, type LayerId } from '../state/store';
import { LAYER_SCALES } from '../scene/colorScales';

const LAYERS: { id: LayerId; label: string; hint: string }[] = [
  { id: 'real', label: 'Estação', hint: 'Visão fechada da estação, sem camada de dado por cima' },
  { id: 'turbidez', label: 'Turbidez', hint: 'Sedimento em suspensão — onde a água ainda está barrenta' },
  { id: 'metais', label: 'Metais pesados', hint: 'Carga de chumbo, mercúrio, cádmio, arsênio e cromo' },
  { id: 'patogenos', label: 'Patógenos', hint: 'Carga biológica (índice de E. coli)' },
  { id: 'pH', label: 'pH', hint: 'Acidez/alcalinidade — faixa ideal 6,5 a 8,5' },
];

export function LayerDock() {
  const layer = useStationStore((s) => s.layer);
  const setLayer = useStationStore((s) => s.setLayer);
  const waterSpeed = useStationStore((s) => s.waterSpeed);
  const setWaterSpeed = useStationStore((s) => s.setWaterSpeed);
  const scale = layer === 'real' ? null : LAYER_SCALES[layer];

  return (
    <div className="layer-dock glass">
      <span className="dock-title">Camada da água</span>
      {LAYERS.map((l) => (
        <button
          key={l.id}
          type="button"
          className="dock-btn"
          data-active={layer === l.id}
          onClick={() => setLayer(l.id)}
          title={l.hint}
        >
          {l.label}
        </button>
      ))}

      {scale && (
        <div className="dock-legend">
          <span className="dock-legend-title">{scale.label}</span>
          <span
            className="legend-scale"
            style={{ background: `linear-gradient(90deg, ${scale.stops.map(([, c]) => c).join(',')})` }}
          />
          <span className="legend-range">
            <span>{scale.domain[0]}{scale.unit}</span>
            <span>{scale.domain[1]}{scale.unit}</span>
          </span>
        </div>
      )}

      {/* A vazão não altera o tratamento — só a velocidade da animação, para dar tempo de
          acompanhar o percurso da água módulo a módulo (ou congelá-lo para observar um trecho). */}
      <div className="flow-control">
        <span>Vazão</span>
        <input
          type="range"
          min={0}
          max={2.5}
          step={0.1}
          value={waterSpeed}
          onChange={(e) => setWaterSpeed(Number(e.target.value))}
          aria-label="Velocidade da animação do fluxo de água"
          title="Velocidade da animação do fluxo (0 = congelado)"
        />
      </div>
    </div>
  );
}
