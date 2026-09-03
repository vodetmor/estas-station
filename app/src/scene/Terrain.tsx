import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  BLOCK,
  PALETTE,
  TERRACES,
  groundY,
  insideAnyModule,
  insideCorridor,
  MODULES,
  naturalFactor,

} from './layout';

/**
 * Encosta em corte: os patamares onde a ESTAS se apoia, a serra natural atrás, o vale à frente
 * e o corte geológico das bordas.
 *
 * Regra estrutural: superfície e corte amostram a MESMA função `groundY`, então nunca voltam a
 * abrir fresta entre o gramado e os estratos (era o que fazia a estação parecer flutuar).
 *
 * O solo é povoado: capim com vento (shader de instância), arbustos, árvores na serra,
 * matacões, valeta de drenagem e a escadaria de serviço que liga o topo à base.
 */

const SEG_X = 132;
const SEG_Z = 66;

// ---------------------------------------------------------------------------

function slopeAt(x: number, z: number): number {
  const e = 0.12;
  const dx = (groundY(x + e, z) - groundY(x - e, z)) / (2 * e);
  const dz = (groundY(x, z + e) - groundY(x, z - e)) / (2 * e);
  return Math.hypot(dx, dz);
}

function hash(i: number): number {
  const s = Math.sin(i * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

export function Terrain() {
  const { surface, strata } = useMemo(() => buildTerrainGeometry(), []);

  return (
    <group name="encosta">
      {/* A superfície RECEBE sombra mas não projeta: com o sol rasante a malha do relevo
          sombreava a si mesma e salpicava o gramado de manchas pretas (shadow acne). */}
      <mesh geometry={surface} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.95} metalness={0.02} />
      </mesh>
      <mesh geometry={strata} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.9} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>

      <RetainingWalls />
      <ServiceStairway />
      <DrainageChannel />
      <Vegetation />
    </group>
  );
}

// ---------------------------------------------------------------------------
// MALHAS
// ---------------------------------------------------------------------------

function buildTerrainGeometry() {
  const { minX, maxX, minZ, maxZ, bottomY } = BLOCK;

  // ---- superfície ----
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];

  const grassLight = new THREE.Color(PALETTE.grassLight);
  const grassDark = new THREE.Color(PALETTE.grassDark);
  const grassDry = new THREE.Color(PALETTE.grassDry);
  const dirt = new THREE.Color('#6a5238');
  const gravel = new THREE.Color('#8d8b82');
  const c = new THREE.Color();

  for (let j = 0; j <= SEG_Z; j++) {
    const z = minZ + (j / SEG_Z) * (maxZ - minZ);
    for (let i = 0; i <= SEG_X; i++) {
      const x = minX + (i / SEG_X) * (maxX - minX);
      const y = groundY(x, z);
      pos.push(x, y, z);

      const nat = naturalFactor(z);
      const slope = slopeAt(x, z);
      const noise = 0.5 + Math.sin(x * 2.3) * Math.cos(z * 2.9) * 0.28 + Math.sin(x * 7.1 + z * 5.3) * 0.14;

      c.copy(grassDark).lerp(grassLight, Math.min(1, Math.max(0, noise)));
      // A serra ao fundo recebe capim mais seco e queimado de sol.
      if (nat > 0.15) c.lerp(grassDry, Math.min(0.55, nat * 0.7));
      // Só a face de corte dos taludes fica exposta; a encosta natural continua gramada.
      if (slope > 0.85) c.lerp(dirt, Math.min(0.72, (slope - 0.85) * 0.85));
      // O terrapleno construído é britado, não gramado.
      if (nat < 0.05 && insideCorridor(x, z)) c.lerp(gravel, 0.62);
      col.push(c.r, c.g, c.b);
    }
  }

  const row = SEG_X + 1;
  for (let j = 0; j < SEG_Z; j++) {
    for (let i = 0; i < SEG_X; i++) {
      const a = j * row + i;
      idx.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
    }
  }

  const surface = new THREE.BufferGeometry();
  surface.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  surface.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  surface.setIndex(idx);
  surface.computeVertexNormals();

  // ---- corte geológico das quatro bordas + fundo ----
  const sPos: number[] = [];
  const sCol: number[] = [];
  const sIdx: number[] = [];

  const bands = [
    new THREE.Color(PALETTE.soilTop),
    new THREE.Color(PALETTE.soilClay),
    new THREE.Color('#7d6444'),
    new THREE.Color(PALETTE.rock),
    new THREE.Color(PALETTE.rockDeep),
  ];

  function curtain(samples: [number, number][]) {
    const start = sPos.length / 3;
    samples.forEach(([x, z]) => {
      const y0 = groundY(x, z);
      const levels = [y0, y0 - 0.42, y0 - 1.1, bottomY + 0.85, bottomY];
      levels.forEach((y, l) => {
        sPos.push(x, y, z);
        const b = bands[l];
        // Bandeamento fino para dar leitura de estratificação geológica no corte.
        const streak = 1 + Math.sin(y * 9.5 + x * 0.7) * 0.07;
        sCol.push(b.r * streak, b.g * streak, b.b * streak);
      });
    });
    const L = 5;
    for (let i = 0; i < samples.length - 1; i++) {
      for (let l = 0; l < L - 1; l++) {
        const a = start + i * L + l;
        const b = a + L;
        sIdx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }

  const nx = 64;
  const nz = 26;
  curtain(Array.from({ length: nx + 1 }, (_, i) => [minX + (i / nx) * (maxX - minX), maxZ] as [number, number]));
  curtain(Array.from({ length: nx + 1 }, (_, i) => [minX + (i / nx) * (maxX - minX), minZ] as [number, number]));
  curtain(Array.from({ length: nz + 1 }, (_, j) => [minX, minZ + (j / nz) * (maxZ - minZ)] as [number, number]));
  curtain(Array.from({ length: nz + 1 }, (_, j) => [maxX, minZ + (j / nz) * (maxZ - minZ)] as [number, number]));

  // Fundo do bloco
  const f = sPos.length / 3;
  sPos.push(minX, bottomY, minZ, maxX, bottomY, minZ, maxX, bottomY, maxZ, minX, bottomY, maxZ);
  for (let k = 0; k < 4; k++) sCol.push(bands[4].r, bands[4].g, bands[4].b);
  sIdx.push(f, f + 2, f + 1, f, f + 3, f + 2);

  const strata = new THREE.BufferGeometry();
  strata.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
  strata.setAttribute('color', new THREE.Float32BufferAttribute(sCol, 3));
  strata.setIndex(sIdx);
  strata.computeVertexNormals();

  return { surface, strata };
}

// ---------------------------------------------------------------------------
// OBRAS DE ARTE DO TERRENO
// ---------------------------------------------------------------------------

/**
 * Muros de arrimo contendo cada talude entre patamares.
 *
 * Cada muro é interrompido por um VERTEDOURO na linha do fluxo: sem essa abertura o muro
 * engolia a queda d'água que liga um módulo ao seguinte (a água sumia dentro do concreto).
 */
const GATE_WIDTH = 1.15;
const WALL_SPAN = 5.2;

function RetainingWalls() {
  return (
    <group>
      {TERRACES.slice(0, -1).map((step, i) => {
        const next = TERRACES[i + 1];
        const h = step.y - next.y;
        // Linha do fluxo neste desnível: média do Z dos módulos que ele separa.
        const gateZ = ((MODULES[i]?.z ?? 0) + (MODULES[i + 1]?.z ?? 0)) / 2;
        // Duas abas de muro, uma de cada lado do vertedouro.
        const sides: { center: number; len: number }[] = [];
        const leftEnd = gateZ - GATE_WIDTH / 2;
        const rightStart = gateZ + GATE_WIDTH / 2;
        const zMin = -WALL_SPAN / 2 - 0.1;
        const zMax = WALL_SPAN / 2 - 0.1;
        if (leftEnd > zMin) sides.push({ center: (zMin + leftEnd) / 2, len: leftEnd - zMin });
        if (rightStart < zMax) sides.push({ center: (rightStart + zMax) / 2, len: zMax - rightStart });

        return (
          <group key={i} position={[step.xEnd - 0.12, next.y + h / 2, 0]}>
            {sides.map((sd, k) => (
              <group key={k} position={[0, 0, sd.center]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.34, h + 0.24, sd.len]} />
                  <meshStandardMaterial color={PALETTE.concreteDark} roughness={0.85} metalness={0.05} />
                </mesh>
                {/* Coroamento do muro */}
                <mesh position={[0, h / 2 + 0.16, 0]}>
                  <boxGeometry args={[0.44, 0.1, sd.len + 0.06]} />
                  <meshStandardMaterial color={PALETTE.rim} roughness={0.7} />
                </mesh>
              </group>
            ))}
            {/* Soleira e ombreiras do vertedouro */}
            <mesh position={[0, -h / 2 - 0.06, gateZ]} receiveShadow>
              <boxGeometry args={[0.6, 0.14, GATE_WIDTH + 0.1]} />
              <meshStandardMaterial color={PALETTE.concrete} roughness={0.82} />
            </mesh>
            {[-1, 1].map((sgn) => (
              <mesh key={sgn} position={[0, 0, gateZ + (sgn * GATE_WIDTH) / 2]} castShadow>
                <boxGeometry args={[0.4, h + 0.3, 0.1]} />
                <meshStandardMaterial color={PALETTE.rim} roughness={0.72} />
              </mesh>
            ))}
            {/* Barbacãs de drenagem do maciço contido */}
            {[-2.1, -1.5, 1.5, 2.1].map((z, k) => (
              <mesh key={k} position={[0.19, -h / 2 + 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.045, 0.045, 0.1, 8]} />
                <meshStandardMaterial color="#3a3f3d" roughness={0.9} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/** Escadaria de serviço que acompanha a estação do patamar mais alto até o reservatório. */
function ServiceStairway() {
  const steps = useMemo(() => {
    const out: { x: number; y: number; h: number }[] = [];
    const z = 2.0;
    for (let x = -8.6; x < 10.6; x += 0.34) {
      const y = groundY(x, z);
      out.push({ x, y, h: 0.16 });
    }
    return out;
  }, []);

  return (
    <group>
      {steps.map((s, i) => (
        <mesh key={i} position={[s.x, s.y - 0.06, 2.0]} receiveShadow castShadow>
          <boxGeometry args={[0.36, 0.14, 1.2]} />
          <meshStandardMaterial color={i % 2 ? '#8f948f' : '#9aa09b'} roughness={0.88} />
        </mesh>
      ))}
      {/* Corrimão contínuo acompanhando o perfil da escada */}
      {steps
        .filter((_, i) => i % 4 === 0)
        .map((s, i) => (
          <mesh key={i} position={[s.x, s.y + 0.4, 2.62]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.8, 6]} />
            <meshStandardMaterial color={PALETTE.steel} metalness={0.75} roughness={0.32} />
          </mesh>
        ))}
    </group>
  );
}

/** Valeta de crista: intercepta a água de chuva da encosta antes de atingir a estação. */
function DrainageChannel() {
  const segs = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (let x = -9.6; x < 11.4; x += 0.5) out.push({ x, y: groundY(x, -2.6) });
    return out;
  }, []);

  return (
    <group>
      {segs.map((s, i) => (
        <group key={i} position={[s.x, s.y + 0.04, -2.6]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.52, 0.1, 0.52]} />
            <meshStandardMaterial color="#6d726f" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[0.53, 0.08, 0.3]} />
            <meshStandardMaterial color="#2f3634" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// VEGETAÇÃO
// ---------------------------------------------------------------------------

const GRASS_COUNT = 3000;
const SHRUB_COUNT = 110;
const ROCK_COUNT = 90;

/**
 * A vegetação é construída IMPERATIVAMENTE (geometria, material, matrizes e cores de instância
 * já prontos) e só então entregue à cena via <primitive>.
 *
 * O motivo é um bug real: montando o InstancedMesh por JSX e preenchendo as cores num efeito,
 * o material compila no primeiro render — quando `instanceColor` ainda não existe. Sem o define
 * USE_INSTANCING_COLOR o shader lê o atributo `color` inexistente como (0,0,0) e a vegetação
 * inteira sai PRETA. Preenchendo antes de entrar na cena, essa janela deixa de existir.
 */
function Vegetation() {
  const time = useMemo(() => ({ value: 0 }), []);
  const { grass, shrubs, rocks } = useMemo(() => buildVegetation(time), [time]);

  useFrame((_, delta) => {
    time.value += delta;
  });

  return (
    <group name="vegetacao">
      <primitive object={grass} />
      <primitive object={shrubs} />
      <primitive object={rocks} />
      <Trees />
    </group>
  );
}

function buildVegetation(time: { value: number }) {
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const col = new THREE.Color();
  const light = new THREE.Color(PALETTE.grassLight);
  const dark = new THREE.Color(PALETTE.grassDark);
  const dry = new THREE.Color(PALETTE.grassDry);

  // ---- tufo de capim: três lâminas cruzadas, origem na base (o vento dobra só a ponta) ----
  const blade = new THREE.ConeGeometry(0.03, 0.2, 3, 1, true);
  blade.translate(0, 0.1, 0);
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 3; k++) {
    const g = blade.clone();
    g.rotateY((k * Math.PI * 2) / 3);
    g.translate(Math.cos(k * 2.1) * 0.045, 0, Math.sin(k * 2.1) * 0.045);
    parts.push(g);
  }
  const grassGeo = mergeGeometries(parts);
  blade.dispose();
  parts.forEach((p) => p.dispose());

  const grassMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  grassMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         #ifdef USE_INSTANCING
           float wx = instanceMatrix[3][0];
           float wz = instanceMatrix[3][2];
           float bend = max(transformed.y, 0.0);
           transformed.x += sin(uTime * 1.7 + wx * 1.4 + wz * 0.9) * 0.09 * bend;
           transformed.z += cos(uTime * 1.25 + wx * 0.8 + wz * 1.5) * 0.055 * bend;
         #endif`,
      );
  };

  const grass = new THREE.InstancedMesh(grassGeo, grassMat, GRASS_COUNT);
  let n = 0;
  for (let i = 0; n < GRASS_COUNT && i < GRASS_COUNT * 8; i++) {
    const x = BLOCK.minX + 0.3 + hash(i * 3.1) * (BLOCK.maxX - BLOCK.minX - 0.6);
    const z = BLOCK.minZ + 0.3 + hash(i * 7.7 + 4.2) * (BLOCK.maxZ - BLOCK.minZ - 0.6);
    if (insideAnyModule(x, z, 0.5) || insideCorridor(x, z)) continue;
    if (slopeAt(x, z) > 1.5) continue; // talude nu de terra não cria capim
    const y = groundY(x, z);
    e.set(hash(i * 1.7) * 0.16 - 0.08, hash(i * 2.9) * Math.PI * 2, hash(i * 5.3) * 0.16 - 0.08);
    q.setFromEuler(e);
    const s = 0.6 + hash(i * 11.3) * 0.75;
    m4.compose(v.set(x, y, z), q, sc.set(s, s * (0.8 + hash(i * 13.1) * 0.7), s));
    grass.setMatrixAt(n, m4);
    col.copy(dark).lerp(light, hash(i * 17.9));
    if (naturalFactor(z) > 0.3) col.lerp(dry, 0.45);
    grass.setColorAt(n, col);
    n++;
  }
  grass.count = n;
  grass.frustumCulled = false;

  // ---- arbustos ----
  // Cor SOLIDA de proposito: com instanceColor os arbustos saiam pretos, e a variacao por
  // instancia nao compensa o risco num objeto deste tamanho — escala e flatShading ja dao
  // variacao suficiente. Tambem nao projetam sombra: arbusto de 15 cm virava mancha no gramado.
  const shrubs = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: '#6ba14a', roughness: 0.88, flatShading: true }),
    SHRUB_COUNT,
  );
  n = 0;
  for (let i = 0; n < SHRUB_COUNT && i < SHRUB_COUNT * 14; i++) {
    const x = BLOCK.minX + 0.5 + hash(i * 4.4 + 1.1) * (BLOCK.maxX - BLOCK.minX - 1);
    const z = BLOCK.minZ + 0.5 + hash(i * 9.1 + 2.7) * (BLOCK.maxZ - BLOCK.minZ - 1);
    if (insideAnyModule(x, z, 1.1) || insideCorridor(x, z)) continue;
    if (slopeAt(x, z) > 1.2) continue;
    const y = groundY(x, z);
    const s = 0.13 + hash(i * 6.6) * 0.15;
    e.set(0, hash(i * 3.3) * 6.28, 0);
    q.setFromEuler(e);
    m4.compose(v.set(x, y + s * 0.6, z), q, sc.set(s * 1.3, s, s * 1.3));
    shrubs.setMatrixAt(n, m4);
    n++;
  }
  shrubs.count = n;
  shrubs.frustumCulled = false;

  // ---- matacões ----
  const rocks = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ color: '#98938a', roughness: 0.95, flatShading: true }),
    ROCK_COUNT,
  );
  n = 0;
  for (let i = 0; n < ROCK_COUNT && i < ROCK_COUNT * 14; i++) {
    const x = BLOCK.minX + 0.4 + hash(i * 2.2 + 5.5) * (BLOCK.maxX - BLOCK.minX - 0.8);
    const z = BLOCK.minZ + 0.4 + hash(i * 12.7 + 0.9) * (BLOCK.maxZ - BLOCK.minZ - 0.8);
    if (insideAnyModule(x, z, 0.8) || insideCorridor(x, z)) continue;
    const y = groundY(x, z);
    const s = 0.08 + hash(i * 5.9) * 0.24;
    e.set(hash(i * 1.3) * 3, hash(i * 2.4) * 6.28, hash(i * 3.6) * 3);
    q.setFromEuler(e);
    m4.compose(v.set(x, y + s * 0.35, z), q, sc.set(s, s * 0.8, s * 1.1));
    rocks.setMatrixAt(n, m4);
    n++;
  }
  rocks.count = n;
  rocks.receiveShadow = true;
  rocks.frustumCulled = false;

  return { grass, shrubs, rocks };
}

/** Árvores na crista da serra e na borda do vale — dão escala humana à maquete. */
function Trees() {
  const spots = useMemo(() => {
    const out: { x: number; y: number; z: number; s: number; k: number }[] = [];
    for (let i = 0; out.length < 14 && i < 400; i++) {
      const x = BLOCK.minX + 0.6 + hash(i * 3.7 + 8.1) * (BLOCK.maxX - BLOCK.minX - 1.2);
      const z = BLOCK.minZ + 0.4 + hash(i * 6.1 + 2.3) * (BLOCK.maxZ - BLOCK.minZ - 0.8);
      if (naturalFactor(z) < 0.45) continue;
      if (insideAnyModule(x, z, 1.6)) continue;
      out.push({ x, y: groundY(x, z), z, s: 0.75 + hash(i * 9.9) * 0.6, k: hash(i * 4.1) });
    }
    return out;
  }, []);

  return (
    <group>
      {spots.map((t, i) => (
        <group key={i} position={[t.x, t.y, t.z]} scale={t.s}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.07, 0.6, 7]} />
            <meshStandardMaterial color="#6b5136" roughness={0.95} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0, 0.7 + k * 0.25, 0]} castShadow>
              <coneGeometry args={[0.42 - k * 0.11, 0.46, 7]} />
              <meshStandardMaterial
                color={t.k > 0.5 ? '#5f9a48' : '#6faa52'}
                roughness={0.92}
                flatShading
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------

/** Mescla geometrias não-indexadas simples (evita puxar `BufferGeometryUtils` inteiro). */
function mergeGeometries(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry();
  const posArrays: Float32Array[] = [];
  const normArrays: Float32Array[] = [];
  let total = 0;
  for (const g of list) {
    const nonIndexed = g.index ? g.toNonIndexed() : g;
    if (!nonIndexed.getAttribute('normal')) nonIndexed.computeVertexNormals();
    posArrays.push(nonIndexed.getAttribute('position').array as Float32Array);
    normArrays.push(nonIndexed.getAttribute('normal').array as Float32Array);
    total += nonIndexed.getAttribute('position').count;
  }
  const pos = new Float32Array(total * 3);
  const norm = new Float32Array(total * 3);
  let off = 0;
  for (let i = 0; i < posArrays.length; i++) {
    pos.set(posArrays[i], off);
    norm.set(normArrays[i], off);
    off += posArrays[i].length;
  }
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  return out;
}
