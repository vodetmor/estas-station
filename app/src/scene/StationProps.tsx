import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { STAGES, type StageId } from '../data/stationData';
import { centerOfStage, vRangeOfStage } from './stationLayout';
import { uvToWorldXZ, surfaceY, STATION_WIDTH } from './stationConfig';
import { useStationStore } from '../state/store';

// Cada etapa vem com uma "casca fechada" (como a estação apareceria de verdade — módulos
// selados) e um conjunto de peças internas que só aparecem quando o módulo está "aberto"
// (clique -> toggleStageOpen). É a interação central pedida: a imagem de referência mostra os
// módulos em corte para fins didáticos; no app, o padrão é fechado, e abrir é uma ação do usuário.

function stageWorldBox(stageId: StageId) {
  const { v0, v1 } = vRangeOfStage(stageId);
  const { u, v } = centerOfStage(stageId);
  const [cx, cz] = uvToWorldXZ(u, v);
  const [x0] = uvToWorldXZ(0, v0);
  const [x1] = uvToWorldXZ(0, v1);
  const length = Math.abs(x1 - x0);
  const y = surfaceY(0.5, v);
  return { cx, cz, y, length, width: STATION_WIDTH * 0.86 };
}

function ClosedShell({ stageId, color }: { stageId: StageId; color: string }) {
  const { cx, cz, y, length, width } = stageWorldBox(stageId);
  const height = 0.5;
  return (
    <group position={[cx, y, cz]}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[length * 0.94, height, width]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, height + 0.015, 0]}>
        <boxGeometry args={[length * 0.98, 0.03, width * 1.04]} />
        <meshStandardMaterial color="#3a3f3d" roughness={0.7} />
      </mesh>
    </group>
  );
}

function FiltracaoInternals() {
  const { cx, cz, y, length, width } = stageWorldBox('filtracao');
  const layers = [
    { color: '#7d7568', h: 0.06 }, // brita
    { color: '#c9b878', h: 0.05 }, // areia quartzosa
    { color: '#2a2a28', h: 0.05 }, // antracito
  ];
  let stackY = 0.02;
  return (
    <group position={[cx, y, cz]}>
      {layers.map((l, i) => {
        const py = stackY + l.h / 2;
        stackY += l.h + 0.01;
        return (
          <mesh key={i} position={[0, py, 0]}>
            <boxGeometry args={[length * 0.7, l.h, width * 0.8]} />
            <meshStandardMaterial color={l.color} roughness={0.95} />
          </mesh>
        );
      })}
      {/* grades metálicas de entrada */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[-length * 0.35, 0.28, i * width * 0.22]}>
          <boxGeometry args={[0.02, 0.4, width * 0.7]} />
          <meshStandardMaterial color="#c7cbc8" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {/* eletroímãs */}
      {[-0.2, 0.15].map((dx, i) => (
        <mesh key={i} position={[length * dx, 0.25, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.3, 12]} />
          <meshStandardMaterial color="#2f3a4a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function BiossorcaoInternals() {
  const { cx, cz, y, length, width } = stageWorldBox('biossorcao');
  const agitatorRef1 = useRef<THREE.Mesh>(null);
  const agitatorRef2 = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (agitatorRef1.current) agitatorRef1.current.rotation.y += delta * 1.4;
    if (agitatorRef2.current) agitatorRef2.current.rotation.y += delta * 1.1;
  });

  const tankOffsets = [-length * 0.28, length * 0.1];
  const panelX = length * 0.4;

  return (
    <group position={[cx, y, cz]}>
      {tankOffsets.map((dx, i) => (
        <group key={i} position={[dx, 0, 0]}>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[length * 0.28, 0.44, width * 0.75]} />
            <meshStandardMaterial color="#3f6b82" roughness={0.5} metalness={0.1} transparent opacity={0.88} />
          </mesh>
          <mesh ref={i === 0 ? agitatorRef1 : agitatorRef2} position={[0, 0.42, 0]}>
            <boxGeometry args={[length * 0.22, 0.02, 0.05]} />
            <meshStandardMaterial color="#dfe4e2" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* painéis de biossorção: ripas verticais em série */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[panelX, 0.28, (i - 2.5) * (width * 0.15)]}>
          <boxGeometry args={[0.02, 0.5, width * 0.11]} />
          <meshStandardMaterial color="#2f6b52" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function DesgaseificacaoInternals() {
  const { cx, cz, y } = stageWorldBox('desgaseificacao');
  return (
    <group position={[cx, y, cz]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 1.3, 10]} />
        <meshStandardMaterial color="#aab0ad" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.58, 0]}>
        <coneGeometry args={[0.16, 0.22, 10]} />
        <meshStandardMaterial color="#8f9592" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

function DesinfeccaoInternals() {
  const { cx, cz, y, length, width } = stageWorldBox('desinfeccao');
  const lamps = 5;
  const pulseRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 6) * 0.03;
      pulseRef.current.scale.set(s, 1, s);
    }
  });
  return (
    <group position={[cx, y, cz]}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[length * 0.8, 0.44, width * 0.8]} />
        <meshStandardMaterial color="#c9c4e0" roughness={0.3} metalness={0.1} transparent opacity={0.35} />
      </mesh>
      <group ref={pulseRef}>
        {Array.from({ length: lamps }).map((_, i) => (
          <mesh key={i} position={[(i - (lamps - 1) / 2) * (length * 0.14), 0.22, 0]}>
            <cylinderGeometry args={[0.025, 0.025, width * 0.7, 8]} />
            <meshStandardMaterial color="#a06bd6" emissive="#8a3fe0" emissiveIntensity={1.4} />
          </mesh>
        ))}
      </group>
      {/* membranas cerâmicas */}
      <mesh position={[length * 0.35, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.06, 16]} />
        <meshStandardMaterial color="#e7e2d6" roughness={0.6} />
      </mesh>
    </group>
  );
}

function RemineralizacaoInternals() {
  const { cx, cz, y, length, width } = stageWorldBox('remineralizacao');
  return (
    <group position={[cx, y, cz]}>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * length * 0.2, 0.24, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.42, 12]} />
          <meshStandardMaterial color="#c7bfa3" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[length * 0.35, 0.16, 0]}>
        <boxGeometry args={[length * 0.22, 0.3, width * 0.7]} />
        <meshStandardMaterial color="#4c7f6f" roughness={0.5} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function MonitoramentoInternals() {
  const { cx, cz, y, width } = stageWorldBox('monitoramento');
  const lightsRef = useRef<THREE.InstancedMesh>(null);
  const lightColors = useMemo(() => ['#3ecf8e', '#3ecf8e', '#fab219', '#3ecf8e'], []);

  useFrame(({ clock }) => {
    if (!lightsRef.current) return;
    const c = new THREE.Color();
    const t = clock.getElapsedTime();
    lightColors.forEach((hex, i) => {
      c.set(hex);
      const pulse = 0.6 + Math.sin(t * 3 + i) * 0.4;
      c.multiplyScalar(pulse);
      lightsRef.current!.setColorAt(i, c);
    });
    if (lightsRef.current.instanceColor) lightsRef.current.instanceColor.needsUpdate = true;
  });

  const mesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.025, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ emissive: '#ffffff', emissiveIntensity: 1 });
    const m = new THREE.InstancedMesh(geo, mat, lightColors.length);
    const dummy = new THREE.Object3D();
    lightColors.forEach((_, i) => {
      dummy.position.set((i - 1.5) * 0.09, 0.42, 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    return m;
  }, [lightColors]);

  return (
    <group position={[cx, y, cz]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.4, width * 0.5]} />
        <meshStandardMaterial color="#4a4f4d" roughness={0.6} />
      </mesh>
      <primitive ref={lightsRef} object={mesh} />
    </group>
  );
}

function ArmazenamentoInternals() {
  const { cx, cz, y, length, width } = stageWorldBox('armazenamento');
  return (
    <group position={[cx, y, cz]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[length * 0.7, 0.6, width * 0.8]} />
        <meshStandardMaterial color="#7d9baa" roughness={0.4} metalness={0.2} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[length * 0.68, 0.03, width * 0.78]} />
        <meshStandardMaterial color="#3f8fb0" roughness={0.15} metalness={0.3} />
      </mesh>
      {/* tubulação de distribuição saindo da base */}
      <mesh position={[length * 0.42, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 10]} />
        <meshStandardMaterial color="#8a8f8c" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

const INTERNALS: Record<StageId, () => React.JSX.Element> = {
  filtracao: FiltracaoInternals,
  biossorcao: BiossorcaoInternals,
  desgaseificacao: DesgaseificacaoInternals,
  desinfeccao: DesinfeccaoInternals,
  remineralizacao: RemineralizacaoInternals,
  monitoramento: MonitoramentoInternals,
  armazenamento: ArmazenamentoInternals,
};

const SHELL_COLOR: Record<StageId, string> = {
  filtracao: '#8a7256',
  biossorcao: '#5b7a8c',
  desgaseificacao: '#9aa0a0',
  desinfeccao: '#8a7aa8',
  remineralizacao: '#6f8a78',
  monitoramento: '#7a7f82',
  armazenamento: '#3f7a96',
};

export function StationProps() {
  const openStages = useStationStore((s) => s.openStages);

  return (
    <group>
      {STAGES.map((stage) => {
        const isOpen = openStages.has(stage.id);
        const Internals = INTERNALS[stage.id];
        return (
          <group key={stage.id}>
            {!isOpen && <ClosedShell stageId={stage.id} color={SHELL_COLOR[stage.id]} />}
            {isOpen && <Internals />}
          </group>
        );
      })}
    </group>
  );
}
