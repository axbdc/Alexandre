import React, { useEffect, useRef } from "react";
import { useLang } from "../context/LanguageContext";

// Cursor "olhos": dois olhos seguem o rato com um pequeno atraso e as pupilas
// olham para onde o rato se está a mexer e piscam de vez em quando. A seta do rato fica escondida.
// - Links e botões: aparece a etiqueta "Clicar".
// - Capas de projeto (data-cursor="project"): etiqueta "Ver projeto".
// Só com rato; em ecrãs táteis não aparece.
const HOVER_SEL = "a, button, [data-cursor='hover'], input, textarea, select, label";

const CustomCursor = () => {
    const wrapRef = useRef(null);
    const pupilsRef = useRef([]);
    const labelRef = useRef(null);
    const { lang } = useLang();

    useEffect(() => {
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!fine) return undefined;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const wrap = wrapRef.current;
        const label = labelRef.current;
        const pupils = pupilsRef.current;

        let mx = -100;
        let my = -100;
        let x = mx;
        let y = my;
        let lx = 0; // olhar (direção)
        let ly = 0;
        let shown = false;
        let raf = 0;

        const onMove = (e) => {
            mx = e.clientX;
            my = e.clientY;
            if (!shown) {
                shown = true;
                x = mx;
                y = my;
                wrap.classList.add("on");
            }
        };

        const tick = () => {
            const k = reduce ? 1 : 0.38;
            const dx = mx - x;
            const dy = my - y;
            x += dx * k;
            y += dy * k;
            // as pupilas olham na direção do movimento (e voltam ao centro quando para)
            const len = Math.hypot(dx, dy);
            const tx = len > 0.5 ? (dx / len) * Math.min(1, len / 40) : 0;
            const ty = len > 0.5 ? (dy / len) * Math.min(1, len / 40) : 0;
            lx += (tx - lx) * 0.2;
            ly += (ty - ly) * 0.2;
            // os olhos ficam centrados no ponto do rato (o cursor é só os olhos)
            wrap.style.transform = `translate(${x - 19}px, ${y - 11}px)`;
            const px = (lx * 3.2).toFixed(2);
            const py = (ly * 3.2).toFixed(2);
            for (const p of pupils) if (p) p.style.transform = `translate(${px}px, ${py}px)`;
            raf = requestAnimationFrame(tick);
        };

        const onOver = (e) => {
            const project = e.target.closest("[data-cursor='project']");
            const hover = !project && e.target.closest(HOVER_SEL);
            const has = !!(project || hover);
            if (has !== wrap.classList.contains("has-label")) wrap.classList.toggle("has-label", has);
            if (has) {
                const txt = project
                    ? lang === "PT" ? "Ver projeto" : "View project"
                    : lang === "PT" ? "Clicar" : "Click";
                if (label.textContent !== txt) label.textContent = txt;
            }
        };
        // só esconde quando o rato sai mesmo da janela (evita o "piscar")
        const onOut = (e) => {
            if (e.relatedTarget || e.toElement) return;
            shown = false;
            wrap.classList.remove("on");
        };

        // piscar os olhos de vez em quando
        let blinkT = 0;
        const blink = () => {
            wrap.classList.add("blink");
            setTimeout(() => wrap.classList.remove("blink"), 150);
            blinkT = setTimeout(blink, 2800 + Math.random() * 3200);
        };
        if (!reduce) blinkT = setTimeout(blink, 2200);
        // esconde a seta do rato: o cursor passa a ser só os olhos
        document.body.classList.add("has-custom-cursor");

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseover", onOver);
        window.addEventListener("mouseout", onOut);
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(blinkT);
            document.body.classList.remove("has-custom-cursor");
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mouseout", onOut);
        };
    }, [lang]);

    return (
        <div ref={wrapRef} className="eyes-cursor" aria-hidden="true" data-testid="custom-cursor">
            <span className="eyes">
                {[0, 1].map((i) => (
                    <span key={i} className="eye">
                        <span className="pupil" ref={(el) => (pupilsRef.current[i] = el)} />
                    </span>
                ))}
            </span>
            <span ref={labelRef} className="eyes-label">
                {lang === "PT" ? "Clicar" : "Click"}
            </span>
        </div>
    );
};

export default CustomCursor;
