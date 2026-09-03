import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { PALETTE, PHASE_TINT, type ModuleDef } from './layout';
import { useStationStore } from '../state/store';

/**
 * Casca fechada e setorizada de uma etapa da ESTAS.
 *
 * A estação NÃO é mais um corte permanentemente aberto: por padrão cada módulo é um volume
 * fechado de concreto, com cobertura, faixa colorida da fase e equipamentos externos. Ao clicar,
 * a cobertura sobe, a parede frontal desce para dentro do piso e a lateral desliza para fora —
 * é ali, e só ali, que os internos aparecem. Fechar devolve o módulo à casca externa.
 *
 * Toda a animação roda em `useFrame` sobre refs (nenhum re-render do React por quadro).
 */

interface ModuleProps {
  def: ModuleDef;
  /** Equipamentos internos — só ficam visíveis com o módulo aberto. */
  children?: ReactNode;
  /** Equipamentos permanentes na fachada (chaminé, escadas, quadros, tubulação). */
  exterior?: ReactNode;
}

const GHOST_OPACITY = 0.14;

export function Module({ def, children, exterior }: ModuleProps) {
  const isOpen = useStationStore((s) => s.openStages.has(def.id));
  const isSelected = useStationStore((s) => s.selectedStageId === def.id);
  const isHovered = useStationStore((s) => s.hoveredStageId === def.id);
  const selectStage = useStationStore((s) => s.selectStage);
  const hoverStage = useStationStore((s) => s.hoverStage);

  const roofRef = useRef<THREE.Group>(null);
  const frontRef = useRef<THREE.Group>(null);
  const sideRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const openness = useRef(0);
  const focus = useRef(0);

  const tint = PHASE_TINT[def.phase];
  const { w, h, d } = def;
  const t = 0.14; // espessura das paredes

  // Faixa de visores na fachada, alinhada à lâmina d'água do módulo (limitada para não
  // encostar no piso nem na verga — na torre de cascata a água é alta, no reservatório é baixa).
  const waterLocal = def.waterY - def.floorY;
  const winMid = Math.min(h * 0.72, Math.max(h * 0.34, waterLocal + 0.06));
  const winH = Math.min(0.42, h * 0.3);
  const winY0 = winMid - winH / 2;
  const winY1 = winMid + winH / 2;
  const mullions = Math.max(3, Math.round(w / 0.85)); // quantidade de vãos envidraçados
  const bay = (w / mullions) * 0.66; // largura do vidro em cada vão

  // Materiais próprios deste módulo: a opacidade das paredes móveis é animada por quadro,
  // então não podem ser compartilhados entre módulos.
  const mats = useMemo(() => {
    const wall = new THREE.MeshStandardMaterial({ color: PALETTE.concrete, roughness: 0.82, metalness: 0.05 });
    const moving = () =>
      new THREE.MeshStandardMaterial({
        color: PALETTE.concrete,
        roughness: 0.82,
        metalness: 0.05,
        transparent: false,
        opacity: 1,
      });
    return {
      wall,
      front: moving(),
      side: moving(),
      roof: new THREE.MeshStandardMaterial({ color: PALETTE.concreteDark, roughness: 0.72, metalness: 0.12 }),
      band: new THREE.MeshStandardMaterial({ color: tint, roughness: 0.45, emissive: tint, emissiveIntensity: 0.18 }),
      floor: new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeep, roughness: 0.9 }),
      // Vidro dos visores: quase totalmente transparente, só um reflexo de vidraça por cima.
      window: new THREE.MeshPhysicalMaterial({
        color: PALETTE.glass,
        transparent: true,
        opacity: 0.16,
        roughness: 0.06,
        metalness: 0,
        transmission: 0,
        depthWrite: false,
      }),
    };
  }, [tint]);

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 5.5);
    openness.current += ((isOpen ? 1 : 0) - openness.current) * k;
    focus.current += ((isSelected ? 1 : isHovered ? 0.55 : 0) - focus.current) * Math.min(1, delta * 8);

    const o = openness.current;
    const ease = o * o * (3 - 2 * o); // suaviza início e fim do movimento

    if (roofRef.current) {
      roofRef.current.position.y = h + ease * h * def.lift;
      roofRef.current.position.x = ease * 0.18;
      roofRef.current.rotation.z = -ease * 0.05;
    }
    if (frontRef.current) {
      // A parede frontal afunda no piso e some — é por ela que se enxerga o interior.
      frontRef.current.position.y = -ease * (h * 0.96);
      mats.front.opacity = 1 - (1 - GHOST_OPACITY) * ease;
    }
    if (sideRef.current) {
      sideRef.current.position.x = ease * (w * 0.55);
      mats.side.opacity = 1 - (1 - GHOST_OPACITY) * ease;
    }
    // Fechado, a parede precisa ser OPACA de verdade: material transparente entra na fila de
    // blending e deixaria a lâmina d'água interna vazar através da casca.
    const wantsBlend = ease > 0.01;
    for (const m of [mats.front, mats.side]) {
      if (m.transparent !== wantsBlend) {
        m.transparent = wantsBlend;
        m.needsUpdate = true;
      }
    }
    if (innerRef.current) innerRef.current.visible = o > 0.04;

    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = focus.current * 0.5;
      glowRef.current.visible = focus.current > 0.01;
    }
    mats.band.emissiveIntensity = 0.18 + focus.current * 0.9;
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    hoverStage(def.id);
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    hoverStage(null);
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectStage(def.id);
  };

  return (
    <group
      name={`modulo-${def.id}`}
      position={[def.x, def.floorY, def.z]}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
    >
      {/* Halo no piso indicando módulo sob foco/seleção */}
      <mesh ref={glowRef} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[Math.max(w, d) * 0.56, Math.max(w, d) * 0.66, 48]} />
        <meshBasicMaterial color={tint} transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Laje de fundação, com sapata aparente rente ao terraço */}
      <mesh position={[0, -0.13, 0]} receiveShadow castShadow material={mats.floor}>
        <boxGeometry args={[w + 0.34, 0.26, d + 0.34]} />
      </mesh>
      {/* Piso interno (fundo do tanque) */}
      <mesh position={[0, 0.02, 0]} receiveShadow material={mats.floor}>
        <boxGeometry args={[w - t * 2, 0.04, d - t * 2]} />
      </mesh>

      {/* Paredes fixas: fundo (-Z) e montante (-X) */}
      <mesh position={[0, h / 2, -d / 2 + t / 2]} castShadow receiveShadow material={mats.wall}>
        <boxGeometry args={[w, h, t]} />
      </mesh>
      <mesh position={[-w / 2 + t / 2, h / 2, 0]} castShadow receiveShadow material={mats.wall}>
        <boxGeometry args={[t, h, d]} />
      </mesh>

      {/* Parede frontal (+Z) — afunda ao abrir.
          Não é um painel maciço: é uma alvenaria com FAIXA DE VISORES na cota da lâmina
          d'água. Com a estação fechada, é por essas janelas que se vê a água correndo dentro
          de cada módulo — sem elas, "fechado" viraria uma fileira de caixas mudas. */}
      <group ref={frontRef}>
        {/* Peitoril (abaixo dos visores) */}
        <mesh position={[0, winY0 / 2, d / 2 - t / 2]} castShadow receiveShadow material={mats.front}>
          <boxGeometry args={[w, winY0, t]} />
        </mesh>
        {/* Verga (acima dos visores) */}
        <mesh
          position={[0, winY1 + (h - winY1) / 2, d / 2 - t / 2]}
          castShadow
          receiveShadow
          material={mats.front}
        >
          <boxGeometry args={[w, h - winY1, t]} />
        </mesh>
        {/* Montantes entre os visores */}
        {Array.from({ length: mullions + 1 }, (_, i) => (
          <mesh
            key={i}
            position={[-w / 2 + (i * w) / mullions, (winY0 + winY1) / 2, d / 2 - t / 2]}
            castShadow
            material={mats.front}
          >
            <boxGeometry args={[w / mullions - bay, winY1 - winY0, t]} />
          </mesh>
        ))}
        {/* Vidro laminado dos visores */}
        <mesh position={[0, (winY0 + winY1) / 2, d / 2 - t / 2]} material={mats.window}>
          <boxGeometry args={[w - 0.02, winY1 - winY0, t * 0.35]} />
        </mesh>
        {/* Faixa colorida da fase */}
        <mesh position={[0, h - 0.09, d / 2 - t / 2]} material={mats.band}>
          <boxGeometry args={[w + 0.02, 0.11, t + 0.03]} />
        </mesh>
        {/* Portão de inspeção e venezianas de ventilação */}
        <mesh position={[-w * 0.36, winY0 * 0.5, d / 2 + 0.01]} material={mats.roof}>
          <boxGeometry args={[w * 0.2, winY0 * 0.86, 0.03]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[w * 0.3, winY1 + 0.09 + i * 0.08, d / 2 + 0.01]} material={mats.roof}>
            <boxGeometry args={[w * 0.24, 0.04, 0.03]} />
          </mesh>
        ))}
      </group>

      {/* Parede jusante (+X) — desliza para fora ao abrir */}
      <group ref={sideRef}>
        <mesh position={[w / 2 - t / 2, h / 2, 0]} castShadow receiveShadow material={mats.side}>
          <boxGeometry args={[t, h, d]} />
        </mesh>
        <mesh position={[w / 2 - t / 2, h - 0.09, 0]} material={mats.band}>
          <boxGeometry args={[t + 0.03, 0.11, d + 0.02]} />
        </mesh>
      </group>

      {/* Cobertura — sobe e inclina ao abrir */}
      <group ref={roofRef} position={[0, h, 0]}>
        <Roof def={def} material={mats.roof} band={mats.band} />
      </group>

      {/* Internos: só existem visualmente com o módulo aberto */}
      <group ref={innerRef} visible={false}>
        {children}
      </group>

      {/* Fachada permanente (visível aberto ou fechado) */}
      {exterior}
    </group>
  );
}

/** Coberturas distintas por tipo de módulo — a silhueta ajuda a ler a estação de longe. */
function Roof({
  def,
  material,
  band,
}: {
  def: ModuleDef;
  material: THREE.Material;
  band: THREE.Material;
}) {
  const { w, d, roof } = def;

  if (roof === 'duas-aguas') {
    const slope = 0.42;
    return (
      <group>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[0, slope / 2, (s * d) / 4]}
            rotation={[-s * 0.34, 0, 0]}
            castShadow
            material={material}
          >
            <boxGeometry args={[w + 0.24, 0.09, d / 2 + 0.24]} />
          </mesh>
        ))}
        {/* Cumeeira */}
        <mesh position={[0, slope + 0.03, 0]} material={band}>
          <boxGeometry args={[w + 0.26, 0.06, 0.1]} />
        </mesh>
        {/* Lanternim de ventilação */}
        <mesh position={[w * 0.22, slope * 0.62, 0]} castShadow material={material}>
          <boxGeometry args={[w * 0.3, 0.16, 0.34]} />
        </mesh>
      </group>
    );
  }

  if (roof === 'abobada') {
    return (
      <group>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow material={material}>
          <cylinderGeometry args={[d / 2 + 0.1, d / 2 + 0.1, w + 0.2, 24, 1, false, 0, Math.PI]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} material={band}>
          <boxGeometry args={[w + 0.22, 0.05, 0.12]} />
        </mesh>
        {/* Escotilha de inspeção do reservatório */}
        <mesh position={[w * 0.2, d / 2 + 0.06, 0]} castShadow material={material}>
          <cylinderGeometry args={[0.16, 0.16, 0.14, 16]} />
        </mesh>
      </group>
    );
  }

  if (roof === 'torre') {
    return (
      <group>
        <mesh position={[0, 0.06, 0]} castShadow material={material}>
          <boxGeometry args={[w + 0.22, 0.12, d + 0.22]} />
        </mesh>
        {/* Platibanda técnica da torre */}
        {[
          [0, (d + 0.2) / 2],
          [0, -(d + 0.2) / 2],
        ].map(([bx, bz], i) => (
          <mesh key={i} position={[bx, 0.2, bz]} material={band}>
            <boxGeometry args={[w + 0.24, 0.16, 0.06]} />
          </mesh>
        ))}
      </group>
    );
  }

  // 'laje'
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow material={material}>
        <boxGeometry args={[w + 0.2, 0.1, d + 0.2]} />
      </mesh>
      <mesh position={[0, 0.16, (d + 0.18) / 2]} material={band}>
        <boxGeometry args={[w + 0.22, 0.12, 0.06]} />
      </mesh>
      {/* Claraboias */}
      {[-0.25, 0.25].map((f, i) => (
        <mesh key={i} position={[w * f, 0.13, 0]} material={material}>
          <boxGeometry args={[w * 0.18, 0.06, d * 0.3]} />
        </mesh>
      ))}
    </group>
  );
}
