import React, { useEffect, useRef } from "react";

// Ondas em linha fina, animadas devagar, no fundo do hero.
// Puramente decorativo: não recebe cliques, pára quando sai do ecrã ou o
// separador fica escondido, e fica parado para quem tem "reduzir movimento".
const WAVES = {
    lines: 16, // número de linhas
    color: "25, 39, 200", // azul do site (RGB)
    opacity: 0.13, // bem transparente, para não fazer ruído atrás do nome
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
        // Só começa a animar depois de a página acabar de carregar (e com o
        // browser livre), para não disputar o processador no telemóvel.
        let started = false;
        const begin = () => {
            if (started || reduce) return;
            started = true;
            start();
        };
        let idleId = 0;
        const onLoad = () => {
            idleId =
                "requestIdleCallback" in window
                    ? window.requestIdleCallback(begin, { timeout: 2000 })
                    : setTimeout(begin, 800);
        };
        if (document.readyState === "complete") onLoad();
        else window.addEventListener("load", onLoad, { once: true });

        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting && !document.hidden;
            if (visible && started) start();
        });
        io.observe(canvas);
        const onVis = () => {
            visible = !document.hidden;
            if (visible && started) start();
        };
        const onResize = () => {
            resize();
            draw(performance.now());
        };
        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("load", onLoad);
            if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
            else clearTimeout(idleId);
            io.disconnect();
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
                // desvanece em cima e em baixo, para ficar só por trás do nome
                WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, #000 35%, #000 75%, transparent 100%)",
                maskImage:
                    "linear-gradient(to bottom, transparent 0%, #000 35%, #000 75%, transparent 100%)",
            }}
        />
    );
};

export default HeroWaves;
