import { create } from 'zustand';
import type { ScenarioId } from '../data/contaminationScenarios';
import { STAGES } from '../data/stationData';

/** 'real' = visão fechada da estação; as demais pintam o parâmetro escolhido sobre a água. */
export type LayerId = 'real' | 'turbidez' | 'metais' | 'patogenos' | 'pH';

const isNarrow = () => typeof window !== 'undefined' && window.innerWidth <= 900;

interface StationStore {
  layer: LayerId;
  scenario: ScenarioId;
  stageIndex: number; // 0 = água bruta, 1..7 = após a etapa
  selectedStageId: string | null;
  hoveredStageId: string | null;
  /** Etapas com o módulo "aberto" (cutaway) para mostrar os internos. */
  openStages: Set<string>;
  detailsOpen: boolean;
  indicatorsOpen: boolean;
  cleanMode: boolean;
  autoRotate: boolean;
  storyOpen: boolean;
  howOpen: boolean;
  tutorialStep: number | null;
  cameraResetSignal: number;
  technicalOverlay: boolean;
  waterSpeed: number;
  setLayer: (layer: LayerId) => void;
  setScenario: (scenario: ScenarioId) => void;
  setStageIndex: (index: number) => void;
  selectStage: (id: string | null) => void;
  hoverStage: (id: string | null) => void;
  toggleStageOpen: (id: string) => void;
  toggleTechnicalOverlay: () => void;
  setWaterSpeed: (speed: number) => void;
  toggleDetails: () => void;
  toggleIndicators: () => void;
  toggleCleanMode: () => void;
  toggleAutoRotate: () => void;
  setStoryOpen: (open: boolean) => void;
  setHowOpen: (open: boolean) => void;
  startTutorial: () => void;
  setTutorialStep: (step: number | null) => void;
  resetCamera: () => void;
}

export const useStationStore = create<StationStore>((set) => ({
  layer: 'real',
  scenario: 'chuva_comum',
  stageIndex: 0,
  selectedStageId: null,
  hoveredStageId: null,
  openStages: new Set(),
  detailsOpen: false,
  indicatorsOpen: false,
  cleanMode: false,
  autoRotate: false,
  storyOpen: false,
  howOpen: false,
  tutorialStep: null,
  cameraResetSignal: 0,
  technicalOverlay: false,
  waterSpeed: 1,
  setLayer: (layer) => set({ layer }),
  setScenario: (scenario) => set({ scenario }),
  setStageIndex: (index) => set({ stageIndex: Math.min(STAGES.length, Math.max(0, index)) }),
  // Selecionar uma etapa abre o painel de detalhes automaticamente; em tela estreita só um painel por vez.
  selectStage: (id) =>
    set((s) => ({
      selectedStageId: id,
      detailsOpen: id !== null,
      indicatorsOpen: id !== null && isNarrow() ? false : s.indicatorsOpen,
    })),
  hoverStage: (id) => set({ hoveredStageId: id }),
  toggleStageOpen: (id) =>
    set((s) => {
      const next = new Set(s.openStages);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { openStages: next };
    }),
  toggleTechnicalOverlay: () => set((s) => ({ technicalOverlay: !s.technicalOverlay })),
  setWaterSpeed: (speed) => set({ waterSpeed: speed }),
  toggleDetails: () =>
    set((s) => {
      const open = !s.detailsOpen;
      return { detailsOpen: open, indicatorsOpen: open && isNarrow() ? false : s.indicatorsOpen };
    }),
  toggleIndicators: () =>
    set((s) => {
      const open = !s.indicatorsOpen;
      return { indicatorsOpen: open, detailsOpen: open && isNarrow() ? false : s.detailsOpen };
    }),
  toggleCleanMode: () => set((s) => ({ cleanMode: !s.cleanMode })),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  setStoryOpen: (open) => set({ storyOpen: open }),
  setHowOpen: (open) => set({ howOpen: open }),
  startTutorial: () => set({ tutorialStep: 0, detailsOpen: false, indicatorsOpen: false, storyOpen: false, howOpen: false }),
  setTutorialStep: (step) => set({ tutorialStep: step }),
  resetCamera: () => set((s) => ({ cameraResetSignal: s.cameraResetSignal + 1 })),
}));
