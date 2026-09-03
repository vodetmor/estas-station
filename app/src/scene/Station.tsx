import { Html } from '@react-three/drei';
import { MODULES, PALETTE, PHASE_TINT, groundY } from './layout';
import { Module } from './Module';
import {
  ArmazenamentoExterior,
  ArmazenamentoInternals,
  BiossorcaoExterior,
  BiossorcaoInternals,
  DesgaseificacaoExterior,
  DesgaseificacaoInternals,
  DesinfeccaoExterior,
  DesinfeccaoInternals,
  FiltracaoExterior,
  FiltracaoInternals,
  MonitoramentoExterior,
  MonitoramentoInternals,
  RemineralizacaoInternals,
} from './internals';
import { useStationStore } from '../state/store';
import { STAGES } from '../data/stationData';

/**
 * A estação montada: 7 módulos setorizados fechados, mais as obras de captação e de saída que
 * não pertencem a módulo nenhum. Cada módulo carrega um selo numerado sempre visível — é o
 * convite para abrir e ver por dentro.
 */

const INTERNALS = {
  filtracao: <FiltracaoInternals />,
  biossorcao: <BiossorcaoInternals />,
  desgaseificacao: <DesgaseificacaoInternals />,
  desinfeccao: <DesinfeccaoInternals />,
  remineralizacao: <RemineralizacaoInternals />,
  monitoramento: <MonitoramentoInternals />,
  armazenamento: <ArmazenamentoInternals />,
} as const;

const EXTERIORS = {
  filtracao: <FiltracaoExterior />,
  biossorcao: <BiossorcaoExterior />,
  desgaseificacao: <DesgaseificacaoExterior />,
  desinfeccao: <DesinfeccaoExterior />,
  remineralizacao: null,
  monitoramento: <MonitoramentoExterior />,
  armazenamento: <ArmazenamentoExterior />,
} as const;

export function Station() {
  return (
    <group name="estacao">
      {MODULES.map((m) => (
        <Module key={m.id} def={m} exterior={EXTERIORS[m.id]}>
          {INTERNALS[m.id]}
        </Module>
      ))}
      <ModuleBadges />
      <Intake />
      <Outfall />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Selos numerados: clicar seleciona e abre o módulo
// ---------------------------------------------------------------------------

function ModuleBadges() {
  const selected = useStationStore((s) => s.selectedStageId);
  const hovered = useStationStore((s) => s.hoveredStageId);
  const openStages = useStationStore((s) => s.openStages);
  const selectStage = useStationStore((s) => s.selectStage);
  const hoverStage = useStationStore((s) => s.hoverStage);
  const cleanMode = useStationStore((s) => s.cleanMode);

  if (cleanMode) return null;

  return (
    <group>
      {MODULES.map((m) => {
        const stage = STAGES.find((s) => s.id === m.id)!;
        const active = selected === m.id;
        const focused = active || hovered === m.id;
        return (
          <Html
            key={m.id}
            position={[m.x, m.floorY + m.h + (m.roof === 'torre' ? 1.35 : 0.72), m.z]}
            center
            zIndexRange={[20, 0]}
          >
            <button
              type="button"
              className="module-badge"
              data-active={active}
              data-open={openStages.has(m.id)}
              style={{ '--tint': PHASE_TINT[m.phase] } as React.CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                selectStage(m.id);
              }}
              onPointerEnter={() => hoverStage(m.id)}
              onPointerLeave={() => hoverStage(null)}
              title={`${stage.label} — clique para abrir o módulo`}
            >
              <span className="badge-roman">{m.roman}</span>
              {focused && (
                <span className="badge-name">
                  {m.short}
                  <small>{openStages.has(m.id) ? 'aberto' : 'clique para abrir'}</small>
                </span>
              )}
            </button>
          </Html>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Obras de captação (montante) e de distribuição (jusante)
// ---------------------------------------------------------------------------

function Intake() {
  const y = groundY(-11.0, -0.4);
  return (
    <group name="captacao">
      {/* Barragem de nível e comporta de tomada d'água na rede pluvial */}
      <mesh position={[-11.1, y + 0.35, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 1.5, 3.4]} />
        <meshStandardMaterial color={PALETTE.concreteDark} roughness={0.86} />
      </mesh>
      <mesh position={[-11.1, y + 1.15, -0.4]}>
        <boxGeometry args={[0.5, 0.12, 3.5]} />
        <meshStandardMaterial color={PALETTE.rim} roughness={0.7} />
      </mesh>
      {/* Comporta com fuso de manobra */}
      <mesh position={[-10.88, y + 0.5, -0.4]} castShadow>
        <boxGeometry args={[0.08, 0.7, 0.8]} />
        <meshStandardMaterial color="#5b6663" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-10.88, y + 1.35, -0.4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-10.88, y + 1.6, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 18]} />
        <meshStandardMaterial color="#dc2626" roughness={0.45} />
      </mesh>
      {/* Grade grosseira de proteção da tomada */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-10.6, y + 0.55, -1.2 + i * 0.2]}>
          <boxGeometry args={[0.03, 0.7, 0.03]} />
          <meshStandardMaterial color={PALETTE.steel} metalness={0.75} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Outfall() {
  const y = groundY(13.8, 0.1);
  return (
    <group name="distribuicao">
      {/* Caixa de distribuição pública e ramais de abastecimento comunitário */}
      <mesh position={[13.9, y + 0.35, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.9, 1.7]} />
        <meshStandardMaterial color={PALETTE.concrete} roughness={0.84} />
      </mesh>
      <mesh position={[13.9, y + 0.83, 0.1]}>
        <boxGeometry args={[1.62, 0.08, 1.82]} />
        <meshStandardMaterial color={PHASE_TINT[5]} roughness={0.5} emissive={PHASE_TINT[5]} emissiveIntensity={0.25} />
      </mesh>
      {[-0.55, 0, 0.55].map((z, i) => (
        <mesh key={i} position={[14.75, y + 0.3, z + 0.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.9, 12]} />
          <meshStandardMaterial color="#1e5f8a" metalness={0.62} roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
}
