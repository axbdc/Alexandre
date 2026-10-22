import React, { useEffect, useRef } from "react";

// Frase que "acende" palavra a palavra à medida que se faz scroll.
const WordReveal = ({ text, className = "" }) => {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const words = Array.from(el.querySelectorAll(".wr-word"));
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
            words.forEach((w) => w.classList.add("lit"));
            return undefined;
        }
        let raf = 0;
        const update = () => {
            const r = el.getBoundingClientRect();
            const vh = window.innerHeight;
            // começa quando o topo entra a 85% do ecrã e acaba quando chega a 35%
            const start = vh * 0.85;
            const end = vh * 0.35;
            const k = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.5)));
            const n = Math.round(k * words.length);
            words.forEach((w, i) => w.classList.toggle("lit", i < n));
        };
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [text]);

    return (
        <p ref={ref} className={`word-reveal ${className}`}>
            {text.split(" ").map((w, i) => (
                <span key={i} className="wr-word">
                    {w}{" "}
                </span>
            ))}
        </p>
    );
};

export default WordReveal;
