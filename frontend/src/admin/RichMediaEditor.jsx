import React, { useRef, useState } from "react";
import { uploadToCloudinary, CLOUDINARY_CLOUD } from "@/lib/cloudinary";
import {
    ScreenStack,
    SliderScreen,
    SLIDER_DEFAULTS,
    isSliderScreen,
    TRANSITIONS,
    TRANSITION_DURS,
} from "@/components/RichMedia";

// screens: [{ src, hotspots: [{x,y,w,h,to}], duration, durationTo, transition, transitionDur }]
// (x/y/w/h em % do ecrã; transition = como o ecrã ENTRA)
// Opcional por ecrã: slider: { b, bDone, overlay, start, doneAt, doneDelay,
// doneTo, hint, handleY, lineInset } -> ver SliderScreen em RichMedia.jsx
const RichMediaEditor = ({ screens = [], fit = "contain", onScreens, onFit, onMsg }) => {
    const [sel, setSel] = useState(0);
    const [drawing, setDrawing] = useState(false);
    const [draft, setDraft] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [pv, setPv] = useState(null); // pré-visualização da transição
    const [slUp, setSlUp] = useState(""); // campo do slider a carregar
    const [slRun, setSlRun] = useState(0); // repõe a pré-visualização do slider
    const [pick, setPick] = useState([]); // frames escolhidas p/ o template slider
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
                              type: "screen",
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
    const setHType = (hi, type) => {
        const arr = screens.map((s, i) =>
            i === sel
                ? {
                      ...s,
                      hotspots: s.hotspots.map((h, k) =>
                          k === hi ? { ...h, type } : h,
                      ),
                  }
                : s,
        );
        onScreens(arr);
    };
    const setHref = (hi, href) => {
        const arr = screens.map((s, i) =>
            i === sel
                ? {
                      ...s,
                      hotspots: s.hotspots.map((h, k) =>
                          k === hi ? { ...h, href } : h,
                      ),
                  }
                : s,
        );
        onScreens(arr);
    };
    const setDuration = (val) => {
        const arr = screens.map((s, i) =>
            i === sel ? { ...s, duration: val } : s,
        );
        onScreens(arr);
    };
    const setDurationTo = (val) => {
        const arr = screens.map((s, i) =>
            i === sel ? { ...s, durationTo: val } : s,
        );
        onScreens(arr);
    };
    const setTransition = (patch) => {
        const arr = screens.map((s, i) => (i === sel ? { ...s, ...patch } : s));
        onScreens(arr);
    };
    const applyTransitionToAll = () => {
        if (!screen) return;
        const t = screen.transition || "none";
        const d = screen.transitionDur || 600;
        onScreens(
            screens.map((s, i) =>
                i === 0 ? s : { ...s, transition: t, transitionDur: d },
            ),
        );
        onMsg && onMsg("Transição aplicada aos ecrãs 2 em diante.");
    };
    const previewTransition = () => {
        if (!screen || screens.length < 2) return;
        const from = sel > 0 ? sel - 1 : screens.length - 1;
        const dur = Number(screen.transitionDur) || 600;
        setDrawing(false);
        setPv({ idx: from, anim: false });
        setTimeout(() => setPv({ idx: sel, anim: true }), 450);
        setTimeout(() => setPv(null), 450 + dur + 300);
    };

    // ---- slider antes/depois ----
    const setSlider = (patch) => {
        const arr = screens.map((s, i) =>
            i === sel ? { ...s, slider: { ...(s.slider || {}), ...patch } } : s,
        );
        onScreens(arr);
    };
    const enableSlider = () => setSlider({ ...SLIDER_DEFAULTS, b: "", bDone: "", overlay: "" });

    // Corrige os índices (hotspots, tempo automático, slider) depois de
    // juntar ou separar ecrãs.
    const reindex = (list, map) =>
        list.map((s) => {
            const o = { ...s };
            if (Array.isArray(o.hotspots)) {
                o.hotspots = o.hotspots.map((h) =>
                    typeof h.to === "number" ? { ...h, to: map(h.to) } : h,
                );
            }
            if (typeof o.durationTo === "number") o.durationTo = map(o.durationTo);
            if (o.slider && typeof o.slider.doneTo === "number") {
                o.slider = { ...o.slider, doneTo: map(o.slider.doneTo) };
            }
            return o;
        });

    // Template: 1.ª frame = A (cima), 2.ª = B (revelada), 3.ª = B final.
    const togglePick = (i) =>
        setPick((p) =>
            p.includes(i) ? p.filter((x) => x !== i) : p.length >= 3 ? p : [...p, i],
        );

    const makeSlider = () => {
        if (pick.length < 2) return;
        const [ia, ib, ic] = pick;
        const A = screens[ia];
        const B = screens[ib];
        const C = typeof ic === "number" ? screens[ic] : null;
        const removed = new Set([ib, ic].filter((x) => typeof x === "number"));

        const list = [];
        const pos = {};
        screens.forEach((s, i) => {
            if (removed.has(i)) return;
            pos[i] = list.length;
            list.push(s);
        });
        removed.forEach((i) => (pos[i] = pos[ia]));

        const at = pos[ia];
        const hasNext = at < list.length - 1;
        list[at] = {
            ...A,
            slider: {
                ...SLIDER_DEFAULTS,
                b: B.src,
                bDone: C ? C.src : "",
                overlay: "",
                doneDelay: hasNext ? 1.5 : 0,
            },
        };
        onScreens(reindex(list, (k) => (typeof pos[k] === "number" ? pos[k] : 0)));
        setSel(at);
        setPick([]);
        setSlRun((r) => r + 1);
        onMsg && onMsg("Slider criado. Ajusta os detalhes no painel do ecrã.");
    };

    // Desfaz o slider: B e B final voltam a ser ecrãs normais logo a seguir.
    const removeSlider = () => {
        const cur = screens[sel];
        if (!cur || !cur.slider) return;
        const { slider, ...rest } = cur;
        const extra = [slider.b, slider.bDone]
            .filter(Boolean)
            .map((src) => ({ src, hotspots: [] }));
        const list = [
            ...screens.slice(0, sel),
            rest,
            ...extra,
            ...screens.slice(sel + 1),
        ];
        const n = extra.length;
        onScreens(reindex(list, (k) => (k > sel ? k + n : k)));
        setPick([]);
    };
    const uploadSlider = async (key, file) => {
        if (!file) return;
        if (!CLOUDINARY_CLOUD || CLOUDINARY_CLOUD.startsWith("PÕE")) {
            onMsg && onMsg("Configura o Cloudinary primeiro em lib/cloudinary.js.");
            return;
        }
        setSlUp(key);
        try {
            const url = await uploadToCloudinary(file);
            setSlider({ [key]: url });
        } catch (e) {
            onMsg && onMsg("Upload falhou: " + e.message);
        } finally {
            setSlUp("");
        }
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

            {screens.length > 1 ? (
                <div className="mb-3 flex items-center gap-2 flex-wrap text-xs border border-hairline p-2">
                    <span className="text-mist">Template slider:</span>
                    {pick.length === 0 ? (
                        <span className="text-mist">
                            marca as frames na tira pela ordem: 1 = imagem de cima (A),
                            2 = imagem revelada (B), 3 = B final (opcional).
                        </span>
                    ) : (
                        <>
                            <span>
                                {pick
                                    .map((i, k) => `ecrã ${i + 1} = ${["A", "B", "B final"][k]}`)
                                    .join(" · ")}
                            </span>
                            <button
                                type="button"
                                onClick={makeSlider}
                                disabled={pick.length < 2}
                                className="border border-ink bg-ink text-bone px-2 py-1 disabled:opacity-40"
                            >
                                Criar slider
                            </button>
                            <button
                                type="button"
                                onClick={() => setPick([])}
                                className="text-mist hover:text-ink underline"
                            >
                                limpar
                            </button>
                        </>
                    )}
                </div>
            ) : null}

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
                                className={`relative border ${i === sel ? "border-ink" : "border-hairline"} bg-black`}
                            >
                                <button
                                    type="button"
                                    onClick={() => togglePick(i)}
                                    title="Marcar para o template slider"
                                    className={`absolute top-1 left-1 z-10 w-5 h-5 text-[10px] leading-5 text-center border ${
                                        pick.includes(i)
                                            ? "bg-ink text-bone border-ink"
                                            : "bg-bone/80 text-ink border-hairline"
                                    }`}
                                >
                                    {pick.includes(i) ? ["A", "B", "F"][pick.indexOf(i)] : ""}
                                </button>
                                {isSliderScreen(s) ? (
                                    <span className="absolute top-1 right-1 z-10 bg-bone/90 px-1 text-[8px] tracking-wide text-ink">
                                        SLIDER
                                    </span>
                                ) : null}
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
                                        <button onClick={() => delScreen(i)} title="Apagar" className="text-terracotta"></button>
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
                                <ScreenStack
                                    screens={screens}
                                    index={pv ? pv.idx : sel}
                                    fit={fit}
                                    animate={!!(pv && pv.anim)}
                                />
                            ) : null}

                            {screen && !pv && isSliderScreen(screen) ? (
                                <SliderScreen
                                    key={`${sel}-${slRun}-${JSON.stringify(screen.slider)}`}
                                    screen={screen}
                                    fit={fit}
                                    animate={false}
                                    interactive={!drawing}
                                />
                            ) : null}

                            {/* hotspots existentes */}
                            {screen && !pv &&
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

                        {/* Transição de entrada do ecrã */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs border border-hairline p-2">
                            <span className="text-mist">Transição ao entrar:</span>
                            <select
                                value={(screen && screen.transition) || "none"}
                                onChange={(e) =>
                                    setTransition({ transition: e.target.value })
                                }
                                className="border border-hairline bg-bone px-2 py-1 text-ink"
                            >
                                {TRANSITIONS.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                            {screen && screen.transition && screen.transition !== "none" ? (
                                <select
                                    value={screen.transitionDur || 600}
                                    onChange={(e) =>
                                        setTransition({
                                            transitionDur: Number(e.target.value),
                                        })
                                    }
                                    className="border border-hairline bg-bone px-2 py-1 text-ink"
                                >
                                    {TRANSITION_DURS.map((d) => (
                                        <option key={d} value={d}>
                                            {d / 1000}s
                                        </option>
                                    ))}
                                </select>
                            ) : null}
                            <button
                                type="button"
                                onClick={previewTransition}
                                disabled={!!pv || screens.length < 2}
                                className="border border-hairline px-2 py-1 hover:border-ink disabled:opacity-40"
                            >
                                {pv ? "A mostrar…" : "Pré-visualizar"}
                            </button>
                            <button
                                type="button"
                                onClick={applyTransitionToAll}
                                className="text-mist hover:text-ink underline"
                            >
                                aplicar a todos
                            </button>
                        </div>

                        {/* Tempo automático do ecrã */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs border border-hairline p-2">
                            <span className="text-mist">Tempo automático:</span>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={screen && screen.duration ? screen.duration : ""}
                                onChange={(e) =>
                                    setDuration(Number(e.target.value) || 0)
                                }
                                className="w-16 border border-hairline bg-bone px-2 py-1 text-ink"
                            />
                            <span className="text-mist">s</span>
                            {screen && screen.duration ? (
                                <>
                                    <span className="text-mist">→ salta p/</span>
                                    <select
                                        value={
                                            typeof screen.durationTo === "number"
                                                ? screen.durationTo
                                                : Math.min(sel + 1, screens.length - 1)
                                        }
                                        onChange={(e) =>
                                            setDurationTo(Number(e.target.value))
                                        }
                                        className="border border-hairline bg-bone px-2 py-1 text-ink"
                                    >
                                        {screens.map((_, k) => (
                                            <option key={k} value={k}>
                                                ecrã {k + 1}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <span className="text-mist">(0 = desligado)</span>
                            )}
                        </div>

                        {/* Slider antes/depois */}
                        {screen ? (
                            <div className="mt-3 text-xs border border-hairline p-2 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-mist">Slider antes/depois:</span>
                                    {screen.slider ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setSlRun((r) => r + 1)}
                                                className="border border-hairline px-2 py-1 hover:border-ink"
                                            >
                                                Repor pré-visualização
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeSlider}
                                                className="text-terracotta ml-auto"
                                            >
                                                desfazer slider
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={enableSlider}
                                            className="border border-hairline px-2 py-1 hover:border-ink"
                                        >
                                            Tornar este ecrã num slider
                                        </button>
                                    )}
                                </div>

                                {screen.slider ? (
                                    <>
                                        <p className="text-[11px] text-mist">
                                            A imagem deste ecrã é a de cima (à esquerda do
                                            handle). Arrastar para a esquerda revela a B.
                                        </p>

                                        {[
                                            ["b", "Imagem revelada (B)", true],
                                            ["bDone", "B final (fade ao completar)", false],
                                            ["overlay", "Overlay PNG (logo, CTA…)", false],
                                        ].map(([key, label, required]) => (
                                            <div key={key} className="flex items-center gap-2 flex-wrap">
                                                <span className="w-44 text-mist">
                                                    {label}
                                                    {required ? " *" : ""}
                                                </span>
                                                {screen.slider[key] ? (
                                                    <img
                                                        src={screen.slider[key]}
                                                        alt=""
                                                        className="h-10 w-6 object-cover bg-black border border-hairline"
                                                    />
                                                ) : null}
                                                <label className="cursor-pointer border border-hairline px-2 py-1 hover:border-ink">
                                                    {slUp === key
                                                        ? "A carregar…"
                                                        : screen.slider[key]
                                                          ? "Trocar"
                                                          : "Carregar"}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) =>
                                                            uploadSlider(key, e.target.files && e.target.files[0])
                                                        }
                                                    />
                                                </label>
                                                {!required && screen.slider[key] ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSlider({ [key]: "" })}
                                                        className="text-mist hover:text-ink underline"
                                                    >
                                                        tirar
                                                    </button>
                                                ) : null}
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="w-44 text-mist">Posição inicial</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={screen.slider.start ?? SLIDER_DEFAULTS.start}
                                                onChange={(e) => setSlider({ start: Number(e.target.value) })}
                                            />
                                            <span>{screen.slider.start ?? SLIDER_DEFAULTS.start}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="w-44 text-mist">Completa ao chegar a</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="40"
                                                value={screen.slider.doneAt ?? SLIDER_DEFAULTS.doneAt}
                                                onChange={(e) => setSlider({ doneAt: Number(e.target.value) })}
                                            />
                                            <span>{screen.slider.doneAt ?? SLIDER_DEFAULTS.doneAt}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="w-44 text-mist">Altura do handle</span>
                                            <input
                                                type="range"
                                                min="5"
                                                max="95"
                                                value={screen.slider.handleY ?? SLIDER_DEFAULTS.handleY}
                                                onChange={(e) => setSlider({ handleY: Number(e.target.value) })}
                                            />
                                            <span>{screen.slider.handleY ?? SLIDER_DEFAULTS.handleY}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="w-44 text-mist">Margem vertical da linha</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="20"
                                                step="0.5"
                                                value={screen.slider.lineInset ?? SLIDER_DEFAULTS.lineInset}
                                                onChange={(e) => setSlider({ lineInset: Number(e.target.value) })}
                                            />
                                            <span>{screen.slider.lineInset ?? SLIDER_DEFAULTS.lineInset}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="w-44 text-mist">Depois de completo</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={screen.slider.doneDelay || ""}
                                                onChange={(e) => setSlider({ doneDelay: Number(e.target.value) || 0 })}
                                                className="w-16 border border-hairline bg-bone px-2 py-1 text-ink"
                                            />
                                            <span className="text-mist">s</span>
                                            {screen.slider.doneDelay ? (
                                                <>
                                                    <span className="text-mist">→ salta p/</span>
                                                    <select
                                                        value={
                                                            typeof screen.slider.doneTo === "number"
                                                                ? screen.slider.doneTo
                                                                : Math.min(sel + 1, screens.length - 1)
                                                        }
                                                        onChange={(e) => setSlider({ doneTo: Number(e.target.value) })}
                                                        className="border border-hairline bg-bone px-2 py-1 text-ink"
                                                    >
                                                        {screens.map((_, k) => (
                                                            <option key={k} value={k}>
                                                                ecrã {k + 1}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </>
                                            ) : (
                                                <span className="text-mist">(0 = fica no slider)</span>
                                            )}
                                        </div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={screen.slider.hint ?? SLIDER_DEFAULTS.hint}
                                                onChange={(e) => setSlider({ hint: e.target.checked })}
                                            />
                                            <span className="text-mist">Handle abana no arranque (dica)</span>
                                        </label>
                                    </>
                                ) : null}
                            </div>
                        ) : null}

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
                                        className="flex items-center gap-2 text-xs flex-wrap border border-hairline p-2"
                                    >
                                        <span className="w-4 text-mist">
                                            {hi + 1}
                                        </span>
                                        <select
                                            value={h.type || "screen"}
                                            onChange={(e) =>
                                                setHType(hi, e.target.value)
                                            }
                                            className="border border-hairline bg-bone px-2 py-1 text-ink"
                                        >
                                            <option value="screen">
                                                Ir para ecrã
                                            </option>
                                            <option value="url">Abrir site</option>
                                        </select>

                                        {(h.type || "screen") === "screen" ? (
                                            <select
                                                value={
                                                    typeof h.to === "number"
                                                        ? h.to
                                                        : 0
                                                }
                                                onChange={(e) =>
                                                    setTarget(
                                                        hi,
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="border border-hairline bg-bone px-2 py-1 text-ink"
                                            >
                                                {screens.map((_, k) => (
                                                    <option key={k} value={k}>
                                                        ecrã {k + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <>
                                                <input
                                                    type="url"
                                                    placeholder="https://..."
                                                    value={h.href || ""}
                                                    onChange={(e) =>
                                                        setHref(hi, e.target.value)
                                                    }
                                                    className="flex-1 min-w-[140px] border border-hairline bg-bone px-2 py-1 text-ink"
                                                />
                                                <span className="text-mist">
                                                    (abre em nova aba)
                                                </span>
                                            </>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => delHotspot(hi)}
                                            className="text-terracotta ml-auto"
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
