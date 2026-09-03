import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  CHANNELS,
  FALLS,
  FLOW_CURVE,
  MODULES,
  PALETTE,
  treatedAt,
  type ChannelDef,
  type ModuleDef,
} from './layout';
import { useStationStore } from '../state/store';
import { computeStageSeries } from '../logic/treatmentModel';
import { totalHeavyMetalLoad } from '../logic/waterQualityModel';
import { getLayerColor } from './colorScales';

/**
 * A água da ESTAS como um SISTEMA, não como caixas azuis soltas.
 *
 * 1. Fluxo visível e direcional: cada lâmina d'água recebe uma "pele" de estrias que corre no
 *    sentido do escoamento (textura rolando em `map.offset`), somada a partículas que percorrem
 *    a linha de corrente e a cortinas de queda com espuma nos desníveis.
 * 2. Continuidade física: módulo -> vertedouro -> queda -> calha -> módulo seguinte, sem trecho
 *    órfão. A curva é a mesma de `layout.ts`.
 * 3. A cor não é decorativa: vem do modelo de tratamento. Na camada "Estação" mostra a
 *    progressão física (barrenta -> clarificada -> potável); nas demais camadas pinta o
 *    parâmetro escolhido (turbidez, metais, patógenos, pH) no ponto do processo.
 */

// ---------------------------------------------------------------------------
// Textura de estrias — o que faz a água "correr" em vez de só ondular
// ---------------------------------------------------------------------------

function buildStreakTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, 256, 64);
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 64;
    const x = Math.random() * 256;
    const len = 16 + Math.random() * 66;
    const a = 0.05 + Math.random() * 0.3;
    for (const ox of [x, x - 256]) {
      const grad = g.createLinearGradient(ox, 0, ox + len, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.45, `rgba(255,255,255,${a})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(ox, y, len, 1.5 + Math.random());
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const StreakContext = { texture: null as THREE.Texture | null };
function streakTexture(): THREE.Texture {
  if (!StreakContext.texture) StreakContext.texture = buildStreakTexture();
  return StreakContext.texture;
}

/** Lâmina de estrias correndo sobre uma superfície de água, no sentido +X local. */
function FlowSkin({
  width,
  depth,
  position,
  rotation = [0, 0, 0],
  speed = 1,
  opacity = 0.5,
}: {
  width: number;
  depth: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  speed?: number;
  opacity?: number;
}) {
  const globalSpeed = useStationStore((s) => s.waterSpeed);
  const tex = useMemo(() => {
    const t = streakTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(0.7, width / 2.4), Math.max(0.5, depth / 1.6));
    return t;
  }, [width, depth]);

  useFrame((_, delta) => {
    tex.offset.x -= delta * 0.34 * speed * globalSpeed;
  });

  return (
    <mesh position={position} rotation={[-Math.PI / 2 + rotation[0], rotation[1], rotation[2]]}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Cor da água por ponto do processo
// ---------------------------------------------------------------------------

/** Progressão física da água quando nenhuma camada de dado está ativa. */
const REAL_PROGRESSION = ['#a5701f', '#8f8a3a', '#3f9fc0', '#45b4d6', '#4ec3e8', '#3fc0f0', '#2fb4f5', '#28aeff'];

function useStageColors(): string[] {
  const scenario = useStationStore((s) => s.scenario);
  const layer = useStationStore((s) => s.layer);

  return useMemo(() => {
    if (layer === 'real') return REAL_PROGRESSION;
    const series = computeStageSeries(scenario, 7);
    return series.map(({ state }) => {
      switch (layer) {
        case 'turbidez':
          return getLayerColor('turbidez', state.turbidez);
        case 'metais':
          return getLayerColor('metais', totalHeavyMetalLoad(state));
        case 'patogenos':
          return getLayerColor('patogenos', state.eColiIndex);
        case 'pH':
          return getLayerColor('pH', state.pH);
        default:
          return REAL_PROGRESSION[0];
      }
    });
  }, [scenario, layer]);
}

function colorFor(colors: string[], treated: number): string {
  const i = Math.min(colors.length - 1, Math.max(0, Math.round(treated)));
  return colors[i];
}

// ---------------------------------------------------------------------------

export function WaterSystem() {
  const colors = useStageColors();
  const stageIndex = useStationStore((s) => s.stageIndex);

  return (
    <group name="agua">
      {MODULES.map((m, i) => (
        <ModuleWater key={m.id} def={m} color={colorFor(colors, i)} highlight={stageIndex === i + 1} />
      ))}

      {CHANNELS.map((c, i) => (
        <Channel key={i} def={c} color={colorFor(colors, c.treated)} />
      ))}

      {FALLS.map((f, i) => (
        <Fall key={i} {...f} color={colorFor(colors, f.treated)} />
      ))}

      <CascadeSheets color={colorFor(colors, 2)} />
      <Foam />
      <FlowParticles colors={colors} />
      <FlowArrows />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lâmina d'água dentro de cada módulo
// ---------------------------------------------------------------------------

function ModuleWater({ def, color, highlight }: { def: ModuleDef; color: string; highlight: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const depth = Math.max(0.16, def.waterY - def.floorY - 0.05);
  const w = def.w - 0.32;
  const d = def.d - 0.32;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) ref.current.position.y = def.waterY - depth / 2 + Math.sin(t * 1.9 + def.x) * 0.006;
    if (ringRef.current) {
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = highlight ? 0.35 + Math.sin(t * 3) * 0.15 : 0;
      ringRef.current.visible = highlight;
    }
  });

  // A torre de cascata não tem lâmina única: a água dela são os degraus (ver CascadeSheets).
  const showBody = def.id !== 'desgaseificacao';

  return (
    <group position={[def.x, 0, def.z]}>
      {showBody && (
        <>
          <mesh ref={ref} position={[0, def.waterY - depth / 2, 0]}>
            <boxGeometry args={[w, depth, d]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.78}
              roughness={0.12}
              metalness={0.18}
              emissive={color}
              emissiveIntensity={0.24}
            />
          </mesh>
          <FlowSkin width={w} depth={d} position={[0, def.waterY + 0.012, 0]} speed={0.7} opacity={0.42} />
        </>
      )}
      {/* Marcador do ponto do tratamento escolhido na linha do tempo */}
      <mesh ref={ringRef} position={[0, def.waterY + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[Math.max(w, d) * 0.4, Math.max(w, d) * 0.47, 40]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Lâminas d'água dos 5 degraus da torre de desgaseificação (Etapa III). */
function CascadeSheets({ color }: { color: string }) {
  const tower = MODULES.find((m) => m.id === 'desgaseificacao')!;
  const steps = [0, 1, 2, 3, 4].map((i) => ({
    x: tower.x - 1.05 + i * 0.52,
    y: tower.floorY + 1.45 - i * 0.32,
  }));

  return (
    <group position={[0, 0, tower.z]}>
      {steps.map((s, i) => (
        <group key={i}>
          {/* Espelho no patamar do degrau */}
          <mesh position={[s.x, s.y - 0.03, 0]}>
            <boxGeometry args={[0.5, 0.06, 2.05]} />
            <meshStandardMaterial color={color} transparent opacity={0.8} roughness={0.1} />
          </mesh>
          <FlowSkin width={0.5} depth={2.05} position={[s.x, s.y + 0.012, 0]} speed={1.6} opacity={0.5} />
          {/* Cortina de queda aerada entre um degrau e o próximo */}
          <mesh position={[s.x + 0.26, s.y - 0.16, 0]}>
            <boxGeometry args={[0.05, 0.3, 2.0]} />
            <meshStandardMaterial
              color="#e8f8ff"
              transparent
              opacity={0.62}
              roughness={0.05}
              emissive="#cfeeff"
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}
      {/* Bacia de dissipação no pé da cascata */}
      <mesh position={[tower.x + 1.05, tower.floorY + 0.2, 0]}>
        <boxGeometry args={[0.68, 0.16, 2.05]} />
        <meshStandardMaterial color={color} transparent opacity={0.82} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Calhas e tubulações de interligação
// ---------------------------------------------------------------------------

function Channel({ def, color }: { def: ChannelDef; color: string }) {
  const a = new THREE.Vector3(...def.from);
  const b = new THREE.Vector3(...def.to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const yaw = Math.atan2(-dir.z, dir.x);
  const pitch = Math.asin(THREE.MathUtils.clamp(dir.y / len, -1, 1));

  if (def.kind === 'tubo') {
    return (
      <group position={mid.toArray()} rotation={[0, yaw, pitch, 'YZX']}>
        {/* Tubulação de aço com a água correndo por dentro */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[def.width / 2, def.width / 2, len, 16, 1, true]} />
          <meshStandardMaterial color="#1e5f8a" metalness={0.62} roughness={0.32} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[def.width / 2 - 0.04, def.width / 2 - 0.04, len - 0.02, 14]} />
          <meshStandardMaterial color={color} transparent opacity={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.18} />
        </mesh>
        {/* Flanges */}
        {[-len / 2 + 0.05, len / 2 - 0.05].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[def.width / 2 + 0.06, def.width / 2 + 0.06, 0.05, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group position={mid.toArray()} rotation={[0, yaw, pitch, 'YZX']}>
      {/* Calha de concreto */}
      <mesh position={[0, -def.width * 0.28, 0]} receiveShadow castShadow>
        <boxGeometry args={[len, 0.08, def.width + 0.16]} />
        <meshStandardMaterial color={PALETTE.concrete} roughness={0.85} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, -def.width * 0.12, (s * (def.width + 0.1)) / 2]} castShadow>
          <boxGeometry args={[len, def.width * 0.5, 0.07]} />
          <meshStandardMaterial color={PALETTE.rim} roughness={0.75} />
        </mesh>
      ))}
      {/* Lâmina d'água correndo pela calha */}
      <mesh position={[0, -def.width * 0.15, 0]}>
        <boxGeometry args={[len, 0.1, def.width]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} roughness={0.08} emissive={color} emissiveIntensity={0.32} />
      </mesh>
      <FlowSkin
        width={len}
        depth={def.width}
        position={[0, -def.width * 0.15 + 0.06, 0]}
        speed={1.9}
        opacity={0.6}
      />
    </group>
  );
}

/** Cortina vertical de queda entre dois terraços. */
function Fall({
  p,
  h,
  w,
  color,
}: {
  p: [number, number, number];
  h: number;
  w: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const globalSpeed = useStationStore((s) => s.waterSpeed);
  const tex = useMemo(() => {
    const t = streakTexture().clone();
    t.needsUpdate = true;
    // O plano é montado de lado (ver rotação abaixo): o eixo U da textura corre na VERTICAL.
    t.repeat.set(Math.max(1, h * 2.6), Math.max(0.6, w * 1.4));
    return t;
  }, [h, w]);

  useFrame(({ clock }, delta) => {
    tex.offset.x += delta * 1.5 * globalSpeed;
    if (ref.current) ref.current.scale.x = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.05;
  });

  return (
    <group position={p}>
      <mesh ref={ref}>
        <boxGeometry args={[0.07, h, w]} />
        <meshStandardMaterial color={color} transparent opacity={0.72} roughness={0.06} />
      </mesh>
      {/* Véu aerado branco descendo pela frente da cortina */}
      <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
        <planeGeometry args={[h, w]} />
        <meshBasicMaterial
          map={tex}
          color="#eaf9ff"
          transparent
          opacity={0.8}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Espuma nas bases das quedas (um único sistema de partículas para todas)
// ---------------------------------------------------------------------------

const FOAM_PER_FALL = 26;

function Foam() {
  const ref = useRef<THREE.Points>(null);
  const globalSpeed = useStationStore((s) => s.waterSpeed);

  const data = useMemo(() => {
    const count = FALLS.length * FOAM_PER_FALL;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seed[i * 3] = Math.random();               // fase do ciclo
      seed[i * 3 + 1] = 0.5 + Math.random();     // velocidade relativa
      seed[i * 3 + 2] = Math.random() - 0.5;     // dispersão lateral
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geo, seed, count };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * globalSpeed;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < data.count; i++) {
      const f = FALLS[Math.floor(i / FOAM_PER_FALL)];
      const k = (data.seed[i * 3] + t * 0.55 * data.seed[i * 3 + 1]) % 1;
      arr[i * 3] = f.p[0] + 0.05 + k * 0.36;
      arr[i * 3 + 1] = f.p[1] - f.h / 2 + Math.sin(k * Math.PI) * 0.22 - k * 0.12;
      arr[i * 3 + 2] = f.p[2] + data.seed[i * 3 + 2] * f.w * 0.95;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={data.geo} frustumCulled={false}>
      <pointsMaterial size={4.5} sizeAttenuation={false} color="#f2fbff" transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Partículas percorrendo a linha de corrente — a leitura do "fluxo" de ponta a ponta
// ---------------------------------------------------------------------------

const PARTICLE_COUNT = 220;

function FlowParticles({ colors }: { colors: string[] }) {
  const ref = useRef<THREE.Points>(null);
  const globalSpeed = useStationStore((s) => s.waterSpeed);

  const data = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const offset = new Float32Array(PARTICLE_COUNT);
    const jitter = new Float32Array(PARTICLE_COUNT * 2);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      offset[i] = i / PARTICLE_COUNT;
      jitter[i * 2] = (Math.random() - 0.5) * 0.34;
      jitter[i * 2 + 1] = (Math.random() - 0.5) * 0.18;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return { geo, offset, jitter };
  }, []);

  const palette = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors]);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * globalSpeed;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const col = ref.current.geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = (data.offset[i] + t * 0.026) % 1;
      const pt = FLOW_CURVE.getPointAt(p);
      pos[i * 3] = pt.x + data.jitter[i * 2] * 0.4;
      pos[i * 3 + 1] = pt.y + 0.03 + Math.sin(t * 4 + i) * 0.012;
      pos[i * 3 + 2] = pt.z + data.jitter[i * 2 + 1];

      // Cor interpolada entre a etapa concluída e a próxima: a mudança acontece no módulo certo.
      const treated = treatedAt(p);
      const lo = Math.min(palette.length - 1, Math.floor(treated));
      const hi = Math.min(palette.length - 1, lo + 1);
      tmp.copy(palette[lo]).lerp(palette[hi], treated - lo);
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={data.geo} frustumCulled={false}>
      <pointsMaterial size={5.5} sizeAttenuation={false} vertexColors transparent opacity={1} depthWrite={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Setas de sentido do escoamento, deslizando sobre a linha de corrente
// ---------------------------------------------------------------------------

const ARROW_COUNT = 10;

function FlowArrows() {
  const ref = useRef<THREE.Group>(null);
  const globalSpeed = useStationStore((s) => s.waterSpeed);
  const show = useStationStore((s) => s.technicalOverlay);
  const target = useMemo(() => new THREE.Vector3(), []);

  // Cone com o eixo em -Z: assim lookAt (que aponta o -Z do objeto) já alinha a seta ao fluxo.
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.08, 0.24, 10);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || !show) return;
    const t = clock.getElapsedTime() * globalSpeed;
    ref.current.children.forEach((c, i) => {
      const p = (i / ARROW_COUNT + t * 0.02) % 1;
      const pt = FLOW_CURVE.getPointAt(p);
      const tan = FLOW_CURVE.getTangentAt(p);
      c.position.set(pt.x, pt.y + 0.22, pt.z);
      c.lookAt(target.copy(c.position).add(tan));
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.5 + Math.sin(p * Math.PI * 8 + t * 2) * 0.2;
    });
  });

  if (!show) return null;

  return (
    <group ref={ref}>
      {Array.from({ length: ARROW_COUNT }, (_, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#8fe6ff" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
