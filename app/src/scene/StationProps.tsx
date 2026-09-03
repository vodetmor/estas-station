import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Equipamentos eletromecânicos, químicos e biológicos internos da ESTAS.
 * Visíveis por padrão na maquete em corte (como na planta técnica de referência):
 * - Fase 1: Camadas do leito filtrante (brita, areia, antracito), 3 eletroímãs industriais;
 * - Fase 2: Agitadores mecânicos rotativos, telas/painéis de bio-sorção, dosador de biossurfactantes;
 * - Fase 3: Coifa e chaminé do sistema de exaustão de gases (CO2/H2S);
 * - Fase 4: Tubos emissores UV-C com brilho violáceo e racks de membranas cerâmicas com AgNPs;
 * - Fase 5: Cartuchos minerais de calcita/dolomita, barramento de pH e tubulação de distribuição pública.
 */
export function StationProps() {
  const agitatorRef1 = useRef<THREE.Group>(null);
  const agitatorRef2 = useRef<THREE.Group>(null);
  const uvLampsRef = useRef<THREE.Group>(null);

  // Animação dos agitadores mecânicos dos tanques de biossurfactante
  useFrame(({ clock }, delta) => {
    if (agitatorRef1.current) agitatorRef1.current.rotation.y += delta * 1.5;
    if (agitatorRef2.current) agitatorRef2.current.rotation.y -= delta * 1.2;

    // Pulsação sutil da radiação UV-C germicida
    if (uvLampsRef.current) {
      const pulse = 1.6 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
      uvLampsRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = pulse;
        }
      });
    }
  });

  return (
    <group name="station-props">
      {/* ========================================================================= */}
      {/* FASE 1: FILTRAÇÃO FÍSICA E MAGNÉTICA                                      */}
      {/* ========================================================================= */}
      <group position={[-6.2, 3.2, -1.2]}>
        {/* Grades metálicas de retenção de sólidos grosseiros */}
        {[-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].map((dz, i) => (
          <mesh key={i} position={[-1.0, 0.2, dz]}>
            <boxGeometry args={[0.02, 0.45, 0.02]} />
            <meshStandardMaterial color="#b0b5b3" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Leito filtrante tríplice estratificado com 3 camadas visíveis */}
        {/* Camada inferior: Brita graduada */}
        <mesh position={[0.05, -0.2, 0]}>
          <boxGeometry args={[2.0, 0.16, 1.9]} />
          <meshStandardMaterial color="#635c52" roughness={0.95} />
        </mesh>
        {/* Camada intermediária: Areia quartzosa */}
        <mesh position={[0.05, -0.06, 0]}>
          <boxGeometry args={[2.0, 0.12, 1.9]} />
          <meshStandardMaterial color="#d4b46a" roughness={0.9} />
        </mesh>
        {/* Camada superior: Carvão antracito */}
        <mesh position={[0.05, 0.04, 0]}>
          <boxGeometry args={[2.0, 0.08, 1.9]} />
          <meshStandardMaterial color="#222324" roughness={0.85} />
        </mesh>
      </group>

      {/* Conjunto de 3 Eletroímãs de Alta Intensidade */}
      <group position={[-4.3, 2.9, -0.9]}>
        {[-0.75, 0, 0.75].map((dz, i) => (
          <group key={i} position={[0, 0.12, dz]}>
            {/* Núcleo ferromagnético central */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.7, 16]} />
              <meshStandardMaterial color="#2d333b" metalness={0.75} roughness={0.3} />
            </mesh>
            {/* Bobina de enrolamento de cobre de alta indução */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.46, 16]} />
              <meshStandardMaterial color="#b86d38" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Suporte de fixação e cabeçote elétrico com LED de status */}
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[0.2, 0.16, 0.2]} />
              <meshStandardMaterial color="#1f2329" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* FASE 2: CASA DO BIOSSURFACTANTE (REATORES & PAINÉIS DE BIO-SORÇÃO)        */}
      {/* ========================================================================= */}
      <group position={[-1.2, 1.9, -0.8]}>
        {/* Agitador mecânico 1 (Tanque A) */}
        <group ref={agitatorRef1} position={[-0.9, 0.15, -0.2]}>
          {/* Eixo vertical */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.8, 12]} />
            <meshStandardMaterial color="#c2c7c5" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Pás do rotor/impelidor */}
          {[-1, 1].map((dir, i) => (
            <mesh key={i} position={[dir * 0.22, -0.2, 0]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.38, 0.1, 0.02]} />
              <meshStandardMaterial color="#3b6978" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
          {/* Pás transversais */}
          {[-1, 1].map((dir, i) => (
            <mesh key={i} position={[0, -0.2, dir * 0.22]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.02, 0.1, 0.38]} />
              <meshStandardMaterial color="#3b6978" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
        {/* Motor de acionamento do agitador 1 */}
        <mesh position={[-0.9, 0.72, -0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.18, 12]} />
          <meshStandardMaterial color="#1f4b59" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Agitador mecânico 2 (Tanque B) */}
        <group ref={agitatorRef2} position={[0.9, 0.15, 0.2]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.8, 12]} />
            <meshStandardMaterial color="#c2c7c5" metalness={0.8} roughness={0.2} />
          </mesh>
          {[-1, 1].map((dir, i) => (
            <mesh key={i} position={[dir * 0.22, -0.2, 0]} rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.38, 0.1, 0.02]} />
              <meshStandardMaterial color="#3b6978" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
        {/* Motor de acionamento do agitador 2 */}
        <mesh position={[0.9, 0.72, 0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.18, 12]} />
          <meshStandardMaterial color="#1f4b59" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Painéis verticais de bio-sorção imobilizada com biossurfactantes */}
        {/* Painel montado na parede traseira */}
        <mesh position={[-0.9, 0.1, -1.14]}>
          <boxGeometry args={[1.1, 0.65, 0.04]} />
          <meshStandardMaterial color="#2d7350" roughness={0.8} />
        </mesh>
        <mesh position={[0.9, 0.1, -1.14]}>
          <boxGeometry args={[1.1, 0.65, 0.04]} />
          <meshStandardMaterial color="#2d7350" roughness={0.8} />
        </mesh>
        {/* Painéis montados nas paredes defletoras */}
        <mesh position={[-0.49, 0.1, -0.2]}>
          <boxGeometry args={[0.03, 0.6, 1.4]} />
          <meshStandardMaterial color="#246344" roughness={0.8} />
        </mesh>
        <mesh position={[0.69, 0.1, 0.2]}>
          <boxGeometry args={[0.03, 0.6, 1.4]} />
          <meshStandardMaterial color="#246344" roughness={0.8} />
        </mesh>

        {/* Dosador de biossurfactantes com bomba dosadora e visor */}
        <mesh position={[-1.3, 0.75, 0.9]}>
          <cylinderGeometry args={[0.12, 0.12, 0.35, 12]} />
          <meshStandardMaterial color="#3ea8cf" roughness={0.3} metalness={0.2} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-1.3, 0.52, 0.9]}>
          <boxGeometry args={[0.18, 0.15, 0.18]} />
          <meshStandardMaterial color="#2b3133" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 3: TORRE DE DESGASEIFICAÇÃO EM CASCATA                               */}
      {/* ========================================================================= */}
      <group position={[0.8, 1.4, 1.5]}>
        {/* Coifa metálica do sistema de exaustão sobre a cascata */}
        <mesh position={[-0.5, 0.95, 0]}>
          <boxGeometry args={[1.1, 0.15, 1.05]} />
          <meshStandardMaterial color="#7a8280" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[-0.5, 1.15, 0]}>
          <coneGeometry args={[0.3, 0.35, 12]} />
          <meshStandardMaterial color="#6a7270" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Duto de exaustão vertical com chapéu chinês para liberação segura de CO2/H2S */}
        <mesh position={[-0.5, 1.6, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.6, 12]} />
          <meshStandardMaterial color="#889290" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh position={[-0.5, 1.95, 0]}>
          <coneGeometry args={[0.18, 0.1, 12]} />
          <meshStandardMaterial color="#555c5a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* FASE 4: DESINFECÇÃO FOTÔNICA E NANO (UV-C E MEMBRANAS DE AG/QUITOSANA)    */}
      {/* ========================================================================= */}
      <group position={[3.6, 0.75, 0.6]}>
        {/* Lâmpadas germicidas UV-C (200-280 nm) com emissão violácea */}
        <group ref={uvLampsRef}>
          {[-0.55, 0.55].map((dz, ch) => (
            <group key={ch} position={[0, 0, dz]}>
              {[-0.15, 0.15].map((dy, l) => (
                <mesh key={l} position={[0, dy, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.022, 0.022, 2.2, 12]} />
                  <meshStandardMaterial
                    color="#b975ff"
                    emissive="#9d4edd"
                    emissiveIntensity={1.8}
                    roughness={0.15}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* Suportes e flanges das lâmpadas UV */}
        {[-0.55, 0.55].map((dz, ch) => (
          <group key={ch} position={[0, 0, dz]}>
            {[-1.0, 0.0, 1.0].map((dx, i) => (
              <mesh key={i} position={[dx, 0.0, 0]}>
                <boxGeometry args={[0.06, 0.38, 0.78]} />
                <meshStandardMaterial color="#aab0ad" metalness={0.8} roughness={0.25} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Módulos de membranas cerâmicas com nanopartículas de prata e quitosana */}
        <group position={[1.2, 0.02, 0]}>
          {[-0.55, 0.55].map((dz, ch) => (
            <group key={ch} position={[0, 0, dz]}>
              {[0, 1, 2, 3].map((k) => (
                <mesh key={k} position={[k * 0.04 - 0.06, 0, 0]}>
                  <boxGeometry args={[0.02, 0.34, 0.72]} />
                  <meshStandardMaterial color="#dedad0" roughness={0.65} metalness={0.2} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </group>

      {/* ========================================================================= */}
      {/* FASE 5: AJUSTE FINAL, PH E RESERVATÓRIO (360.000 L/H)                     */}
      {/* ========================================================================= */}
      <group position={[6.6, 0.1, -0.8]}>
        {/* Cartuchos de Remineralização (calcita e dolomita para aporte de Ca e Mg) */}
        {[-0.8, -0.4, 0.0].map((dx, i) => (
          <group key={i} position={[dx, 0.18, -0.8]}>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 0.65, 16]} />
              <meshStandardMaterial color="#d4ccbe" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.36, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
              <meshStandardMaterial color="#3ea8cf" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Barramento de tubulações de ajuste de pH com válvulas e dosagem */}
        <group position={[0.6, 0.45, -0.8]}>
          {/* Tubulação horizontal */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 1.4, 12]} />
            <meshStandardMaterial color="#2374ab" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Válvulas manuais de controle com volantes vermelhos */}
          {[-0.4, 0.1, 0.5].map((dx, i) => (
            <group key={i} position={[dx, 0, 0]}>
              <mesh position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
                <meshStandardMaterial color="#e5e7eb" metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.045, 0.012, 8, 16]} />
                <meshStandardMaterial color="#dc2626" roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Tubulação principal de saída de água potável (Distribuição Pública) */}
        <group position={[1.6, -0.25, 0.3]}>
          {/* Tubo flangeado azul de grande diâmetro */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.9, 16]} />
            <meshStandardMaterial color="#1e5f8a" metalness={0.65} roughness={0.3} />
          </mesh>
          {/* Flange de fixação */}
          <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.04, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Válvula de gaveta/borboleta com atuador */}
          <mesh position={[0.1, 0.16, 0]}>
            <boxGeometry args={[0.12, 0.22, 0.12]} />
            <meshStandardMaterial color="#0f766e" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
