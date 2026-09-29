import React, { useEffect, useRef } from "react";
import { useLang } from "../context/LanguageContext";

// Cursor: ponto (segue o rato na hora) + anel (segue com atraso).
// - Links e botões: o anel cresce e fica azul.
// - Capas de projeto (data-cursor="project"): o anel vira um círculo azul com "Ver projeto".
// Só aparece com rato; em ecrãs táteis fica o cursor normal.
const HOVER_SEL = "a, button, [data-cursor='hover'], input, textarea, select, label";

const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const { lang } = useLang();

    useEffect(() => {
        const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!isFinePointer) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        document.body.classList.add("has-custom-cursor");
        const dot = dotRef.current;
        const ring = ringRef.current;
        let raf = 0;

        // O CSS anula o zoom do site no cursor (.cursor-dot/.cursor-ring),
        // por isso as coordenadas do rato usam-se tal como vêm.
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let rx = mx;
        let ry = my;
        let shown = false;

        const onMove = (e) => {
            mx = e.clientX;
            my = e.clientY;
            if (!shown) {
                shown = true;
                rx = mx;
                ry = my;
                dot.classList.add("on");
                ring.classList.add("on");
            }
        };

        const tick = () => {
            const k = reduce ? 1 : 0.16;
            rx += (mx - rx) * k;
            ry += (my - ry) * k;
            dot.style.transform = `translate(${mx}px, ${my}px)`;
            ring.style.transform = `translate(${rx}px, ${ry}px)`;
            raf = requestAnimationFrame(tick);
        };

        const onOver = (e) => {
            const project = e.target.closest("[data-cursor='project']");
            const hover = !project && e.target.closest(HOVER_SEL);
            ring.classList.toggle("is-project", !!project);
            dot.classList.toggle("is-project", !!project);
            ring.classList.toggle("is-hover", !!hover);
        };
        const onLeaveWindow = () => {
            shown = false;
            dot.classList.remove("on");
            ring.classList.remove("on");
        };
        const onDown = () => ring.classList.add("is-down");
        const onUp = () => ring.classList.remove("is-down");

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseover", onOver);
        window.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);
        document.documentElement.addEventListener("mouseleave", onLeaveWindow);
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
            document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
            document.body.classList.remove("has-custom-cursor");
        };
    }, []);

    return (
        <>
            <div ref={ringRef} className="cursor-ring" aria-hidden="true" data-testid="custom-cursor-ring">
                <span className="cursor-ring-label">{lang === "PT" ? "Ver projeto" : "View project"}</span>
            </div>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" data-testid="custom-cursor" />
        </>
    );
};

export default CustomCursor;
