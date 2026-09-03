import { useCallback, useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { STAGES, type StageId } from '../data/stationData';
import { computeMetrics, type WaterMetricSnapshot } from '../logic/stageMetrics';
import { surfaceAt } from './stationLayout';
import { getLayerColor, hexToRgbFloat } from './colorScales';
import { buildOverlayGeometry, buildSlabGeometry } from './terraceGeometry';
import { HALF_WIDTH, HALF_LENGTH, STATION_LENGTH, surfaceY, uvToWorldXZ, worldToUV } from './stationConfig';
import { useStationStore, type LayerId } from '../state/store';
import { vRangeOfStage } from './stationLayout';

const TOP_SEG_U = 24;
const TOP_SEG_V = 220; // resolução alta ao longo do fluxo: os degraus precisam ficar nítidos
const SLAB_SEG = 80;

const ZONE_COLOR: Record<StageId, string> = {
  filtracao: '#8a7256',
  biossorcao: '#5b7a8c',
  desgaseificacao: '#9aa0a0',
  desinfeccao: '#8a7aa8',
  remineralizacao: '#6f8a78',
  monitoramento: '#7a7f82',
  armazenamento: '#3f7a96',
};

function metricForLayer(layer: Exclude<LayerId, 'real'>, m: WaterMetricSnapshot): number {
  switch (layer) {
    case 'turbidez':
      return m.turbidez;
    case 'metais':
      return m.metaisTotal;
    case 'patogenos':
      return m.eColiIndex;
    case 'pH':
      return m.pH;
  }
}

export function StationStructure() {
  const layer = useStationStore((s) => s.layer);
  const scenario = useStationStore((s) => s.scenario);
  const selectedStageId = useStationStore((s) => s.selectedStageId);
  const hoveredStageId = useStationStore((s) => s.hoveredStageId);
  const selectStage = useStationStore((s) => s.selectStage);
  const hoverStage = useStationStore((s) => s.hoverStage);

  const baseGeometry = useMemo(
    () =>
      buildOverlayGeometry(
        TOP_SEG_U,
        TOP_SEG_V,
        (u, v) => hexToRgbFloat(ZONE_COLOR[surfaceAt(u, v)]),
        0,
      ),
    [],
  );
  const slabGeometry = useMemo(() => buildSlabGeometry(SLAB_SEG), []);

  const overlayGeometry = useMemo(() => {
    if (layer === 'real') return null;
    return buildOverlayGeometry(
      TOP_SEG_U,
      TOP_SEG_V,
      (u, v) => {
        const stageId = surfaceAt(u, v);
        const stageOrder = STAGES.find((s) => s.id === stageId)!.order;
        const metrics = computeMetrics(scenario, stageOrder);
        return hexToRgbFloat(getLayerColor(layer, metricForLayer(layer, metrics)));
      },
      0.05,
    );
  }, [layer, scenario]);

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const { u, v } = worldToUV(e.point.x, e.point.z);
      const id = surfaceAt(u, v);
      if (id !== hoveredStageId) hoverStage(id);
    },
    [hoveredStageId, hoverStage],
  );

  const handlePointerOut = useCallback(() => {
    hoverStage(null);
    document.body.style.cursor = 'default';
  }, [hoverStage]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const { u, v } = worldToUV(e.point.x, e.point.z);
      selectStage(surfaceAt(u, v));
    },
    [selectStage],
  );

  const highlightId = (hoveredStageId ?? selectedStageId) as StageId | null;

  return (
    <group>
      <mesh
        geometry={baseGeometry}
        onPointerMove={handlePointerMove}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        receiveShadow
      >
        <meshStandardMaterial vertexColors roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      <mesh geometry={slabGeometry}>
        <meshStandardMaterial vertexColors roughness={1} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {overlayGeometry && (
        <mesh geometry={overlayGeometry} renderOrder={2}>
          <meshBasicMaterial vertexColors transparent opacity={0.55} depthWrite={false} />
        </mesh>
      )}

      {highlightId && (
        <StageHighlight stageId={highlightId} selected={highlightId === selectedStageId} />
      )}
    </group>
  );
}

/** Contorno retangular marcando o módulo (etapa) inteiro sob o cursor ou selecionado. */
function StageHighlight({ stageId, selected }: { stageId: StageId; selected: boolean }) {
  const { v0, v1 } = vRangeOfStage(stageId);
  const vMid = (v0 + v1) / 2;
  const y = surfaceY(0.5, vMid) + 0.06;

  const geometry = useMemo(() => {
    const [x0, z0] = uvToWorldXZ(0, v0);
    const [x1, z1] = uvToWorldXZ(1, v1);
    const points = [
      new THREE.Vector3(x0, 0, z0),
      new THREE.Vector3(x1, 0, z0),
      new THREE.Vector3(x1, 0, z1),
      new THREE.Vector3(x0, 0, z1),
      new THREE.Vector3(x0, 0, z0),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [v0, v1]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: selected ? '#3ea8cf' : '#eef7f7',
        transparent: true,
        opacity: selected ? 0.95 : 0.55,
        linewidth: 2,
      }),
    [selected],
  );

  return <primitive object={new THREE.Line(geometry, material)} position={[0, y, 0]} />;
}

// Reexporta constantes de posicionamento úteis para outros arquivos da cena.
export { HALF_WIDTH, HALF_LENGTH, STATION_LENGTH };
