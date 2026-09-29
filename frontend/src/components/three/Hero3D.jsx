import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Icosahedron } from "@react-three/drei";

/**
 * Abstract 3D piece for the hero. Purely decorative: sits behind the
 * copy, never intercepts clicks (canvas + wrapper are pointer-events:none),
 * and is skipped entirely below the md breakpoint and for anyone with
 * "reduce motion" set, so it never costs a mobile visitor anything.
 */
const DriftingShape = () => {
    const group = useRef(null);
    const mouse = useRef({ x: 0, y: 0 });

    useFrame((state, delta) => {
        if (!group.current) return;
        // Slow constant spin…
        group.current.rotation.y += delta * 0.12;
        group.current.rotation.x += delta * 0.05;
        // …plus a gentle pull toward the cursor for a subtle parallax feel.
        const targetX = mouse.current.y * 0.25;
        const targetY = mouse.current.x * 0.25;
        group.current.rotation.x += (targetX - group.current.rotation.x) * 0.02;
        group.current.rotation.y += (targetY - group.current.rotation.y) * 0.02;
    });

    React.useEffect(() => {
        const onMove = (e) => {
            mouse.current = {
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1,
            };
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    return (
        <group ref={group}>
            <Icosahedron args={[1.6, 4]}>
                <MeshDistortMaterial
                    color="#A85B48"
                    roughness={0.25}
                    metalness={0.1}
                    distort={0.35}
                    speed={1.4}
                    wireframe
                    transparent
                    opacity={0.5}
                />
            </Icosahedron>
            <Icosahedron args={[1.05, 2]}>
                <meshStandardMaterial
                    color="#1C1B1A"
                    roughness={0.35}
                    transparent
                    opacity={0.06}
                />
            </Icosahedron>
        </group>
    );
};

const Hero3D = () => {
    const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return null;

    return (
        <div
            aria-hidden="true"
            data-testid="hero-3d"
            className="pointer-events-none absolute right-[-4%] top-[2%] hidden md:block w-[calc(38vw/var(--site-zoom))] max-w-[560px] aspect-square opacity-90"
        >
            <Suspense fallback={null}>
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 40 }}
                    gl={{ alpha: true, antialias: true }}
                    dpr={[1, 1.75]}
                >
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[3, 3, 4]} intensity={0.6} />
                    <DriftingShape />
                </Canvas>
            </Suspense>
        </div>
    );
};

export default Hero3D;
