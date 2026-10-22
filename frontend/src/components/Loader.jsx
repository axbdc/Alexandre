import React, { useEffect, useState } from "react";

// Ecrã de entrada: fundo azul, nome gigante e contador 000% -> 100%,
// depois sobe e revela o site. Só aparece na primeira visita da sessão.
const KEY = "ptf:intro-seen";

const shouldShow = () => {
    try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
        return !sessionStorage.getItem(KEY);
    } catch (e) {
        return false;
    }
};

const Loader = () => {
    const [show] = useState(shouldShow);
    const [pct, setPct] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const [gone, setGone] = useState(!show);

    useEffect(() => {
        if (!show) return undefined;
        document.documentElement.classList.add("intro-lock");
        const start = performance.now();
        const DURATION = 1300;
        let raf = 0;
        const step = (now) => {
            const k = Math.min(1, (now - start) / DURATION);
            const eased = 1 - Math.pow(1 - k, 3);
            setPct(Math.round(eased * 100));
            if (k < 1) raf = requestAnimationFrame(step);
            else {
                setLeaving(true);
                try {
                    sessionStorage.setItem(KEY, "1");
                } catch (e) {
                    /* ignora */
                }
                setTimeout(() => {
                    document.documentElement.classList.remove("intro-lock");
                    setGone(true);
                }, 900);
            }
        };
        raf = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(raf);
            document.documentElement.classList.remove("intro-lock");
        };
    }, [show]);

    if (gone) return null;

    return (
        <div className={`intro ${leaving ? "is-leaving" : ""}`} aria-hidden="true" data-testid="intro-loader">
            <div className="intro-top">
                <span>Portfólio · 2026</span>
                <span className="tabular-nums">A carregar {String(pct).padStart(3, "0")}%</span>
            </div>
            <div className="intro-name">
                <span className="intro-row">Alexandre</span>
                <span className="intro-row">Cosme</span>
            </div>
            <div className="intro-bottom">
                <span>Design &amp; Multimedia Lead · Portugal</span>
                <span className="intro-bar">
                    <span style={{ transform: `scaleX(${pct / 100})` }} />
                </span>
            </div>
        </div>
    );
};

export default Loader;
