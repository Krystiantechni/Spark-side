import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Sparkles } from "@react-three/drei";

// Animowany distort-blob na hero. Lekka scena, ~150KB extra.
export default function HeroBlob() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 2]}
      className="!absolute inset-0"
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} color="#00D9FF" intensity={2} />
      <pointLight position={[-10, -10, -5]} color="#FF0080" intensity={1.5} />
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={2}>
        <mesh scale={1.7}>
          <icosahedronGeometry args={[1, 5]} />
          <MeshDistortMaterial
            color="#0A0A0F"
            distort={0.5}
            speed={2}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>
      </Float>
      <Sparkles count={60} scale={[8, 8, 8]} size={2} speed={0.4} color="#00D9FF" />
    </Canvas>
  );
}
