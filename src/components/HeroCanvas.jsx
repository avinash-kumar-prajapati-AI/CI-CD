import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeStore } from '../store/themeStore';

function createNodeData(count, mobile) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const radius = mobile ? 1.15 + Math.random() * 0.8 : 1.4 + Math.random() * 1.1;
    return {
      angle,
      radius,
      depth: (Math.random() - 0.5) * (mobile ? 0.8 : 1.1),
      offset: Math.random() * Math.PI * 2,
      speed: 0.45 + Math.random() * 0.55,
      lift: 0.18 + Math.random() * 0.18
    };
  });
}

function createEdges(nodes, mobile) {
  const maxDistance = mobile ? 1.25 : 1.55;
  const edges = [];

  for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < nodes.length; targetIndex += 1) {
      const source = nodes[sourceIndex];
      const target = nodes[targetIndex];
      const sourceVector = new THREE.Vector3(
        Math.cos(source.angle) * source.radius,
        Math.sin(source.angle) * source.radius * 0.68,
        source.depth
      );
      const targetVector = new THREE.Vector3(
        Math.cos(target.angle) * target.radius,
        Math.sin(target.angle) * target.radius * 0.68,
        target.depth
      );

      if (sourceVector.distanceTo(targetVector) < maxDistance) {
        edges.push([sourceIndex, targetIndex]);
      }
    }
  }

  return edges;
}

function NeuralMesh({ mobile, palette }) {
  const nodeCount = mobile ? 26 : 42;
  const nodes = useMemo(() => createNodeData(nodeCount, mobile), [mobile, nodeCount]);
  const edges = useMemo(() => createEdges(nodes, mobile), [mobile, nodes]);
  const pointsRef = useRef(null);
  const linesRef = useRef(null);
  const glowRef = useRef(null);
  const pointerTarget = useRef(new THREE.Vector3());
  const pointerFollower = useRef(new THREE.Vector3());

  const pointPositions = useMemo(() => new Float32Array(nodeCount * 3), [nodeCount]);
  const linePositions = useMemo(() => new Float32Array(edges.length * 6), [edges.length]);
  const activePositions = useMemo(() => Array.from({ length: nodeCount }, () => new THREE.Vector3()), [nodeCount]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    pointerTarget.current.set(state.pointer.x * 2.1, state.pointer.y * 1.25, 0.15);
    pointerFollower.current.lerp(pointerTarget.current, 0.08);

    nodes.forEach((node, index) => {
      const wave = time * node.speed + node.offset;
      const x = Math.cos(node.angle + time * 0.08) * node.radius + Math.sin(wave) * 0.12;
      const y = Math.sin(node.angle + time * 0.11) * node.radius * 0.68 + Math.cos(wave * 1.1) * node.lift;
      const z = node.depth + Math.sin(wave * 0.7) * 0.18;

      const vector = activePositions[index];
      vector.set(x, y, z);

      const distanceToPointer = vector.distanceTo(pointerFollower.current);
      const influenceRadius = mobile ? 0.95 : 1.15;

      if (distanceToPointer < influenceRadius) {
        const pull = (influenceRadius - distanceToPointer) / influenceRadius;
        vector.lerp(pointerFollower.current, pull * 0.12);
        vector.z += pull * 0.22;
      }

      pointPositions[index * 3] = vector.x;
      pointPositions[index * 3 + 1] = vector.y;
      pointPositions[index * 3 + 2] = vector.z;
    });

    edges.forEach(([startIndex, endIndex], edgeIndex) => {
      const start = activePositions[startIndex];
      const end = activePositions[endIndex];
      const offset = edgeIndex * 6;

      linePositions[offset] = start.x;
      linePositions[offset + 1] = start.y;
      linePositions[offset + 2] = start.z;
      linePositions[offset + 3] = end.x;
      linePositions[offset + 4] = end.y;
      linePositions[offset + 5] = end.z;
    });

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.z = time * 0.05;
    }

    if (linesRef.current) {
      linesRef.current.geometry.attributes.position.needsUpdate = true;
      linesRef.current.rotation.z = time * 0.035;
    }

    if (glowRef.current) {
      glowRef.current.position.lerp(pointerFollower.current, 0.12);
      const pulse = 0.2 + (Math.sin(time * 2.4) + 1) * 0.04;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={pointPositions}
            count={pointPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={palette.node}
          size={mobile ? 0.045 : 0.05}
          sizeAttenuation
          transparent
          opacity={palette.nodeOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={palette.line}
          transparent
          opacity={mobile ? palette.lineOpacityMobile : palette.lineOpacityDesktop}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color={palette.glow}
          transparent
          opacity={palette.glowOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, -0.35]}>
        <ringGeometry args={[1.25, mobile ? 1.75 : 2.05, 64]} />
        <meshBasicMaterial
          color={palette.ring}
          transparent
          opacity={palette.ringOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function HeroCanvas() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  const { theme } = useThemeStore();

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const palette = useMemo(
    () =>
      theme === 'light'
        ? {
            background: '#edf3fa',
            fog: '#edf3fa',
            ambient: 0.86,
            keyLight: '#1d4ed8',
            fillLight: '#6d28d9',
            rimLight: '#ffffff',
            node: '#0f3d63',
            nodeOpacity: 0.96,
            line: '#1e40af',
            lineOpacityMobile: 0.32,
            lineOpacityDesktop: 0.36,
            glow: '#7c3aed',
            glowOpacity: 0.14,
            ring: '#334155',
            ringOpacity: 0.14
          }
        : {
            background: '#04050a',
            fog: '#04050a',
            ambient: 0.45,
            keyLight: '#00f5ff',
            fillLight: '#7b2fff',
            rimLight: '#ffffff',
            node: '#86fff8',
            nodeOpacity: 0.9,
            line: '#48dfff',
            lineOpacityMobile: 0.22,
            lineOpacityDesktop: 0.28,
            glow: '#7b2fff',
            glowOpacity: 0.14,
            ring: '#00f5ff',
            ringOpacity: 0.08
          },
    [theme]
  );

  return (
    <Canvas
      key={theme}
      camera={{ position: [0, 0, 4.4], fov: mobile ? 54 : 44 }}
      className="absolute inset-0"
      dpr={[1, 1.8]}
    >
      <color
        attach="background"
        args={[palette.background]}
      />
      <fog
        attach="fog"
        args={[palette.fog, 4.5, 8]}
      />
      <ambientLight intensity={palette.ambient} />
      <pointLight
        position={[2.2, 2, 2.5]}
        intensity={18}
        color={palette.keyLight}
      />
      <pointLight
        position={[-2.5, -1.4, 2.2]}
        intensity={16}
        color={palette.fillLight}
      />
      <pointLight
        position={[0, 0, 2.8]}
        intensity={8}
        color={palette.rimLight}
      />
      <NeuralMesh
        mobile={mobile}
        palette={palette}
      />
    </Canvas>
  );
}
