import React, { useEffect, useRef } from "react";
import WorkCard from "./WorkCard";

// Destaques: no computador a secção fica "presa" e o scroll vertical faz
// deslizar os projetos na horizontal. No telemóvel é um carrossel normal
// (desliza com o dedo).
const FeaturedStrip = ({ projects, lang, onOpen }) => {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return undefined;
        const desktop = window.matchMedia("(min-width: 1024px)");
        let raf = 0;
        let dist = 0; // distância horizontal a percorrer (px no ecrã)

        const zoom = () =>
            parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-zoom")) || 1;

        const measure = () => {
            if (!desktop.matches) {
                section.style.height = "";
                track.style.transform = "";
                return;
            }
            const z = zoom();
            const trackW = track.scrollWidth * z;
            const vw = window.innerWidth;
            dist = Math.max(0, trackW - vw);
            // altura da secção = altura do ecrã + distância a percorrer (em px locais)
            section.style.height = `${(window.innerHeight + dist) / z}px`;
            update();
        };

        const update = () => {
            if (!desktop.matches) return;
            const z = zoom();
            const r = section.getBoundingClientRect();
            const total = r.height - window.innerHeight;
            const k = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
            track.style.transform = `translate3d(${(-k * dist) / z}px,0,0)`;
        };

        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(track);
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", onScroll, { passive: true });
        desktop.addEventListener("change", measure);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", onScroll);
            desktop.removeEventListener("change", measure);
        };
    }, [projects.length]);

    if (!projects.length) return null;

    return (
        <div ref={sectionRef} className="featured">
            <div className="featured-sticky">
                <div className="featured-head px-4 md:px-8">
                    <span className="section-kicker">
                        ↳ {lang === "PT" ? "Destaques" : "Highlights"} / {String(projects.length).padStart(2, "0")}
                    </span>
                    <span className="section-kicker hidden lg:inline">
                        {lang === "PT" ? "Continua a fazer scroll →" : "Keep scrolling →"}
                    </span>
                </div>
                <div className="featured-viewport no-scrollbar">
                    <ul ref={trackRef} className="featured-track">
                        {projects.map((p, i) => (
                            <li key={p._key || p.id} className="featured-item">
                                <WorkCard p={p} i={i} lang={lang} onOpen={onOpen} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FeaturedStrip;
