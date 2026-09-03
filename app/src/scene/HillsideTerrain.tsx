import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Encosta montanhosa em corte isométrico (diorama arquitetônico e geotécnico).
 * Reproduz o corte transversal de engenharia da imagem de referência:
 * - Terreno natural inclinado com grama nos platôs e taludes;
 * - Corte lateral estratificado mostrando as camadas geológicas (solo orgânico, argila, rocha);
 * - Muros de arrimo e sapatas escalonadas de concreto armado que suportam as 5 fases da ESTAS.
 */
export function HillsideTerrain() {
  // Geometria da encosta com platôs esculpidos para cada terraço
  const { terrainGeometry, strataGeometry } = useMemo(() => {
    // Dimensões globais do bloco de terreno
    const minX = -9.2;
    const maxX = 9.8;
    const minZ = -4.8;
    const maxZ = 3.6;
    const bottomY = -2.2;

    // Função de altura do relevo da montanha base
    const getGroundY = (x: number, z: number) => {
      // Relevo desce de X = -9 (topo da serra, Y ~ 4.2) para X = +9 (vale/base, Y ~ -0.2)
      const slope = 4.2 - ((x - minX) / (maxX - minX)) * 4.4;
      // Pequena elevação na encosta posterior (Z < 0) e suave no primeiro plano
      const zFactor = Math.cos((z - minZ) / (maxZ - minZ) * Math.PI * 0.5) * 0.4;
      return slope + zFactor;
    };

    // 1. Malha da superfície de solo / gramado
    const segX = 40;
    const segZ = 24;
    const terrainPos: number[] = [];
    const terrainColors: number[] = [];
    const terrainIndices: number[] = [];

    const grassLight = new THREE.Color('#5c8f43');
    const grassDark = new THREE.Color('#466e33');
    const dirtColor = new THREE.Color('#544332');

    for (let j = 0; j <= segZ; j++) {
      const v = j / segZ;
      const z = minZ + v * (maxZ - minZ);
      for (let i = 0; i <= segX; i++) {
        const u = i / segX;
        const x = minX + u * (maxX - minX);

        // Se estiver na área das fundações centrais (onde ficam os tanques), rebaixa ligeiramente
        let y = getGroundY(x, z);

        // Fundações para cada fase
        if (x >= -7.8 && x <= -3.2 && z >= -2.8 && z <= 0.8) {
          y = Math.min(y, 2.9); // Platô Fase 1
        } else if (x >= -3.0 && x <= 1.2 && z >= -2.8 && z <= 0.9) {
          y = Math.min(y, 1.6); // Platô Fase 2
        } else if (x >= -0.8 && x <= 2.8 && z >= 0.8 && z <= 2.8) {
          y = Math.min(y, 1.2); // Platô Fase 3 (Cascata)
        } else if (x >= 2.0 && x <= 6.2 && z >= -1.2 && z <= 2.6) {
          y = Math.min(y, 0.5); // Platô Fase 4
        } else if (x >= 4.8 && x <= 8.8 && z >= -2.8 && z <= 1.2) {
          y = Math.min(y, -0.1); // Platô Fase 5
        }

        terrainPos.push(x, y, z);

        // Variação suave de cor de grama
        const noise = Math.sin(x * 2.5) * Math.cos(z * 3.0) * 0.15 + 0.5;
        const col = grassDark.clone().lerp(grassLight, noise);
        // Próximo aos cortes fica tom de terra
        if (z > maxZ - 0.3 || x > maxX - 0.4 || x < minX + 0.4) {
          col.lerp(dirtColor, 0.4);
        }
        terrainColors.push(col.r, col.g, col.b);
      }
    }

    const rowVerts = segX + 1;
    for (let j = 0; j < segZ; j++) {
      for (let i = 0; i < segX; i++) {
        const a = j * rowVerts + i;
        const b = a + 1;
        const c = a + rowVerts;
        const d = c + 1;
        terrainIndices.push(a, c, b, b, c, d);
      }
    }

    const tGeo = new THREE.BufferGeometry();
    tGeo.setAttribute('position', new THREE.Float32BufferAttribute(terrainPos, 3));
    tGeo.setAttribute('color', new THREE.Float32BufferAttribute(terrainColors, 3));
    tGeo.setIndex(terrainIndices);
    tGeo.computeVertexNormals();

    // 2. Corte geológico lateral (estratos de terra e rocha)
    // Mostra as camadas de subsolo ao longo das bordas cortadas (frente maxZ e laterais)
    const strataPos: number[] = [];
    const strataColors: number[] = [];
    const strataIndices: number[] = [];

    // Definir contorno da borda: frente (z = maxZ), lado direito (x = maxX), fundo (y = bottomY)
    const topsoilCol = new THREE.Color('#3b2b1d');
    const clayCol = new THREE.Color('#694d33');
    const rockCol = new THREE.Color('#423c37');
    const deepRockCol = new THREE.Color('#24211e');

    // Gerar faixa do corte frontal (x de minX a maxX na linha z = maxZ)
    const frontSegs = 32;
    for (let i = 0; i <= frontSegs; i++) {
      const u = i / frontSegs;
      const x = minX + u * (maxX - minX);
      const topY = getGroundY(x, maxZ);

      // 4 camadas verticais
      const y0 = topY;
      const y1 = topY - 0.5;
      const y2 = topY - 1.2;
      const y3 = bottomY;

      const idx = strataPos.length / 3;

      strataPos.push(x, y0, maxZ, x, y1, maxZ, x, y2, maxZ, x, y3, maxZ);
      strataColors.push(
        topsoilCol.r, topsoilCol.g, topsoilCol.b,
        clayCol.r, clayCol.g, clayCol.b,
        rockCol.r, rockCol.g, rockCol.b,
        deepRockCol.r, deepRockCol.g, deepRockCol.b,
      );

      if (i < frontSegs) {
        for (let l = 0; l < 3; l++) {
          const a = idx + l;
          const b = a + 4;
          const c = a + 1;
          const d = b + 1;
          strataIndices.push(a, b, c, b, d, c);
        }
      }
    }

    // Gerar faixa do corte lateral direito (z de minZ a maxZ na linha x = maxX)
    const sideSegs = 16;
    for (let j = 0; j <= sideSegs; j++) {
      const v = j / sideSegs;
      const z = minZ + v * (maxZ - minZ);
      const topY = getGroundY(maxX, z);

      const y0 = topY;
      const y1 = topY - 0.4;
      const y2 = topY - 1.0;
      const y3 = bottomY;

      const idx = strataPos.length / 3;

      strataPos.push(maxX, y0, z, maxX, y1, z, maxX, y2, z, maxX, y3, z);
      strataColors.push(
        topsoilCol.r, topsoilCol.g, topsoilCol.b,
        clayCol.r, clayCol.g, clayCol.b,
        rockCol.r, rockCol.g, rockCol.b,
        deepRockCol.r, deepRockCol.g, deepRockCol.b,
      );

      if (j < sideSegs) {
        for (let l = 0; l < 3; l++) {
          const a = idx + l;
          const b = a + 4;
          const c = a + 1;
          const d = b + 1;
          strataIndices.push(a, c, b, b, c, d);
        }
      }
    }

    // Fundo da caixa cortada
    const floorIdx = strataPos.length / 3;
    strataPos.push(
      minX, bottomY, minZ,
      maxX, bottomY, minZ,
      maxX, bottomY, maxZ,
      minX, bottomY, maxZ,
    );
    for (let k = 0; k < 4; k++) {
      strataColors.push(deepRockCol.r, deepRockCol.g, deepRockCol.b);
    }
    strataIndices.push(floorIdx, floorIdx + 2, floorIdx + 1, floorIdx, floorIdx + 3, floorIdx + 2);

    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.Float32BufferAttribute(strataPos, 3));
    sGeo.setAttribute('color', new THREE.Float32BufferAttribute(strataColors, 3));
    sGeo.setIndex(strataIndices);
    sGeo.computeVertexNormals();

    return { terrainGeometry: tGeo, strataGeometry: sGeo };
  }, []);

  return (
    <group name="hillside-terrain">
      {/* Superfície do relevo da montanha */}
      <mesh geometry={terrainGeometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0.04} />
      </mesh>

      {/* Corte transversal estratificado (geologia) */}
      <mesh geometry={strataGeometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.88} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>

      {/* Muro de contenção de concreto armado superior */}
      <mesh position={[-7.9, 3.4, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 1.4, 4.2]} />
        <meshStandardMaterial color="#888c89" roughness={0.7} metalness={0.12} />
      </mesh>

      {/* Muro de contenção entre Fase 1 e Fase 2 */}
      <mesh position={[-3.3, 2.5, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 1.6, 4.0]} />
        <meshStandardMaterial color="#7f8380" roughness={0.7} metalness={0.12} />
      </mesh>

      {/* Muro de contenção inferior ao lado do reservatório */}
      <mesh position={[4.6, 0.8, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 1.4, 3.8]} />
        <meshStandardMaterial color="#7a7e7c" roughness={0.7} metalness={0.12} />
      </mesh>

      {/* Drenos de encosta em concreto */}
      <mesh position={[-0.5, 1.8, -3.2]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[14.0, 0.15, 0.3]} />
        <meshStandardMaterial color="#6a6e6b" roughness={0.65} />
      </mesh>
    </group>
  );
}
