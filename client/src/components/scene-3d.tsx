import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Edges } from "@react-three/drei";
import { useRef, memo, useState, useEffect } from "react";
import * as THREE from "three";

interface FloatingShapeProps {
    position?: [number, number, number];
    color?: string;
    speed?: number;
    rotationSpeed?: number;
    scale?: number;
}

function FloatingShape({ position = [0, 0, 0], color = "#6AC1E8", speed = 1, rotationSpeed = 1, scale = 1 }: FloatingShapeProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2 * rotationSpeed;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3 * rotationSpeed;
        }
    });

    return (
        <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
            <mesh ref={meshRef} scale={scale}>
                <icosahedronGeometry args={[1, 0]} />
                <meshBasicMaterial visible={false} />
                <Edges
                    scale={1.0}
                    threshold={15}
                    color={color}
                    lineWidth={2}
                />
            </mesh>
        </Float>
    );
}

export const Scene3D = memo(function Scene3D() {
    const [mounted, setMounted] = useState(false);
    const [ready, setReady] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 500);

        const handleBeforeUnload = () => {
            if (containerRef.current) {
                containerRef.current.style.opacity = '0';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 bg-slate-950 pointer-events-none" style={{ backgroundColor: '#020617' }}>
            {mounted && (
                <div ref={containerRef} className={`w-full h-full transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                    <Canvas
                        camera={{ position: [0, 0, 10] }}
                        dpr={[1, 1.5]}
                        gl={{ alpha: false, antialias: true }}
                        onCreated={({ gl }) => {
                            gl.setClearColor('#020617');
                            gl.clear();
                            // Small delay to ensure first frame is painted
                            requestAnimationFrame(() => {
                                setReady(true);
                            });
                        }}
                    >
                        <color attach="background" args={['#020617']} />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />

                        {/* Left side shape */}
                        <FloatingShape position={[-9, 2, 0]} color="#6AC1E8" speed={1.5} rotationSpeed={1} scale={2} />

                        {/* Right side shape (upper) */}
                        <FloatingShape position={[9, 3, -2]} color="#6AC1E8" speed={2} rotationSpeed={1.5} scale={1.5} />

                        {/* Right side shape (lower) */}
                        <FloatingShape position={[10, -3, 0]} color="#3B82F6" speed={1} rotationSpeed={0.8} scale={2.2} />
                    </Canvas>
                </div>
            )}
        </div>
    );
});
