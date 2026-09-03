import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PALETTE } from './layout';
import { useStationStore } from '../state/store';

/**
 * Equipamentos de cada etapa da ESTAS, em coordenadas LOCAIS do módulo
 * (origem = centro do piso, +X = sentido do fluxo, +Z = fachada de visualização).
 *
 * Cada arquivo-fonte do projeto (§7.2 a §7.8) descreve a composição do seu módulo; é essa lista
 * de equipamentos que está modelada aqui — não decoração genérica.
 */

const steel = { color: PALETTE.steel, metalness: 0.8, roughness: 0.28 };
const darkSteel = { color: PALETTE.steelDark, metalness: 0.65, roughness: 0.4 };

/** Hook auxiliar: a animação só roda com o módulo efetivamente aberto. */
function useOpen(id: string) {
  return useStationStore((s) => s.openStages.has(id));
}

// ===========================================================================
// ETAPA I — grades, peneiras, leito de brita/areia/antracito e eletroímãs
// ===========================================================================

export function FiltracaoInternals() {
  const open = useOpen('filtracao');
  const capturedRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!open || !capturedRef.current) return;
    const t = clock.getElapsedTime();
    capturedRef.current.children.forEach((c, i) => {
      c.position.y = 0.62 + Math.sin(t * 2 + i * 1.7) * 0.03;
      c.rotation.y = t * 0.6 + i;
    });
  });

  return (
    <group>
      {/* Grades metálicas de retenção de sólidos grosseiros */}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[-1.42, 0.42, -1.1 + i * 0.22]} castShadow>
          <boxGeometry args={[0.03, 0.78, 0.03]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}

      {/* Peneiras de granulometria decrescente (duas telas inclinadas) */}
      {[-1.14, -0.94].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0]} rotation={[0, 0, 0.22]}>
          <boxGeometry args={[0.02, 0.62, 2.3]} />
          <meshStandardMaterial color={i === 0 ? '#9aa3a0' : '#7d8785'} metalness={0.7} roughness={0.45} />
        </mesh>
      ))}

      {/* Leito filtrante tríplice — brita graduada, areia quartzosa e antracito */}
      <group position={[-0.25, 0, 0]}>
        <mesh position={[0, 0.11, 0]} receiveShadow>
          <boxGeometry args={[1.5, 0.18, 2.3]} />
          <meshStandardMaterial color="#5c564c" roughness={0.98} />
        </mesh>
        <mesh position={[0, 0.27, 0]} receiveShadow>
          <boxGeometry args={[1.5, 0.14, 2.3]} />
          <meshStandardMaterial color="#cdad63" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.39, 0]} receiveShadow>
          <boxGeometry args={[1.5, 0.1, 2.3]} />
          <meshStandardMaterial color="#1f2021" roughness={0.88} />
        </mesh>
        {/* Drenos de fundo do leito */}
        {[-0.7, 0, 0.7].map((z, i) => (
          <mesh key={i} position={[0, 0.03, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 1.4, 10]} />
            <meshStandardMaterial {...darkSteel} />
          </mesh>
        ))}
      </group>

      {/* Muro divisor para o canal magnético */}
      <mesh position={[0.55, 0.32, 0]} castShadow>
        <boxGeometry args={[0.1, 0.64, 2.5]} />
        <meshStandardMaterial color={PALETTE.concreteDark} roughness={0.8} />
      </mesh>

      {/* Canal com 3 eletroímãs de alta intensidade */}
      <group position={[1.05, 0, 0]}>
        {[-0.78, 0, 0.78].map((z, i) => (
          <group key={i} position={[0, 0, z]}>
            {/* Núcleo ferromagnético */}
            <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.5, 16]} />
              <meshStandardMaterial color="#2b3138" metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Bobina de cobre */}
            <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.185, 0.185, 0.32, 16]} />
              <meshStandardMaterial color="#b06a33" metalness={0.85} roughness={0.32} />
            </mesh>
            {/* Sapata polar mergulhando no canal */}
            <mesh position={[0, 0.63, 0]} castShadow>
              <boxGeometry args={[0.26, 0.2, 0.36]} />
              <meshStandardMaterial color="#3b4249" metalness={0.8} roughness={0.35} />
            </mesh>
            {/* Cabeçote elétrico com LED de operação */}
            <mesh position={[0, 1.06, 0]}>
              <boxGeometry args={[0.2, 0.14, 0.2]} />
              <meshStandardMaterial {...darkSteel} />
            </mesh>
            <mesh position={[0, 1.15, 0]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.4} />
            </mesh>
          </group>
        ))}
        {/* Partículas ferromagnéticas retidas sob as sapatas polares */}
        <group ref={capturedRef}>
          {[-0.78, 0, 0.78].map((z, i) => (
            <mesh key={i} position={[0, 0.62, z]}>
              <icosahedronGeometry args={[0.055, 0]} />
              <meshStandardMaterial color="#4b3b2c" roughness={0.95} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export function FiltracaoExterior() {
  return (
    <group>
      {/* Quadro elétrico dos eletroímãs, encostado na empena de montante */}
      <group position={[-1.82, 0.42, 1.0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.84, 0.5]} />
          <meshStandardMaterial color="#39433f" roughness={0.55} metalness={0.35} />
        </mesh>
        <mesh position={[0.12, 0.16, 0]}>
          <boxGeometry args={[0.02, 0.16, 0.3]} />
          <meshStandardMaterial color="#0f2a33" emissive="#1c7ea8" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* Escada marinheiro de acesso ao lanternim */}
      <ServiceLadder position={[1.0, 0, 1.55]} height={1.5} />
    </group>
  );
}

// ===========================================================================
// ETAPA II — reatores, agitadores lentos, painéis de biossorção e dosador
// ===========================================================================

export function BiossorcaoInternals() {
  const open = useOpen('biossorcao');
  const ag1 = useRef<THREE.Group>(null);
  const ag2 = useRef<THREE.Group>(null);
  const micelas = useRef<THREE.Points>(null);

  const micelaData = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seed[i * 3] = -1.5 + Math.random() * 3.0;
      seed[i * 3 + 1] = 0.12 + Math.random() * 0.5;
      seed[i * 3 + 2] = -1.3 + Math.random() * 2.6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geo, seed, count };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!open) return;
    if (ag1.current) ag1.current.rotation.y += delta * 1.1;
    if (ag2.current) ag2.current.rotation.y -= delta * 0.9;
    if (micelas.current) {
      const t = clock.getElapsedTime();
      const arr = micelas.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < micelaData.count; i++) {
        const sx = micelaData.seed[i * 3];
        const sy = micelaData.seed[i * 3 + 1];
        const sz = micelaData.seed[i * 3 + 2];
        // Circulação lenta induzida pelos agitadores (§7.3: agitação lenta e constante)
        const ang = t * 0.35 + i * 0.4;
        arr[i * 3] = sx + Math.cos(ang) * 0.16;
        arr[i * 3 + 1] = sy + Math.sin(t * 0.8 + i) * 0.05;
        arr[i * 3 + 2] = sz + Math.sin(ang) * 0.16;
      }
      micelas.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Chicanas do labirinto de contato (30 min de retenção) */}
      <mesh position={[-0.62, 0.44, -0.42]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.88, 2.24]} />
        <meshStandardMaterial color={PALETTE.concreteDark} roughness={0.8} />
      </mesh>
      <mesh position={[0.62, 0.44, 0.42]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.88, 2.24]} />
        <meshStandardMaterial color={PALETTE.concreteDark} roughness={0.8} />
      </mesh>

      {/* Agitadores de baixa rotação */}
      {[
        { ref: ag1, x: -1.25, z: 0.55 },
        { ref: ag2, x: 0.05, z: -0.62 },
      ].map((a, i) => (
        <group key={i} position={[a.x, 0, a.z]}>
          <group ref={a.ref}>
            <mesh position={[0, 0.62, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.028, 1.1, 12]} />
              <meshStandardMaterial {...steel} />
            </mesh>
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[0, 0.24, 0]} rotation={[0, (k * Math.PI * 2) / 3, 0.24]}>
                <boxGeometry args={[0.46, 0.03, 0.12]} />
                <meshStandardMaterial color="#3b6978" metalness={0.55} roughness={0.4} />
              </mesh>
            ))}
          </group>
          {/* Motorredutor */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 12]} />
            <meshStandardMaterial color="#1f4b59" metalness={0.5} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* Painéis de biossorção com biossurfactantes imobilizados */}
      {[
        { p: [-1.2, 0.42, -1.4] as const, r: [0, 0, 0] as const, s: [1.3, 0.8, 0.05] as const },
        { p: [1.0, 0.42, -1.4] as const, r: [0, 0, 0] as const, s: [1.3, 0.8, 0.05] as const },
        { p: [-0.53, 0.42, -0.42] as const, r: [0, 0, 0] as const, s: [0.05, 0.72, 2.1] as const },
        { p: [0.71, 0.42, 0.42] as const, r: [0, 0, 0] as const, s: [0.05, 0.72, 2.1] as const },
      ].map((p, i) => (
        <group key={i} position={p.p as unknown as [number, number, number]}>
          <mesh castShadow>
            <boxGeometry args={p.s as unknown as [number, number, number]} />
            <meshStandardMaterial color="#2e7a55" roughness={0.85} />
          </mesh>
          {/* Malha de suporte do biofilme */}
          <mesh scale={[1.02, 0.9, 1.02]}>
            <boxGeometry args={p.s as unknown as [number, number, number]} />
            <meshStandardMaterial color="#5fbd8c" roughness={0.6} wireframe />
          </mesh>
        </group>
      ))}

      {/* Micelas de biossurfactante capturando metais (Pb, Hg, Cd, As, Cr) */}
      <points ref={micelas} geometry={micelaData.geo}>
        <pointsMaterial size={4} sizeAttenuation={false} color="#7ff0c0" transparent opacity={0.9} depthWrite={false} />
      </points>

      {/* Compartimento de retenção dos resíduos metálicos removidos */}
      <mesh position={[1.35, 0.16, 1.15]} castShadow>
        <boxGeometry args={[0.5, 0.32, 0.6]} />
        <meshStandardMaterial color="#4a3f36" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function BiossorcaoExterior() {
  return (
    <group>
      {/* Tanque externo de biossurfactante com bomba dosadora (§7.3) */}
      <group position={[-1.95, 0, 1.45]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 1.0, 20]} />
          <meshStandardMaterial color="#2f8e7d" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.03, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.06, 20]} />
          <meshStandardMaterial {...steel} />
        </mesh>
        <mesh position={[0.26, 0.18, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial {...darkSteel} />
        </mesh>
        {/* Linha de dosagem entrando no reator */}
        <mesh position={[0.6, 0.92, -0.3]} rotation={[0, 0.5, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.1, 10]} />
          <meshStandardMaterial color="#2374ab" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
      <ServiceLadder position={[1.35, 0, 1.72]} height={1.7} />
    </group>
  );
}

// ===========================================================================
// ETAPA III — torre de aeração em cascata, dutos e exaustão de gases
// ===========================================================================

export function DesgaseificacaoInternals() {
  const open = useOpen('desgaseificacao');
  const bubbles = useRef<THREE.Points>(null);

  const bubbleData = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 2);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seed[i * 2] = -1.05 + Math.random() * 2.2;
      seed[i * 2 + 1] = -0.9 + Math.random() * 1.8;
      speed[i] = 0.25 + Math.random() * 0.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geo, seed, speed, count };
  }, []);

  useFrame(({ clock }) => {
    if (!open || !bubbles.current) return;
    const t = clock.getElapsedTime();
    const arr = bubbles.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < bubbleData.count; i++) {
      const x = bubbleData.seed[i * 2];
      const z = bubbleData.seed[i * 2 + 1];
      // Gases sobem do espelho d'água de cada degrau até a coifa de exaustão.
      const base = 1.42 - (x + 1.05) * 0.5;
      const rise = ((t * bubbleData.speed[i] + i * 0.13) % 1) * (1.72 - base);
      arr[i * 3] = x + Math.sin(t * 1.6 + i) * 0.05;
      arr[i * 3 + 1] = base + rise;
      arr[i * 3 + 2] = z + Math.cos(t * 1.3 + i) * 0.05;
    }
    bubbles.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Sucessivos desníveis da torre hidráulica (§7.4) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = -1.05 + i * 0.52;
        const y = 1.42 - i * 0.32;
        return (
          <group key={i}>
            <mesh position={[x, y - 0.16, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.52, 0.32, 2.1]} />
              <meshStandardMaterial color={PALETTE.concrete} roughness={0.8} />
            </mesh>
            {/* Vertedouro de lâmina delgada de cada degrau */}
            <mesh position={[x + 0.25, y + 0.03, 0]}>
              <boxGeometry args={[0.05, 0.07, 2.1]} />
              <meshStandardMaterial color={PALETTE.rim} roughness={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* Bacia de pé da cascata */}
      <mesh position={[1.05, 0.12, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.24, 2.1]} />
        <meshStandardMaterial color={PALETTE.concreteDeep} roughness={0.85} />
      </mesh>

      {/* Coifa coletora e duto de ventilação para a exaustão */}
      <mesh position={[-0.1, 1.72, 0]} castShadow>
        <boxGeometry args={[2.2, 0.12, 2.0]} />
        <meshStandardMaterial color="#75807d" metalness={0.55} roughness={0.42} />
      </mesh>
      <mesh position={[0.55, 1.62, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.5, 0.1, 1.9]} />
        <meshStandardMaterial color="#828d8a" metalness={0.55} roughness={0.42} />
      </mesh>
      {/* Filtro de gases antes do lançamento (§7.4: "passando por um filtro") */}
      <mesh position={[-0.72, 1.6, 0]} castShadow>
        <boxGeometry args={[0.42, 0.28, 0.9]} />
        <meshStandardMaterial color="#4c5a52" roughness={0.75} />
      </mesh>

      {/* CO2 e H2S desprendendo da lâmina aerada */}
      <points ref={bubbles} geometry={bubbleData.geo}>
        <pointsMaterial size={3.5} sizeAttenuation={false} color="#d8f4ff" transparent opacity={0.5} depthWrite={false} />
      </points>
    </group>
  );
}

export function DesgaseificacaoExterior() {
  const plume = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!plume.current) return;
    const t = clock.getElapsedTime();
    plume.current.children.forEach((c, i) => {
      const k = (t * 0.32 + i * 0.25) % 1;
      c.position.y = 2.9 + k * 1.5;
      c.position.x = 0.62 + k * 0.55;
      c.scale.setScalar(0.1 + k * 0.42);
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.24 * (1 - k);
    });
  });

  return (
    <group>
      {/* Chaminé de exaustão dos gases desprendidos — atravessa a cobertura */}
      <mesh position={[0.62, 2.42, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.95, 14]} />
        <meshStandardMaterial color="#8d9895" metalness={0.62} roughness={0.36} />
      </mesh>
      <mesh position={[0.62, 2.94, 0]} castShadow>
        <coneGeometry args={[0.26, 0.16, 14]} />
        <meshStandardMaterial color="#4f5654" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Anéis de reforço da chaminé */}
      {[2.15, 2.6].map((y, i) => (
        <mesh key={i} position={[0.62, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.018, 8, 18]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
      {/* Pluma de gases lançados */}
      <group ref={plume}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.32, 10, 10]} />
            <meshBasicMaterial color="#b9c9c6" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <ServiceLadder position={[-1.05, 0, 1.4] } height={2.3} />
      {/* Guarda-corpo do passadiço superior da torre */}
      <Railing position={[0, 2.05, 1.32]} length={2.5} />
    </group>
  );
}

// ===========================================================================
// ETAPA IV — câmaras UV-C fechadas e membranas cerâmicas com quitosana
// ===========================================================================

export function DesinfeccaoInternals() {
  const open = useOpen('desinfeccao');
  const lamps = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!open || !lamps.current) return;
    const pulse = 1.7 + Math.sin(clock.getElapsedTime() * 3.4) * 0.4;
    // Percorre a árvore inteira: as lâmpadas ficam dentro de grupos aninhados.
    lamps.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial && m.emissiveIntensity !== undefined) {
        m.emissiveIntensity = pulse;
      }
    });
  });

  return (
    <group>
      {/* Duas câmaras longitudinais fechadas de radiação */}
      {[-0.62, 0.62].map((z, ch) => (
        <group key={ch} position={[0, 0, z]}>
          <mesh position={[-0.35, 0.24, 0]} receiveShadow>
            <boxGeometry args={[1.9, 0.06, 0.86]} />
            <meshStandardMaterial color="#6b7370" metalness={0.4} roughness={0.45} />
          </mesh>
          {/* Divisórias das câmaras */}
          {[-1.3, -0.4, 0.5].map((x, i) => (
            <mesh key={i} position={[x, 0.42, 0]} castShadow>
              <boxGeometry args={[0.07, 0.5, 0.9]} />
              <meshStandardMaterial color={PALETTE.concreteDark} roughness={0.75} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Lâmpadas germicidas UV-C (200-280 nm) */}
      <group ref={lamps}>
        {[-0.62, 0.62].map((z, ch) => (
          <group key={ch} position={[0, 0, z]}>
            {[0.4, 0.56].map((y, l) => (
              <mesh key={l} position={[-0.35, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.024, 0.024, 1.85, 12]} />
                <meshStandardMaterial color="#c79bff" emissive="#8b3ff0" emissiveIntensity={1.7} roughness={0.15} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {/* Volume de luz germicida dentro das câmaras */}
      {[-0.62, 0.62].map((z, i) => (
        <mesh key={i} position={[-0.35, 0.46, z]}>
          <boxGeometry args={[1.85, 0.32, 0.7]} />
          <meshBasicMaterial color="#7b3fe0" transparent opacity={0.14} depthWrite={false} />
        </mesh>
      ))}

      {/* Racks de membranas cerâmicas revestidas de quitosana */}
      <group position={[1.02, 0, 0]}>
        {[-0.62, 0.62].map((z, ch) => (
          <group key={ch} position={[0, 0.42, z]}>
            {[0, 1, 2, 3, 4].map((k) => (
              <mesh key={k} position={[k * 0.07 - 0.14, 0, 0]} castShadow>
                <boxGeometry args={[0.03, 0.5, 0.78]} />
                <meshStandardMaterial color="#e2ded3" roughness={0.62} metalness={0.15} />
              </mesh>
            ))}
            {/* Moldura do rack */}
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.42, 0.05, 0.86]} />
              <meshStandardMaterial {...steel} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Radiômetro UV de validação de dose */}
      <mesh position={[0.2, 0.72, 1.02]} castShadow>
        <boxGeometry args={[0.16, 0.2, 0.12]} />
        <meshStandardMaterial color="#20282c" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.2, 0.79, 1.09]}>
        <boxGeometry args={[0.1, 0.06, 0.01]} />
        <meshStandardMaterial color="#0a3a2a" emissive="#34d399" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

export function DesinfeccaoExterior() {
  return (
    <group>
      {/* Painel de reatores/ballast das lâmpadas UV */}
      <group position={[-1.75, 0.45, 1.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.9, 0.72]} />
          <meshStandardMaterial color="#3b3550" roughness={0.5} metalness={0.35} />
        </mesh>
        {[0.2, 0.02, -0.16].map((y, i) => (
          <mesh key={i} position={[0.11, y, 0]}>
            <boxGeometry args={[0.02, 0.06, 0.5]} />
            <meshStandardMaterial color="#2b1a4a" emissive="#a855f7" emissiveIntensity={1.1} />
          </mesh>
        ))}
      </group>
      <Railing position={[0, 1.32, 1.42]} length={2.6} />
    </group>
  );
}

// ===========================================================================
// ETAPA V — cartuchos de calcita/dolomita e reservatório de estabilização
// ===========================================================================

export function RemineralizacaoInternals() {
  return (
    <group>
      {/* Cartuchos com minerais naturais (Ca, Mg) */}
      {[-0.5, -0.05, 0.4].map((x, i) => (
        <group key={i} position={[x, 0, -0.35]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.78, 16]} />
            <meshStandardMaterial color="#ded6c6" roughness={0.82} />
          </mesh>
          {/* Recheio granular visível pela janela do cartucho */}
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.5, 16]} />
            <meshStandardMaterial color="#f2ead8" roughness={0.95} transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.07, 16]} />
            <meshStandardMaterial color="#3ea8cf" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Barrilete de mistura com válvulas de ajuste */}
      <group position={[0, 0.88, 0.2]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 1.5, 12]} />
          <meshStandardMaterial color="#2374ab" metalness={0.7} roughness={0.3} />
        </mesh>
        {[-0.5, -0.05, 0.4].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, -0.07, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.4, 10]} />
              <meshStandardMaterial {...steel} />
            </mesh>
            <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.045, 0.012, 8, 14]} />
              <meshStandardMaterial color="#dc2626" roughness={0.42} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Bacia de estabilização físico-química */}
      <mesh position={[0.1, 0.1, 0.45]} receiveShadow>
        <boxGeometry args={[1.5, 0.2, 0.6]} />
        <meshStandardMaterial color={PALETTE.concreteDeep} roughness={0.88} />
      </mesh>
      {/* Eletrodo de pH compensado */}
      <mesh position={[0.62, 0.4, 0.45]}>
        <cylinderGeometry args={[0.02, 0.02, 0.42, 10]} />
        <meshStandardMaterial color="#cfd6d3" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ===========================================================================
// ETAPA VI — bancada de auditoria final multiparâmetro (Portaria 888)
// ===========================================================================

export function MonitoramentoInternals() {
  const open = useOpen('monitoramento');
  const leds = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!open || !leds.current) return;
    const t = clock.getElapsedTime();
    leds.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * (1.4 + i * 0.35) + i)) * 2.2;
    });
  });

  return (
    <group>
      {/* Canal de passagem com as sondas mergulhadas */}
      <mesh position={[0, 0.14, -0.42]} receiveShadow>
        <boxGeometry args={[1.5, 0.28, 0.5]} />
        <meshStandardMaterial color={PALETTE.concreteDeep} roughness={0.88} />
      </mesh>
      {[-0.42, -0.12, 0.18, 0.48].map((x, i) => (
        <group key={i} position={[x, 0, -0.42]}>
          <mesh position={[0, 0.46, 0]}>
            <cylinderGeometry args={[0.021, 0.021, 0.62, 10]} />
            <meshStandardMaterial color="#c9d2cf" metalness={0.65} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#242c2f" metalness={0.5} roughness={0.42} />
          </mesh>
        </group>
      ))}

      {/* Bancada / rack do controlador lógico multiparâmetro */}
      <mesh position={[0, 0.4, 0.42]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.32]} />
        <meshStandardMaterial color="#2b3438" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Telas de telemetria */}
      {[-0.42, 0.0, 0.42].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0.59]}>
          <boxGeometry args={[0.34, 0.22, 0.02]} />
          <meshStandardMaterial color="#07222b" emissive="#1fb6d8" emissiveIntensity={0.85} roughness={0.25} />
        </mesh>
      ))}
      {/* LEDs de status por parâmetro auditado */}
      <group ref={leds}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[-0.54 + i * 0.18, 0.3, 0.59]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.4} />
          </mesh>
        ))}
      </group>

      {/* Válvula automática de bloqueio: fecha a distribuição se algum parâmetro desviar */}
      <group position={[0.68, 0.3, -0.05]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.36, 12]} />
          <meshStandardMaterial color="#1e5f8a" metalness={0.65} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.12, 0.18, 0.12]} />
          <meshStandardMaterial color="#0f766e" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export function MonitoramentoExterior() {
  return (
    <group>
      {/* Telemetria: antena e módulo fotovoltaico do centro de controle */}
      <mesh position={[-0.7, 1.9, -0.5]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.85, 8]} />
        <meshStandardMaterial {...steel} />
      </mesh>
      <mesh position={[-0.7, 2.32, -0.5]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0.55, 1.62, -0.2]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.03, 0.46]} />
        <meshStandardMaterial color="#12305c" metalness={0.55} roughness={0.28} />
      </mesh>
    </group>
  );
}

// ===========================================================================
// ETAPA VII — reservatório de água potável e barrilete de distribuição
// ===========================================================================

export function ArmazenamentoInternals() {
  return (
    <group>
      {/* Chicana anti-curto-circuito hidráulico do reservatório */}
      <mesh position={[-0.3, 0.5, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.0, 2.3]} />
        <meshStandardMaterial color={PALETTE.concreteDark} roughness={0.8} />
      </mesh>
      {/* Boia de nível piezométrico */}
      <group position={[0.75, 0, 1.0]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.9, 8]} />
          <meshStandardMaterial {...steel} />
        </mesh>
        <mesh position={[0, 1.06, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#f4a72c" roughness={0.5} />
        </mesh>
      </group>
      {/* Escada interna de inspeção */}
      <ServiceLadder position={[-1.2, 0, 1.35]} height={1.6} />
      {/* Tomada d'água de saída com crivo */}
      <mesh position={[1.2, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.3, 14]} />
        <meshStandardMaterial color="#1e5f8a" metalness={0.65} roughness={0.32} />
      </mesh>
    </group>
  );
}

export function ArmazenamentoExterior() {
  return (
    <group>
      {/* Barrilete de distribuição pública com válvulas de controle de vazão */}
      <group position={[1.85, -0.1, 0.05]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 1.5, 16]} />
          <meshStandardMaterial color="#1e5f8a" metalness={0.65} roughness={0.3} />
        </mesh>
        {[-0.45, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.19, 0.19, 0.05, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {[-0.2, 0.25].map((x, i) => (
          <group key={i} position={[x, 0.2, 0]}>
            <mesh>
              <boxGeometry args={[0.13, 0.24, 0.13]} />
              <meshStandardMaterial color="#0f766e" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.06, 0.014, 8, 16]} />
              <meshStandardMaterial color="#dc2626" roughness={0.42} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Medidor ultrassônico de vazão */}
      <mesh position={[2.6, 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.18, 0.26, 0.18]} />
        <meshStandardMaterial color="#233033" metalness={0.5} roughness={0.45} />
      </mesh>
      <ServiceLadder position={[-1.05, 0, 1.75]} height={1.9} />
      <Railing position={[0, 2.35, 1.5]} length={2.6} />
    </group>
  );
}

// ===========================================================================
// PEÇAS REUTILIZADAS
// ===========================================================================

function ServiceLadder({ position, height }: { position: [number, number, number]; height: number }) {
  const rungs = Math.max(2, Math.round(height / 0.26));
  return (
    <group position={position}>
      {[-0.13, 0.13].map((z, i) => (
        <mesh key={i} position={[0, height / 2, z]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, height, 8]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
      {Array.from({ length: rungs }, (_, i) => (
        <mesh key={i} position={[0, 0.12 + i * (height / rungs), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.26, 6]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
    </group>
  );
}

function Railing({ position, length }: { position: [number, number, number]; length: number }) {
  const posts = Math.max(2, Math.round(length / 0.45));
  return (
    <group position={position}>
      {[0.24, 0.44].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, length, 8]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
      {Array.from({ length: posts + 1 }, (_, i) => (
        <mesh key={i} position={[-length / 2 + i * (length / posts), 0.22, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.45, 8]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
    </group>
  );
}
