// frontend/src/components/RichMedia.jsx
import React, { useState } from "react";
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

// Player INTERATIVO (usado no separador de teste). Tocar avança; hotspots saltam.
export const RichMediaPlayer = ({ screens = [], lang, fit = "contain" }) => {
    const [i, setI] = useState(0);
    const [showHint, setShowHint] = useState(true);

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

    return (
        <div className="flex flex-col items-center">
            <PhoneMock>
                <img
                    src={screen.src}
                    alt={`${i + 1}`}
                    onClick={onScreenClick}
                    draggable={false}
                    className={`w-full h-full ${
                        fit === "cover" ? "object-cover" : "object-contain"
                    } ${hasHotspots ? "" : "cursor-pointer"}`}
                />

                {hasHotspots
                    ? screen.hotspots.map((h, idx) => (
                          <button
                              key={idx}
                              type="button"
                              onClick={() => go(h.to)}
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
