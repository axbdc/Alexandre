import React, { useMemo, useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useLang, t } from "../context/LanguageContext";
import { CATEGORIES, SECTION_LABELS } from "../data/content";
import useProjects from "../hooks/useProjects";
import useHighlights from "../hooks/useHighlights";
import useReveal from "../hooks/useReveal";
import FeaturedStrip from "./FeaturedStrip";
import WorkCard from "./WorkCard";
// O modal (e o framer-motion que ele usa) só é descarregado quando é preciso,
// para não pesar no primeiro carregamento no telemóvel.
const loadModal = () => import("./ProjectModal");
const ProjectModal = lazy(loadModal);


const SelectedWorks = () => {
    const { lang } = useLang();
    const { projects } = useProjects();
    const highlights = useHighlights();

    // Destaques: imagens escolhidas no admin, cada uma ligada a um projeto.
    // Sem destaques publicados, mostra os 6 primeiros projetos.
    const featured = useMemo(() => {
        const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
        const list = highlights
            .filter((h) => h.image && byId[h.project_id])
            .map((h) => ({
                ...byId[h.project_id],
                cover: h.image,
                _key: h.id,
                highlightLabel: h.label_pt || h.label_en ? { PT: h.label_pt || h.label_en, EN: h.label_en || h.label_pt } : null,
            }));
        return list.length ? list : projects.slice(0, 6);
    }, [highlights, projects]);
    const rootRef = useReveal([lang, projects]);
    const [active, setActive] = useState("all");
    const [openId, setOpenId] = useState(null);
    const [modalReady, setModalReady] = useState(false);

    // Pré-carrega o modal em segundo plano depois de a página estar pronta,
    // para abrir sem espera quando se toca num projeto.
    useEffect(() => {
        const go = () => loadModal().catch(() => {});
        const id =
            "requestIdleCallback" in window
                ? window.requestIdleCallback(go, { timeout: 4000 })
                : setTimeout(go, 2500);
        return () =>
            "cancelIdleCallback" in window
                ? window.cancelIdleCallback(id)
                : clearTimeout(id);
    }, []);
    useEffect(() => {
        if (openId) setModalReady(true);
    }, [openId]);

    const filtered = useMemo(
        () =>
            active === "all"
                ? projects
                : projects.filter((p) => p.category === active),
        [active, projects],
    );

    const counts = useMemo(() => {
        const out = { all: projects.length };
        for (const c of CATEGORIES) {
            if (c.id === "all") continue;
            out[c.id] = projects.filter((p) => p.category === c.id).length;
        }
        return out;
    }, [projects]);

    const openIndex = useMemo(
        () => filtered.findIndex((p) => p.id === openId),
        [filtered, openId],
    );

    const open = filtered[openIndex] || null;

    // abrir a partir dos destaques: garante que o projeto está na lista atual
    const openFromFeatured = useCallback((id) => {
        setActive("all");
        setOpenId(id);
    }, []);

    const close = useCallback(() => setOpenId(null), []);
    const goPrev = useCallback(() => {
        if (!filtered.length) return;
        const next = openIndex <= 0 ? filtered.length - 1 : openIndex - 1;
        setOpenId(filtered[next].id);
    }, [filtered, openIndex]);
    const goNext = useCallback(() => {
        if (!filtered.length) return;
        const next = openIndex >= filtered.length - 1 ? 0 : openIndex + 1;
        setOpenId(filtered[next].id);
    }, [filtered, openIndex]);

    return (
        <section
            id="work"
            ref={rootRef}
            data-testid="works-section"
            className="pt-4 pb-20 md:pb-28"
        >
            <FeaturedStrip projects={featured} lang={lang} onOpen={openFromFeatured} />
            <div className="mx-auto max-w-[1600px] px-4 md:px-8 pt-16 md:pt-24">
                <div className="flex items-end justify-between mb-10 md:mb-14 reveal">
                    <div>
                        <span className="section-kicker">↳ {t(SECTION_LABELS.work, lang)} / {String(projects.length).padStart(2, "0")}</span>
                        <h2 className="font-condensed uppercase text-6xl md:text-8xl mt-4 text-ink leading-[0.9]">
                            {lang === "PT" ? "Todos os trabalhos" : "All work"}
                        </h2>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="overline">
                            {lang === "PT" ? "A mostrar" : "Showing"}
                        </div>
                        <div
                            className="font-display text-2xl text-ink mt-1 tabular-nums"
                            data-testid="works-count"
                        >
                            {String(filtered.length).padStart(2, "0")}
                            <span className="text-mist mx-2">/</span>
                            <span className="text-mist">
                                {String(projects.length).padStart(2, "0")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category tabs */}
                <div
                    className="reveal -mx-6 md:mx-0 mb-12 md:mb-16 overflow-x-auto no-scrollbar"
                    data-testid="category-tabs"
                >
                    <ul className="flex items-center gap-2 md:gap-3 px-6 md:px-0">
                        {CATEGORIES.map((c) => {
                            const isActive = c.id === active;
                            return (
                                <li key={c.id}>
                                    <button
                                        onClick={() => setActive(c.id)}
                                        data-testid={`category-tab-${c.id}`}
                                        aria-pressed={isActive}
                                        className={`group relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 border transition-colors duration-300 whitespace-nowrap ${
                                            isActive
                                                ? "bg-ink text-bone border-ink"
                                                : "border-hairline text-ink hover:border-ink"
                                        }`}
                                    >
                                        <span className="text-sm tracking-wide">
                                            {t(c.label, lang)}
                                        </span>
                                        <span
                                            className={`text-xs tabular-nums ${
                                                isActive
                                                    ? "text-bone/60"
                                                    : "text-mist"
                                            }`}
                                        >
                                            {String(counts[c.id]).padStart(
                                                2,
                                                "0",
                                            )}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Grelha filtrada */}
                <ul
                    key={active}
                    data-testid="works-grid"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
                >
                    {filtered.map((p, i) => (
                        <li
                            key={p.id}
                            className="work-in"
                            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                        >
                            <WorkCard p={p} i={i} lang={lang} onOpen={setOpenId} />
                        </li>
                    ))}
                </ul>

                {filtered.length === 0 && (
                    <p className="text-center text-graphite py-24">
                        {lang === "PT"
                            ? "Nenhum projeto nesta categoria ainda."
                            : "No projects in this category yet."}
                    </p>
                )}
            </div>

            {modalReady ? (
                <Suspense fallback={null}>
                    <ProjectModal
                        project={open}
                        index={openIndex >= 0 ? openIndex : 0}
                        total={filtered.length}
                        onClose={close}
                        onPrev={goPrev}
                        onNext={goNext}
                    />
                </Suspense>
            ) : null}
        </section>
    );
};

export default SelectedWorks;
