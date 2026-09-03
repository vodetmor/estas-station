import { useEffect, useRef, type ElementRef } from 'react';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { BLOCK, MODULE_BY_ID } from './layout';
import { useStationStore } from '../state/store';

/**
 * Câmera ortográfica isométrica. A estação é uma calha MUITO comprida (7 terraços em fila),
 * então a câmera fica baixa e o enquadramento é calculado pela extensão real do bloco de
 * terreno — não por número mágico. Selecionar um módulo aproxima a mira dele.
 */

const SPAN_X = BLOCK.maxX - BLOCK.minX;
const SPAN_Z = BLOCK.maxZ - BLOCK.minZ;
const CENTER_X = (BLOCK.maxX + BLOCK.minX) / 2;

export function IsoCamera({ resetSignal }: { resetSignal: number }) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const cameraRef = useRef<ElementRef<typeof OrthographicCamera>>(null);
  const mounted = useRef(false);
  const autoRotate = useStationStore((s) => s.autoRotate);
  const selectedStageId = useStationStore((s) => s.selectedStageId);
  const { size } = useThree();

  // Numa isométrica simétrica o comprimento e a largura somam na horizontal projetada.
  const projected = (SPAN_X + SPAN_Z) * 0.74;
  const fit = Math.min(size.width / projected, size.height / (projected * 0.66));
  const zoom = Math.max(11, Math.min(34, fit));

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.zoom = zoom;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [zoom]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    controlsRef.current?.reset();
  }, [resetSignal]);

  // Mira: centro da estação quando nada está selecionado, o módulo escolhido quando há foco.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const m = selectedStageId ? MODULE_BY_ID[selectedStageId as keyof typeof MODULE_BY_ID] : null;
    const target = m ? [m.x, m.floorY + m.h * 0.4, m.z] : [CENTER_X + 0.3, 1.0, 0];
    controls.target.set(target[0], target[1], target[2]);
    controls.update();
  }, [selectedStageId]);

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[CENTER_X + 13, 12.5, 17]}
        zoom={zoom}
        near={0.1}
        far={400}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[CENTER_X + 0.3, 1.0, 0]}
        enablePan
        panSpeed={0.7}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.08}
        minZoom={9}
        maxZoom={190}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.9}
        autoRotate={autoRotate}
        autoRotateSpeed={0.35}
      />
    </>
  );
}
