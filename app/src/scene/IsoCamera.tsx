import { useEffect, useRef, type ElementRef } from 'react';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { STATION_LENGTH, STATION_WIDTH, ELEV_SCALE } from './stationConfig';
import { useStationStore } from '../state/store';

/**
 * Câmera ortográfica isométrica, adaptada do app da fazenda: lá a "pegada" era ~quadrada e a
 * câmera olhava quase de cima; aqui a estação é uma calha comprida e alta (degraus), então a
 * câmera fica mais baixa (mais horizontal) para mostrar a face de cada terraço, não só o topo.
 */
export function IsoCamera({ resetSignal }: { resetSignal: number }) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const cameraRef = useRef<ElementRef<typeof OrthographicCamera>>(null);
  const mounted = useRef(false);
  const autoRotate = useStationStore((s) => s.autoRotate);
  const { size } = useThree();

  // Extensão projetada aproximada: comprimento + largura contribuem para o espalhamento
  // horizontal na isométrica simétrica; a altura entra na vertical.
  const projectedSpan = (STATION_LENGTH + STATION_WIDTH) * 0.62;
  const fitZoom = Math.min(size.width / projectedSpan, size.height / (projectedSpan * 0.62 + ELEV_SCALE));
  const zoom = Math.max(16, Math.min(60, fitZoom));

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

  return (
    <>
      <OrthographicCamera ref={cameraRef} makeDefault position={[13, 7, 10]} zoom={zoom} near={0.1} far={300} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        panSpeed={0.6}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.25}
        minZoom={12}
        maxZoom={160}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.9}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />
    </>
  );
}
