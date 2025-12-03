import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useRef, memo } from "react";
import * as THREE from "three";

function FloatingShape() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} scale={1.5}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color="#6AC1E8"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </Float>
    );
}

export const Scene3D = memo(function Scene3D() {
    return (
        <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-slate-950 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 1.5]}> {/* Limit pixel ratio for performance */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
                <FloatingShape />
            </Canvas>
        </div>
    );
});
