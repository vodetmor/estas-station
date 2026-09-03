import { useMemo } from 'react';
import * as THREE from 'three';
import { surfaceAt } from './stationLayout';
import { STAGES } from '../data/stationData';
import { computeMetrics } from '../logic/stageMetrics';
import { getLayerColor, hexToRgbFloat } from './colorScales';
import { surfaceY, uvToWorldXZ } from './stationConfig';
import { useStationStore } from '../state/store';

// Fita d'água seguindo o centro da calha (u=0.5) do início ao fim, caindo em cada degrau — a
// mesma técnica do rio da fazenda (fita fina colorida acompanhando a altura do terreno), mas
// aqui a cor muda de trecho a trecho conforme a turbidez REAL após cada etapa: a água entra
// barrenta e sai clara, sem precisar de nenhum texto para comunicar "isso está purificando".

const STEPS = 260;

export function WaterFlow() {
  const scenario = useStationStore((s) => s.scenario);

  const geometry = useMemo(() => {
    const halfWidth = 0.09;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= STEPS; i++) {
      const v = i / STEPS;
      const stageId = surfaceAt(0.5, v);
      const stageOrder = STAGES.find((s) => s.id === stageId)!.order;
      const metrics = computeMetrics(scenario, stageOrder);
      const hex = getLayerColor('turbidez', metrics.turbidez);
      const [r, g, b] = hexToRgbFloat(hex);

      const y = surfaceY(0.5, v) + 0.03;
      const [xL, zL] = uvToWorldXZ(0.5 - halfWidth, v);
      const [xR, zR] = uvToWorldXZ(0.5 + halfWidth, v);

      positions.push(xL, y, zL, xR, y, zR);
      colors.push(r, g, b, r, g, b);

      if (i < STEPS) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [scenario]);

  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshStandardMaterial vertexColors roughness={0.12} metalness={0.15} transparent opacity={0.88} side={THREE.DoubleSide} />
    </mesh>
  );
}
