import React, { useEffect, useLayoutEffect, useRef } from "react";

// Texto gigante em que as letras "esticam" na vertical quando o rato passa
// por cima (a letra mais perto do rato cresce mais e as vizinhas um pouco).
// - fit: ajusta o tamanho da letra para ocupar a largura toda do contentor.
// - Em ecrãs táteis ou com "reduzir movimento" fica estático.
const StretchText = ({ text, className = "", fit = true, max = 1.45, as: Tag = "div", ...rest }) => {
    const boxRef = useRef(null);
    const lineRef = useRef(null);
    const lettersRef = useRef([]);

    // Ajustar à largura
    useLayoutEffect(() => {
        if (!fit) return undefined;
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
        // as fontes chegam depois: voltar a medir
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize).catch(() => {});
        return () => ro.disconnect();
    }, [fit, text]);

    useEffect(() => {
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const box = boxRef.current;
        if (!fine || reduce || !box) return undefined;

        const letters = lettersRef.current.filter(Boolean);
        const cur = letters.map(() => 1);
        const target = letters.map(() => 1);
        let raf = 0;
        let running = false;

        const tick = () => {
            let moving = false;
            for (let i = 0; i < letters.length; i++) {
                cur[i] += (target[i] - cur[i]) * 0.18;
                if (Math.abs(target[i] - cur[i]) > 0.002) moving = true;
                letters[i].style.transform = `scaleY(${cur[i].toFixed(3)})`;
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

        const onMove = (e) => {
            const x = e.clientX;
            letters.forEach((el, i) => {
                const r = el.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const d = Math.abs(x - cx) / Math.max(r.width, 1);
                target[i] = 1 + (max - 1) * Math.exp(-(d * d) / 1.6);
            });
            kick();
        };
        const onLeave = () => {
            for (let i = 0; i < target.length; i++) target[i] = 1;
            kick();
        };

        box.addEventListener("pointermove", onMove);
        box.addEventListener("pointerleave", onLeave);
        return () => {
            cancelAnimationFrame(raf);
            box.removeEventListener("pointermove", onMove);
            box.removeEventListener("pointerleave", onLeave);
        };
    }, [text, max]);

    lettersRef.current = [];
    const chars = Array.from(text);

    return (
        <Tag ref={boxRef} className={`stretch-text ${className}`} aria-label={text} {...rest}>
            <span ref={lineRef} className="stretch-line" aria-hidden="true">
                {chars.map((ch, i) =>
                    ch === " " ? (
                        <span key={i} className="stretch-space"> </span>
                    ) : (
                        <span
                            key={i}
                            ref={(el) => (lettersRef.current[i] = el)}
                            className="stretch-letter"
                            style={{ animationDelay: `${i * 35}ms` }}
                        >
                            {ch}
                        </span>
                    ),
                )}
            </span>
        </Tag>
    );
};

export default StretchText;
