import { useStationStore } from '../state/store';
import { Html } from '@react-three/drei';

/**
 * Prancha técnica e anotações arquitetônicas da ESTAS.
 * Reproduz as chamadas técnicas, setas de vazão, cotas e legendas da imagem de referência:
 * - Setas de entrada de água bruta (50 L/s e 100 L/s);
 * - Rótulos setoriais de cada uma das 5 fases de tratamento com tempos de retenção;
 * - Anotações de equipamentos: eletroímãs, leito filtrante, micelas, cascata, UV-C e reservatório;
 * - Seta e cota de saída para distribuição pública (360.000 L/h).
 */
export function TechnicalAnnotations() {
  const technicalOverlay = useStationStore((s) => s.technicalOverlay);
  const selectStage = useStationStore((s) => s.selectStage);
  const selectedStageId = useStationStore((s) => s.selectedStageId);

  if (!technicalOverlay) return null;

  return (
    <group name="technical-annotations">
      {/* ========================================================================= */}
      {/* SETAS DE ENTRADA EM 3D (ÁGUA BRUTA 50 L/S & 100 L/S)                      */}
      {/* ========================================================================= */}
      {/* Seta 3D azul de entrada 50 L/s */}
      <group position={[-8.4, 4.0, -2.1]} rotation={[0, 0, -0.4]}>
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.7, 12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.2, 0.4, 12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Seta 3D azul de entrada secundária 100 L/s */}
      <group position={[-8.5, 3.7, -0.6]} rotation={[0, -0.3, -0.2]}>
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.35, 12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Seta 3D verde de saída (Distribuição Pública 360.000 L/h) */}
      <group position={[8.4, -0.25, 0.3]} rotation={[0, 0, -0.2]}>
        <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.7, 12]} />
          <meshStandardMaterial color="#16a34a" emissive="#15803d" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.22, 0.4, 12]} />
          <meshStandardMaterial color="#16a34a" emissive="#15803d" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* RÓTULOS SETORIAIS FLUTUANTES (CLICÁVEIS)                                   */}
      {/* ========================================================================= */}
      {/* Chamada de Entrada 50 L/s */}
      <Html position={[-8.4, 3.4, -2.1]} center>
        <div
          className="tech-callout primary"
          onClick={() => selectStage('filtracao')}
          title="Clique para ver detalhes"
        >
          <div className="arrow-badge">➜ 50 L/s</div>
          <div className="callout-body">
            <strong>ENTRADA ÁGUA BRUTA</strong>
            <span>Captação de encosta</span>
          </div>
        </div>
      </Html>

      {/* Fase 1: Filtração Física e Magnética */}
      <Html position={[-5.8, 3.8, -1.2]} center>
        <div
          className={`tech-stage-tag ${selectedStageId === 'filtracao' ? 'selected' : ''}`}
          onClick={() => selectStage('filtracao')}
        >
          <span className="tag-number">1</span>
          <div className="tag-info">
            <strong>FILTRAÇÃO E ELETROÍMÃS</strong>
            <small className="hide-on-mobile">Brita, areia, antracito e campo magnético</small>
          </div>
        </div>
      </Html>

      {/* Sub-rótulo brita/areia posicionado à esquerda no primeiro plano */}
      <Html position={[-7.2, 2.8, 0.4]} center>
        <div className="tech-subtag" onClick={() => selectStage('filtracao')}>
          <span className="dot" /> BRITA, AREIA E ANTRACITO
        </div>
      </Html>

      {/* Sub-rótulo eletroímãs posicionado à direita no primeiro plano */}
      <Html position={[-4.2, 2.3, 0.6]} center>
        <div className="tech-subtag" onClick={() => selectStage('filtracao')}>
          <span className="dot" /> ELETROÍMÃS DE ALTA INTENSIDADE
        </div>
      </Html>

      {/* Fase 2: Casa do Biossurfactante */}
      <Html position={[-1.2, 2.8, -1.6]} center>
        <div
          className={`tech-stage-tag ${selectedStageId === 'biossorcao' ? 'selected' : ''}`}
          onClick={() => selectStage('biossorcao')}
        >
          <span className="tag-number">2</span>
          <div className="tag-info">
            <strong>BIOSSURFACTANTES</strong>
            <small className="hide-on-mobile">Reatores de contato · Remoção de Pb, Hg, Cr, Cd</small>
          </div>
        </div>
      </Html>

      <Html position={[-2.4, 1.7, 0.8]} center>
        <div className="tech-subtag" onClick={() => selectStage('biossorcao')}>
          <span className="dot green" /> PAINÉIS DE BIO-SORÇÃO
        </div>
      </Html>

      <Html position={[0.0, 1.7, 0.8]} center>
        <div className="tech-subtag" onClick={() => selectStage('biossorcao')}>
          <span className="dot green" /> MICELAS CAPTURANDO METAIS
        </div>
      </Html>

      {/* Fase 3: Desgaseificação em Cascata */}
      <Html position={[1.4, 2.1, 2.4]} center>
        <div
          className={`tech-stage-tag ${selectedStageId === 'desgaseificacao' ? 'selected' : ''}`}
          onClick={() => selectStage('desgaseificacao')}
        >
          <span className="tag-number">3</span>
          <div className="tag-info">
            <strong>DESGASEIFICAÇÃO</strong>
            <small className="hide-on-mobile">Cascata de aeração e exaustão de gases</small>
          </div>
        </div>
      </Html>

      {/* Fase 4: Desinfecção Fotônica e Nano */}
      <Html position={[3.8, 1.4, 1.6]} center>
        <div
          className={`tech-stage-tag ${selectedStageId === 'desinfeccao' ? 'selected' : ''}`}
          onClick={() => selectStage('desinfeccao')}
        >
          <span className="tag-number">4</span>
          <div className="tag-info">
            <strong>DESINFECÇÃO UV-C E NANO</strong>
            <small className="hide-on-mobile">Lâmpadas germicidas e membranas de prata</small>
          </div>
        </div>
      </Html>

      {/* Fase 5: Reservatório e Distribuição */}
      <Html position={[6.6, 1.1, -1.6]} center>
        <div
          className={`tech-stage-tag ${selectedStageId === 'armazenamento' ? 'selected' : ''}`}
          onClick={() => selectStage('armazenamento')}
        >
          <span className="tag-number">5</span>
          <div className="tag-info">
            <strong>RESERVATÓRIO POTÁVEL</strong>
            <small className="hide-on-mobile">Remineralização e saída pública · 360.000 L/h</small>
          </div>
        </div>
      </Html>

      {/* Seta e chamada de saída de água potável */}
      <Html position={[8.8, 0.1, 0.8]} center>
        <div
          className="tech-callout success"
          onClick={() => selectStage('armazenamento')}
        >
          <div className="arrow-badge">➔ 360.000 L/h</div>
          <div className="callout-body">
            <strong>DISTRIBUIÇÃO PÚBLICA</strong>
            <span>Água potável · Padrão Portaria MS 888</span>
          </div>
        </div>
      </Html>

      {/* Barra de escala técnica */}
      <group position={[0, -0.6, 3.1]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6.0, 0.04, 0.04]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
        <Html position={[0, -0.2, 0]} center>
          <div className="tech-scale-label">ESCALA 1:50 · PLANTA TÉCNICA E CORTES · LA SALLE 2026</div>
        </Html>
      </group>
    </group>
  );
}
