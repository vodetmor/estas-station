// Escalas de cor puras (sem dependência de three.js) para reuso na cena 3D e na legenda da UI.

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Interpola cor ao longo de múltiplos stops [posição 0-1, cor hex]. */
export function colorFromStops(stops: [number, string][], t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (clamped >= t0 && clamped <= t1) {
      const localT = t1 === t0 ? 0 : (clamped - t0) / (t1 - t0);
      const rgb0 = hexToRgb(c0);
      const rgb1 = hexToRgb(c1);
      return rgbToHex(
        lerp(rgb0.r, rgb1.r, localT),
        lerp(rgb0.g, rgb1.g, localT),
        lerp(rgb0.b, rgb1.b, localT),
      );
    }
  }
  return stops[stops.length - 1][1];
}

const norm = (v: number, min: number, max: number) => (v - min) / (max - min);

export const LAYER_SCALES = {
  turbidez: {
    stops: [
      [0, '#3b8dc9'],
      [0.4, '#c9a24a'],
      [1, '#6b4a2e'],
    ] as [number, string][],
    domain: [5, 900] as [number, number],
    unit: 'uT',
    label: 'Turbidez (VMP: 5 uT)',
  },
  metais: {
    stops: [
      [0, '#3f9e4d'],
      [0.5, '#e8c93f'],
      [1, '#a12b6b'],
    ] as [number, string][],
    domain: [0, 0.15] as [number, number],
    unit: 'mg/L',
    label: 'Carga de metais pesados (Pb+Hg+Cd+As+Cr)',
  },
  patogenos: {
    stops: [
      [0, '#3f9e4d'],
      [0.4, '#e8c93f'],
      [1, '#a12b2b'],
    ] as [number, string][],
    domain: [0, 100] as [number, number],
    unit: '',
    label: 'Carga biológica (índice E. coli)',
  },
  pH: {
    stops: [
      [0, '#c9422f'],
      [0.5, '#3f9e4d'],
      [1, '#3b6dc9'],
    ] as [number, string][],
    domain: [5, 9] as [number, number],
    unit: '',
    label: 'pH (faixa ideal: 6,5–8,5)',
  },
} as const;

export function getLayerColor(layer: keyof typeof LAYER_SCALES, value: number): string {
  const { stops, domain } = LAYER_SCALES[layer];
  return colorFromStops(stops, norm(value, domain[0], domain[1]));
}

export function mixColors(hexA: string, hexB: string, t: number): string {
  return colorFromStops([[0, hexA], [1, hexB]], t);
}

/** RGB em ponto flutuante 0-1, formato esperado pelos atributos de cor de vértice do three.js. */
export function hexToRgbFloat(hex: string): [number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  return [r / 255, g / 255, b / 255];
}
