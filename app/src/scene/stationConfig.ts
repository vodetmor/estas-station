import { elevationAt } from './stationLayout';

// A estação é uma "calha" comprida (água entra num ponto e desce em terraços até o outro):
// diferente da fazenda (recorte ~quadrado), aqui largura e comprimento são independentes.
export const STATION_WIDTH = 5.2; // eixo u (lateral)
export const STATION_LENGTH = 15.6; // eixo v (sentido do fluxo, entrada -> saída)
export const HALF_WIDTH = STATION_WIDTH / 2;
export const HALF_LENGTH = STATION_LENGTH / 2;
export const ELEV_SCALE = 3.4; // queda total do topo (água bruta) até a base (reservatório)
export const BASE_Y = 0.1;
export const SLAB_BOTTOM_Y = -1.1;

// O comprimento (fluxo, v) corre ao longo de X, a largura (u) ao longo de Z — de propósito:
// numa câmera isométrica simétrica (mesmo ângulo nos 3 eixos), é o eixo mais comprido que deve
// se espalhar pela tela para a "escadaria" ficar legível, com a largura dando volume em Z.

/** (u, v) normalizados -> coordenadas de mundo (x, z). u=0..1 largura, v=0 (entrada) .. 1 (saída). */
export function uvToWorldXZ(u: number, v: number): [number, number] {
  return [v * STATION_LENGTH - HALF_LENGTH, u * STATION_WIDTH - HALF_WIDTH];
}

/** Coordenadas de mundo (x, z) -> (u, v) normalizados. */
export function worldToUV(x: number, z: number): { u: number; v: number } {
  return { u: (z + HALF_WIDTH) / STATION_WIDTH, v: (x + HALF_LENGTH) / STATION_LENGTH };
}

/** Altura do terraço em (u, v), já na escala da cena. */
export function surfaceY(u: number, v: number): number {
  return BASE_Y + elevationAt(u, v) * ELEV_SCALE;
}
