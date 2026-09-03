import { useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useStationStore } from '../state/store';
import type { StageId } from '../data/stationData';

/**
 * Estrutura arquitetônica e de engenharia em concreto armado da ESTAS.
 * Reproduz fielmente a maquete isométrica em corte (cutaway) da imagem de referência:
 * - Fase 1: Calhas de entrada, bacia de brita/areia/antracito e canal de eletroímãs;
 * - Fase 2: Reatores de biossurfactantes com chicanas defletoras e passarelas;
 * - Fase 3: Escada hidráulica de desgaseificação em cascata e escadaria de acesso de serviço;
 * - Fase 4: Câmaras longitudinais de desinfecção fotônica UV-C e polimento;
 * - Fase 5: Reservatório final de água potável (360.000 L/h) com visor frontal transparente e escadas.
 */
export function StationStructure() {
  const selectedStageId = useStationStore((s) => s.selectedStageId);
  const hoveredStageId = useStationStore((s) => s.hoveredStageId);
  const selectStage = useStationStore((s) => s.selectStage);
  const hoverStage = useStationStore((s) => s.hoverStage);

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>, stageId: StageId) => {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
      hoverStage(stageId);
    },
    [hoverStage],
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = 'default';
      hoverStage(null);
    },
    [hoverStage],
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>, stageId: StageId) => {
      e.stopPropagation();
      selectStage(stageId);
    },
    [selectStage],
  );

  // Cores de concreto armado arquitetônico
  const concreteColor = '#949996';
  const concreteDark = '#787d7b';
  const rimColor = '#b5bab7';
  const highlightColor = '#3ea8cf';

  return (
    <group name="station-structure">
      {/* ========================================================================= */}
      {/* FASE 1: FILTRAÇÃO FÍSICA E MAGNÉTICA (DEGRAUS 1A & 1B)                    */}
      {/* ========================================================================= */}
      <group
        name="stage-filtracao"
        onPointerOver={(e) => handlePointerOver(e, 'filtracao')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'filtracao')}
      >
        {/* Calha de entrada de água bruta (Inlet Flume) */}
        <mesh position={[-7.7, 3.75, -2.1]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.35, 0.6]} />
          <meshStandardMaterial color={concreteDark} roughness={0.7} />
        </mesh>
        <mesh position={[-7.7, 3.85, -2.42]}>
          <boxGeometry args={[1.6, 0.45, 0.08]} />
          <meshStandardMaterial color={rimColor} roughness={0.6} />
        </mesh>

        {/* Tanque 1A: Leito filtrante tríplice (Brita, Areia, Antracito) */}
        <group position={[-6.2, 3.2, -1.2]}>
          {/* Fundo do tanque */}
          <mesh position={[0, -0.32, 0]} receiveShadow>
            <boxGeometry args={[2.4, 0.16, 2.2]} />
            <meshStandardMaterial color={concreteColor} roughness={0.75} />
          </mesh>
          {/* Paredes de concreto do tanque */}
          <mesh position={[-1.15, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.7, 2.2]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, -1.05]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.7, 0.16]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 1.05]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.7, 0.16]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          {/* Parede frontal em corte (rebaixada para visualização interna) */}
          <mesh position={[1.15, -0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.4, 2.2]} />
            <meshStandardMaterial color={rimColor} roughness={0.65} />
          </mesh>
        </group>

        {/* Tanque 1B: Bacia dos Eletroímãs de Alta Intensidade */}
        <group position={[-4.3, 2.9, -0.9]}>
          {/* Fundo */}
          <mesh position={[0, -0.32, 0]} receiveShadow>
            <boxGeometry args={[1.9, 0.16, 2.4]} />
            <meshStandardMaterial color={concreteColor} roughness={0.75} />
          </mesh>
          {/* Paredes perimetrais */}
          <mesh position={[0, 0.05, -1.15]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.6, 0.16]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.05, 1.15]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.6, 0.16]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          {/* Separadores dos 3 canais magnéticos internos */}
          {[-0.38, 0.38].map((dz, i) => (
            <mesh key={i} position={[0, -0.02, dz]} castShadow>
              <boxGeometry args={[1.8, 0.45, 0.1]} />
              <meshStandardMaterial color={concreteDark} roughness={0.7} />
            </mesh>
          ))}
          {/* Vertedouros com aberturas de saída */}
          <mesh position={[0.92, -0.1, 0]} castShadow>
            <boxGeometry args={[0.12, 0.3, 2.4]} />
            <meshStandardMaterial color={rimColor} roughness={0.65} />
          </mesh>
        </group>

        {/* Canaleta de transição para a Fase 2 */}
        <mesh position={[-3.15, 2.45, -0.9]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.7, 0.15, 0.8]} />
          <meshStandardMaterial color={concreteDark} roughness={0.7} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 2: REATORES DE BIOSSURFACTANTES (CASA DO BIOSSURFACTANTE)            */}
      {/* ========================================================================= */}
      <group
        name="stage-biossorcao"
        onPointerOver={(e) => handlePointerOver(e, 'biossorcao')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'biossorcao')}
      >
        <group position={[-1.2, 1.9, -0.8]}>
          {/* Laje de fundação dos reatores */}
          <mesh position={[0, -0.45, 0]} receiveShadow>
            <boxGeometry args={[3.2, 0.2, 2.6]} />
            <meshStandardMaterial color={concreteColor} roughness={0.75} />
          </mesh>

          {/* Paredes perimetrais em corte (Cutaway) */}
          <mesh position={[0, 0.15, -1.25]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 1.0, 0.18]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          <mesh position={[-1.52, 0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 1.0, 2.6]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          <mesh position={[1.52, 0.15, -0.4]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 1.0, 1.8]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>

          {/* Paredes defletoras (chicanas do labirinto de contato - 30 min) */}
          <mesh position={[-0.4, 0.05, -0.2]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.8, 1.9]} />
            <meshStandardMaterial color={concreteDark} roughness={0.7} />
          </mesh>
          <mesh position={[0.6, 0.05, 0.2]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.8, 1.9]} />
            <meshStandardMaterial color={concreteDark} roughness={0.7} />
          </mesh>

          {/* Borda frontal cortada para visualização arquitetônica interna */}
          <mesh position={[0, -0.15, 1.25]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.45, 0.18]} />
            <meshStandardMaterial color={rimColor} roughness={0.65} />
          </mesh>

          {/* Passarela operacional superior de concreto sobre os tanques */}
          <mesh position={[0, 0.65, -0.2]} castShadow>
            <boxGeometry args={[0.4, 0.08, 2.5]} />
            <meshStandardMaterial color={rimColor} roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* FASE 3: TORRE DE DESGASEIFICAÇÃO EM CASCATA & ESCADA OPERACIONAL           */}
      {/* ========================================================================= */}
      <group
        name="stage-desgaseificacao"
        onPointerOver={(e) => handlePointerOver(e, 'desgaseificacao')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'desgaseificacao')}
      >
        {/* Estrutura da cascata hidráulica em degraus escalonados */}
        <group position={[0.8, 1.4, 1.5]}>
          {/* Degraus da cascata de aeração (5 degraus descendentes) */}
          {[0, 1, 2, 3, 4].map((step) => {
            const sx = step * 0.42 - 0.84;
            const sy = 0.5 - step * 0.24;
            return (
              <group key={step}>
                <mesh position={[sx, sy - 0.12, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.42, 0.24, 0.9]} />
                  <meshStandardMaterial color={concreteColor} roughness={0.7} />
                </mesh>
                {/* Vertedouro de cada degrau */}
                <mesh position={[sx + 0.19, sy + 0.04, 0]}>
                  <boxGeometry args={[0.04, 0.08, 0.9]} />
                  <meshStandardMaterial color={rimColor} roughness={0.6} />
                </mesh>
              </group>
            );
          })}

          {/* Paredes laterais da calha de cascata */}
          <mesh position={[0, 0.25, -0.48]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.85, 0.08]} />
            <meshStandardMaterial color={concreteDark} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0.48]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.55, 0.08]} />
            <meshStandardMaterial color={rimColor} roughness={0.65} />
          </mesh>

          {/* Escadaria de serviço de concreto paralela com corrimão */}
          <group position={[0, -0.1, 0.75]}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <mesh key={i} position={[i * 0.28 - 0.84, 0.42 - i * 0.16, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.28, 0.16, 0.35]} />
                <meshStandardMaterial color={concreteDark} roughness={0.8} />
              </mesh>
            ))}
            {/* Corrimão metálico tubular */}
            <mesh position={[0, 0.35, 0.16]} rotation={[0, 0, -0.5]}>
              <cylinderGeometry args={[0.018, 0.018, 2.3, 8]} />
              <meshStandardMaterial color="#c2c7c5" metalness={0.75} roughness={0.3} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* FASE 4: DESINFECÇÃO FOTÔNICA E NANO (CÂMARAS UV-C E MEMBRANAS)              */}
      {/* ========================================================================= */}
      <group
        name="stage-desinfeccao"
        onPointerOver={(e) => handlePointerOver(e, 'desinfeccao')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'desinfeccao')}
      >
        <group position={[3.6, 0.75, 0.6]}>
          {/* Laje base */}
          <mesh position={[0, -0.32, 0]} receiveShadow>
            <boxGeometry args={[2.8, 0.16, 2.1]} />
            <meshStandardMaterial color={concreteColor} roughness={0.75} />
          </mesh>

          {/* Canal duplo longitudinal de aço inox e concreto */}
          {[-0.55, 0.55].map((dz, i) => (
            <group key={i} position={[0, 0, dz]}>
              {/* Fundo do canal */}
              <mesh position={[0, -0.15, 0]} receiveShadow>
                <boxGeometry args={[2.7, 0.12, 0.85]} />
                <meshStandardMaterial color="#6e7370" metalness={0.3} roughness={0.5} />
              </mesh>
              {/* Parede traseira */}
              <mesh position={[0, 0.12, -0.42]} castShadow receiveShadow>
                <boxGeometry args={[2.7, 0.45, 0.08]} />
                <meshStandardMaterial color={concreteColor} roughness={0.7} />
              </mesh>
              {/* Parede frontal cortada (para ver os tubos UV-C e água) */}
              <mesh position={[0, 0.0, 0.42]} castShadow receiveShadow>
                <boxGeometry args={[2.7, 0.22, 0.08]} />
                <meshStandardMaterial color={rimColor} roughness={0.65} />
              </mesh>
            </group>
          ))}

          {/* Parede divisória central entre os dois canais */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[2.7, 0.5, 0.12]} />
            <meshStandardMaterial color={concreteDark} roughness={0.7} />
          </mesh>

          {/* Cabeçote de entrada e saída com conexões flangeadas */}
          <mesh position={[-1.38, 0.15, 0]} castShadow>
            <boxGeometry args={[0.12, 0.5, 2.1]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          <mesh position={[1.38, 0.08, 0]} castShadow>
            <boxGeometry args={[0.12, 0.35, 2.1]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* FASE 5: AJUSTE FINAL, PH E RESERVATÓRIO DE ÁGUA POTÁVEL (360.000 L/H)      */}
      {/* ========================================================================= */}
      <group
        name="stage-armazenamento"
        onPointerOver={(e) => handlePointerOver(e, 'armazenamento')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'armazenamento')}
      >
        <group position={[6.6, 0.1, -0.8]}>
          {/* Laje estrutural de fundo */}
          <mesh position={[0, -0.55, 0]} receiveShadow>
            <boxGeometry args={[3.2, 0.22, 2.4]} />
            <meshStandardMaterial color={concreteColor} roughness={0.75} />
          </mesh>

          {/* Parede traseira e parede esquerda de concreto maciço */}
          <mesh position={[0, 0.1, -1.15]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 1.1, 0.16]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          <mesh position={[-1.52, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 1.1, 2.4]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>
          <mesh position={[1.52, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 1.1, 2.4]} />
            <meshStandardMaterial color={concreteColor} roughness={0.7} />
          </mesh>

          {/* PAREDE FRONTAL TRANSPARENTE EM ACRÍLICO / VIDRO ESTRUTURAL (VISOR DE POTABILIDADE) */}
          <mesh position={[0, 0.08, 1.15]}>
            <boxGeometry args={[3.1, 1.05, 0.06]} />
            <meshStandardMaterial
              color="#eaf4ff"
              transparent
              opacity={0.32}
              roughness={0.08}
              metalness={0.05}
            />
          </mesh>
          {/* Moldura de aço / concreto do visor frontal */}
          <mesh position={[0, -0.45, 1.15]}>
            <boxGeometry args={[3.2, 0.14, 0.12]} />
            <meshStandardMaterial color={concreteDark} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.62, 1.15]}>
            <boxGeometry args={[3.2, 0.08, 0.12]} />
            <meshStandardMaterial color={rimColor} roughness={0.6} />
          </mesh>

          {/* Escada de acesso de concreto no canto frontal direito */}
          <group position={[1.8, -0.35, 0.8]}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[i * 0.22, -i * 0.12, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.22, 0.12, 0.5]} />
                <meshStandardMaterial color={concreteDark} roughness={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* Destaque / Realce visual da fase selecionada */}
      {selectedStageId && <StageSelectionOutline stageId={selectedStageId} color={highlightColor} />}
      {hoveredStageId && hoveredStageId !== selectedStageId && (
        <StageSelectionOutline stageId={hoveredStageId} color="#ffffff" opacity={0.4} />
      )}
    </group>
  );
}

/** Contorno de destaque em neon sutil sobre a fase sob foco ou seleção. */
function StageSelectionOutline({
  stageId,
  color,
  opacity = 0.9,
}: {
  stageId: string;
  color: string;
  opacity?: number;
}) {
  const boxConfig: Record<string, [number, number, number, number, number, number]> = {
    filtracao: [-5.3, 3.2, -1.0, 4.4, 0.9, 2.6],
    biossorcao: [-1.2, 1.9, -0.8, 3.4, 1.1, 2.7],
    desgaseificacao: [0.8, 1.4, 1.5, 2.4, 0.9, 1.9],
    desinfeccao: [3.6, 0.75, 0.6, 3.0, 0.8, 2.3],
    remineralizacao: [6.6, 0.1, -0.8, 3.3, 1.2, 2.5],
    monitoramento: [6.6, 0.1, -0.8, 3.3, 1.2, 2.5],
    armazenamento: [6.6, 0.1, -0.8, 3.3, 1.2, 2.5],
  };

  const cfg = boxConfig[stageId] ?? boxConfig.filtracao;
  const [x, y, z, w, h, d] = cfg;

  return (
    <group position={[x, y + h / 2, z]}>
      <mesh>
        <boxGeometry args={[w + 0.05, h + 0.05, d + 0.05]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
      </mesh>
    </group>
  );
}
