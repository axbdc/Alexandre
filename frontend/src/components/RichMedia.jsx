import React, { useState, useEffect, useRef } from "react";
import { t } from "../context/LanguageContext";

const COPY = {
    rm_hint: { PT: "Toca para interagir", EN: "Tap to interact" },
    rm_restart: { PT: "Recomeçar", EN: "Restart" },
    rm_drag: { PT: "Arrasta para revelar", EN: "Drag to reveal" },
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
    // Se o ecrã anterior era um slider, o que estava visível no fim era a
    // imagem revelada (B), não a de cima (A).
    const prevSrc = p
        ? isSliderScreen(p)
            ? p.slider.bDone || p.slider.b
            : p.src
        : null;

    return (
        <>
            <style>{RM_CSS}</style>
            {p ? (
                <img
                    src={prevSrc}
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

// ---------- Slider antes/depois ----------
// Um ecrã com { slider: { b, ... } } passa a ser um slider:
//   src           = imagem de CIMA (A), visível à esquerda do handle
//   slider.b      = imagem REVELADA (B), visível à direita do handle
//   slider.bDone  = (opcional) versão final de B, entra em fade ao completar
//   slider.overlay= (opcional) PNG transparente por cima de tudo (logo, CTA…)
//   slider.start  = posição inicial do handle em % (0 = esquerda)
//   slider.doneAt = ao arrastar até aqui (%), o slider fica completo
//   slider.doneDelay / doneTo = depois de completo, salta p/ outro ecrã
//   slider.hint   = handle abana no arranque para mostrar que se arrasta
//   slider.handleY= altura do handle em %
//   slider.lineInset = margem vertical da linha em % (para PNGs com barras)
export const SLIDER_DEFAULTS = {
    start: 50,
    doneAt: 10,
    doneDelay: 0,
    hint: true,
    handleY: 50,
    lineInset: 0,
};

export const isSliderScreen = (s) => !!(s && s.slider && s.slider.b);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const SliderScreen = ({
    screen,
    fit = "contain",
    animate = true,
    interactive = true,
    onDone,
    onInteract,
}) => {
    const cfg = { ...SLIDER_DEFAULTS, ...(screen.slider || {}) };
    const start = clamp(Number(cfg.start) || 0, 0, 100);
    const doneAt = clamp(Number(cfg.doneAt) || 0, 0, 50);
    const handleY = clamp(Number(cfg.handleY) || 50, 5, 95);
    const inset = clamp(Number(cfg.lineInset) || 0, 0, 40);

    const [x, setX] = useState(start);
    const [smooth, setSmooth] = useState(false);
    const [done, setDone] = useState(false);
    const boxRef = useRef(null);
    const dragging = useRef(false);
    const timers = useRef([]);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };

    // Pré-carrega B, B final e overlay.
    useEffect(() => {
        [cfg.b, cfg.bDone, cfg.overlay].filter(Boolean).forEach((u) => {
            const im = new Image();
            im.src = u;
        });
    }, [cfg.b, cfg.bDone, cfg.overlay]);

    // Dica: o handle abana uma vez para os lados.
    useEffect(() => {
        if (!cfg.hint || !interactive) return;
        const seq = [
            [700, () => setSmooth(true)],
            [720, () => setX(clamp(start - 14, doneAt + 4, 100))],
            [1320, () => setX(clamp(start + 8, 0, 100))],
            [1920, () => setX(start)],
            [2500, () => setSmooth(false)],
        ];
        timers.current = seq.map(([ms, fn]) => setTimeout(fn, ms));
        return clearTimers;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Depois de completo: salta para o ecrã configurado.
    useEffect(() => {
        if (!done || !onDone) return;
        const delay = Number(cfg.doneDelay) || 0;
        if (delay <= 0) return;
        const timer = setTimeout(() => onDone(cfg.doneTo), delay * 1000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [done]);

    const posFrom = (e) => {
        const r = boxRef.current.getBoundingClientRect();
        return clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
    };

    const finish = () => {
        dragging.current = false;
        setSmooth(true);
        setX(doneAt);
        setDone(true);
    };

    const onPointerDown = (e) => {
        if (!interactive || done) return;
        e.preventDefault();
        clearTimers();
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
            /* sem pointer capture: continua na mesma */
        }
        dragging.current = true;
        setSmooth(false);
        onInteract && onInteract();
        const v = posFrom(e);
        if (v <= doneAt) finish();
        else setX(v);
    };
    const onPointerMove = (e) => {
        if (!dragging.current) return;
        const v = posFrom(e);
        if (v <= doneAt) finish();
        else setX(v);
    };
    const onPointerUp = () => {
        dragging.current = false;
    };

    const fitCls = fit === "cover" ? "object-cover" : "object-contain";
    const type = animate ? screen.transition || "none" : "none";
    const dur = Number(screen.transitionDur) || 600;
    const ease = "cubic-bezier(.4,0,.2,1)";
    const tr = (prop) => (smooth ? `${prop} 550ms ${ease}` : "none");

    return (
        <div
            ref={boxRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={`absolute inset-0 select-none ${interactive ? "" : "pointer-events-none"}`}
            style={{
                animation: type === "flash" ? "none" : animFor(type, dur),
                touchAction: "none",
                cursor: interactive && !done ? "ew-resize" : "default",
            }}
        >
            {/* B, revelada */}
            <img
                src={cfg.b}
                alt=""
                draggable={false}
                className={`absolute inset-0 w-full h-full ${fitCls} pointer-events-none`}
            />
            {cfg.bDone ? (
                <img
                    src={cfg.bDone}
                    alt=""
                    draggable={false}
                    className={`absolute inset-0 w-full h-full ${fitCls} pointer-events-none`}
                    style={{
                        opacity: done ? 1 : 0,
                        transition: "opacity 700ms ease",
                    }}
                />
            ) : null}

            {/* A, de cima, cortada pelo handle */}
            <img
                src={screen.src}
                alt=""
                draggable={false}
                className={`absolute inset-0 w-full h-full ${fitCls} pointer-events-none`}
                style={{
                    clipPath: `inset(0 ${100 - x}% 0 0)`,
                    WebkitClipPath: `inset(0 ${100 - x}% 0 0)`,
                    transition: tr("clip-path"),
                }}
            />

            {/* Linha */}
            <div
                className="absolute pointer-events-none bg-white"
                style={{
                    left: `${x}%`,
                    top: `${inset}%`,
                    bottom: `${inset}%`,
                    width: "2px",
                    transform: "translateX(-50%)",
                    transition: tr("left"),
                }}
            />

            {/* Overlay fixo (logo, fechar, CTA) */}
            {cfg.overlay ? (
                <img
                    src={cfg.overlay}
                    alt=""
                    draggable={false}
                    className={`absolute inset-0 w-full h-full ${fitCls} pointer-events-none`}
                />
            ) : null}

            {/* Handle */}
            <div
                className="absolute pointer-events-none rounded-full bg-white flex items-center justify-center"
                style={{
                    left: `${x}%`,
                    top: `${handleY}%`,
                    width: "10%",
                    aspectRatio: "1 / 1",
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 2px 10px rgba(0,0,0,.35)",
                    transition: tr("left"),
                }}
            >
                <svg viewBox="0 0 40 20" width="62%" aria-hidden="true">
                    <path
                        d="M12 3 L5 10 L12 17 M28 3 L35 10 L28 17"
                        fill="none"
                        stroke="#1d1a4f"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    );
};

// Player INTERATIVO (usado no separador de teste). Tocar avança; hotspots saltam.
export const RichMediaPlayer = ({ screens = [], lang, fit = "contain" }) => {
    const [i, setI] = useState(0);
    const [showHint, setShowHint] = useState(true);
    const [run, setRun] = useState(0); // muda ao recomeçar, para repor o slider

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
    const isSlider = isSliderScreen(screen);

    const go = (to) => {
        setShowHint(false);
        setI((prev) => {
            const n = typeof to === "number" ? to : prev + 1;
            return Math.max(0, Math.min(screens.length - 1, n));
        });
    };

    const onScreenClick = () => {
        if (hasHotspots || isSlider) return;
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
                    onClick={isSlider ? undefined : onScreenClick}
                    clickable={!hasHotspots && !isSlider}
                />

                {isSlider ? (
                    <SliderScreen
                        key={`${i}-${run}`}
                        screen={screen}
                        fit={fit}
                        onInteract={() => setShowHint(false)}
                        onDone={(to) =>
                            go(typeof to === "number" ? to : i + 1)
                        }
                    />
                ) : null}

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
                            {t(isSlider ? COPY.rm_drag : COPY.rm_hint, lang)}
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
                        setRun((r) => r + 1);
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
