import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStationStore } from '../state/store';

/**
 * Simulação volumétrica, contínua e interativa do fluxo de água da ESTAS.
 * Garante conexão física e visual ininterrupta entre todas as 5 fases:
 * - Entrada de água bruta -> Fase 1 (leito de brita/areia e eletroímãs);
 * - Aqueduto de interligação -> Fase 2 (reatores de biossurfactantes);
 * - Vertedouro e calha elevada -> Fase 3 (cascata de desgaseificação);
 * - Bacia de transição -> Fase 4 (câmaras UV-C e nanomembranas);
 * - Canal de vertimento -> Fase 5 (reservatório potável e saída pública).
 * 
 * Inclui sistema de partículas que viajam ao longo da curva hidrodinâmica (streamline),
 * mudando de cor e demonstrando o processo progressivo de purificação em tempo real.
 */
export function RealisticWater() {
  const scenarioId = useStationStore((s) => s.scenario);
  const waterSpeed = useStationStore((s) => s.waterSpeed ?? 1);

  // Referências para animação das superfícies e partículas
  const phase1WaterRef = useRef<THREE.Mesh>(null);
  const phase2WaterRef = useRef<THREE.Mesh>(null);
  const cascadeWaterRef = useRef<THREE.Group>(null);
  const phase4WaterRef = useRef<THREE.Mesh>(null);
  const phase5WaterRef = useRef<THREE.Mesh>(null);
  const flume12Ref = useRef<THREE.Mesh>(null);
  const flume23Ref = useRef<THREE.Mesh>(null);
  const flume34Ref = useRef<THREE.Mesh>(null);
  const flume45Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Propriedades visuais da água bruta de acordo com o cenário ativo
  const rawWaterProps = useMemo(() => {
    switch (scenarioId) {
      case 'rejeito_mineracao':
        return {
          color: new THREE.Color('#7a3a22'),
          roughness: 0.35,
          opacity: 0.94,
        };
      case 'enchente_urbana':
        return {
          color: new THREE.Color('#614c38'),
          roughness: 0.3,
          opacity: 0.9,
        };
      case 'chuva_comum':
      default:
        return {
          color: new THREE.Color('#856f4d'),
          roughness: 0.25,
          opacity: 0.85,
        };
    }
  }, [scenarioId]);

  // Curva 3D contínua (streamline) que conecta todas as estações do topo à base
  const flowSpline = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.2, 3.82, -2.1), // Entrada água bruta
      new THREE.Vector3(-6.2, 3.32, -1.4), // Leito filtrante brita/areia
      new THREE.Vector3(-4.4, 3.02, -0.9), // Canal de eletroímãs
      new THREE.Vector3(-3.2, 2.65, -0.9), // Conexão Fase 1 -> Fase 2
      new THREE.Vector3(-2.2, 2.12, -0.9), // Reator 1 de biossurfactante
      new THREE.Vector3(-0.6, 2.12, -0.5), // Reator 2 de biossurfactante
      new THREE.Vector3(0.2, 1.95, -0.1),  // Vertedouro saída Fase 2
      new THREE.Vector3(0.1, 1.82, 0.6),   // Aqueduto conectando Fase 2 -> 3
      new THREE.Vector3(-0.04, 1.70, 1.5), // Topo cascata degrau 1
      new THREE.Vector3(0.38, 1.46, 1.5),  // Cascata degrau 2
      new THREE.Vector3(0.80, 1.22, 1.5),  // Cascata degrau 3
      new THREE.Vector3(1.22, 0.98, 1.5),  // Cascata degrau 4
      new THREE.Vector3(1.64, 0.82, 1.5),  // Fim da cascata degrau 5
      new THREE.Vector3(1.95, 0.76, 1.05), // Bacia de coleta conectando 3 -> 4
      new THREE.Vector3(2.4, 0.82, 0.6),   // Entrada canais UV-C
      new THREE.Vector3(3.6, 0.82, 0.6),   // Câmaras UV-C e membranas cerâmicas
      new THREE.Vector3(4.8, 0.76, 0.35),  // Saída Fase 4
      new THREE.Vector3(5.2, 0.62, -0.1),  // Aqueduto conectando 4 -> 5
      new THREE.Vector3(6.0, 0.38, -0.6),  // Entrada reservatório potável
      new THREE.Vector3(7.4, 0.38, -0.8),  // Centro reservatório potável
      new THREE.Vector3(8.5, 0.05, 0.2),   // Saída distribuição pública
    ]);
  }, []);

  // Sistema de partículas circulantes ao longo do trajeto hidrodinâmico
  const particleData = useMemo(() => {
    const count = 75;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const progressOffsets = new Float32Array(count);
    const lateralOffsets = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {
      progressOffsets[i] = i / count;
      lateralOffsets[i * 2] = (Math.random() - 0.5) * 0.25; // jitter X
      lateralOffsets[i * 2 + 1] = (Math.random() - 0.5) * 0.25; // jitter Z
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return { geometry: geo, progressOffsets, lateralOffsets, count };
  }, []);

  // Paleta de cores para transição progressiva da pureza da água
  const colorsPalette = useMemo(() => {
    return {
      silt: rawWaterProps.color,
      biochem: new THREE.Color('#38bdf8'),
      foam: new THREE.Color('#e0f2fe'),
      uv: new THREE.Color('#a855f7'),
      pure: new THREE.Color('#0ea5e9'),
    };
  }, [rawWaterProps]);

  // Loop de animação contínua da água e partículas de fluxo
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * waterSpeed;

    // 1. Superfície Fase 1 (ondulação suave)
    if (phase1WaterRef.current) {
      phase1WaterRef.current.position.y = 3.32 + Math.sin(t * 3.0) * 0.006;
    }

    // 2. Superfície Fase 2 (vórtices nos reatores)
    if (phase2WaterRef.current) {
      phase2WaterRef.current.position.y = 2.12 + Math.sin(t * 2.5 + 1.0) * 0.005;
    }

    // 3. Cascata Fase 3 (pulsos rítmicos dos degraus)
    if (cascadeWaterRef.current) {
      cascadeWaterRef.current.children.forEach((mesh, i) => {
        mesh.position.y = 1.68 - i * 0.24 + Math.sin(t * 5.0 + i * 1.5) * 0.006;
      });
    }

    // 4. Superfície Fase 4
    if (phase4WaterRef.current) {
      phase4WaterRef.current.position.y = 0.92 + Math.sin(t * 2.0 + 2.0) * 0.004;
    }

    // 5. Superfície Fase 5 (reservatório cristalino)
    if (phase5WaterRef.current) {
      phase5WaterRef.current.position.y = 0.48 + Math.sin(t * 1.4 + 3.0) * 0.003;
    }

    // Ondulação nas canaletas de interligação
    if (flume12Ref.current) flume12Ref.current.position.y = 2.65 + Math.sin(t * 4.0) * 0.005;
    if (flume23Ref.current) flume23Ref.current.position.y = 1.82 + Math.sin(t * 4.2 + 1) * 0.005;
    if (flume34Ref.current) flume34Ref.current.position.y = 0.76 + Math.sin(t * 4.5 + 2) * 0.005;
    if (flume45Ref.current) flume45Ref.current.position.y = 0.62 + Math.sin(t * 4.0 + 3) * 0.004;

    // Animação das partículas circulantes ao longo do spline de fluxo
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = particlesRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;

      const flowRate = 0.045 * waterSpeed;

      for (let i = 0; i < particleData.count; i++) {
        // Progresso no ciclo [0, 1]
        const p = (particleData.progressOffsets[i] + t * flowRate) % 1.0;
        const pt = flowSpline.getPoint(p);

        // Posição com leve dispersão lateral no leito
        posArr[i * 3] = pt.x + particleData.lateralOffsets[i * 2];
        posArr[i * 3 + 1] = pt.y + Math.sin(t * 6 + i) * 0.012;
        posArr[i * 3 + 2] = pt.z + particleData.lateralOffsets[i * 2 + 1];

        // Transição de cor progressiva conforme a água é tratada
        let col = colorsPalette.silt;
        if (p < 0.18) {
          col = colorsPalette.silt; // Água bruta turva
        } else if (p < 0.42) {
          col = colorsPalette.biochem; // Reatores com biossurfactantes
        } else if (p < 0.62) {
          col = colorsPalette.foam; // Queda aerada espumante
        } else if (p < 0.80) {
          col = colorsPalette.uv; // Radiação UV-C germicida
        } else {
          col = colorsPalette.pure; // Água potável cristalina
        }

        colArr[i * 3] = col.r;
        colArr[i * 3 + 1] = col.g;
        colArr[i * 3 + 2] = col.b;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  });

  return (
    <group name="realistic-water">
      {/* ========================================================================= */}
      {/* FASE 1: ÁGUA BRUTA (CALHA DE ENTRADA, FILTRAÇÃO E ELETROÍMÃS)             */}
      {/* ========================================================================= */}
      <group>
        {/* Calha de entrada de água bruta na encosta */}
        <mesh position={[-7.7, 3.82, -2.1]}>
          <boxGeometry args={[1.5, 0.1, 0.45]} />
          <meshStandardMaterial
            color={rawWaterProps.color}
            roughness={rawWaterProps.roughness}
            transparent
            opacity={rawWaterProps.opacity}
          />
        </mesh>

        {/* Queda d'água de entrada no tanque 1A */}
        <mesh position={[-7.1, 3.5, -1.8]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.4, 0.08, 0.6]} />
          <meshStandardMaterial
            color={rawWaterProps.color}
            roughness={0.2}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Lâmina d'água sobre o leito de brita/areia/antracito (Tanque 1A) */}
        <mesh ref={phase1WaterRef} position={[-6.2, 3.32, -1.2]}>
          <boxGeometry args={[2.2, 0.12, 2.0]} />
          <meshStandardMaterial
            color={rawWaterProps.color}
            roughness={rawWaterProps.roughness}
            metalness={0.15}
            transparent
            opacity={rawWaterProps.opacity}
          />
        </mesh>

        {/* Água nos canais dos eletroímãs (Tanque 1B) */}
        <mesh position={[-4.3, 3.02, -0.9]}>
          <boxGeometry args={[1.8, 0.14, 2.2]} />
          <meshStandardMaterial
            color={rawWaterProps.color.clone().lerp(new THREE.Color('#4d889e'), 0.25)}
            roughness={0.22}
            metalness={0.2}
            transparent
            opacity={0.82}
          />
        </mesh>

        {/* ========================================================================= */}
        {/* CONEXÃO FÍSICA FASE 1 -> FASE 2: AQUEDUTO DE FLUXO CONTÍNUO               */}
        {/* ========================================================================= */}
        <mesh ref={flume12Ref} position={[-3.2, 2.65, -0.9]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.9, 0.08, 0.6]} />
          <meshStandardMaterial
            color="#5c9bb0"
            roughness={0.12}
            metalness={0.15}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 2: REATORES DE BIOSSURFACTANTE                                       */}
      {/* ========================================================================= */}
      <group>
        {/* Água dos tanques de reação com biossurfactantes */}
        <mesh ref={phase2WaterRef} position={[-1.2, 2.12, -0.8]}>
          <boxGeometry args={[3.0, 0.38, 2.4]} />
          <meshStandardMaterial
            color="#3a8da8"
            roughness={0.18}
            metalness={0.15}
            transparent
            opacity={0.82}
          />
        </mesh>

        {/* ========================================================================= */}
        {/* CONEXÃO FÍSICA FASE 2 -> FASE 3: AQUEDUTO ELEVADO E QUEDA NA CASCATA      */}
        {/* ========================================================================= */}
        {/* Calha de água no aqueduto conectando saída da Fase 2 à Cascata */}
        <mesh ref={flume23Ref} position={[0.1, 1.82, 0.5]} rotation={[0, 0.8, -0.15]}>
          <boxGeometry args={[1.5, 0.08, 0.45]} />
          <meshStandardMaterial
            color="#5bb3cc"
            roughness={0.12}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Queda vertical de água derramando diretamente no 1º degrau da cascata */}
        <mesh position={[-0.04, 1.68, 1.25]}>
          <boxGeometry args={[0.3, 0.22, 0.5]} />
          <meshStandardMaterial
            color="#c8eaf5"
            roughness={0.08}
            transparent
            opacity={0.92}
            emissive="#d4f1f9"
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 3: CASCATA DE DESGASEIFICAÇÃO (DEGRAUS E AERAÇÃO ESPUMANTE)          */}
      {/* ========================================================================= */}
      <group ref={cascadeWaterRef} position={[0.8, 0, 1.5]}>
        {/* 5 lâminas d'água sobre os degraus da escada hidráulica */}
        {[0, 1, 2, 3, 4].map((step) => {
          const sx = step * 0.42 - 0.84;
          const sy = 1.68 - step * 0.24;
          return (
            <group key={step}>
              {/* Água no patamar do degrau */}
              <mesh position={[sx, sy, 0]}>
                <boxGeometry args={[0.4, 0.06, 0.82]} />
                <meshStandardMaterial
                  color="#c8eaf5"
                  roughness={0.15}
                  transparent
                  opacity={0.88}
                />
              </mesh>
              {/* Cortina vertical de água em queda espumosa (aeração) */}
              <mesh position={[sx + 0.2, sy - 0.12, 0]}>
                <boxGeometry args={[0.04, 0.22, 0.8]} />
                <meshStandardMaterial
                  color="#ffffff"
                  roughness={0.08}
                  transparent
                  opacity={0.92}
                  emissive="#d4f1f9"
                  emissiveIntensity={0.25}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ========================================================================= */}
      {/* CONEXÃO FÍSICA FASE 3 -> FASE 4: BACIA COLETORA E CANALETA DE TRANSIÇÃO    */}
      {/* ========================================================================= */}
      <mesh ref={flume34Ref} position={[1.85, 0.76, 1.05]} rotation={[0, -0.65, -0.1]}>
        <boxGeometry args={[1.2, 0.08, 0.45]} />
        <meshStandardMaterial
          color="#68b9cf"
          roughness={0.12}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* ========================================================================= */}
      {/* FASE 4: CÂMARAS UV-C E MEMBRANAS CERÂMICAS (DESINFECÇÃO FOTÔNICA)         */}
      {/* ========================================================================= */}
      <group>
        {/* Água nos dois canais longitudinais UV-C */}
        {[-0.55, 0.55].map((dz, i) => (
          <mesh key={i} ref={i === 0 ? phase4WaterRef : undefined} position={[3.6, 0.92, 0.6 + dz]}>
            <boxGeometry args={[2.6, 0.32, 0.8]} />
            <meshStandardMaterial
              color="#5479d6"
              emissive="#7b3fe0"
              emissiveIntensity={0.25}
              roughness={0.08}
              metalness={0.12}
              transparent
              opacity={0.72}
            />
          </mesh>
        ))}

        {/* ========================================================================= */}
        {/* CONEXÃO FÍSICA FASE 4 -> FASE 5: VERTEDOURO POLIDO E QUEDA NO RESERVATÓRIO*/}
        {/* ========================================================================= */}
        <mesh ref={flume45Ref} position={[5.05, 0.62, -0.05]} rotation={[0, 0.45, -0.2]}>
          <boxGeometry args={[1.1, 0.08, 0.55]} />
          <meshStandardMaterial
            color="#52b8db"
            roughness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Cortina d'água caindo no reservatório final */}
        <mesh position={[5.45, 0.48, -0.3]}>
          <boxGeometry args={[0.08, 0.28, 0.75]} />
          <meshStandardMaterial
            color="#7ed8f5"
            roughness={0.08}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 5: RESERVATÓRIO FINAL DE ÁGUA POTÁVEL (360.000 L/H)                  */}
      {/* ========================================================================= */}
      <group position={[6.6, 0.1, -0.8]}>
        {/* Volume de água pura cristalina no reservatório final */}
        <mesh ref={phase5WaterRef} position={[0, 0.38, 0]}>
          <boxGeometry args={[3.0, 0.82, 2.2]} />
          <meshStandardMaterial
            color="#2aa6df"
            emissive="#00507a"
            emissiveIntensity={0.12}
            roughness={0.06}
            metalness={0.1}
            transparent
            opacity={0.68}
          />
        </mesh>

        {/* Efeito de caustics / reflexo de pureza no fundo do reservatório */}
        <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.9, 2.1]} />
          <meshBasicMaterial color="#41c6f5" transparent opacity={0.35} />
        </mesh>

        {/* Fluxo de saída contínua na tubulação para distribuição pública */}
        <mesh position={[1.7, -0.25, 1.0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.8, 0.08, 0.22]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* SISTEMA DE PARTÍCULAS CIRCULANTES (STREAMLINE DE PURIFICAÇÃO)             */}
      {/* ========================================================================= */}
      <primitive
        ref={particlesRef}
        object={
          new THREE.Points(
            particleData.geometry,
            new THREE.PointsMaterial({
              size: 0.06,
              vertexColors: true,
              transparent: true,
              opacity: 0.9,
              depthWrite: false,
            })
          )
        }
      />
    </group>
  );
}
