import * as THREE from 'three';
import { SLAB_BOTTOM_Y, surfaceY, uvToWorldXZ } from './stationConfig';

// Adaptado de surfaceGeometry.ts (app da fazenda): a lógica de malha é idêntica (um grid de
// vértices deslocados por `surfaceY`), só que aqui a "pegada" é comprida e estreita, então os
// segmentos de u e v são independentes — precisamos de bem mais resolução ao longo do fluxo (v)
// para os degraus ficarem nítidos do que na largura (u), que é sempre plana.

/** Malha do topo da estação: os degraus vêm inteiramente de `surfaceY` (ver stationLayout.ts). */
export function buildTopGeometry(segU: number, segV: number): THREE.BufferGeometry {
  const vertsU = segU + 1;
  const vertsV = segV + 1;
  const positions = new Float32Array(vertsU * vertsV * 3);
  const uvs = new Float32Array(vertsU * vertsV * 2);

  for (let i = 0; i < vertsV; i++) {
    const v = i / segV;
    for (let j = 0; j < vertsU; j++) {
      const u = j / segU;
      const [x, z] = uvToWorldXZ(u, v);
      const idx = i * vertsU + j;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = surfaceY(u, v);
      positions[idx * 3 + 2] = z;
      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = v;
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < segV; i++) {
    for (let j = 0; j < segU; j++) {
      const a = i * vertsU + j;
      const b = a + 1;
      const c = a + vertsU;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Paredes laterais + fundo do recorte: transforma a estrutura num bloco sólido de concreto
 * encaixado na encosta, em vez de uma superfície flutuando no vazio — mesma técnica do
 * "bloco de terra" do app da fazenda, só trocando a paleta terrosa por tons de concreto.
 */
export function buildSlabGeometry(seg: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const topColor = new THREE.Color('#8b8f8c');
  const midColor = new THREE.Color('#5c6260');
  const bottomColor = new THREE.Color('#2c302f');

  const edge: [number, number][] = [];
  for (let i = 0; i <= seg; i++) edge.push([i / seg, 0]);
  for (let i = 1; i <= seg; i++) edge.push([1, i / seg]);
  for (let i = seg - 1; i >= 0; i--) edge.push([i / seg, 1]);
  for (let i = seg - 1; i >= 0; i--) edge.push([0, i / seg]);

  edge.forEach(([u, v]) => {
    const [x, z] = uvToWorldXZ(u, v);
    const y = surfaceY(u, v);
    positions.push(x, y, z);
    colors.push(topColor.r, topColor.g, topColor.b);
    positions.push(x, (y + SLAB_BOTTOM_Y) / 2, z);
    colors.push(midColor.r, midColor.g, midColor.b);
    positions.push(x, SLAB_BOTTOM_Y, z);
    colors.push(bottomColor.r, bottomColor.g, bottomColor.b);
  });

  const ringCount = edge.length;
  for (let i = 0; i < ringCount; i++) {
    const next = (i + 1) % ringCount;
    for (let layer = 0; layer < 2; layer++) {
      const a = i * 3 + layer;
      const b = next * 3 + layer;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const baseIndex = positions.length / 3;
  const [cx, cz] = uvToWorldXZ(0.5, 0.5);
  positions.push(cx, SLAB_BOTTOM_Y, cz);
  colors.push(bottomColor.r, bottomColor.g, bottomColor.b);
  for (let i = 0; i < ringCount; i++) {
    const next = (i + 1) % ringCount;
    indices.push(baseIndex, i * 3 + 2, next * 3 + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Superfície fina logo acima do terraço, usada para pintar o mapa de calor da camada ativa. */
export function buildOverlayGeometry(
  segU: number,
  segV: number,
  colorAt: (u: number, v: number) => [number, number, number],
  yOffset: number,
): THREE.BufferGeometry {
  const vertsU = segU + 1;
  const vertsV = segV + 1;
  const positions = new Float32Array(vertsU * vertsV * 3);
  const colors = new Float32Array(vertsU * vertsV * 3);

  for (let i = 0; i < vertsV; i++) {
    const v = i / segV;
    for (let j = 0; j < vertsU; j++) {
      const u = j / segU;
      const [x, z] = uvToWorldXZ(u, v);
      const idx = i * vertsU + j;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = surfaceY(u, v) + yOffset;
      positions[idx * 3 + 2] = z;
      const [r, g, b] = colorAt(u, v);
      colors[idx * 3] = r;
      colors[idx * 3 + 1] = g;
      colors[idx * 3 + 2] = b;
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < segV; i++) {
    for (let j = 0; j < segU; j++) {
      const a = i * vertsU + j;
      const b = a + 1;
      const c = a + vertsU;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
