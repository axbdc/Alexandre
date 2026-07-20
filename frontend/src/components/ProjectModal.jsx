import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="relative border border-hairline overflow-hidden bg-gradient-to-b from-[#f4f2ee] to-[#e7e3da]">
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
    <div className="border border-hairline bg-[#e7e3da] p-6 md:p-12 flex items-center justify-center">
        <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[58vh] object-contain bg-white shadow-[0_30px_60px_-25px_rgba(28,27,26,0.55)]"
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
                    className="w-full object-cover"
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
const PlayerFrame = ({ src, alt, url }) => {
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
                    className="w-full h-full object-cover opacity-90"
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


const ProjectModal = ({ project, index, total, onClose, onPrev, onNext }) => {
    const lang = useLang().lang;
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
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
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
                <div className="relative project-image-wrap aspect-[16/9]">
                    <img src={project.cover} alt={title} />
                </div>
            );
        }

        if (isMotion) {
            return (
                <PlayerFrame src={project.cover} alt={title} url={project.url} />
            );
        }

        return (
            <div className="relative project-image-wrap aspect-[16/9]">
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
        <AnimatePresence>
            {project && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    data-testid="project-modal"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Blurred backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-ink/30 backdrop-blur-md"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    />

                    {/* Centered card */}
                    <motion.div
                        key={project.id}
                        className="relative bg-bone w-full max-w-[940px] max-h-[88vh] flex flex-col shadow-[0_30px_80px_-20px_rgba(28,27,26,0.35)]"
                        initial={{ y: 24, opacity: 0, scale: 0.985 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 12, opacity: 0, scale: 0.99 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        {/* Top bar */}
                        <div className="shrink-0 hairline-bottom flex items-center justify-between px-5 md:px-7 h-12 md:h-14 bg-bone">
                            <span className="overline">
                                {String(index + 1).padStart(2, "0")}{" "}
                                <span className="text-mist">
                                    {t(COPY.of, lang)}{" "}
                                    {String(total).padStart(2, "0")}
                                </span>
                                <span className="text-mist mx-2">·</span>
                                <span className="text-mist">
                                    {t(project.subtitle, lang)}
                                </span>
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={onPrev}
                                    aria-label={t(COPY.prev, lang)}
                                    data-testid="modal-prev"
                                    className="h-8 w-8 inline-flex items-center justify-center border border-hairline text-ink hover:border-ink transition-colors"
                                >
                                    <ArrowLeft size={14} />
                                </button>
                                <button
                                    onClick={onNext}
                                    aria-label={t(COPY.next, lang)}
                                    data-testid="modal-next"
                                    className="h-8 w-8 inline-flex items-center justify-center border border-hairline text-ink hover:border-ink transition-colors"
                                >
                                    <ArrowRight size={14} />
                                </button>
                                <button
                                    onClick={onClose}
                                    aria-label={t(COPY.close, lang)}
                                    data-testid="modal-close"
                                    className="ml-1 h-8 w-8 inline-flex items-center justify-center border border-ink text-ink hover:bg-ink hover:text-bone transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="px-5 md:px-8 pt-6 md:pt-8 pb-4">
                                <h2
                                    data-testid="modal-title"
                                    className="font-display text-2xl md:text-4xl leading-[1] text-ink"
                                >
                                    {t(project.title, lang)}
                                </h2>
                                <div className="mt-2 text-sm text-graphite">
                                    {localize(project.client, lang)}
                                    <span className="text-mist mx-2">·</span>
                                    {project.year}
                                </div>
                            </div>

                            {/* Cover — moldura por categoria */}
                            <div className="px-5 md:px-8 pb-2">
                                {renderCover()}
                            </div>

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
                            <div className="px-5 md:px-8 pt-8 pb-2 grid grid-cols-12 gap-6">
                                <aside className="col-span-12 md:col-span-4 space-y-5 text-sm">
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
                                            <div className="overline mb-2">
                                                {t(COPY.tools, lang)}
                                            </div>
                                            <ul className="flex flex-wrap gap-x-3 gap-y-1">
                                                {project.tools.map((tt) => (
                                                    <li
                                                        key={tt}
                                                        className="text-sm text-ink"
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
                                            className="group inline-flex items-center gap-2 text-ink text-sm"
                                        >
                                            <span className="link-underline">
                                                {linkLabel}
                                            </span>
                                            <ArrowUpRight
                                                size={14}
                                                className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                            />
                                        </a>
                                    ) : null}
                                </aside>

                                <div className="col-span-12 md:col-span-8">
                                    <div className="overline mb-3">
                                        {t(COPY.overview, lang)}
                                    </div>
                                    <div className="space-y-4 text-sm md:text-base text-graphite leading-relaxed">
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
                            </div>

                            {/* Gallery */}
                            {isPostsProject ? (
                                posts.length || stories.length ? (
                                    <div className="px-5 md:px-8 pt-8 pb-8 space-y-8">
                                        {posts.length ? (
                                            <div>
                                                <div className="overline mb-4">
                                                    Posts
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
                                                <div className="overline mb-4">
                                                    Stories
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
                                <div className="px-5 md:px-8 pt-8 pb-8">
                                    <div className="overline mb-4">
                                        {t(COPY.gallery, lang)}
                                    </div>
                                    <div className="columns-2 gap-3 md:gap-4">
                                        {project.gallery.map((src, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setLightboxIndex(i)}
                                                className="block w-full mb-3 md:mb-4 cursor-pointer overflow-hidden break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                                                aria-label={`${t(project.title, lang)} — ${i + 1}`}
                                            >
                                                <img
                                                    src={src}
                                                    alt={`${t(project.title, lang)} — ${i + 1}`}
                                                    loading="lazy"
                                                    className="w-full h-auto block"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>

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

                                <img
                                    src={gallery[lightboxIndex]}
                                    alt={`${t(project.title, lang)} — ${lightboxIndex + 1}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl"
                                />

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
            )}
        </AnimatePresence>
    );
};

const MetaRow = ({ label, value }) => (
    <div>
        <div className="overline mb-1">{label}</div>
        <div className="text-sm md:text-base text-ink">{value}</div>
    </div>
);

export default ProjectModal;
