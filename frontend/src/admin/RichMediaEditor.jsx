// frontend/src/admin/RichMediaEditor.jsx
import React, { useRef, useState } from "react";
import { uploadToCloudinary, CLOUDINARY_CLOUD } from "@/lib/cloudinary";

// screens: [{ src, hotspots: [{x,y,w,h,to}] }]  (x/y/w/h em % do ecrã)
const RichMediaEditor = ({ screens = [], fit = "contain", onScreens, onFit, onMsg }) => {
    const [sel, setSel] = useState(0);
    const [drawing, setDrawing] = useState(false);
    const [draft, setDraft] = useState(null);
    const [uploading, setUploading] = useState(false);
    const boxRef = useRef(null);

    const screen = screens[sel] || null;

    const addScreens = async (files) => {
        const list = Array.from(files || []);
        if (!list.length) return;
        if (!CLOUDINARY_CLOUD || CLOUDINARY_CLOUD.startsWith("PÕE")) {
            onMsg && onMsg("Configura o Cloudinary primeiro em lib/cloudinary.js.");
            return;
        }
        setUploading(true);
        try {
            const added = [];
            for (const f of list) {
                const url = await uploadToCloudinary(f);
                added.push({ src: url, hotspots: [] });
            }
            onScreens([...(screens || []), ...added]);
        } catch (e) {
            onMsg && onMsg("Upload falhou: " + e.message);
        } finally {
            setUploading(false);
        }
    };

    const move = (i, dir) => {
        const j = i + dir;
        if (j < 0 || j >= screens.length) return;
        const arr = screens.slice();
        [arr[i], arr[j]] = [arr[j], arr[i]];
        onScreens(arr);
        setSel(j);
    };

    const delScreen = (i) => {
        const arr = screens.slice();
        arr.splice(i, 1);
        onScreens(arr);
        setSel(Math.max(0, Math.min(i, arr.length - 1)));
    };

    // ---- desenho de hotspots ----
    const pct = (e) => {
        const r = boxRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
        };
    };
    const onDown = (e) => {
        if (!drawing) return;
        e.preventDefault();
        const p = pct(e);
        setDraft({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
    };
    const onMove = (e) => {
        if (!drawing || !draft) return;
        const p = pct(e);
        setDraft((d) => ({ ...d, x1: p.x, y1: p.y }));
    };
    const onUp = () => {
        if (!drawing || !draft) return;
        const x = Math.min(draft.x0, draft.x1);
        const y = Math.min(draft.y0, draft.y1);
        const w = Math.abs(draft.x1 - draft.x0);
        const h = Math.abs(draft.y1 - draft.y0);
        setDraft(null);
        setDrawing(false);
        if (w < 3 || h < 3) return; // demasiado pequeno
        const to = Math.min(sel + 1, Math.max(0, screens.length - 1));
        const arr = screens.map((s, i) =>
            i === sel
                ? {
                      ...s,
                      hotspots: [
                          ...(s.hotspots || []),
                          {
                              x: +x.toFixed(1),
                              y: +y.toFixed(1),
                              w: +w.toFixed(1),
                              h: +h.toFixed(1),
                              to,
                          },
                      ],
                  }
                : s,
        );
        onScreens(arr);
    };

    const setTarget = (hi, to) => {
        const arr = screens.map((s, i) =>
            i === sel
                ? {
                      ...s,
                      hotspots: s.hotspots.map((h, k) =>
                          k === hi ? { ...h, to } : h,
                      ),
                  }
                : s,
        );
        onScreens(arr);
    };
    const delHotspot = (hi) => {
        const arr = screens.map((s, i) =>
            i === sel
                ? { ...s, hotspots: s.hotspots.filter((_, k) => k !== hi) }
                : s,
        );
        onScreens(arr);
    };

    const draftStyle = draft
        ? {
              left: `${Math.min(draft.x0, draft.x1)}%`,
              top: `${Math.min(draft.y0, draft.y1)}%`,
              width: `${Math.abs(draft.x1 - draft.x0)}%`,
              height: `${Math.abs(draft.y1 - draft.y0)}%`,
          }
        : null;

    return (
        <div className="mt-3">
            {/* Fit + adicionar ecrãs */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
                <label className="text-xs text-mist">
                    Ajuste:{" "}
                    <select
                        value={fit}
                        onChange={(e) => onFit && onFit(e.target.value)}
                        className="border border-hairline bg-bone px-2 py-1 text-ink"
                    >
                        <option value="contain">contain (barras pretas)</option>
                        <option value="cover">cover (preenche)</option>
                    </select>
                </label>
                <label className="cursor-pointer text-xs tracking-[0.18em] uppercase border border-hairline px-3 py-2 hover:border-ink">
                    {uploading ? "A carregar…" : "Adicionar ecrãs"}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => addScreens(e.target.files)}
                    />
                </label>
            </div>

            {screens.length === 0 ? (
                <p className="text-sm text-mist">
                    Sem ecrãs. Carrega os PNGs da campanha (pela ordem que quiseres
                    mostrar).
                </p>
            ) : (
                <div className="flex gap-4">
                    {/* Tira de ecrãs */}
                    <div className="w-24 shrink-0 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {screens.map((s, i) => (
                            <div
                                key={i}
                                className={`border ${i === sel ? "border-ink" : "border-hairline"} bg-black`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setSel(i)}
                                    className="block w-full"
                                >
                                    <img
                                        src={s.src}
                                        alt={`${i + 1}`}
                                        className="w-full aspect-[9/19] object-contain"
                                    />
                                </button>
                                <div className="flex items-center justify-between px-1 py-0.5 bg-bone text-[10px] text-mist">
                                    <span>{i + 1}</span>
                                    <span className="flex gap-1">
                                        <button onClick={() => move(i, -1)} title="Subir">↑</button>
                                        <button onClick={() => move(i, 1)} title="Descer">↓</button>
                                        <button onClick={() => delScreen(i)} title="Apagar" className="text-terracotta">✕</button>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Preview + desenho */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setDrawing((d) => !d);
                                    setDraft(null);
                                }}
                                className={`text-xs tracking-[0.18em] uppercase px-3 py-2 border ${drawing ? "bg-ink text-bone border-ink" : "border-hairline hover:border-ink"}`}
                            >
                                {drawing ? "A desenhar… (arrasta)" : "Desenhar zona"}
                            </button>
                            <span className="text-[11px] text-mist">
                                Ecrã {sel + 1} de {screens.length}
                            </span>
                        </div>

                        <div
                            ref={boxRef}
                            onMouseDown={onDown}
                            onMouseMove={onMove}
                            onMouseUp={onUp}
                            className={`relative mx-auto bg-black overflow-hidden border border-hairline ${drawing ? "cursor-crosshair" : ""}`}
                            style={{ width: "220px", aspectRatio: "9 / 19" }}
                        >
                            {screen ? (
                                <img
                                    src={screen.src}
                                    alt=""
                                    draggable={false}
                                    className={`w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"} pointer-events-none`}
                                />
                            ) : null}

                            {/* hotspots existentes */}
                            {screen &&
                                (screen.hotspots || []).map((h, hi) => (
                                    <div
                                        key={hi}
                                        className="absolute border-2 border-terracotta bg-terracotta/20 flex items-center justify-center text-[10px] text-bone"
                                        style={{
                                            left: `${h.x}%`,
                                            top: `${h.y}%`,
                                            width: `${h.w}%`,
                                            height: `${h.h}%`,
                                        }}
                                    >
                                        {hi + 1}
                                    </div>
                                ))}

                            {/* rascunho a desenhar */}
                            {draftStyle ? (
                                <div
                                    className="absolute border-2 border-dashed border-terracotta bg-terracotta/10"
                                    style={draftStyle}
                                />
                            ) : null}
                        </div>

                        {/* lista de hotspots do ecrã */}
                        <div className="mt-3 space-y-2">
                            {screen && (screen.hotspots || []).length === 0 ? (
                                <p className="text-[11px] text-mist">
                                    Sem zonas neste ecrã. Carrega em “Desenhar zona”
                                    e arrasta sobre a imagem.
                                </p>
                            ) : null}
                            {screen &&
                                (screen.hotspots || []).map((h, hi) => (
                                    <div
                                        key={hi}
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        <span className="w-4 text-mist">
                                            {hi + 1}
                                        </span>
                                        <span className="text-mist">vai para</span>
                                        <select
                                            value={h.to}
                                            onChange={(e) =>
                                                setTarget(hi, Number(e.target.value))
                                            }
                                            className="border border-hairline bg-bone px-2 py-1 text-ink"
                                        >
                                            {screens.map((_, k) => (
                                                <option key={k} value={k}>
                                                    ecrã {k + 1}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => delHotspot(hi)}
                                            className="text-terracotta"
                                        >
                                            apagar
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RichMediaEditor;
