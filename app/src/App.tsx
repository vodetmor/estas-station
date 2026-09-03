import { Canvas } from '@react-three/fiber';
import './App.css';
import { IsoCamera } from './scene/IsoCamera';
import { HillsideTerrain } from './scene/HillsideTerrain';
import { StationStructure } from './scene/StationStructure';
import { StationProps } from './scene/StationProps';
import { RealisticWater } from './scene/RealisticWater';
import { TechnicalAnnotations } from './scene/TechnicalAnnotations';
import { TopBar } from './components/TopBar';
import { StageBar } from './components/StageBar';
import { LayerDock } from './components/LayerDock';
import { StatusBar } from './components/StatusBar';
import { DetailsPanel } from './components/DetailsPanel';
import { IndicatorsPanel } from './components/IndicatorsPanel';
import { StoryModal } from './components/StoryModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { ScenarioToast } from './components/ScenarioToast';
import { Tutorial } from './components/Tutorial';
import { useStationStore } from './state/store';

function StationScene() {
  const resetSignal = useStationStore((s) => s.cameraResetSignal);

  return (
    <>
      <hemisphereLight args={['#eef7ff', '#4a4035', 0.6]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[12, 16, 8]} intensity={1.4} />
      <directionalLight position={[-8, 10, -6]} intensity={0.4} color="#cce7ff" />
      <IsoCamera resetSignal={resetSignal} />
      <HillsideTerrain />
      <StationStructure />
      <StationProps />
      <RealisticWater />
      <TechnicalAnnotations />
    </>
  );
}

export default function App() {
  const cleanMode = useStationStore((s) => s.cleanMode);
  const detailsOpen = useStationStore((s) => s.detailsOpen);
  const indicatorsOpen = useStationStore((s) => s.indicatorsOpen);
  const toggleDetails = useStationStore((s) => s.toggleDetails);
  const toggleIndicators = useStationStore((s) => s.toggleIndicators);
  const technicalOverlay = useStationStore((s) => s.technicalOverlay);
  const selectStage = useStationStore((s) => s.selectStage);

  return (
    <div
      className="app"
      data-clean={cleanMode}
      data-indicators={indicatorsOpen ? 'open' : 'closed'}
      data-details={detailsOpen ? 'open' : 'closed'}
    >
      <div className="viewport">
        <Canvas
          dpr={[1, 1.35]}
          onPointerMissed={() => selectStage(null)}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
        >
          <StationScene />
        </Canvas>
      </div>

      <TopBar />

      {!cleanMode && technicalOverlay && (
        <div className="compass-hud" title="Orientação Geográfica da Estação">
          <div className="compass-n">N</div>
          <div className="compass-star">✦</div>
          <div className="compass-axis">
            <span>W</span>
            <span>E</span>
          </div>
          <div className="compass-s">S</div>
        </div>
      )}

      {!cleanMode && (
        <>
          <LayerDock />
          <StatusBar />

          <button type="button" className="drawer-tab details" onClick={toggleDetails}>
            {detailsOpen ? '›' : '‹'}
            <span>Diagnóstico</span>
          </button>
          <button type="button" className="drawer-tab indicators" onClick={toggleIndicators}>
            {indicatorsOpen ? '▾' : '▴'}
            <span className="label-long">Indicadores, clima e impacto</span>
            <span className="label-short">Indicadores</span>
          </button>

          <aside className="details-drawer glass" data-open={detailsOpen}>
            <DetailsPanel />
          </aside>

          <section className="indicators-drawer glass" data-open={indicatorsOpen}>
            <div className="panel-shell">
              <header className="panel-header">
                <div>
                  <h2>Indicadores, clima e impacto</h2>
                  <p>Projeção da estação inteira</p>
                </div>
                <button type="button" className="panel-close" onClick={toggleIndicators} aria-label="Fechar painel">
                  ×
                </button>
              </header>
              <div className="panel-scroll">
                <IndicatorsPanel />
              </div>
            </div>
          </section>

          <StageBar />
          <ScenarioToast />

          <footer className="credit glass">
            Aplicativo desenvolvido pela equipe SobraQuark, estudantes do <strong>Colégio La Salle Sobradinho</strong>
          </footer>
        </>
      )}

      <StoryModal />
      <HowItWorksModal />
      <Tutorial />
    </div>
  );
}
