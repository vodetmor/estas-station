import { Canvas } from '@react-three/fiber';
import './App.css';
import { IsoCamera } from './scene/IsoCamera';
import { Terrain } from './scene/Terrain';
import { Station } from './scene/Station';
import { WaterSystem } from './scene/WaterSystem';
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
      {/* Luz de céu aberto: hemisférica fria por cima, quente refletida do solo por baixo. */}
      <hemisphereLight args={['#dceeff', '#5a4c38', 0.78]} />
      <ambientLight intensity={0.46} />
      {/* Sol principal — é ele que projeta as sombras que assentam a estação no terreno. */}
      <directionalLight
        position={[-16, 22, 14]}
        intensity={1.55}
        color='#fff4e2'
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.07}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
      />
      {/* Preenchimento frio vindo do vale, para o corte geológico não virar breu. */}
      <directionalLight position={[14, 8, -12]} intensity={0.38} color='#bfe0ff' />

      <IsoCamera resetSignal={resetSignal} />
      <Terrain />
      <Station />
      <WaterSystem />
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
          shadows
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
