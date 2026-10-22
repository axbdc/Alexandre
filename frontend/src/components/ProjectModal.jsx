import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
    X,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Box,
    Play,
} from "lucide-react";
import { useLang, t } from "../context/LanguageContext";
import { launchAR, hasARAssets } from "../lib/ar";
import { PhoneStrip } from "./RichMedia";
import { isVideo, videoPoster } from "../lib/media";

const localize = (v, lang) => (typeof v === "string" ? v : t(v, lang));

const COPY = {
    client: { PT: "Cliente", EN: "Client" },
    year: { PT: "Ano", EN: "Year" },
    role: { PT: "Função", EN: "Role" },
    overview: { PT: "Sobre o projeto", EN: "About the project" },
    gallery: { PT: "Galeria", EN: "Gallery" },
    tools: { PT: "Ferramentas", EN: "Tools" },
    link: { PT: "Ver projeto", EN: "View project" },
    link_live: { PT: "Ver site ao vivo", EN: "Visit live site" },
    link_video: { PT: "Ver vídeo", EN: "Watch video" },
    link_test: { PT: "Testar rich media", EN: "Test rich media" },
    rm_hint: { PT: "Toca para interagir", EN: "Tap to interact" },
    rm_restart: { PT: "Recomeçar", EN: "Restart" },
    view_ar: { PT: "Ver em AR / 3D", EN: "View in AR / 3D" },
    prev: { PT: "Anterior", EN: "Previous" },
    next: { PT: "Seguinte", EN: "Next" },
    close: { PT: "Fechar", EN: "Close" },
    of: { PT: "de", EN: "of" },
};

// =====================================================================
//  MOLDURAS POR CATEGORIA
//  Cada meio mostrado no seu contexto nativo. Só aparecem no modal (o
//  detalhe); a grelha mantém-se limpa e uniforme.
// =====================================================================

// WEB — janela de browser. A barra mostra o domínio do `url`.
// Se passares `srcMobile`, aparece um telemóvel sobreposto (responsivo).
const BrowserFrame = ({ src, srcMobile, alt, url }) => {
    let domain = "";
    try {
        domain = new URL(url || "").hostname.replace(/^www\./, "");
    } catch (e) {
        domain = "";
    }
    return (
        <div className="relative">
            <div className="border border-hairline bg-white shadow-[0_20px_50px_-25px_rgba(28,27,26,0.45)]">
                <div className="flex items-center gap-2 h-9 px-3 border-b border-hairline bg-bone">
                    <span className="flex items-center gap-1.5 shrink-0">
                        <span className="h-2.5 w-2.5 rounded-full border border-hairline" />
                        <span className="h-2.5 w-2.5 rounded-full border border-hairline" />
                        <span className="h-2.5 w-2.5 rounded-full border border-hairline" />
                    </span>
                    {domain ? (
                        <span className="mx-auto max-w-[62%] truncate rounded-full border border-hairline bg-white px-3 py-0.5 text-[11px] tracking-wide text-mist">
                            {domain}
                        </span>
                    ) : (
                        <span className="mx-auto" />
                    )}
                    <span className="shrink-0 w-[46px]" />
                </div>
                <div className="aspect-[16/10] overflow-hidden bg-white">
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                    />
                </div>
            </div>
            {srcMobile ? (
                <div className="absolute -bottom-4 -right-1 md:-right-4 w-[22%] max-w-[120px]">
                    <div className="border border-hairline bg-white rounded-[16px] overflow-hidden shadow-[0_18px_40px_-18px_rgba(28,27,26,0.5)]">
                        <div className="aspect-[9/19] overflow-hidden bg-white">
                            <img
                                src={srcMobile}
                                alt={`${alt} — mobile`}
                                className="w-full h-full object-cover object-top"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

// AR & 3D — render sobre "estúdio" neutro, com sombra de contacto.
// object-contain para nunca cortar o render. overlay = botão AR (opcional).
const StageFrame = ({ src, alt, label, overlay }) => (
    <div className="relative border border-hairline overflow-hidden bg-gradient-to-b from-pebble to-sand">
        <div className="aspect-[16/9] flex items-center justify-center p-6 md:p-10">
            <img
                src={src}
                alt={alt}
                className="max-h-full max-w-full object-contain drop-shadow-[0_28px_36px_rgba(28,27,26,0.28)]"
                loading="lazy"
            />
        </div>
        {label ? (
            <span className="absolute top-3 left-3 overline text-mist">
                {label}
            </span>
        ) : null}
        {overlay}
    </div>
);

// DESIGN GRÁFICO — a arte como folha impressa sobre superfície neutra.
// Respeita o rácio da imagem (object-contain), com sombra de folha.
const PrintFrame = ({ src, alt }) => (
    <div className="border border-hairline bg-sand p-6 md:p-12 flex items-center justify-center">
        <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[calc(58vh/var(--site-zoom))] object-contain bg-white shadow-[0_30px_60px_-25px_rgba(28,27,26,0.55)]"
            loading="lazy"
        />
    </div>
);

// FOTOGRAFIA — moldura de galeria: passe-partout fino + legenda.
const PhotoFrame = ({ src, alt, caption }) => (
    <figure>
        <div className="bg-white border border-hairline p-3 md:p-4 shadow-[0_22px_50px_-30px_rgba(28,27,26,0.5)]">
            <div className="overflow-hidden">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                />
            </div>
        </div>
        {caption ? (
            <figcaption className="mt-3 overline text-mist">
                {caption}
            </figcaption>
        ) : null}
    </figure>
);

// MOTION & RICH MEDIA — chrome de leitor de vídeo. Se houver `url`, o play
// abre o vídeo; caso contrário fica decorativo (sinaliza "isto é vídeo").
const PlayerFrame = ({ src, alt, url, video }) => {
    // Vídeo principal carregado no admin: toca aqui mesmo.
    if (video) {
        return (
            <div className="relative border border-hairline bg-ink overflow-hidden">
                <video
                    src={video}
                    poster={src || videoPoster(video)}
                    controls
                    playsInline
                    preload="metadata"
                    className="block w-full aspect-[16/9] bg-ink object-contain"
                    aria-label={alt}
                />
            </div>
        );
    }
    const PlayButton = (
        <span className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-bone/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-105">
            <Play
                size={22}
                className="text-ink translate-x-[1px]"
                fill="currentColor"
            />
        </span>
    );
    return (
        <div className="relative border border-hairline bg-ink overflow-hidden group">
            <div className="aspect-[16/9] overflow-hidden">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-contain"
                    loading="lazy"
                />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                {url ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={alt}
                    >
                        {PlayButton}
                    </a>
                ) : (
                    PlayButton
                )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10 px-3 flex items-center gap-3 bg-gradient-to-t from-ink/85 to-transparent">
                <span className="text-[11px] tracking-wide text-bone/80">
                    00:00
                </span>
                <span className="flex-1 h-[3px] bg-bone/25 relative">
                    <span className="absolute left-0 top-0 h-full w-1/4 bg-bone/80" />
                </span>
            </div>
        </div>
    );
};


const NO_DRAG =
    "button, a, input, textarea, select, video, iframe, model-viewer, .overflow-x-auto, [data-no-drag]";

const CARD_VARIANTS = {
    // d = 0: a abrir (sobe); 1 / -1: seguinte / anterior (desliza para o lado)
    enter: (d) => (d === 0 ? { y: "18%", opacity: 0 } : { x: d > 0 ? 160 : -160, opacity: 0 }),
    center: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (d) => ({
        x: d > 0 ? -160 : 160,
        opacity: 0,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    }),
};

const EASE = [0.22, 1, 0.36, 1];
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } };
const RISE = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };
const TITLE_IN = { hidden: { y: "105%" }, show: { y: 0, transition: { duration: 0.9, ease: EASE } } };

const ModalInner = ({ project, index, total, onClose, onPrev, onNext, direction = 1 }) => {
    const lang = useLang().lang;
    const dragControls = useDragControls();
    const scrollRef = useRef(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const isPostsProject =
        project &&
        project.category === "graphic" &&
        project.subtype === "posts";
    const posts = (project && project.posts) || [];
    const stories = (project && project.stories) || [];
    const gallery = isPostsProject
        ? [...posts, ...stories]
        : (project && project.gallery) || [];

    const lbNext = useCallback(
        () =>
            setLightboxIndex((i) =>
                i === null || !gallery.length ? i : (i + 1) % gallery.length,
            ),
        [gallery.length],
    );
    const lbPrev = useCallback(
        () =>
            setLightboxIndex((i) =>
                i === null || !gallery.length
                    ? i
                    : (i - 1 + gallery.length) % gallery.length,
            ),
        [gallery.length],
    );

    // Fecha o lightbox ao trocar de projeto
    useEffect(() => {
        setLightboxIndex(null);
    }, [project && project.id]);

    useEffect(() => {
        if (!project) return;
        const onKey = (e) => {
            if (lightboxIndex !== null) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    setLightboxIndex(null);
                }
                if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    lbPrev();
                }
                if (e.key === "ArrowRight") {
                    e.preventDefault();
                    lbNext();
                }
                return;
            }
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        if (window.__lenis) window.__lenis.stop();
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
            if (window.__lenis) window.__lenis.start();
        };
    }, [project, onClose, onPrev, onNext, lightboxIndex, lbPrev, lbNext]);

    if (!project) return null;

    const cat = project.category;
    const isWeb = cat === "web";
    const isMotion = cat === "motion";
    const isRM = !!(
        cat === "richmedia" &&
        project.richmedia &&
        project.richmedia.screens &&
        project.richmedia.screens.length
    );

    const renderCover = () => {
        const title = t(project.title, lang);

        if (isWeb) {
            return (
                <BrowserFrame
                    src={project.cover}
                    srcMobile={project.cover_mobile}
                    alt={title}
                    url={project.url}
                />
            );
        }

        if (cat === "ar3d") {
            const arOverlay = hasARAssets(project) ? (
                <button
                    type="button"
                    onClick={() =>
                        launchAR({
                            glb: project.model_glb,
                            usdz: project.model_usdz,
                            title,
                            image: project.cover,
                        })
                    }
                    data-testid="modal-ar-button"
                    className="absolute bottom-3 right-3 md:bottom-4 md:right-4 inline-flex items-center gap-2 bg-ink text-bone hover:bg-terracotta transition-colors duration-500 px-4 py-2.5 shadow-lg"
                >
                    <Box size={14} />
                    <span className="text-xs tracking-[0.18em] uppercase">
                        {t(COPY.view_ar, lang)}
                    </span>
                </button>
            ) : null;
            return (
                <StageFrame
                    src={project.cover}
                    alt={title}
                    label={t(project.subtitle, lang)}
                    overlay={arOverlay}
                />
            );
        }

        if (cat === "graphic") {
            return <PrintFrame src={project.cover} alt={title} />;
        }

        if (cat === "photo") {
            return (
                <PhotoFrame
                    src={project.cover}
                    alt={title}
                    caption={`${title} · ${project.year}`}
                />
            );
        }

        if (cat === "richmedia") {
            if (project.richmedia && project.richmedia.screens?.length) {
                return (
                    <PhoneStrip
                        screens={project.richmedia.screens}
                        fit={project.richmedia.fit}
                    />
                );
            }
            return (
                <div className="pm-plain">
                    <img src={project.cover} alt={title} />
                </div>
            );
        }

        if (isMotion) {
            return (
                <PlayerFrame
                    src={project.cover}
                    alt={title}
                    url={project.url}
                    video={project.video}
                />
            );
        }

        return (
            <div className="pm-plain">
                <img src={project.cover} alt={title} />
            </div>
        );
    };

    const linkLabel = isWeb
        ? t(COPY.link_live, lang)
        : isMotion
          ? t(COPY.link_video, lang)
          : t(COPY.link, lang);

    return (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.15 } }}
                    transition={{ duration: 0.35 }}
                    data-testid="project-modal"
                    data-lenis-prevent
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Fundo desfocado */}
                    <motion.div
                        className="absolute inset-0 pm-backdrop"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                    />

                    {/* Painel do projeto */}
                    <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={project.id}
                        custom={direction}
                        variants={CARD_VARIANTS}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="pm-sheet relative w-full flex flex-col"
                        style={{ touchAction: "pan-y" }}
                        drag="x"
                        dragListener={false}
                        dragControls={dragControls}
                        dragDirectionLock
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.25}
                        onPointerDown={(e) => {
                            if (total < 2) return;
                            if (e.target.closest(NO_DRAG)) return;
                            dragControls.start(e);
                        }}
                        onDragEnd={(e, info) => {
                            const dx = info.offset.x;
                            const v = info.velocity.x;
                            if (dx < -110 || v < -600) onNext();
                            else if (dx > 110 || v > 600) onPrev();
                        }}
                    >
                        {/* Barra de cima */}
                        <div className="pm-bar shrink-0">
                            <span className="pm-kicker">
                                ({String(index + 1).padStart(2, "0")}) / {String(total).padStart(2, "0")}
                                <span className="pm-dot" />
                                {t(project.subtitle, lang)}
                            </span>
                            <div className="flex items-center gap-2">
                                {total > 1 ? (
                                    <span className="pm-hint hidden md:inline">
                                        {lang === "PT" ? "Arrasta para o lado" : "Drag sideways"}
                                    </span>
                                ) : null}
                                <button onClick={onPrev} aria-label={t(COPY.prev, lang)} data-testid="modal-prev" className="pm-btn">
                                    <ArrowLeft size={16} />
                                </button>
                                <button onClick={onNext} aria-label={t(COPY.next, lang)} data-testid="modal-next" className="pm-btn">
                                    <ArrowRight size={16} />
                                </button>
                                <button onClick={onClose} aria-label={t(COPY.close, lang)} data-testid="modal-close" className="pm-btn pm-btn-close">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto pm-scroll" ref={scrollRef}>
                            <motion.div className="pm-head" variants={STAGGER} initial="hidden" animate="show">
                                <motion.div variants={RISE} className="pm-meta">
                                    <span>{localize(project.client, lang)}</span>
                                    {project.year ? <span>{project.year}</span> : null}
                                </motion.div>
                                <div className="overflow-hidden">
                                    <motion.h2 variants={TITLE_IN} data-testid="modal-title" className="pm-title">
                                        {t(project.title, lang)}
                                    </motion.h2>
                                </div>
                                {project.summary ? (
                                    <motion.p variants={RISE} className="pm-lead">
                                        {t(project.summary, lang)}
                                    </motion.p>
                                ) : null}
                            </motion.div>

                            {/* Capa — moldura por categoria (nunca corta a imagem) */}
                            <motion.div
                                className="pm-cover"
                                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {renderCover()}
                            </motion.div>

                            {/* CTA grande para testar o rich media */}
                            {isRM ? (
                                <div className="px-5 md:px-8 pt-5 flex justify-center">
                                    <a
                                        href={`/rm/${project.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        data-testid="modal-test-rm"
                                        className="group inline-flex items-center gap-3 bg-ink text-bone px-8 md:px-10 py-4 md:py-5 text-sm md:text-base tracking-[0.18em] uppercase hover:bg-terracotta transition-colors shadow-[0_18px_44px_-18px_rgba(28,27,26,0.55)]"
                                    >
                                        {t(COPY.link_test, lang)}
                                        <ArrowUpRight
                                            size={20}
                                            className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                        />
                                    </a>
                                </div>
                            ) : null}

                            {/* Body */}
                            <InView root={scrollRef} className="pm-body grid grid-cols-12 gap-y-10 md:gap-x-12">
                                <aside className="col-span-12 md:col-span-4 pm-facts">
                                    <MetaRow
                                        label={t(COPY.client, lang)}
                                        value={localize(project.client, lang)}
                                    />
                                    <MetaRow
                                        label={t(COPY.year, lang)}
                                        value={project.year}
                                    />
                                    <MetaRow
                                        label={t(COPY.role, lang)}
                                        value={
                                            project.role
                                                ? localize(project.role, lang)
                                                : t(project.subtitle, lang)
                                        }
                                    />
                                    {project.tools?.length ? (
                                        <div>
                                            <div className="pm-label">
                                                {t(COPY.tools, lang)}
                                            </div>
                                            <ul className="flex flex-wrap gap-1.5 mt-2">
                                                {project.tools.map((tt) => (
                                                    <li
                                                        key={tt}
                                                        className="pm-chip"
                                                    >
                                                        {tt}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                    {project.url ? (
                                        <a
                                            href={project.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            data-testid="modal-external-link"
                                            className="group inline-flex w-full sm:w-auto items-center justify-between gap-6 rounded-full bg-terracotta px-6 py-3.5 text-bone shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] hover:bg-terracotta-hover transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                                        >
                                            <span className="text-sm font-medium tracking-wide">
                                                {linkLabel}
                                            </span>
                                            <ArrowUpRight
                                                size={18}
                                                className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            />
                                        </a>
                                    ) : null}
                                </aside>

                                <div className="col-span-12 md:col-span-8">
                                    <div className="pm-label mb-4">
                                        ↳ {t(COPY.overview, lang)}
                                    </div>
                                    <div className="pm-text space-y-5">
                                        {(project.details
                                            ? localize(
                                                  project.details,
                                                  lang,
                                              ).split(/\n\n+/)
                                            : [t(project.summary, lang)]
                                        ).map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </div>
                                </div>
                            </InView>

                            {/* Gallery */}
                            {isPostsProject ? (
                                posts.length || stories.length ? (
                                    <div className="pm-gallery space-y-10">
                                        {posts.length ? (
                                            <div>
                                                <div className="pm-label mb-5">
                                                    ↳ Posts
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                                    {posts.map((src, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() =>
                                                                setLightboxIndex(i)
                                                            }
                                                            className="block cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                                                            aria-label={`Post ${i + 1}`}
                                                        >
                                                            <img
                                                                src={src}
                                                                alt={`Post ${i + 1}`}
                                                                loading="lazy"
                                                                className="w-full h-auto block"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                        {stories.length ? (
                                            <div>
                                                <div className="pm-label mb-5">
                                                    ↳ Stories
                                                </div>
                                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                                                    {stories.map((src, j) => (
                                                        <button
                                                            key={j}
                                                            type="button"
                                                            onClick={() =>
                                                                setLightboxIndex(
                                                                    posts.length + j,
                                                                )
                                                            }
                                                            className="block cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                                                            aria-label={`Story ${j + 1}`}
                                                        >
                                                            <img
                                                                src={src}
                                                                alt={`Story ${j + 1}`}
                                                                loading="lazy"
                                                                className="w-full h-auto block"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null
                            ) : project.gallery?.length ? (
                                <div className="pm-gallery">
                                    <div className="pm-label mb-5">
                                        ↳ {t(COPY.gallery, lang)}
                                    </div>
                                    <div className="columns-1 sm:columns-2 gap-3 md:gap-4">
                                        {project.gallery.map((src, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setLightboxIndex(i)}
                                                className="block w-full mb-3 md:mb-4 cursor-pointer overflow-hidden break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                                                aria-label={`${t(project.title, lang)} — ${i + 1}`}
                                            >
                                                {isVideo(src) ? (
                                                    <span className="relative block">
                                                        <video
                                                            src={src}
                                                            poster={videoPoster(src)}
                                                            muted
                                                            loop
                                                            autoPlay
                                                            playsInline
                                                            preload="metadata"
                                                            className="w-full h-auto block bg-ink"
                                                        />
                                                        <span className="absolute left-3 bottom-3 h-9 w-9 rounded-full bg-bone/90 flex items-center justify-center">
                                                            <Play size={14} className="text-ink translate-x-[1px]" fill="currentColor" />
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <InView root={scrollRef} as="span" className="block pm-rise">
                                                        <img
                                                            src={src}
                                                            alt={`${t(project.title, lang)} — ${i + 1}`}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="w-full h-auto block"
                                                        />
                                                    </InView>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {total > 1 ? (
                                <button type="button" onClick={onNext} className="pm-next group" data-testid="modal-next-big">
                                    <span className="pm-label">{lang === "PT" ? "Projeto seguinte" : "Next project"}</span>
                                    <span className="pm-next-word">
                                        {lang === "PT" ? "Seguinte" : "Next"}
                                        <ArrowRight className="pm-next-arrow" strokeWidth={1.5} />
                                    </span>
                                </button>
                            ) : null}
                        </div>
                    </motion.div>
                    </AnimatePresence>

                    {/* Lightbox da galeria */}
                    <AnimatePresence>
                        {lightboxIndex !== null && gallery[lightboxIndex] ? (
                            <motion.div
                                className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/92 backdrop-blur-md p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setLightboxIndex(null)}
                                data-testid="gallery-lightbox"
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex(null);
                                    }}
                                    aria-label={t(COPY.close, lang)}
                                    className="absolute top-5 right-5 h-10 w-10 inline-flex items-center justify-center border border-bone/40 text-bone hover:bg-bone hover:text-ink transition-colors"
                                >
                                    <X size={16} />
                                </button>

                                {gallery.length > 1 ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            lbPrev();
                                        }}
                                        aria-label={t(COPY.prev, lang)}
                                        className="absolute left-4 md:left-8 h-11 w-11 inline-flex items-center justify-center border border-bone/40 text-bone hover:bg-bone hover:text-ink transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                ) : null}

                                {isVideo(gallery[lightboxIndex]) ? (
                                    <video
                                        key={gallery[lightboxIndex]}
                                        src={gallery[lightboxIndex]}
                                        poster={videoPoster(gallery[lightboxIndex])}
                                        controls
                                        autoPlay
                                        playsInline
                                        onClick={(e) => e.stopPropagation()}
                                        className="max-h-[calc(85vh/var(--site-zoom))] max-w-[calc(90vw/var(--site-zoom))] shadow-2xl bg-ink"
                                    />
                                ) : (
                                    <img
                                        src={gallery[lightboxIndex]}
                                        alt={`${t(project.title, lang)} — ${lightboxIndex + 1}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="max-h-[calc(85vh/var(--site-zoom))] max-w-[calc(90vw/var(--site-zoom))] object-contain shadow-2xl"
                                    />
                                )}

                                {gallery.length > 1 ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            lbNext();
                                        }}
                                        aria-label={t(COPY.next, lang)}
                                        className="absolute right-4 md:right-8 h-11 w-11 inline-flex items-center justify-center border border-bone/40 text-bone hover:bg-bone hover:text-ink transition-colors"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                ) : null}

                                {gallery.length > 1 ? (
                                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.18em] text-bone/70 tabular-nums">
                                        {String(lightboxIndex + 1).padStart(2, "0")}{" "}
                                        / {String(gallery.length).padStart(2, "0")}
                                    </span>
                                ) : null}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </motion.div>
    );
};

// Abrir/fechar com animação: guarda o último projeto para a animação de saída
// e calcula a direção (anterior/seguinte) para o cartão deslizar para o lado certo.
const ProjectModal = ({ project, index, total, onClose, onPrev, onNext }) => {
    const last = useRef(null);
    const prevIndex = useRef(index);
    const dir = useRef(1);
    if (project) {
        if (!last.current) dir.current = 0;
        else if (last.current.project.id !== project.id) {
            const d = index - prevIndex.current;
            // passar do último para o primeiro (ou ao contrário) conta como "seguinte"/"anterior"
            dir.current = Math.abs(d) > 1 ? (d > 0 ? -1 : 1) : d >= 0 ? 1 : -1;
        }
        prevIndex.current = index;
        last.current = { project, index, total };
    }
    const shown = last.current;
    return (
        <AnimatePresence onExitComplete={() => (last.current = null)}>
            {project && shown ? (
                <ModalInner
                    key="project-modal"
                    project={shown.project}
                    index={shown.index}
                    total={shown.total}
                    direction={dir.current}
                    onClose={onClose}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            ) : null}
        </AnimatePresence>
    );
};

const MetaRow = ({ label, value }) =>
    value ? (
        <div className="pm-fact">
            <div className="pm-label">{label}</div>
            <div className="pm-value">{value}</div>
        </div>
    ) : null;

// Mostra os filhos com uma animação suave quando entram no ecrã
// (dentro do painel do projeto, que tem o seu próprio scroll).
const InView = ({ root, as = "div", className = "", children }) => {
    const ref = useRef(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setOn(true);
                    io.disconnect();
                }
            },
            { root: root && root.current ? root.current : null, threshold: 0.08 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [root]);
    const Tag = as;
    return (
        <Tag ref={ref} className={`pm-reveal ${on ? "is-in" : ""} ${className}`}>
            {children}
        </Tag>
    );
};

export default ProjectModal;
