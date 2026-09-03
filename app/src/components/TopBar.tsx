import { useStationStore } from '../state/store';
import { CONTAMINATION_SCENARIOS, type ScenarioId } from '../data/contaminationScenarios';

const SCENARIO_ORDER: ScenarioId[] = ['chuva_comum', 'enchente_urbana', 'rejeito_mineracao'];

export function TopBar() {
  const scenario = useStationStore((s) => s.scenario);
  const setScenario = useStationStore((s) => s.setScenario);
  const autoRotate = useStationStore((s) => s.autoRotate);
  const toggleAutoRotate = useStationStore((s) => s.toggleAutoRotate);
  const cleanMode = useStationStore((s) => s.cleanMode);
  const toggleCleanMode = useStationStore((s) => s.toggleCleanMode);
  const resetCamera = useStationStore((s) => s.resetCamera);
  const setStoryOpen = useStationStore((s) => s.setStoryOpen);
  const setHowOpen = useStationStore((s) => s.setHowOpen);
  const startTutorial = useStationStore((s) => s.startTutorial);
  const technicalOverlay = useStationStore((s) => s.technicalOverlay);
  const toggleTechnicalOverlay = useStationStore((s) => s.toggleTechnicalOverlay);
  const anyOpen = useStationStore((s) => s.openStages.size > 0);
  const openAllStages = useStationStore((s) => s.openAllStages);
  const closeAllStages = useStationStore((s) => s.closeAllStages);

  return (
    <header className="topbar glass">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <div>
          <h1>ESTAS</h1>
          <p className="brand-subtitle">Estação Setorizada de Tratamento de Águas Supercontaminadas · unidade modular</p>
        </div>
      </div>

      <div className="scenario-switch" role="group" aria-label="Origem da água bruta">
        {SCENARIO_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className="scenario-option"
            data-scenario={id}
            data-active={scenario === id}
            onClick={() => setScenario(id)}
            title={CONTAMINATION_SCENARIOS[id].headline}
          >
            {CONTAMINATION_SCENARIOS[id].label}
          </button>
        ))}
      </div>

      <div className="topbar-actions">
        <div className="action-group info-actions">
          <button type="button" className="ghost-btn accent" onClick={() => setStoryOpen(true)}>
            <span className="label-long">ODS 6 — por que isso importa</span>
            <span className="label-short">ODS 6</span>
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setHowOpen(true)}
            title="O que cada elemento e cada botão significam, e como o tratamento funciona"
          >
            Como funciona
          </button>
          <button type="button" className="ghost-btn" onClick={startTutorial} title="Refazer o tutorial guiado">
            Tutorial
          </button>
        </div>
        <div className="action-group camera-actions">
          <button
            type="button"
            className="ghost-btn"
            data-active={anyOpen}
            onClick={anyOpen ? closeAllStages : openAllStages}
            title={
              anyOpen
                ? 'Fechar todos os módulos e voltar à estação fechada'
                : 'Abrir os 7 módulos de uma vez (vista em corte da estação inteira)'
            }
          >
            <span className="label-long">{anyOpen ? 'Fechar módulos' : 'Abrir módulos'}</span>
            <span className="label-short">{anyOpen ? 'Fechar' : 'Abrir'}</span>
          </button>
          <button
            type="button"
            className="ghost-btn"
            data-active={autoRotate}
            onClick={toggleAutoRotate}
            title="Girar a estação automaticamente (bom para gravar)"
          >
            {autoRotate ? 'Parar' : 'Girar'}
          </button>
          <button type="button" className="ghost-btn" onClick={resetCamera} title="Voltar à vista inicial">
            <span className="label-long">Recentrar</span>
            <span className="label-short">Centrar</span>
          </button>
          <button
            type="button"
            className="ghost-btn"
            data-active={technicalOverlay}
            onClick={toggleTechnicalOverlay}
            title="Mostrar ou ocultar rótulos, cotas e prancha técnica de engenharia"
          >
            {technicalOverlay ? 'Planta: On' : 'Planta: Off'}
          </button>
          <button
            type="button"
            className="ghost-btn"
            data-active={cleanMode}
            onClick={toggleCleanMode}
            title="Esconder os painéis e deixar só a estação"
          >
            {cleanMode ? 'Painéis' : 'Só a estação'}
          </button>
        </div>
      </div>
    </header>
  );
}
