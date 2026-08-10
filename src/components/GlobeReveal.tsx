import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const GlobeMesh: React.FC = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/textures/earth.jpg');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group position={[0, 0, -2]}>
      {/* Outer Atmosphere Layer */}
      <Sphere args={[2.6, 64, 64]}>
        <meshStandardMaterial 
          color="#1E3A8A" 
          transparent={true} 
          opacity={0.15} 
          roughness={1}
        />
      </Sphere>
      
      {/* Core Planet */}
      <Sphere ref={sphereRef} args={[2.5, 64, 64]}>
        <meshStandardMaterial 
          color={isDarkMode ? '#050B14' : '#0B192C'} 
          roughness={0.4} 
          metalness={0.2}
          emissiveMap={texture}
          emissive="#D97736"
          emissiveIntensity={1.5}
        />
      </Sphere>
    </group>
  );
};

const AirplaneModel = React.forwardRef<THREE.Group, any>((props, ref) => (
  <group ref={ref} {...props}>
    {/* Fuselage */}
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 16]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.4} roughness={0.2} />
      </mesh>
    </group>
    {/* Wings */}
    <mesh position={[0, 0, -0.02]}>
      <boxGeometry args={[0.2, 0.005, 0.06]} />
      <meshStandardMaterial color="#E5E7EB" metalness={0.5} roughness={0.2} />
    </mesh>
    {/* Tail */}
    <mesh position={[0, 0.03, -0.08]}>
      <boxGeometry args={[0.005, 0.06, 0.04]} />
      <meshStandardMaterial color="#D97736" />
    </mesh>
  </group>
));

const ShipModel = React.forwardRef<THREE.Group, any>((props, ref) => (
  <group ref={ref} {...props}>
    {/* Hull */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.06, 0.04, 0.24]} />
      <meshStandardMaterial color="#0B192C" metalness={0.2} roughness={0.8} />
    </mesh>
    {/* Deck 1 */}
    <mesh position={[0, 0.03, -0.02]}>
      <boxGeometry args={[0.05, 0.02, 0.16]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    {/* Deck 2 */}
    <mesh position={[0, 0.05, -0.04]}>
      <boxGeometry args={[0.04, 0.02, 0.1]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    {/* Funnel */}
    <mesh position={[0, 0.07, -0.06]}>
      <cylinderGeometry args={[0.006, 0.006, 0.04]} />
      <meshStandardMaterial color="#D97736" />
    </mesh>
  </group>
));

const TrainModel = React.forwardRef<THREE.Group, any>((props, ref) => (
  <group ref={ref} {...props}>
    {/* Engine Body */}
    <mesh position={[0, 0, 0.08]}>
      <boxGeometry args={[0.03, 0.04, 0.08]} />
      <meshStandardMaterial color="#333333" />
    </mesh>
    {/* Boiler */}
    <group position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.04]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
    {/* Cabin Roof */}
    <mesh position={[0, 0.025, 0.06]}>
      <boxGeometry args={[0.035, 0.01, 0.04]} />
      <meshStandardMaterial color="#D97736" />
    </mesh>
    {/* Carriage 1 */}
    <mesh position={[0, 0, -0.02]}>
      <boxGeometry args={[0.03, 0.035, 0.08]} />
      <meshStandardMaterial color="#444444" />
    </mesh>
    {/* Carriage 2 */}
    <mesh position={[0, 0, -0.11]}>
      <boxGeometry args={[0.03, 0.035, 0.08]} />
      <meshStandardMaterial color="#444444" />
    </mesh>
  </group>
));

const OrbitingTransits: React.FC = () => {
  const airplaneRef = useRef<THREE.Group>(null);
  const shipRef = useRef<THREE.Group>(null);
  const trainRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Airplane: high altitude (radius 3.0)
    if (airplaneRef.current) {
      airplaneRef.current.position.x = Math.cos(t * 0.4) * 3.0;
      airplaneRef.current.position.y = Math.sin(t * 0.2) * 1.5;
      airplaneRef.current.position.z = Math.sin(t * 0.4) * 3.0;
      
      const nextX = Math.cos((t + 0.01) * 0.4) * 3.0;
      const nextY = Math.sin((t + 0.01) * 0.2) * 1.5;
      const nextZ = Math.sin((t + 0.01) * 0.4) * 3.0;
      
      airplaneRef.current.up.copy(airplaneRef.current.position).normalize();
      airplaneRef.current.lookAt(nextX, nextY, nextZ);
    }
    
    // Ship: surface (radius 2.5)
    if (shipRef.current) {
      shipRef.current.position.x = Math.sin(t * 0.2) * 2.5;
      shipRef.current.position.y = -0.3; // slightly offset from equator
      shipRef.current.position.z = Math.cos(t * 0.2) * 2.5;
      
      const nextX = Math.sin((t + 0.01) * 0.2) * 2.5;
      const nextZ = Math.cos((t + 0.01) * 0.2) * 2.5;
      
      shipRef.current.up.copy(shipRef.current.position).normalize();
      shipRef.current.lookAt(nextX, -0.3, nextZ);
    }

    // Train: surface (radius 2.52) - Latitude tracking
    if (trainRef.current) {
      trainRef.current.position.x = Math.cos(t * 0.3 + Math.PI) * 2.52;
      trainRef.current.position.y = Math.sin(t * 0.3) * 2.52;
      trainRef.current.position.z = Math.sin(t * 0.3 + Math.PI) * 2.52;
      
      const nextX = Math.cos((t + 0.01) * 0.3 + Math.PI) * 2.52;
      const nextY = Math.sin((t + 0.01) * 0.3) * 2.52;
      const nextZ = Math.sin((t + 0.01) * 0.3 + Math.PI) * 2.52;
      
      trainRef.current.up.copy(trainRef.current.position).normalize();
      trainRef.current.lookAt(nextX, nextY, nextZ);
    }
  });

  return (
    <group position={[0, 0, -2]}>
      <AirplaneModel ref={airplaneRef} />
      <ShipModel ref={shipRef} />
      <TrainModel ref={trainRef} />
    </group>
  );
};

const SolarTerminatorLight = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      const now = new Date();
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();
      const timeInHours = hours + minutes / 60 + seconds / 3600;
      
      // Calculate realistic solar angle based on 24h UTC cycle
      const angle = (timeInHours / 24) * Math.PI * 2 + Math.PI; 
      
      const distance = 15;
      lightRef.current.position.x = Math.cos(angle) * distance;
      lightRef.current.position.z = Math.sin(angle) * distance;
      lightRef.current.position.y = 2;
    }
  });

  return <directionalLight ref={lightRef} intensity={2.5} castShadow />;
};

export const GlobeReveal: React.FC = () => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 7], fov: 45 }}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ backgroundColor: 'var(--bg-color)', height: '100vh', width: '100vw' }}
    >
      <ambientLight intensity={0.5} />
      <SolarTerminatorLight />
      <GlobeMesh />
      <OrbitingTransits />
    </Canvas>
  );
};
