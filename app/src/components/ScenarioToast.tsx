import { useEffect, useState } from 'react';
import { useStationStore } from '../state/store';
import { CONTAMINATION_SCENARIOS } from '../data/contaminationScenarios';

/**
 * Ao trocar a origem da água bruta, explica em uma frase POR QUE aquele cenário importa e o
 * que a estação faz de diferente nele. Aparece sozinho, some sozinho.
 */
export function ScenarioToast() {
  const scenarioId = useStationStore((s) => s.scenario);
  const setHowOpen = useStationStore((s) => s.setHowOpen);
  const [visible, setVisible] = useState(false);
  const scenario = CONTAMINATION_SCENARIOS[scenarioId];

  useEffect(() => {
    if (scenarioId === 'chuva_comum') {
      setVisible(false);
      return;
    }
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 13000);
    return () => window.clearTimeout(id);
  }, [scenarioId]);

  if (!visible) return null;

  return (
    <div className="scenario-toast glass" data-scenario={scenarioId}>
      <button type="button" className="panel-close" onClick={() => setVisible(false)} aria-label="Fechar aviso">
        ×
      </button>
      <span className="toast-tag">{scenario.label}</span>
      <strong>{scenario.headline}</strong>
      <p>{scenario.description}</p>
      <p className="toast-action">
        <span>Ajuste operacional:</span> {scenario.strategy}
      </p>
      <button type="button" className="link-btn" onClick={() => setHowOpen(true)}>
        Como o tratamento se adapta →
      </button>
    </div>
  );
}
