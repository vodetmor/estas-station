import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStationStore } from '../state/store';

/**
 * Simulação volumétrica e dinâmica da água da ESTAS.
 * Reproduz o comportamento hidrodinâmico real ao longo de todas as fases do tratamento:
 * - Fase 1: Água bruta barrenta/turva (sensível ao cenário: chuva, enchente ou rejeito de mineração);
 * - Fase 2: Água em reação nos reatores com biossurfactantes, espuma e vórtices nos agitadores;
 * - Fase 3: Cascatas sucessivas de aeração com espuma branca e turbulência de desgaseificação;
 * - Fase 4: Água translúcida iluminada pela radiação germicida UV-C violácea;
 * - Fase 5: Água potável cristalina azul-turquesa no reservatório final (conforme Portaria GM/MS 888/2021).
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
  const particlesRef = useRef<THREE.Points>(null);

  // Propriedades visuais da água bruta de acordo com o cenário ativo
  const rawWaterProps = useMemo(() => {
    switch (scenarioId) {
      case 'rejeito_mineracao':
        return {
          color: new THREE.Color('#7a3a22'), // Rejeito de mineração: óxidos de ferro, lama e metais
          roughness: 0.35,
          opacity: 0.94,
          turbidityLabel: 'Altíssima turbidez e metais pesados',
        };
      case 'enchente_urbana':
        return {
          color: new THREE.Color('#614c38'), // Enchente urbana: lama densa e matéria orgânica
          roughness: 0.3,
          opacity: 0.9,
          turbidityLabel: 'Alta carga orgânica e coliformes',
        };
      case 'chuva_comum':
      default:
        return {
          color: new THREE.Color('#856f4d'), // Chuva comum: turbidez moderada
          roughness: 0.25,
          opacity: 0.85,
          turbidityLabel: 'Turbidez pluvial típica',
        };
    }
  }, [scenarioId]);

  // Sistema de partículas de fluxo e poluentes otimizado (baixo custo de CPU/GPU)
  const particleData = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    const metalCol = new THREE.Color('#d97706');
    const siltCol = new THREE.Color('#785536');
    const bubbleCol = new THREE.Color('#e0f2fe');

    for (let i = 0; i < count; i++) {
      const t = Math.random();
      let x = 0;
      let y = 0;
      let z = 0;
      let col = siltCol;

      if (t < 0.3) {
        x = -7.5 + Math.random() * 3.2;
        y = 3.3 + Math.random() * 0.2;
        z = -1.2 + (Math.random() - 0.5) * 1.8;
        col = Math.random() > 0.4 ? siltCol : metalCol;
      } else if (t < 0.6) {
        x = -2.6 + Math.random() * 2.8;
        y = 2.0 + Math.random() * 0.25;
        z = -0.8 + (Math.random() - 0.5) * 2.0;
        col = metalCol;
      } else if (t < 0.8) {
        x = 0.0 + Math.random() * 1.6;
        y = 1.3 + Math.random() * 0.4;
        z = 1.5 + (Math.random() - 0.5) * 0.8;
        col = bubbleCol;
      } else {
        x = 3.0 + Math.random() * 4.8;
        y = 0.4 + Math.random() * 0.3;
        z = -0.5 + (Math.random() - 0.5) * 1.8;
        col = bubbleCol;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      speeds[i] = 0.4 + Math.random() * 0.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return { geometry: geo, speeds };
  }, []);

  const frameCount = useRef(0);

  // Loop de animação contínua da água (ondulações e partículas) otimizado a 60fps
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * waterSpeed;

    // 1. Ondulação superficial da água bruta na Fase 1
    if (phase1WaterRef.current) {
      phase1WaterRef.current.position.y = 3.32 + Math.sin(t * 3.2) * 0.008;
    }

    // 2. Vórtice suave nos reatores de biossurfactante da Fase 2
    if (phase2WaterRef.current) {
      phase2WaterRef.current.position.y = 2.12 + Math.sin(t * 2.4 + 1.0) * 0.006;
    }

    // 3. Turbulência e pulsação da cascata da Fase 3
    if (cascadeWaterRef.current) {
      cascadeWaterRef.current.children.forEach((mesh, i) => {
        mesh.position.y = 1.68 - i * 0.24 + Math.sin(t * 6.0 + i * 1.5) * 0.008;
      });
    }

    // 4. Ondulação límpida com reflexo UV na Fase 4
    if (phase4WaterRef.current) {
      phase4WaterRef.current.position.y = 0.92 + Math.sin(t * 2.0 + 2.0) * 0.005;
    }

    // 5. Superfície calma e cristalina do reservatório potável na Fase 5
    if (phase5WaterRef.current) {
      phase5WaterRef.current.position.y = 0.48 + Math.sin(t * 1.5 + 3.0) * 0.004;
    }

    // Animação das partículas com atualização a cada 2 quadros para máxima fluidez
    frameCount.current++;
    if (particlesRef.current && frameCount.current % 2 === 0) {
      const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const spd = waterSpeed * 0.018;
      for (let i = 0; i < particleData.speeds.length; i++) {
        const idx = i * 3;
        arr[idx] += spd * particleData.speeds[i];
        if (arr[idx] > 8.0) {
          arr[idx] = -7.4;
          arr[idx + 1] = 3.3;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="realistic-water">
      {/* ========================================================================= */}
      {/* FASE 1: ÁGUA BRUTA (FILTRAÇÃO E ELETROÍMÃS)                               */}
      {/* ========================================================================= */}
      <group>
        {/* Água na calha de entrada */}
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

        {/* Cascata de transição da Fase 1 para a Fase 2 */}
        <mesh position={[-3.25, 2.65, -0.9]} rotation={[0, 0, -0.45]}>
          <boxGeometry args={[0.55, 0.08, 0.7]} />
          <meshStandardMaterial
            color="#a7cfdf"
            roughness={0.1}
            metalness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 2: ÁGUA EM REAÇÃO COM BIOSSURFACTANTES (CASA DO BIOSSURFACTANTE)     */}
      {/* ========================================================================= */}
      <group>
        {/* Água dos tanques de reação com biossurfactantes (azulada com leve espuma verde-água) */}
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

        {/* Transbordamento em vertedouro para a torre de desgaseificação */}
        <mesh position={[0.3, 1.8, 0.5]} rotation={[0, 0.8, -0.3]}>
          <boxGeometry args={[0.5, 0.06, 0.5]} />
          <meshStandardMaterial
            color="#8ed0e0"
            roughness={0.12}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 3: ÁGUA EM CASCATA DE DESGASEIFICAÇÃO (ESPUMA E AERAÇÃO)             */}
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
              {/* Cortina vertical de água em queda espumosa (queda aerada) */}
              <mesh position={[sx + 0.2, sy - 0.12, 0]}>
                <boxGeometry args={[0.04, 0.22, 0.8]} />
                <meshStandardMaterial
                  color="#ffffff"
                  roughness={0.08}
                  transparent
                  opacity={0.92}
                  emissive="#d4f1f9"
                  emissiveIntensity={0.2}
                />
              </mesh>
            </group>
          );
        })}

        {/* Calha de coleta inferior da cascata direcionando para a Fase 4 */}
        <mesh position={[1.4, 0.88, -0.2]} rotation={[0, -0.6, -0.2]}>
          <boxGeometry args={[0.7, 0.08, 0.45]} />
          <meshStandardMaterial
            color="#68b9cf"
            roughness={0.12}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 4: ÁGUA TRANSLÚCIDA ILUMINADA POR UV-C (DESINFECÇÃO FOTÔNICA)       */}
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

        {/* Vertedouro polido de saída das membranas cerâmicas para o reservatório */}
        <mesh position={[5.05, 0.65, -0.2]} rotation={[0, 0.4, -0.3]}>
          <boxGeometry args={[0.6, 0.06, 0.5]} />
          <meshStandardMaterial
            color="#52b8db"
            roughness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 5: ÁGUA POTÁVEL CRISTALINA NO RESERVATÓRIO (PORTABILIDADE MS 888)    */}
      {/* ========================================================================= */}
      <group position={[6.6, 0.1, -0.8]}>
        {/* Volume de água pura límpida no reservatório final */}
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

        {/* Efeito de caustics / reflexo de luz pura no fundo do reservatório */}
        <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.9, 2.1]} />
          <meshBasicMaterial color="#41c6f5" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* SISTEMA DE PARTÍCULAS (MICELAS, METAIS, SÓLIDOS E BOLHAS DE FLUIDO)       */}
      {/* ========================================================================= */}
      <primitive ref={particlesRef} object={new THREE.Points(particleData.geometry, new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }))} />
    </group>
  );
}
