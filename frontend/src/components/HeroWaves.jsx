import React, { useEffect, useRef } from "react";

// Ondas em linha fina, animadas devagar, no fundo do hero.
// Puramente decorativo: não recebe cliques, pára quando sai do ecrã ou o
// separador fica escondido, e fica parado para quem tem "reduzir movimento".
const WAVES = {
    lines: 16, // número de linhas
    color: "214, 199, 170", // creme (RGB)
    opacity: 0.55, // intensidade máxima das linhas
    speed: 0.00018, // velocidade (mais alto = mais rápido)
    amplitude: 52, // altura das ondas (px)
};

const HeroWaves = () => {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let w = 0;
        let h = 0;
        let raf = 0;
        let visible = true;
        let t0 = performance.now();

        const resize = () => {
            const zoom =
                parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue("--site-zoom"),
                ) || 1;
            const dpr = Math.min(window.devicePixelRatio || 1, 2) * zoom;
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = (now) => {
            const t = (now - t0) * WAVES.speed;
            ctx.clearRect(0, 0, w, h);
            ctx.lineWidth = 1;
            const n = WAVES.lines;
            for (let i = 0; i < n; i++) {
                const p = i / (n - 1);
                const baseY = h * (0.18 + p * 0.72);
                const amp = WAVES.amplitude * (0.55 + 0.45 * Math.sin(p * Math.PI));
                const alpha = WAVES.opacity * (0.35 + 0.65 * Math.sin(p * Math.PI));
                ctx.strokeStyle = `rgba(${WAVES.color}, ${alpha.toFixed(3)})`;
                ctx.beginPath();
                for (let x = 0; x <= w; x += 6) {
                    const k = x / w;
                    const y =
                        baseY +
                        Math.sin(k * 5.2 + t * 6 + p * 2.4) * amp * 0.6 +
                        Math.sin(k * 2.1 - t * 4 + p * 5.1) * amp * 0.4;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        };

        const loop = (now) => {
            draw(now);
            if (visible && !reduce) raf = requestAnimationFrame(loop);
        };
        const start = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(loop);
        };

        resize();
        draw(performance.now());
        if (!reduce) start();

        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting && !document.hidden;
            if (visible && !reduce) start();
        });
        io.observe(canvas);
        const onVis = () => {
            visible = !document.hidden;
            if (visible && !reduce) start();
        };
        const onResize = () => {
            resize();
            draw(performance.now());
        };
        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            aria-hidden="true"
            data-testid="hero-waves"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
                // mais visível à direita, desvanece por trás do texto
                WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 35%, #000 70%)",
                maskImage:
                    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 35%, #000 70%)",
            }}
        />
    );
};

export default HeroWaves;
