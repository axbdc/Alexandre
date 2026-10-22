import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// Texto gigante animado: quando o rato se aproxima, as letras fogem do cursor,
// esticam e inclinam, e voltam ao sítio com efeito de mola.
// - fit: ajusta o tamanho da letra para ocupar a largura toda do contentor.
// - Em ecrãs táteis ou com "reduzir movimento" fica estático.
const StretchText = ({ text, className = "", fit = true, max = 1.4, as: Tag = "div", ...rest }) => {
    const boxRef = useRef(null);
    const lineRef = useRef(null);
    const lettersRef = useRef([]);
    // só aparece quando a fonte final já chegou e o tamanho está certo (sem saltos)
    const [ready, setReady] = useState(false);

    // Ajustar à largura
    useLayoutEffect(() => {
        if (!fit) {
            setReady(true);
            return undefined;
        }
        const box = boxRef.current;
        const line = lineRef.current;
        if (!box || !line) return undefined;
        const resize = () => {
            line.style.fontSize = "100px";
            const w = line.scrollWidth;
            const avail = box.clientWidth;
            if (w > 0) line.style.fontSize = `${(100 * avail) / w}px`;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(box);
        let done = false;
        const show = () => {
            if (done) return;
            done = true;
            resize();
            setReady(true);
        };
        const fallback = setTimeout(show, 1500);
        if (document.fonts && document.fonts.load) {
            document.fonts.load('400 100px "Anton"').then(show).catch(show);
        } else show();
        return () => {
            ro.disconnect();
            clearTimeout(fallback);
        };
    }, [fit, text]);

    // Física das letras: perto do rato as letras "fogem" (afastam-se do cursor),
    // esticam na vertical e inclinam; quando o rato sai voltam com efeito de mola.
    useEffect(() => {
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const box = boxRef.current;
        if (!fine || reduce || !box) return undefined;

        const letters = lettersRef.current.filter(Boolean);
        const st = letters.map(() => ({ x: 0, y: 0, s: 1, r: 0, vx: 0, vy: 0, vs: 0, vr: 0, tx: 0, ty: 0, ts: 1, tr: 0 }));
        let centers = [];
        let raf = 0;
        let running = false;
        let px = -1e5;
        let py = -1e5;
        let inside = false;

        // centros das letras (sem transformações), medidos só quando é preciso
        const measure = () => {
            centers = letters.map((el) => {
                const prev = el.style.transform;
                el.style.transform = "none";
                const r = el.getBoundingClientRect();
                el.style.transform = prev;
                return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
            });
        };

        const K = 0.09; // rigidez da mola
        const D = 0.8; // amortecimento (menor = mais "gelatina")

        const tick = () => {
            let moving = false;
            for (let i = 0; i < letters.length; i++) {
                const a = st[i];
                a.vx = (a.vx + (a.tx - a.x) * K) * D;
                a.vy = (a.vy + (a.ty - a.y) * K) * D;
                a.vs = (a.vs + (a.ts - a.s) * K) * D;
                a.vr = (a.vr + (a.tr - a.r) * K) * D;
                a.x += a.vx;
                a.y += a.vy;
                a.s += a.vs;
                a.r += a.vr;
                if (
                    Math.abs(a.vx) + Math.abs(a.vy) + Math.abs(a.vs) * 50 + Math.abs(a.vr) > 0.02 ||
                    Math.abs(a.tx - a.x) + Math.abs(a.ty - a.y) > 0.2
                )
                    moving = true;
                letters[i].style.transform = `translate(${a.x.toFixed(2)}px, ${a.y.toFixed(2)}px) rotate(${a.r.toFixed(2)}deg) scaleY(${a.s.toFixed(3)})`;
            }
            if (moving) raf = requestAnimationFrame(tick);
            else running = false;
        };
        const kick = () => {
            if (!running) {
                running = true;
                raf = requestAnimationFrame(tick);
            }
        };

        const setTargets = () => {
            for (let i = 0; i < letters.length; i++) {
                const c = centers[i];
                const a = st[i];
                if (!c || !inside) {
                    a.tx = 0;
                    a.ty = 0;
                    a.ts = 1;
                    a.tr = 0;
                    continue;
                }
                const dx = c.x - px;
                const dy = c.y - py;
                const dist = Math.hypot(dx, dy) || 1;
                const R = c.h * 0.9; // raio de influência
                const f = Math.exp(-(dist * dist) / (2 * R * R));
                const push = c.h * 0.32 * f; // quanto foge
                a.tx = (dx / dist) * push;
                a.ty = (dy / dist) * push * 0.6;
                a.ts = 1 + (max - 1) * f;
                a.tr = (dx / dist) * 7 * f;
            }
            kick();
        };

        const onMove = (e) => {
            px = e.clientX;
            py = e.clientY;
            const r = box.getBoundingClientRect();
            const pad = r.height * 0.25;
            const now = px > r.left - pad && px < r.right + pad && py > r.top - pad && py < r.bottom + pad;
            if (now && !inside) measure();
            inside = now;
            setTargets();
        };
        const remeasure = () => {
            if (inside) measure();
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("scroll", remeasure, { passive: true });
        window.addEventListener("resize", remeasure);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("scroll", remeasure);
            window.removeEventListener("resize", remeasure);
        };
    }, [text, max]);

    lettersRef.current = [];
    const chars = Array.from(text);

    return (
        <Tag ref={boxRef} className={`stretch-text ${ready ? "is-ready" : ""} ${className}`} aria-label={text} {...rest}>
            <span ref={lineRef} className="stretch-line" aria-hidden="true">
                {chars.map((ch, i) =>
                    ch === " " ? (
                        <span key={i} className="stretch-space"> </span>
                    ) : (
                        <span key={i} ref={(el) => (lettersRef.current[i] = el)} className="stretch-letter">
                            {/* a animação de entrada fica num span interior, para não
                                bloquear o transform da física (as animações CSS ganham ao style) */}
                            <span className="stretch-in" style={{ animationDelay: `${i * 35}ms` }}>
                                {ch}
                            </span>
                        </span>
                    ),
                )}
            </span>
        </Tag>
    );
};

export default StretchText;
