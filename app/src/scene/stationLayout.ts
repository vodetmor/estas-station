import type { StageId } from '../data/stationData';

// Planta baixa da ESTAS em corte: em vez do relevo suave da fazenda (duas variáveis, morro),
// aqui é um perfil em DEGRAUS ao longo de um único eixo (v = sentido do fluxo, 0 na entrada de
// água bruta, 1 no reservatório de saída). A largura (u) não afeta a altura — os terraços são
// retos de lado a lado, como na imagem de referência.
//
// A Etapa III (desgaseificação em cascata) é subdividida em 4 mini-degraus dentro da sua faixa
// de v, para reproduzir fisicamente os "sucessivos desníveis" descritos no projeto — as outras
// etapas ficam em um único platô.

export interface StepDef {
  v0: number;
  v1: number;
  height: number; // 0..1, normalizado (multiplicado por ELEV_SCALE na cena)
  stageId: StageId;
}

export const STEP_PROFILE: StepDef[] = [
  { v0: 0.0, v1: 0.15, height: 1.0, stageId: 'filtracao' },
  { v0: 0.15, v1: 0.34, height: 0.82, stageId: 'biossorcao' },
  { v0: 0.34, v1: 0.38, height: 0.68, stageId: 'desgaseificacao' },
  { v0: 0.38, v1: 0.42, height: 0.6, stageId: 'desgaseificacao' },
  { v0: 0.42, v1: 0.46, height: 0.52, stageId: 'desgaseificacao' },
  { v0: 0.46, v1: 0.5, height: 0.44, stageId: 'desgaseificacao' },
  { v0: 0.5, v1: 0.66, height: 0.34, stageId: 'desinfeccao' },
  { v0: 0.66, v1: 0.8, height: 0.22, stageId: 'remineralizacao' },
  { v0: 0.8, v1: 0.88, height: 0.12, stageId: 'monitoramento' },
  { v0: 0.88, v1: 1.0, height: 0.0, stageId: 'armazenamento' },
];

/** Largura (em v) da transição entre um degrau e o próximo — quanto menor, mais vertical a "parede". */
const RISER_WIDTH = 0.006;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Altura do terraço em v (0..1), independente de u — plana de lado a lado. */
export function elevationAt(_u: number, v: number): number {
  const clamped = Math.min(1, Math.max(0, v));
  for (let i = 0; i < STEP_PROFILE.length; i++) {
    const step = STEP_PROFILE[i];
    if (clamped < step.v1 || i === STEP_PROFILE.length - 1) {
      const next = STEP_PROFILE[i + 1];
      if (!next || clamped < step.v1 - RISER_WIDTH) return step.height;
      // transição suave e estreita entre step.height e next.height, centrada no fim deste degrau
      const t = smoothstep(step.v1 - RISER_WIDTH, step.v1, clamped);
      return step.height + (next.height - step.height) * t;
    }
  }
  return STEP_PROFILE[STEP_PROFILE.length - 1].height;
}

/** Em qual etapa (StageId) o ponto (u, v) fisicamente está — usado para clique/hover e camadas. */
export function surfaceAt(_u: number, v: number): StageId {
  const clamped = Math.min(1, Math.max(0, v));
  for (const step of STEP_PROFILE) {
    if (clamped >= step.v0 && clamped < step.v1) return step.stageId;
  }
  return STEP_PROFILE[STEP_PROFILE.length - 1].stageId;
}

/** Faixa de v ocupada por uma etapa (pode abranger vários mini-degraus, ex. a cascata). */
export function vRangeOfStage(stageId: StageId): { v0: number; v1: number } {
  const steps = STEP_PROFILE.filter((s) => s.stageId === stageId);
  return { v0: steps[0].v0, v1: steps[steps.length - 1].v1 };
}

/** Centro (u, v) de uma etapa — para posicionar props/marcadores/labels. */
export function centerOfStage(stageId: StageId): { u: number; v: number } {
  const { v0, v1 } = vRangeOfStage(stageId);
  return { u: 0.5, v: (v0 + v1) / 2 };
}
