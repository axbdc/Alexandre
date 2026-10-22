import React, { useEffect, useRef } from "react";
import { t } from "../context/LanguageContext";
import { ABOUT } from "../data/content";

// Crachá com a foto, pendurado numa fita. Balança com o scroll e inclina
// para o lado do rato (efeito 3D). Em "reduzir movimento" fica parado.
const IdBadge = ({ lang }) => {
    const swingRef = useRef(null);
    const cardRef = useRef(null);
    const b = ABOUT.badge;

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const swing = swingRef.current;
        const card = cardRef.current;
        if (reduce || !swing || !card) return undefined;

        let angle = 0; // balanço (graus)
        let vel = 0;
        let lastY = window.scrollY;
        let tiltX = 0;
        let tiltY = 0;
        let tx = 0;
        let ty = 0;
        let raf = 0;

        const onScroll = () => {
            const y = window.scrollY;
            vel += Math.max(-40, Math.min(40, y - lastY)) * 0.008; // empurrão proporcional à velocidade do scroll
            lastY = y;
        };
        const onMove = (e) => {
            const r = card.getBoundingClientRect();
            const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
            const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
            tx = Math.max(-1, Math.min(1, nx)) * 12;
            ty = Math.max(-1, Math.min(1, ny)) * -10;
        };
        const onLeave = () => {
            tx = 0;
            ty = 0;
        };
        const tick = () => {
            // mola amortecida a puxar o balanço para 0
            vel += -angle * 0.04;
            vel *= 0.92;
            angle += vel;
            angle = Math.max(-9, Math.min(9, angle));
            tiltX += (tx - tiltX) * 0.1;
            tiltY += (ty - tiltY) * 0.1;
            swing.style.transform = `rotate(${angle.toFixed(2)}deg)`;
            card.style.transform = `rotateY(${tiltX.toFixed(2)}deg) rotateX(${tiltY.toFixed(2)}deg)`;
            raf = requestAnimationFrame(tick);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerleave", onLeave);
        };
    }, []);

    return (
        <div className="badge-wrap" data-testid="about-badge">
            <div ref={swingRef} className="badge-swing">
                <div className="badge-strap" aria-hidden="true">
                    <span>AC · AC · AC · AC · AC · AC · AC · AC</span>
                </div>
                <div className="badge-clip" aria-hidden="true" />
                <div ref={cardRef} className="badge-card" data-cursor="hover">
                    <div className="badge-holes" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>
                    <div className="badge-inner">
                        <div className="badge-dept">{t(b.dept, lang)}</div>
                        <div className="badge-photo">
                            <img src={b.photo} alt="Alexandre Cosme" loading="lazy" decoding="async" />
                        </div>
                        <div className="badge-field">
                            <span>{lang === "PT" ? "Nome:" : "Name:"}</span>
                            <em>{b.name}</em>
                        </div>
                        <div className="badge-field">
                            <span>{lang === "PT" ? "Função:" : "Role:"}</span>
                            <em>{b.role}</em>
                        </div>
                        <div className="badge-note">{t(b.note, lang)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdBadge;
