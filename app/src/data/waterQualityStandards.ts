// Padrão de potabilidade brasileiro (Portaria de Consolidação nº 5/2017, anexo XX, atualizado
// pela Portaria GM/MS nº 888, de 4 de maio de 2021) + diretrizes da OMS (WHO, 2022) onde a
// norma brasileira é omissa. Todo valor aqui é um VMP (Valor Máximo Permitido) REAL, citável —
// é a régua contra a qual a estação simulada mede seu próprio desempenho.

export type ParamId =
  | 'pH'
  | 'turbidez'
  | 'corAparente'
  | 'tds'
  | 'dureza'
  | 'eColi'
  | 'cianobacterias'
  | 'chumbo'
  | 'mercurio'
  | 'cadmio'
  | 'arsenio'
  | 'cromo'
  | 'cobre'
  | 'niquel'
  | 'bario'
  | 'aluminio'
  | 'ferro'
  | 'manganes'
  | 'cloreto'
  | 'sulfato'
  | 'amonia'
  | 'sulfeto';

export type ParamCategory = 'organoleptico' | 'microbiologico' | 'inorganico' | 'fisico';

export interface ParamStandard {
  id: ParamId;
  label: string;
  unit: string;
  category: ParamCategory;
  /** Valor Máximo Permitido. Para parâmetros de faixa (pH) usar vmpMin/vmpMax. */
  vmp?: number;
  vmpMin?: number;
  vmpMax?: number;
  /** true = quanto menor, melhor (a maioria); false = precisa ficar dentro de uma faixa (pH, dureza mineral). */
  lowerIsBetter: boolean;
  source: string;
}

export const WATER_QUALITY_STANDARDS: Record<ParamId, ParamStandard> = {
  pH: {
    id: 'pH', label: 'pH', unit: '', category: 'fisico',
    vmpMin: 6.5, vmpMax: 8.5, lowerIsBetter: false,
    source: 'OMS (2004) / Portaria GM/MS nº 888/2021',
  },
  turbidez: {
    id: 'turbidez', label: 'Turbidez', unit: 'uT', category: 'fisico',
    vmp: 5.0, lowerIsBetter: true,
    source: 'Portaria GM/MS nº 888/2021',
  },
  corAparente: {
    id: 'corAparente', label: 'Cor aparente', unit: 'uH', category: 'organoleptico',
    vmp: 15, lowerIsBetter: true,
    source: 'Portaria GM/MS nº 888/2021',
  },
  tds: {
    id: 'tds', label: 'Sólidos dissolvidos totais', unit: 'mg/L', category: 'organoleptico',
    vmp: 500, lowerIsBetter: true,
    source: 'Portaria GM/MS nº 888/2021',
  },
  dureza: {
    id: 'dureza', label: 'Dureza total', unit: 'mg/L', category: 'organoleptico',
    vmp: 300, lowerIsBetter: true,
    source: 'Portaria GM/MS nº 888/2021',
  },
  eColi: {
    id: 'eColi', label: 'Escherichia coli', unit: 'UFC/100mL', category: 'microbiologico',
    vmp: 0, lowerIsBetter: true,
    source: 'Portaria GM/MS nº 888/2021 — ausência em 100 mL',
  },
  cianobacterias: {
    id: 'cianobacterias', label: 'Cianobactérias', unit: 'células/mL', category: 'microbiologico',
    vmp: 10000, lowerIsBetter: true,
    source: 'Portaria GM/MS nº 888/2021',
  },
  chumbo: { id: 'chumbo', label: 'Chumbo (Pb)', unit: 'mg/L', category: 'inorganico', vmp: 0.01, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  mercurio: { id: 'mercurio', label: 'Mercúrio total (Hg)', unit: 'mg/L', category: 'inorganico', vmp: 0.001, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  cadmio: { id: 'cadmio', label: 'Cádmio (Cd)', unit: 'mg/L', category: 'inorganico', vmp: 0.003, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  arsenio: { id: 'arsenio', label: 'Arsênio (As)', unit: 'mg/L', category: 'inorganico', vmp: 0.01, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  cromo: { id: 'cromo', label: 'Cromo (Cr)', unit: 'mg/L', category: 'inorganico', vmp: 0.05, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  cobre: { id: 'cobre', label: 'Cobre (Cu)', unit: 'mg/L', category: 'inorganico', vmp: 2, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  niquel: { id: 'niquel', label: 'Níquel (Ni)', unit: 'mg/L', category: 'inorganico', vmp: 0.07, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  bario: { id: 'bario', label: 'Bário (Ba)', unit: 'mg/L', category: 'inorganico', vmp: 0.7, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  aluminio: { id: 'aluminio', label: 'Alumínio (Al)', unit: 'mg/L', category: 'organoleptico', vmp: 0.2, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  ferro: { id: 'ferro', label: 'Ferro (Fe)', unit: 'mg/L', category: 'organoleptico', vmp: 0.3, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  manganes: { id: 'manganes', label: 'Manganês (Mn)', unit: 'mg/L', category: 'organoleptico', vmp: 0.1, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  cloreto: { id: 'cloreto', label: 'Cloreto', unit: 'mg/L', category: 'organoleptico', vmp: 250, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  sulfato: { id: 'sulfato', label: 'Sulfato', unit: 'mg/L', category: 'organoleptico', vmp: 250, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  amonia: { id: 'amonia', label: 'Amônia (como N)', unit: 'mg/L', category: 'organoleptico', vmp: 1.2, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
  sulfeto: { id: 'sulfeto', label: 'Sulfeto de hidrogênio', unit: 'mg/L', category: 'organoleptico', vmp: 0.05, lowerIsBetter: true, source: 'Portaria GM/MS nº 888/2021' },
};

/** Dose mínima de UV-C para desinfecção — Portaria GM/MS nº 888/2021, faixa germicida 200-280 nm. */
export const UV_MIN_DOSE_MJ_CM2 = 1.5;

export const HEAVY_METAL_IDS: ParamId[] = ['chumbo', 'mercurio', 'cadmio', 'arsenio', 'cromo'];

export function isWithinLimit(id: ParamId, value: number): boolean {
  const std = WATER_QUALITY_STANDARDS[id];
  if (std.vmpMin !== undefined && std.vmpMax !== undefined) {
    return value >= std.vmpMin && value <= std.vmpMax;
  }
  return value <= (std.vmp ?? Infinity);
}
