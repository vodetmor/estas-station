import { Canvas } from '@react-three/fiber';
import './App.css';
import { IsoCamera } from './scene/IsoCamera';
import { StationStructure } from './scene/StationStructure';
import { StationProps } from './scene/StationProps';
import { WaterFlow } from './scene/WaterFlow';
import { StageMarkers } from './scene/StageMarkers';
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
      <hemisphereLight args={['#dbeaff', '#6d6152', 0.42]} />
      <ambientLight intensity={0.36} />
      <directionalLight position={[9, 12, 6]} intensity={1.1} />
      <directionalLight position={[-6, 5, -4]} intensity={0.22} />
      <IsoCamera resetSignal={resetSignal} />
      <StationStructure />
      <StationProps />
      <WaterFlow />
      <StageMarkers />
    </>
  );
}

export default function App() {
  const cleanMode = useStationStore((s) => s.cleanMode);
  const detailsOpen = useStationStore((s) => s.detailsOpen);
  const indicatorsOpen = useStationStore((s) => s.indicatorsOpen);
  const toggleDetails = useStationStore((s) => s.toggleDetails);
  const toggleIndicators = useStationStore((s) => s.toggleIndicators);

  return (
    <div
      className="app"
      data-clean={cleanMode}
      data-indicators={indicatorsOpen ? 'open' : 'closed'}
      data-details={detailsOpen ? 'open' : 'closed'}
    >
      <div className="viewport">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
          <StationScene />
        </Canvas>
      </div>

      <TopBar />

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
