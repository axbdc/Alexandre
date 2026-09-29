// frontend/src/components/RichMedia.jsx
import React, { useState, useEffect, useRef } from "react";
import { t } from "../context/LanguageContext";

const COPY = {
    rm_hint: { PT: "Toca para interagir", EN: "Tap to interact" },
    rm_restart: { PT: "Recomeçar", EN: "Restart" },
};

// Telemóvel = mockup PNG (frontend/public/phone-frame.png). Tamanho configurável.
export const PhoneMock = ({ children, width = 230 }) => (
    <div className="relative mx-auto" style={{ width: `${width}px` }}>
        <img
            src="/phone-frame.png"
            alt=""
            draggable={false}
            className="block w-full h-auto select-none pointer-events-none"
        />
        <div
            className="absolute overflow-hidden bg-black"
            style={{
                top: "1.2%",
                left: "2.9%",
                right: "4.6%",
                bottom: "1.5%",
                borderRadius: "1.1rem",
            }}
        >
            {children}
        </div>
    </div>
);

// ---------- Transições entre ecrãs ----------
// Cada ecrã pode ter { transition, transitionDur } = a forma como ENTRA.
export const TRANSITIONS = [
    { id: "none", label: "Corte seco" },
    { id: "fade", label: "Fade" },
    { id: "slide", label: "Deslizar" },
    { id: "zoom", label: "Zoom + fade" },
    { id: "flash", label: "Flash branco" },
];
export const TRANSITION_DURS = [300, 600, 1000, 1500];

const RM_CSS = `
@keyframes rmFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes rmSlide { from { transform: translateX(100%) } to { transform: translateX(0) } }
@keyframes rmZoom { from { opacity: 0; transform: scale(1.15) } to { opacity: 1; transform: scale(1) } }
@keyframes rmFlash { from { opacity: 1 } to { opacity: 0 } }
`;

const animFor = (type, dur) => {
    if (type === "fade") return `rmFade ${dur}ms ease both`;
    if (type === "slide") return `rmSlide ${dur}ms cubic-bezier(.2,.8,.2,1) both`;
    if (type === "zoom") return `rmZoom ${dur}ms ease-out both`;
    return "none";
};

// Mostra o ecrã atual por cima do anterior e anima a entrada.
// Tem de estar dentro de um contentor com position relative/absolute.
export const ScreenStack = ({
    screens = [],
    index = 0,
    fit = "contain",
    animate = true,
    onClick,
    clickable = false,
}) => {
    const [prev, setPrev] = useState(null);
    const last = useRef(index);
    const s = screens[index] || {};
    const type = animate ? s.transition || "none" : "none";
    const dur = Number(s.transitionDur) || 600;

    useEffect(() => {
        if (last.current === index) return;
        const from = last.current;
        last.current = index;
        if (type === "none" || type === "flash") {
            setPrev(null);
            return;
        }
        setPrev(from);
        const timer = setTimeout(() => setPrev(null), dur + 60);
        return () => clearTimeout(timer);
    }, [index, type, dur]);

    const fitCls = fit === "cover" ? "object-cover" : "object-contain";
    const p = prev !== null ? screens[prev] : null;

    return (
        <>
            <style>{RM_CSS}</style>
            {p ? (
                <img
                    src={p.src}
                    alt=""
                    draggable={false}
                    className={`absolute inset-0 w-full h-full ${fitCls} pointer-events-none`}
                />
            ) : null}
            {s.src ? (
                <img
                    key={index}
                    src={s.src}
                    alt={`${index + 1}`}
                    draggable={false}
                    onClick={onClick}
                    className={`absolute inset-0 w-full h-full ${fitCls} ${clickable ? "cursor-pointer" : ""} ${onClick ? "" : "pointer-events-none"}`}
                    style={{ animation: animFor(type, dur) }}
                />
            ) : null}
            {type === "flash" ? (
                <div
                    key={`flash-${index}`}
                    className="absolute inset-0 bg-white pointer-events-none"
                    style={{ animation: `rmFlash ${dur}ms ease-out both` }}
                />
            ) : null}
        </>
    );
};

// Player INTERATIVO (usado no separador de teste). Tocar avança; hotspots saltam.
export const RichMediaPlayer = ({ screens = [], lang, fit = "contain" }) => {
    const [i, setI] = useState(0);
    const [showHint, setShowHint] = useState(true);

    // Pré-carrega os ecrãs para as transições não piscarem.
    useEffect(() => {
        screens.forEach((sc) => {
            if (sc && sc.src) {
                const im = new Image();
                im.src = sc.src;
            }
        });
    }, [screens]);

    if (!screens.length) return null;

    const screen = screens[i] || {};
    const hasHotspots =
        Array.isArray(screen.hotspots) && screen.hotspots.length > 0;

    const go = (to) => {
        setShowHint(false);
        setI((prev) => {
            const n = typeof to === "number" ? to : prev + 1;
            return Math.max(0, Math.min(screens.length - 1, n));
        });
    };

    const onScreenClick = () => {
        if (hasHotspots) return;
        if (i < screens.length - 1) go(i + 1);
    };

    // Ação de uma zona: abrir site (nova aba) ou ir para um ecrã.
    const act = (h) => {
        if (h && h.type === "url" && h.href) {
            window.open(h.href, "_blank", "noopener,noreferrer");
            return;
        }
        go(h.to);
    };

    // Tempo automático: se o ecrã tiver duração, avança sozinho.
    useEffect(() => {
        const s = screens[i];
        if (!s || !s.duration) return;
        const to = typeof s.durationTo === "number" ? s.durationTo : i + 1;
        if (to > screens.length - 1) return; // não avança além do último
        const timer = setTimeout(
            () => {
                setShowHint(false);
                setI(Math.max(0, Math.min(screens.length - 1, to)));
            },
            s.duration * 1000,
        );
        return () => clearTimeout(timer);
    }, [i, screens]);

    return (
        <div className="flex flex-col items-center">
            <PhoneMock>
                <ScreenStack
                    screens={screens}
                    index={i}
                    fit={fit}
                    onClick={onScreenClick}
                    clickable={!hasHotspots}
                />

                {hasHotspots
                    ? screen.hotspots.map((h, idx) => (
                          <button
                              key={idx}
                              type="button"
                              onClick={() => act(h)}
                              aria-label={`-> ${h.to + 1}`}
                              className="absolute hover:bg-bone/10 transition-colors"
                              style={{
                                  left: `${h.x}%`,
                                  top: `${h.y}%`,
                                  width: `${h.w}%`,
                                  height: `${h.h}%`,
                              }}
                          />
                      ))
                    : null}

                {showHint && i === 0 ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                        <span className="rounded-full bg-bone/90 px-3 py-1 text-[11px] tracking-wide text-ink animate-pulse">
                            {t(COPY.rm_hint, lang)}
                        </span>
                    </div>
                ) : null}
            </PhoneMock>

            <div className="mt-3 flex items-center gap-4 text-[11px] tracking-wide text-mist">
                <span>
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {String(screens.length).padStart(2, "0")}
                </span>
                <button
                    type="button"
                    onClick={() => {
                        setI(0);
                        setShowHint(true);
                    }}
                    className="link-underline text-ink"
                >
                    {t(COPY.rm_restart, lang)}
                </button>
            </div>
        </div>
    );
};

// Vitrine ESTÁTICA: fila de telemóveis com os ecrãs (para a capa do modal).
export const PhoneStrip = ({ screens = [], fit = "contain" }) => {
    if (!screens.length) return null;
    return (
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
            {screens.map((s, i) => (
                <div key={i} className="shrink-0">
                    <PhoneMock width={148}>
                        <img
                            src={s.src}
                            alt={`${i + 1}`}
                            draggable={false}
                            className={`w-full h-full ${
                                fit === "cover" ? "object-cover" : "object-contain"
                            }`}
                        />
                    </PhoneMock>
                </div>
            ))}
        </div>
    );
};
