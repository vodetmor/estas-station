import { Html } from '@react-three/drei';
import { useStationStore } from '../state/store';
import { MODULES, PHASE_TINT } from './layout';
import { STAGES, STAGE_ZONES } from '../data/stationData';

/**
 * Prancha técnica sobreposta à maquete — o equivalente às chamadas, setas de vazão e cotas da
 * planta de referência. Fica atrás do interruptor "Planta" porque é informação de engenharia,
 * não navegação: com ela desligada, a estação se lê como maquete; com ela ligada, como prancha.
 *
 * As posições derivam de `MODULES`, então mover um módulo na planta move a chamada junto.
 */

/** Chamadas de equipamento de cada etapa, ancoradas por deslocamento relativo ao módulo. */
const CALLOUTS: { id: string; dy: number; dz: number; text: string }[] = [
  { id: 'filtracao', dy: 0.35, dz: 2.35, text: 'Brita, areia quartzosa e antracito' },
  { id: 'filtracao', dy: 1.15, dz: -2.4, text: 'Eletroímãs de alta intensidade' },
  { id: 'biossorcao', dy: 0.4, dz: 2.5, text: 'Painéis de bio-sorção' },
  { id: 'biossorcao', dy: 1.2, dz: -2.6, text: 'Micelas capturando Pb, Hg, Cd, As e Cr' },
  { id: 'desgaseificacao', dy: 2.1, dz: -2.1, text: 'Exaustão de CO₂ e gases sulfetados' },
  { id: 'desgaseificacao', dy: 0.3, dz: 2.2, text: 'Sucessivos desníveis · aeração' },
  { id: 'desinfeccao', dy: 0.35, dz: 2.2, text: 'Câmaras UV-C · 1,5 mJ/cm²' },
  { id: 'desinfeccao', dy: 1.1, dz: -2.3, text: 'Membranas cerâmicas com quitosana' },
  { id: 'remineralizacao', dy: 0.35, dz: 2.0, text: 'Cartuchos de calcita e dolomita' },
  { id: 'monitoramento', dy: 1.25, dz: -1.9, text: 'Auditoria multiparâmetro · Portaria 888' },
  { id: 'armazenamento', dy: 0.4, dz: 2.5, text: 'Reservatório protegido · 360.000 L/h' },
];

export function TechnicalAnnotations() {
  const technicalOverlay = useStationStore((s) => s.technicalOverlay);
  const selectStage = useStationStore((s) => s.selectStage);
  const selectedStageId = useStationStore((s) => s.selectedStageId);

  if (!technicalOverlay) return null;

  return (
    <group name="prancha-tecnica">
      {/* Seta 3D de entrada de água bruta */}
      <group position={[-12.6, 4.6, -0.4]}>
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.8, 12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.22, 0.44, 12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.7} />
        </mesh>
      </group>

      {/* Seta 3D de saída para distribuição pública */}
      <group position={[15.4, -1.0, 0.1]}>
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 12]} />
          <meshStandardMaterial color="#16a34a" emissive="#15803d" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0.25, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.24, 0.46, 12]} />
          <meshStandardMaterial color="#16a34a" emissive="#15803d" emissiveIntensity={0.7} />
        </mesh>
      </group>

      <Html position={[-12.9, 3.9, -0.4]} center zIndexRange={[18, 0]}>
        <div className="tech-callout primary" onClick={() => selectStage('filtracao')}>
          <div className="arrow-badge">➜ 50 L/s</div>
          <div className="callout-body">
            <strong>ENTRADA DE ÁGUA BRUTA</strong>
            <span>Captação em rede pluvial de encosta</span>
          </div>
        </div>
      </Html>

      <Html position={[15.9, -1.7, 0.1]} center zIndexRange={[18, 0]}>
        <div className="tech-callout success" onClick={() => selectStage('armazenamento')}>
          <div className="arrow-badge">➔ 360.000 L/h</div>
          <div className="callout-body">
            <strong>DISTRIBUIÇÃO PÚBLICA</strong>
            <span>Água potável · Portaria GM/MS 888/2021</span>
          </div>
        </div>
      </Html>

      {/* Rótulo de fase sobre cada módulo */}
      {MODULES.map((m) => {
        const stage = STAGES.find((s) => s.id === m.id)!;
        return (
          <Html
            key={m.id}
            position={[m.x, m.floorY + m.h + (m.roof === 'torre' ? 2.0 : 1.35), m.z]}
            center
            zIndexRange={[18, 0]}
          >
            <div
              className={`tech-stage-tag ${selectedStageId === m.id ? 'selected' : ''}`}
              style={{ '--tint': PHASE_TINT[m.phase] } as React.CSSProperties}
              onClick={() => selectStage(m.id)}
            >
              <span className="tag-number">{m.roman}</span>
              <div className="tag-info">
                <strong>{stage.shortLabel.toUpperCase()}</strong>
                <small className="hide-on-mobile">{STAGE_ZONES[stage.zone].label}</small>
              </div>
            </div>
          </Html>
        );
      })}

      {/* Chamadas de equipamento */}
      {CALLOUTS.map((c, i) => {
        const m = MODULES.find((mm) => mm.id === c.id)!;
        return (
          <Html key={i} position={[m.x, m.floorY + c.dy, m.z + c.dz]} center zIndexRange={[16, 0]}>
            <div className="tech-subtag" onClick={() => selectStage(m.id)}>
              <span className="dot" style={{ background: PHASE_TINT[m.phase] }} /> {c.text}
            </div>
          </Html>
        );
      })}

      {/* Barra de escala */}
      <group position={[1.4, -1.6, 3.5]}>
        <mesh>
          <boxGeometry args={[8.0, 0.04, 0.04]} />
          <meshBasicMaterial color="#ffffff" opacity={0.55} transparent />
        </mesh>
        <Html position={[0, -0.28, 0]} center zIndexRange={[16, 0]}>
          <div className="tech-scale-label">ESCALA 1:50 · PLANTA TÉCNICA E CORTES · SOBRAQUARK 2026</div>
        </Html>
      </group>
    </group>
  );
}
