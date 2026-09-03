import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { STAGES } from '../data/stationData';
import { resolveWaterQuality } from '../logic/treatmentModel';
import { centerOfStage } from './stationLayout';
import { surfaceY, uvToWorldXZ } from './stationConfig';
import { useStationStore } from '../state/store';

// Focos de não-conformidade: em qual etapa algum parâmetro monitorado ainda está fora do VMP da
// Portaria GM/MS 888/2021, para o cenário ativo — adaptado do marcador de praga do app da
// fazenda (halo pulsante + sprite de aviso clicável).

function createWarningTexture(critical: boolean): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.beginPath();
  ctx.moveTo(size / 2, 14);
  ctx.lineTo(size - 12, size - 20);
  ctx.lineTo(12, size - 20);
  ctx.closePath();
  ctx.fillStyle = critical ? '#d03b3b' : '#e8a33a';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(12,12,12,0.55)';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 58px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', size / 2, size / 2 + 12);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function Marker({ x, y, z, critical, onSelect }: { x: number; y: number; z: number; critical: boolean; onSelect: () => void }) {
  const haloRef = useRef<THREE.Mesh>(null);
  const spriteRef = useRef<THREE.Sprite>(null);
  const texture = useMemo(() => createWarningTexture(critical), [critical]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.85 + Math.sin(t * 2.4) * 0.15;
    if (haloRef.current) {
      haloRef.current.scale.setScalar(pulse);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.22 + (pulse - 0.85) * 0.9;
    }
    if (spriteRef.current) spriteRef.current.position.y = 0.5 + Math.sin(t * 1.8) * 0.04;
  });

  return (
    <group position={[x, y, z]}>
      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} renderOrder={4}>
        <ringGeometry args={[0.28, 0.5, 40]} />
        <meshBasicMaterial color={critical ? '#ff5a4d' : '#ffbe3d'} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <sprite
        ref={spriteRef}
        position={[0, 0.5, 0]}
        scale={[0.32, 0.32, 0.32]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <spriteMaterial map={texture} transparent depthTest={false} />
      </sprite>
    </group>
  );
}

export function StageMarkers() {
  const scenario = useStationStore((s) => s.scenario);
  const selectStage = useStationStore((s) => s.selectStage);
  const toggleOpen = useStationStore((s) => s.toggleStageOpen);

  const foci = useMemo(() => {
    return STAGES.filter((stage) => resolveWaterQuality(scenario, stage.order).compliancePct < 100).map((stage) => {
      const result = resolveWaterQuality(scenario, stage.order);
      return { stage, critical: result.compliancePct < 60 };
    });
  }, [scenario]);

  return (
    <group>
      {foci.map(({ stage, critical }) => {
        const { u, v } = centerOfStage(stage.id);
        const [x, z] = uvToWorldXZ(u, v);
        const y = surfaceY(u, v);
        return (
          <Marker
            key={stage.id}
            x={x}
            y={y}
            z={z}
            critical={critical}
            onSelect={() => {
              selectStage(stage.id);
              toggleOpen(stage.id);
            }}
          />
        );
      })}
    </group>
  );
}
