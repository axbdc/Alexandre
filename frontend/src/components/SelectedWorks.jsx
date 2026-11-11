import React, { useMemo, useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useLang, t } from "../context/LanguageContext";
import { CATEGORIES, SECTION_LABELS } from "../data/content";
import useProjects from "../hooks/useProjects";
import useHighlights from "../hooks/useHighlights";
import useReveal from "../hooks/useReveal";
import FeaturedStrip from "./FeaturedStrip";
import WorkCard from "./WorkCard";
import { projectPath, segmentFromLocation, findBySegment } from "../lib/projectUrl";

const DEFAULT_TITLE = typeof document !== "undefined" ? document.title : "";
// O modal (e o framer-motion que ele usa) só é descarregado quando é preciso,
// para não pesar no primeiro carregamento no telemóvel.
const loadModal = () => import("./ProjectModal");
const ProjectModal = lazy(loadModal);


// Marca de um projeto: o campo "marca" do admin. Projetos pessoais não têm marca.
const PERSONAL = /projeto (pessoal|pr[oó]prio)|personal project|own project/i;
const clientText = (p) => (typeof p.client === "string" ? p.client : (p.client && (p.client.PT || p.client.EN)) || "");
const brandOf = (p) => {
    if (p.brand) return p.brand;
    const c = clientText(p);
    if (!c || PERSONAL.test(c)) return "";
    return c.replace(/\s*\(.*\)\s*$/, "").trim();
};
const STEP = 4;

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

    // Cartões da grelha: uma marca por cartão (com todos os trabalhos dela)
    // e os projetos pessoais à parte, cada um no seu cartão.
    const entries = useMemo(() => {
        const map = new Map();
        const out = [];
        for (const p of filtered) {
            const b = brandOf(p);
            if (!b) {
                out.push({ type: "project", key: p.id, project: p });
                continue;
            }
            const k = b.toLowerCase();
            if (!map.has(k)) {
                const entry = { type: "brand", key: "brand:" + k, name: b, projects: [] };
                map.set(k, entry);
                out.push(entry);
            }
            map.get(k).projects.push(p);
        }
        return out.filter((e) => e.type === "brand");
    }, [filtered]);
    // projetos pessoais: secção própria, por baixo das marcas
    const personal = useMemo(() => filtered.filter((p) => !brandOf(p)), [filtered]);
    const [shown, setShown] = useState(STEP);
    useEffect(() => {
        setShown(STEP);
    }, [active]);
    const visible = entries.slice(0, shown);

    const allBrandCount = useMemo(() => new Set(projects.map((p) => brandOf(p).toLowerCase()).filter(Boolean)).size, [projects]);
    const counts = useMemo(() => {
        const out = { all: projects.length };
        for (const c of CATEGORIES) {
            if (c.id === "all") continue;
            out[c.id] = projects.filter((p) => p.category === c.id).length;
        }
        return out;
    }, [projects]);

    // Link direto para um projeto: /projeto/<slug>-<id> (ou o antigo /?p=<id>)
    const deepLinked = React.useRef(false);
    const pushedRef = React.useRef(false);
    const projectsRef = React.useRef(projects);
    projectsRef.current = projects;
    useEffect(() => {
        if (deepLinked.current || !projects.length) return;
        deepLinked.current = true;
        const seg = segmentFromLocation();
        if (!seg) return;
        if (new URLSearchParams(window.location.search).get("p")) {
            window.history.replaceState(null, "", "/");
        }
        const found = findBySegment(projects, seg);
        if (found) {
            setActive("all");
            setOpenId(found.id);
        }
    }, [projects]);

    // O endereço acompanha o projeto aberto, para se poder copiar e partilhar.
    useEffect(() => {
        if (!deepLinked.current) return;
        const onProject = window.location.pathname.startsWith("/projeto/");
        const p = openId ? projects.find((x) => x.id === openId) : null;
        if (p) {
            const path = projectPath(p);
            if (window.location.pathname !== path) {
                if (!onProject) {
                    window.history.pushState({ ptf: 1 }, "", path);
                    pushedRef.current = true;
                } else {
                    window.history.replaceState(window.history.state, "", path);
                }
            }
            document.title = `${t(p.title, lang)} | Alexandre Cosme`;
        } else if (!openId) {
            if (onProject) {
                if (pushedRef.current) {
                    pushedRef.current = false;
                    window.history.back();
                } else {
                    window.history.replaceState(null, "", "/");
                }
            }
            document.title = DEFAULT_TITLE;
        }
    }, [openId, projects, lang]);

    // Botão "voltar" do telemóvel/browser fecha o projeto (ou volta a abri-lo).
    useEffect(() => {
        const onPop = () => {
            if (!window.location.pathname.startsWith("/projeto/")) {
                pushedRef.current = false;
                setOpenId(null);
            } else {
                const found = findBySegment(projectsRef.current, segmentFromLocation());
                if (found) setOpenId(found.id);
            }
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    // trabalhos da mesma marca do projeto aberto (separadores no topo do projeto)
    const openProject = openId ? projects.find((p) => p.id === openId) : null;
    const brandList = useMemo(() => {
        if (!openProject) return [];
        const b = brandOf(openProject).toLowerCase();
        if (!b) return [];
        const list = projects.filter((p) => brandOf(p).toLowerCase() === b);
        // o tipo escolhido no filtro aparece primeiro
        return active === "all" ? list : [...list.filter((p) => p.category === active), ...list.filter((p) => p.category !== active)];
    }, [openProject, projects, active]);
    const siblings = useMemo(() => {
        const used = {};
        return brandList.map((p) => {
            const c = CATEGORIES.find((x) => x.id === p.category);
            const base = c ? t(c.label, lang) : t(p.title, lang);
            used[base] = (used[base] || 0) + 1;
            return { id: p.id, base, title: t(p.title, lang) };
        }).map((x) => ({ id: x.id, label: used[x.base] > 1 ? x.title : x.base }));
    }, [brandList, lang]);
    const navList = filtered;
    const openIndex = useMemo(
        () => navList.findIndex((p) => p.id === openId),
        [navList, openId],
    );

    const open = navList[openIndex] || (openId ? projects.find((p) => p.id === openId) : null) || null;

    // abrir a partir dos destaques: garante que o projeto está na lista atual
    const openFromFeatured = useCallback((id) => {
        setActive("all");
        setOpenId(id);
    }, []);

    const close = useCallback(() => setOpenId(null), []);
    const goPrev = useCallback(() => {
        if (!navList.length) return;
        const next = openIndex <= 0 ? navList.length - 1 : openIndex - 1;
        setOpenId(navList[next].id);
    }, [navList, openIndex]);
    const goNext = useCallback(() => {
        if (!navList.length) return;
        const next = openIndex >= navList.length - 1 ? 0 : openIndex + 1;
        setOpenId(navList[next].id);
    }, [navList, openIndex]);

    // cartão de marca: abre logo o primeiro trabalho; os outros ficam nos separadores
    const onCard = useCallback(
        (key) => {
            const e = entries.find((x) => x.key === key);
            if (e) setOpenId(e.projects[0].id);
        },
        [entries],
    );

    return (
        <section
            id="work"
            ref={rootRef}
            className="pt-4 pb-20 md:pb-28"
        >
            <FeaturedStrip projects={featured} lang={lang} onOpen={openFromFeatured} />
            <div id="projetos" className="mx-auto max-w-[1600px] px-4 md:px-8 pt-16 md:pt-24 scroll-mt-16">
                <div className="flex items-end justify-between mb-10 md:mb-14 reveal">
                    <div>
                        <span className="section-kicker">↳ {t(SECTION_LABELS.work, lang)} / {String(projects.length).padStart(2, "0")}</span>
                        <h2 className="font-condensed uppercase text-6xl md:text-8xl mt-4 text-ink leading-[0.9]">
                            {lang === "PT" ? "Todos os trabalhos" : "All work"}
                        </h2>
                    </div>
                    <div className="hidden lg:block text-right">
                        <div className="overline">
                            {lang === "PT" ? "A mostrar" : "Showing"}
                        </div>
                        <div
                            className="font-display text-2xl text-ink mt-1 tabular-nums"
                        >
                            {String(visible.length).padStart(2, "0")}
                            <span className="text-mist mx-2">/</span>
                            <span className="text-mist">
                                {String(entries.length).padStart(2, "0")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category tabs */}
                <div
                    className="reveal -mx-6 md:mx-0 mb-12 md:mb-16 overflow-x-auto no-scrollbar"
                >
                    <ul className="flex items-center gap-2 md:gap-3 px-6 md:px-0">
                        {CATEGORIES.map((c) => {
                            const isActive = c.id === active;
                            return (
                                <li key={c.id}>
                                    <button
                                        onClick={() => setActive(c.id)}
                                        aria-pressed={isActive}
                                        className={`group relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 border transition-colors duration-300 whitespace-nowrap ${
                                            isActive
                                                ? "bg-ink text-bone border-ink"
                                                : "border-hairline text-ink hover:border-ink"
                                        }`}
                                    >
                                        <span className="text-sm tracking-wide">
                                            {c.id === "all" ? (lang === "PT" ? "Marcas" : "Brands") : t(c.label, lang)}
                                        </span>
                                        <span
                                            className={`text-xs tabular-nums ${
                                                isActive
                                                    ? "text-bone/60"
                                                    : "text-mist"
                                            }`}
                                        >
                                            {String(c.id === "all" ? allBrandCount : counts[c.id]).padStart(
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

                {/* Grelha: marcas e projetos pessoais */}
                <ul
                    key={active}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
                >
                    {visible.map((e, i) => {
                        let card;
                        if (e.type === "project") card = e.project;
                        else {
                            const first = e.projects[0];
                            const kinds = [...new Set(e.projects.map((p) => p.category))]
                                .map((id) => (CATEGORIES.find((c) => c.id === id) || {}).label)
                                .filter(Boolean)
                                .map((l) => t(l, lang));
                            card =
                                e.projects.length === 1
                                    ? first
                                    : {
                                          id: e.key,
                                          title: { PT: e.name, EN: e.name },
                                          client: lang === "PT"
                                              ? `${String(e.projects.length).padStart(2, "0")} trabalhos`
                                              : `${String(e.projects.length).padStart(2, "0")} pieces of work`,
                                          cover: first.cover,
                                          category: first.category,
                                          tags: kinds,
                                      };
                        }
                        return (
                            <li
                                key={e.key}
                                className="work-in"
                                style={{ animationDelay: `${(i % STEP) * 60}ms` }}
                            >
                                <WorkCard p={card} i={i} lang={lang} className="work-card--grid" onOpen={e.type === "brand" ? () => onCard(e.key) : setOpenId} />
                            </li>
                        );
                    })}
                </ul>

                {entries.length > shown ? (
                    <div className="mt-10 md:mt-12 flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShown((n) => n + STEP)}
                            className="group inline-flex items-center gap-3 border border-ink text-ink px-8 py-4 text-xs md:text-sm tracking-[0.18em] uppercase hover:bg-ink hover:text-bone transition-colors"
                        >
                            {lang === "PT" ? "Mostrar mais" : "Show more"}
                        </button>
                        <span className="text-xs text-mist tabular-nums">
                            {String(visible.length).padStart(2, "0")} / {String(entries.length).padStart(2, "0")}
                        </span>
                    </div>
                ) : null}

                {personal.length ? (
                    <div className="mt-16 md:mt-24">
                        <div className="flex items-end justify-between mb-8 md:mb-10">
                            <div>
                                <span className="section-kicker">↳ {lang === "PT" ? "Projetos pessoais" : "Personal projects"} / {String(personal.length).padStart(2, "0")}</span>
                                <p className="mt-3 text-sm text-graphite max-w-md">
                                    {lang === "PT"
                                        ? "Coisas que faço por conta própria, para experimentar e aprender."
                                        : "Things I make on my own, to experiment and learn."}
                                </p>
                            </div>
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                            {personal.map((p, i) => (
                                <li key={p.id} className="work-in" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
                                    <WorkCard p={p} i={i} lang={lang} onOpen={setOpenId} className="work-card--grid" />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

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
                        total={navList.length}
                        siblings={siblings}
                        onPick={setOpenId}
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
