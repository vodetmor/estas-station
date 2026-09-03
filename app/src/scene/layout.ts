import * as THREE from 'three';
import type { StageId } from '../data/stationData';

/**
 * Planta única da maquete: TUDO na cena 3D (terreno, módulos, água, anotações) lê deste
 * arquivo. Antes cada componente carregava suas próprias coordenadas mágicas, e por isso o
 * terreno e as construções não fechavam — os prédios flutuavam sobre um barranco liso.
 *
 * Convenção de eixos: a água entra em -X (topo da encosta) e sai em +X (vale), descendo por
 * 7 terraços — um por etapa. Z é a largura da estação (frente = +Z, face de corte da câmera).
 */

// ---------------------------------------------------------------------------
// PALETA — concreto arquitetônico, aço e identidade cromática das 5 fases
// ---------------------------------------------------------------------------

export const PALETTE = {
  concrete: '#9aa09c',
  concreteDark: '#787e7a',
  concreteDeep: '#5f6562',
  rim: '#bfc4c0',
  steel: '#aeb5b2',
  steelDark: '#4a5250',
  glass: '#cfe9f5',
  soilTop: '#3a2c1e',
  soilClay: '#6d5136',
  rock: '#464039',
  rockDeep: '#221f1c',
  grassLight: '#7fb954',
  grassDark: '#547f3c',
  grassDry: '#9aa855',
} as const;

/** Cor de identidade de cada fase (faixa do módulo, badge e anotações). */
export const PHASE_TINT: Record<number, string> = {
  1: '#c9a227',
  2: '#3fa06b',
  3: '#4bb3d4',
  4: '#8b5cf6',
  5: '#2f8fd6',
};

// ---------------------------------------------------------------------------
// RELEVO — perfil em terraços ao longo de X + encosta natural atrás e à frente
// ---------------------------------------------------------------------------

export const BLOCK = {
  minX: -11.6,
  maxX: 15.4,
  minZ: -4.8,
  maxZ: 4.4,
  bottomY: -3.2,
} as const;

/** Patamares: cada faixa de X é plana, com um talude curto ligando uma à seguinte. */
export const TERRACES: { xEnd: number; y: number }[] = [
  { xEnd: -4.55, y: 3.1 },
  { xEnd: -1.05, y: 2.25 },
  { xEnd: 1.95, y: 1.15 },
  { xEnd: 4.9, y: 0.5 },
  { xEnd: 7.1, y: -0.1 },
  { xEnd: 9.0, y: -0.55 },
  { xEnd: Infinity, y: -1.0 },
];

/** Largura (em X) do talude entre dois patamares. */
const RISER = 0.6;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Altura do patamar em X, com transição suave no talude. Independe de Z. */
export function terraceY(x: number): number {
  for (let i = 0; i < TERRACES.length; i++) {
    const step = TERRACES[i];
    const next = TERRACES[i + 1];
    if (x < step.xEnd || !next) {
      if (!next || x < step.xEnd - RISER) return step.y;
      const t = smoothstep(step.xEnd - RISER, step.xEnd, x);
      return step.y + (next.y - step.y) * t;
    }
  }
  return TERRACES[TERRACES.length - 1].y;
}

/** Faixa de Z ocupada pela plataforma construída — fora dela o terreno vira encosta natural. */
export const PLATFORM_Z = { back: -2.3, front: 2.15 } as const;

/** Quanto o ponto está "fora" da plataforma (0 = terraço plano, 1 = encosta natural). */
export function naturalFactor(z: number): number {
  if (z < PLATFORM_Z.back) return smoothstep(PLATFORM_Z.back, BLOCK.minZ, z);
  if (z > PLATFORM_Z.front) return smoothstep(PLATFORM_Z.front, BLOCK.maxZ, z);
  return 0;
}

function relief(x: number, z: number): number {
  return (
    Math.sin(x * 0.62 + 1.3) * 0.42 +
    Math.sin(z * 0.9) * 0.24 +
    Math.sin(x * 1.9 + z * 1.4) * 0.13 +
    Math.cos(x * 3.4 - z * 2.2) * 0.06
  );
}

/**
 * Altura do solo em qualquer (x, z) — FONTE ÚNICA. O corte geológico das bordas amostra
 * exatamente esta função, então superfície e estrato nunca mais abrem fresta.
 */
export function groundY(x: number, z: number): number {
  const base = terraceY(x);
  const nat = naturalFactor(z);
  if (nat === 0) return base;
  const behind = z < PLATFORM_Z.back;
  // Atrás a serra sobe; à frente o terreno desce para o vale onde fica o corte de exibição.
  const drift = behind ? 1.7 * nat : -0.95 * nat;
  return base + drift + relief(x, z) * nat;
}

// ---------------------------------------------------------------------------
// MÓDULOS — as 7 etapas como volumes FECHADOS que se abrem ao clique
// ---------------------------------------------------------------------------

export type RoofKind = 'laje' | 'duas-aguas' | 'torre' | 'abobada';

export interface ModuleDef {
  id: StageId;
  /** Fase da prancha de referência (1..5) a que este módulo pertence. */
  phase: number;
  roman: string;
  /** Centro do módulo no plano. */
  x: number;
  z: number;
  /** Cota do piso interno (fundo do tanque). */
  floorY: number;
  /** Dimensões da casca fechada: largura (X), altura (Y), profundidade (Z). */
  w: number;
  h: number;
  d: number;
  /** Cota da lâmina d'água dentro do módulo. */
  waterY: number;
  roof: RoofKind;
  /** Deslocamento da cobertura ao abrir (multiplicador de `h`). */
  lift: number;
  short: string;
}

/**
 * As 7 etapas em FILA ÚNICA descendo a encosta: a água nunca volta para trás nem cruza
 * tubulação por cima de outro módulo — quem olha a maquete lê o percurso sem legenda.
 */
export const MODULES: ModuleDef[] = [
  {
    id: 'filtracao', phase: 1, roman: 'I',
    x: -6.2, z: -0.4, floorY: 3.1, waterY: 3.66,
    w: 3.3, h: 1.3, d: 2.9,
    roof: 'duas-aguas', lift: 0.95, short: 'Filtração',
  },
  {
    id: 'biossorcao', phase: 2, roman: 'II',
    x: -2.7, z: -0.4, floorY: 2.25, waterY: 2.85,
    w: 3.4, h: 1.5, d: 3.1,
    roof: 'duas-aguas', lift: 0.9, short: 'Biossorção',
  },
  {
    id: 'desgaseificacao', phase: 3, roman: 'III',
    x: 0.5, z: 0.3, floorY: 1.15, waterY: 1.32,
    w: 2.6, h: 1.95, d: 2.5,
    roof: 'torre', lift: 0.8, short: 'Desgaseificação',
  },
  {
    id: 'desinfeccao', phase: 4, roman: 'IV',
    x: 3.4, z: -0.1, floorY: 0.5, waterY: 1.05,
    w: 2.9, h: 1.2, d: 2.6,
    roof: 'laje', lift: 1.0, short: 'UV-C e nano',
  },
  {
    id: 'remineralizacao', phase: 5, roman: 'V',
    x: 6.0, z: 0.1, floorY: -0.1, waterY: 0.32,
    w: 2.0, h: 1.15, d: 2.2,
    roof: 'laje', lift: 1.0, short: 'Remineralização',
  },
  {
    id: 'monitoramento', phase: 5, roman: 'VI',
    x: 8.0, z: 0.1, floorY: -0.55, waterY: 0.0,
    w: 1.8, h: 1.35, d: 2.0,
    roof: 'duas-aguas', lift: 0.95, short: 'Verificação',
  },
  {
    id: 'armazenamento', phase: 5, roman: 'VII',
    x: 10.7, z: 0.1, floorY: -1.0, waterY: -0.15,
    w: 2.9, h: 1.75, d: 3.2,
    roof: 'abobada', lift: 0.85, short: 'Reservatório',
  },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<StageId, ModuleDef>;

/** O ponto (x, z) cai dentro da pegada de algum módulo (com margem)? Usado pela vegetação. */
export function insideAnyModule(x: number, z: number, margin = 0.45): boolean {
  return MODULES.some(
    (m) => Math.abs(x - m.x) < m.w / 2 + margin && Math.abs(z - m.z) < m.d / 2 + margin,
  );
}

/** Corredor da calha de interligação e da escada de serviço — também sem vegetação. */
export function insideCorridor(x: number, z: number): boolean {
  if (Math.abs(z - 2.05) < 0.8 && x > -9.0 && x < 12.6) return true; // escada de serviço
  return MODULES.some((m) => Math.abs(z - m.z) < 0.6 && Math.abs(x - m.x) < m.w / 2 + 1.3);
}

// ---------------------------------------------------------------------------
// HIDRÁULICA — o percurso contínuo da água, da captação à distribuição pública
// ---------------------------------------------------------------------------

export interface FlowNode {
  p: [number, number, number];
  /** Etapas já aplicadas (0..7) quando a água chega neste nó. */
  treated: number;
}

/**
 * Linha de corrente contínua. É a MESMA curva usada pelas partículas, pelas cortinas de queda
 * e pelo cálculo de cor da água — o que se vê escorrendo é literalmente o que o modelo de
 * tratamento calcula para aquele ponto do processo.
 */
export const FLOW_NODES: FlowNode[] = [
  { p: [-11.2, 4.5, -0.4], treated: 0 },   // captação na encosta
  { p: [-9.6, 4.05, -0.4], treated: 0 },   // calha de aproximação
  { p: [-8.1, 3.74, -0.4], treated: 0 },   // chegada ao módulo I
  { p: [-7.3, 3.66, -0.4], treated: 0 },   // grades e peneiras
  { p: [-6.4, 3.66, -0.4], treated: 0 },   // leito brita/areia/antracito
  { p: [-5.2, 3.66, -0.4], treated: 0 },   // canal dos eletroímãs
  { p: [-4.62, 3.58, -0.4], treated: 1 },  // vertedouro da Etapa I
  { p: [-4.46, 3.1, -0.4], treated: 1 },   // queda I -> II
  { p: [-4.2, 2.85, -0.4], treated: 1 },   // entrada dos reatores
  { p: [-3.4, 2.85, -1.05], treated: 1 },  // labirinto de contato (chicana 1)
  { p: [-2.4, 2.85, 0.3], treated: 1 },    // labirinto de contato (chicana 2)
  { p: [-1.5, 2.85, -0.35], treated: 2 },  // painéis de biossorção
  { p: [-1.06, 2.8, 0.05], treated: 2 },   // vertedouro da Etapa II
  { p: [-0.78, 2.72, 0.3], treated: 2 },   // aqueduto elevado II -> III
  { p: [-0.55, 2.6, 0.3], treated: 2 },    // topo da torre de cascata
  { p: [-0.03, 2.28, 0.3], treated: 2 },   // degrau 1
  { p: [0.49, 1.96, 0.3], treated: 2 },    // degrau 2
  { p: [1.01, 1.64, 0.3], treated: 3 },    // degrau 3
  { p: [1.53, 1.36, 0.3], treated: 3 },    // degrau 4
  { p: [1.74, 1.3, 0.3], treated: 3 },     // bacia de pé da cascata
  { p: [1.98, 1.2, 0.05], treated: 3 },    // vertedouro da Etapa III
  { p: [2.16, 1.05, -0.1], treated: 3 },   // queda III -> IV
  { p: [2.5, 1.05, -0.1], treated: 3 },    // entrada das câmaras UV-C
  { p: [4.2, 1.05, -0.1], treated: 4 },    // câmaras UV-C e membranas cerâmicas
  { p: [4.86, 1.0, -0.1], treated: 4 },    // vertedouro da Etapa IV
  { p: [5.02, 0.45, 0.05], treated: 4 },   // queda IV -> V
  { p: [5.3, 0.32, 0.1], treated: 4 },     // cartuchos de calcita/dolomita
  { p: [6.4, 0.32, 0.1], treated: 5 },     // bacia de estabilização
  { p: [6.98, 0.26, 0.1], treated: 5 },    // vertedouro da Etapa V
  { p: [7.12, 0.06, 0.1], treated: 5 },   // queda V -> VI
  { p: [7.45, 0.0, 0.1], treated: 5 },   // bancada multiparâmetro
  { p: [8.55, 0.0, 0.1], treated: 6 },   // saída certificada
  { p: [8.98, -0.04, 0.1], treated: 6 },   // vertedouro da Etapa VI
  { p: [9.16, -0.15, 0.1], treated: 6 },   // queda VI -> VII
  { p: [10.7, -0.15, 0.1], treated: 6 },   // corpo do reservatório
  { p: [12.25, -0.52, 0.1], treated: 7 },  // barrilete de saída
  { p: [13.9, -1.1, 0.1], treated: 7 },    // distribuição pública
];

export const FLOW_CURVE = new THREE.CatmullRomCurve3(
  FLOW_NODES.map((n) => new THREE.Vector3(...n.p)),
  false,
  'catmullrom',
  0.3,
);

/** Etapas já aplicadas (0..7) na fração `t` do percurso — interpolado entre nós. */
export function treatedAt(t: number): number {
  const f = Math.min(0.9999, Math.max(0, t)) * (FLOW_NODES.length - 1);
  const i = Math.floor(f);
  const frac = f - i;
  const a = FLOW_NODES[i].treated;
  const b = FLOW_NODES[Math.min(FLOW_NODES.length - 1, i + 1)].treated;
  return a + (b - a) * frac;
}

/** Quedas d'água: onde o percurso vence um desnível entre terraços (cortina + espuma). */
export const FALLS: { p: [number, number, number]; h: number; w: number; treated: number }[] = [
  { p: [-4.52, 3.22, -0.4], h: 0.74, w: 0.9, treated: 1 },
  { p: [-1.06, 2.74, 0.05], h: 0.16, w: 0.5, treated: 2 },
  { p: [2.05, 1.13, -0.02], h: 0.24, w: 0.55, treated: 3 },
  { p: [4.96, 0.72, -0.02], h: 0.6, w: 0.5, treated: 4 },
  { p: [7.1, 0.13, 0.1], h: 0.3, w: 0.42, treated: 5 },
  { p: [9.06, -0.06, 0.1], h: 0.2, w: 0.38, treated: 6 },
  { p: [13.0, -0.85, 0.1], h: 0.6, w: 0.34, treated: 7 },
];

/**
 * Trechos de canal aberto (calhas de interligação) entre um módulo e o seguinte.
 * Cada trecho é desenhado como uma calha de concreto com lâmina d'água correndo por dentro.
 */
export interface ChannelDef {
  from: [number, number, number];
  to: [number, number, number];
  width: number;
  /** Etapas já aplicadas na água que corre neste trecho. */
  treated: number;
  /** Canal a céu aberto (com calha de concreto) ou tubulação fechada. */
  kind: 'calha' | 'tubo';
}

export const CHANNELS: ChannelDef[] = [
  { from: [-11.2, 4.5, -0.4], to: [-8.1, 3.74, -0.4], width: 0.85, treated: 0, kind: 'calha' },
  { from: [-4.62, 3.58, -0.4], to: [-4.2, 2.9, -0.4], width: 0.75, treated: 1, kind: 'calha' },
  { from: [-1.2, 2.82, -0.1], to: [-0.55, 2.62, 0.3], width: 0.7, treated: 2, kind: 'calha' },
  { from: [1.98, 1.2, 0.05], to: [2.55, 1.05, -0.1], width: 0.7, treated: 3, kind: 'calha' },
  { from: [4.86, 1.0, -0.1], to: [5.3, 0.34, 0.1], width: 0.65, treated: 4, kind: 'calha' },
  { from: [6.98, 0.26, 0.1], to: [7.45, 0.02, 0.1], width: 0.55, treated: 5, kind: 'tubo' },
  { from: [8.6, 0.0, 0.1], to: [9.3, -0.15, 0.1], width: 0.5, treated: 6, kind: 'tubo' },
  { from: [12.15, -0.5, 0.1], to: [13.9, -1.1, 0.1], width: 0.5, treated: 7, kind: 'tubo' },
];
