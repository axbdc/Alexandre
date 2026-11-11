import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
    X,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Box,
    Play,
    Link2,
    Check,
} from "lucide-react";
import { useLang, t } from "../context/LanguageContext";
import { launchAR, isARProject, canLaunchAR } from "../lib/ar";
import ARViewer from "./ARViewer";
import { PhoneStrip } from "./RichMedia";
import { isVideo, videoPoster } from "../lib/media";
import { cld, cldSrcSet } from "../lib/img";
import { projectPath } from "../lib/projectUrl";

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

// WEB, janela de browser. A barra mostra o domínio do `url`.
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
                        src={cld(src, 1000)}
                        srcSet={cldSrcSet(src, [1000, 1800])}
                        sizes="(min-width: 1024px) 50vw, 100vw"
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
                                src={cld(srcMobile, 1000)}
                                srcSet={cldSrcSet(srcMobile, [1000, 1800])}
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                alt={`${alt} (mobile)`}
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

// AR & 3D, render sobre "estúdio" neutro, com sombra de contacto.
// object-contain para nunca cortar o render. overlay = botão AR (opcional).
const StageFrame = ({ src, alt, label, overlay }) => (
    <div className="relative border border-hairline overflow-hidden bg-gradient-to-b from-pebble to-sand">
        <div className="aspect-[16/9] flex items-center justify-center p-6 md:p-10">
            <img
                src={cld(src, 1000)}
                srcSet={cldSrcSet(src, [1000, 1800])}
                sizes="(min-width: 1024px) 50vw, 100vw"
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

// DESIGN GRÁFICO, a arte como folha impressa sobre superfície neutra.
// Respeita o rácio da imagem (object-contain), com sombra de folha.
const PrintFrame = ({ src, alt }) => (
    <div className="border border-hairline bg-sand p-6 md:p-12 flex items-center justify-center">
        <img
            src={cld(src, 1000)}
            srcSet={cldSrcSet(src, [1000, 1800])}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt={alt}
            className="max-w-full max-h-[calc(58vh/var(--site-zoom))] object-contain bg-white shadow-[0_30px_60px_-25px_rgba(28,27,26,0.55)]"
            loading="lazy"
        />
    </div>
);

// FOTOGRAFIA, moldura de galeria: passe-partout fino + legenda.
const PhotoFrame = ({ src, alt, caption }) => (
    <figure>
        <div className="bg-white border border-hairline p-3 md:p-4 shadow-[0_22px_50px_-30px_rgba(28,27,26,0.5)]">
            <div className="overflow-hidden">
                <img
                    src={cld(src, 1000)}
                    srcSet={cldSrcSet(src, [1000, 1800])}
                    sizes="(min-width: 1024px) 50vw, 100vw"
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

// MOTION & RICH MEDIA, chrome de leitor de vídeo. Se houver `url`, o play
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
                    src={cld(src, 1000)}
                    srcSet={cldSrcSet(src, [1000, 1800])}
                    sizes="(min-width: 1024px) 50vw, 100vw"
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


// MOTION com vários vídeos: leitor grande em cima e, por baixo, a lista dos
// vídeos do cliente para trocar. O leitor adapta-se ao formato do vídeo
// (16:9, quadrado ou vertical) para não aparecerem barras pretas enormes.
const MotionPlayer = ({ videos, cover, alt, lang }) => {
    const [cur, setCur] = useState(0);
    const [ratio, setRatio] = useState(16 / 9);
    const [autoplay, setAutoplay] = useState(false);
    const v = videos[Math.min(cur, videos.length - 1)];
    const vertical = ratio < 1;
    const pick = (i) => {
        if (i === cur) return;
        setAutoplay(true);
        setCur(i);
    };
    return (
        <div>
            <div className="relative border border-hairline bg-ink overflow-hidden flex justify-center">
                <video
                    key={v.src}
                    src={v.src}
                    poster={cur === 0 && cover ? cover : videoPoster(v.src)}
                    controls
                    playsInline
                    autoPlay={autoplay}
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                        const el = e.currentTarget;
                        if (el.videoWidth && el.videoHeight) setRatio(el.videoWidth / el.videoHeight);
                    }}
                    className="block bg-ink object-contain"
                    style={
                        vertical
                            ? { height: "min(78vh, 760px)", aspectRatio: String(ratio), maxWidth: "100%" }
                            : { width: "100%", aspectRatio: String(ratio) }
                    }
                    aria-label={t(v.title, lang) || alt}
                />
            </div>
            {videos.length > 1 ? (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2" data-no-drag>
                    {videos.map((it, i) => {
                        const on = i === cur;
                        const label = t(it.title, lang);
                        return (
                            <button
                                key={it.src + i}
                                type="button"
                                onClick={() => pick(i)}
                                aria-pressed={on}
                                className={`shrink-0 w-36 md:w-44 text-left group focus:outline-none ${on ? "" : "opacity-70 hover:opacity-100"}`}
                            >
                                <span className={`relative block aspect-video overflow-hidden bg-ink border ${on ? "border-ink" : "border-hairline"}`}>
                                    <img
                                        src={videoPoster(it.src) || cover}
                                        alt=""
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute left-2 bottom-2 h-7 w-7 rounded-full bg-bone/90 flex items-center justify-center">
                                        <Play size={11} className="text-ink translate-x-[1px]" fill="currentColor" />
                                    </span>
                                </span>
                                <span className="mt-1.5 flex items-baseline gap-2 text-[12px] leading-tight">
                                    <span className="tabular-nums text-mist">{String(i + 1).padStart(2, "0")}</span>
                                    <span className={`truncate ${on ? "text-ink" : "text-graphite"}`}>
                                        {label || `${alt} ${i + 1}`}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
};

// MOTION com vários vídeos: mostra todos de uma vez, a tocar em silêncio
// (só os que estão à vista). Tocar num abre-o em grande, com som, e dá para
// passar aos outros com as setas.
const WallTile = ({ v, i, label, onOpen, root, ratio, onRatio }) => {
    const ref = useRef(null);
    const setRatio = (r) => onRatio(i, r);
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        // o vídeo pode já ter os metadados antes de o React ligar o evento
        if (el.readyState >= 1 && el.videoWidth) setRatio(el.videoWidth / el.videoHeight);
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    const p = el.play();
                    if (p && p.catch) p.catch(() => {});
                } else el.pause();
            },
            { root: root && root.current ? root.current : null, threshold: 0.25 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [root]);
    return (
        <button
            type="button"
            onClick={() => onOpen(i)}
            className="group text-left focus:outline-none"
            aria-label={label}
        >
            <span
                className="relative block overflow-hidden rounded-[14px] bg-ink shadow-[0_18px_40px_-24px_rgba(28,27,26,0.55)] ring-1 ring-black/5"
                style={{ aspectRatio: String(ratio) }}
            >
                <video
                    ref={ref}
                    src={v.src}
                    poster={videoPoster(v.src)}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                        const el = e.currentTarget;
                        if (el.videoWidth && el.videoHeight) setRatio(el.videoWidth / el.videoHeight);
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300" />
                <span className="absolute right-2.5 top-2.5 h-8 w-8 rounded-full bg-bone/90 flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                    <Play size={12} className="text-ink translate-x-[1px]" fill="currentColor" />
                </span>
            </span>
            <span className="mt-2 flex items-baseline gap-2 text-[12px] leading-tight">
                <span className="tabular-nums text-mist">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-graphite group-hover:text-ink transition-colors">{label}</span>
            </span>
        </button>
    );
};

// Os vídeos horizontais vão para uma grelha própria (2 por linha) e os
// verticais/quadrados para outra (4 por linha), para não ficarem buracos.
const MotionWall = ({ videos, alt, lang, onOpen, root }) => {
    const [ratios, setRatios] = useState({});
    const onRatio = useCallback((i, r) => setRatios((m) => (m[i] === r ? m : { ...m, [i]: r })), []);
    const items = videos.map((v, i) => ({ v, i, ratio: ratios[i] || 9 / 16 }));
    const wide = items.filter((x) => x.ratio > 1.2);
    const tall = items.filter((x) => x.ratio <= 1.2);
    const tile = (x) => (
        <WallTile
            key={x.v.src + x.i}
            v={x.v}
            i={x.i}
            root={root}
            ratio={x.ratio}
            onRatio={onRatio}
            label={t(x.v.title, lang) || `${alt} ${x.i + 1}`}
            onOpen={onOpen}
        />
    );
    return (
        <div>
            <div className="pm-label mb-4">
                ↳ {String(videos.length).padStart(2, "0")}{" "}
                {lang === "PT" ? "vídeos · toca num para ver com som" : "videos · tap one to watch with sound"}
            </div>
            {wide.length ? (
                <div className={`grid grid-cols-1 ${wide.length > 1 ? "md:grid-cols-2" : ""} gap-3 md:gap-4 items-start ${tall.length ? "mb-5 md:mb-6" : ""}`}>
                    {wide.map(tile)}
                </div>
            ) : null}
            {tall.length ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-start">
                    {tall.map(tile)}
                </div>
            ) : null}
        </div>
    );
};

// DESIGN GRÁFICO / POSTS: primeiro os posts, depois as stories. Os posts são
// separados pelo formato (1080x1080 e 1080x1350), cada grupo com cartões do
// seu tamanho e 4 por linha, para as filas ficarem sempre alinhadas.
const PostTile = ({ src, i, label, ratio, onOpen, eager }) => (
    <button
        type="button"
        onClick={onOpen}
        className="group block text-left focus:outline-none"
        aria-label={label}
    >
        <span
            className="relative block overflow-hidden rounded-[12px] bg-pebble shadow-[0_18px_40px_-24px_rgba(28,27,26,0.55)] ring-1 ring-black/5"
            style={{ aspectRatio: String(ratio) }}
        >
            <img
                src={cld(src, 1000)}
                srcSet={cldSrcSet(src, [1000, 1800])}
                sizes="(min-width: 1024px) 25vw, 50vw"
                alt={label}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />
        </span>
        <span className="mt-2 block text-[12px] tabular-nums text-mist">
            {String(i + 1).padStart(2, "0")}
        </span>
    </button>
);

// Lê o tamanho de cada imagem antes de montar a grelha (1:1 ou 4:5).
const usePostRatios = (list) => {
    const [ratios, setRatios] = useState({});
    useEffect(() => {
        let alive = true;
        list.forEach((src) => {
            const im = new Image();
            im.onload = () => {
                if (!alive || !im.naturalWidth) return;
                const r = im.naturalWidth / im.naturalHeight;
                setRatios((m) => ({ ...m, [src]: r > 0.9 ? 1 : 4 / 5 }));
            };
            im.src = cld(src, 200);
        });
        return () => {
            alive = false;
        };
    }, [list.join("|")]);
    return ratios;
};

// DESIGN GRÁFICO (banners, cartazes, impressão...): a galeria em grelha no topo,
// agrupada por formato para as filas ficarem alinhadas.
const bucketOf = (r) => {
    if (r > 1.25) return { key: "wide", ratio: r > 1.6 ? 16 / 9 : 4 / 3, cols: "md:grid-cols-2" };
    if (r > 0.9) return { key: "square", ratio: 1, cols: "md:grid-cols-4" };
    if (r > 0.7) return { key: "portrait", ratio: 4 / 5, cols: "md:grid-cols-4" };
    return { key: "tall", ratio: 9 / 16, cols: "md:grid-cols-5" };
};
const ORDER = ["wide", "square", "portrait", "tall"];

const useRatios = (list) => {
    const [ratios, setRatios] = useState({});
    useEffect(() => {
        let alive = true;
        list.forEach((src) => {
            const im = new Image();
            im.onload = () => {
                if (!alive || !im.naturalWidth) return;
                setRatios((m) => ({ ...m, [src]: im.naturalWidth / im.naturalHeight }));
            };
            im.src = cld(src, 200);
        });
        return () => {
            alive = false;
        };
    }, [list.join("|")]);
    return ratios;
};

const GalleryWall = ({ images, title, lang, onOpen }) => {
    const ratios = useRatios(images);
    const ready = images.every((src) => ratios[src]);
    const groups = {};
    images.forEach((src, i) => {
        const b = bucketOf(ratios[src] || 1);
        (groups[b.key] = groups[b.key] || { ...b, items: [] }).items.push({ src, i });
    });
    let n = 0;
    return (
        <div>
            <div className="pm-label mb-4">
                ↳ {String(images.length).padStart(2, "0")}{" "}
                {lang === "PT" ? "peças · toca para ver em grande" : "pieces · tap to view larger"}
            </div>
            <div className={`space-y-3 md:space-y-4 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>
                {ORDER.filter((k) => groups[k]).map((k) => (
                    <div key={k} className={`grid grid-cols-2 ${groups[k].cols} gap-3 md:gap-4`}>
                        {groups[k].items.map((x) => {
                            const num = n++;
                            return (
                                <PostTile
                                    key={x.src + x.i}
                                    src={x.src}
                                    i={num}
                                    ratio={groups[k].ratio}
                                    eager={num < 8}
                                    label={`${title} ${num + 1}`}
                                    onOpen={() => onOpen(x.i)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PostsWall = ({ posts, stories, title, lang, onOpen }) => {
    const ratios = usePostRatios(posts);
    const ready = posts.every((src) => ratios[src]);
    const items = posts.map((src, i) => ({ src, i, ratio: ratios[src] || 4 / 5 }));
    const groups = ready
        ? [items.filter((x) => x.ratio === 1), items.filter((x) => x.ratio !== 1)].filter((g) => g.length)
        : [items];
    let n = 0;
    return (
        <div className="space-y-10 md:space-y-12">
            {posts.length ? (
                <div>
                    <div className="pm-label mb-4">
                        ↳ {String(posts.length).padStart(2, "0")} posts
                        {lang === "PT" ? " · toca para ver em grande" : " · tap to view larger"}
                    </div>
                    <div className={`space-y-3 md:space-y-4 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>
                        {groups.map((g, gi) => (
                            <div key={gi} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                {g.map((x) => {
                                    const num = n++;
                                    return (
                                        <PostTile
                                            key={x.src + x.i}
                                            src={x.src}
                                            i={num}
                                            ratio={x.ratio}
                                            eager={num < 8}
                                            label={`${title} post ${num + 1}`}
                                            onOpen={() => onOpen(x.i)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
            {stories.length ? (
                <div>
                    <div className="pm-label mb-4">
                        ↳ {String(stories.length).padStart(2, "0")} stories
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                        {stories.map((src, j) => (
                            <PostTile
                                key={src + j}
                                src={src}
                                i={j}
                                ratio={9 / 16}
                                label={`${title} story ${j + 1}`}
                                onOpen={() => onOpen(posts.length + j)}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
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
    // design gráfico sem posts/stories mas com galeria a sério (não só a capa)
    const graphicWall =
        project &&
        project.category === "graphic" &&
        !(project.subtype === "posts" && ((project.posts || []).length || (project.stories || []).length)) &&
        project.gallery &&
        project.gallery.length > 1;
    const stories = (project && project.stories) || [];
    const motionVideos =
        project && project.category === "motion" && project.videos && project.videos.length > 1
            ? project.videos
            : null;
    const gallery = isPostsProject
        ? [...posts, ...stories]
        : motionVideos
          ? motionVideos.map((v) => v.src)
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

    // Visualizador 3D (computador) aberto?
    const [arOpen, setArOpen] = useState(false);

    // Fecha o lightbox (e o visualizador 3D) ao trocar de projeto
    useEffect(() => {
        setLightboxIndex(null);
        setArOpen(false);
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
            if (e.key === "Escape") {
                if (arOpen) setArOpen(false);
                else onClose();
                return;
            }
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
    }, [project, onClose, onPrev, onNext, lightboxIndex, lbPrev, lbNext, arOpen]);

    if (!project) return null;

    const cat = project.category;
    const isWeb = cat === "web";
    const isMotion = cat === "motion";
    const isAR = isARProject(project);
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
            return (
                <StageFrame
                    src={project.cover}
                    alt={title}
                    label={t(project.subtitle, lang)}
                />
            );
        }

        if (isPostsProject && (posts.length || stories.length)) {
            return (
                <PostsWall
                    posts={posts}
                    stories={stories}
                    title={title}
                    lang={lang}
                    onOpen={setLightboxIndex}
                />
            );
        }

        if (graphicWall) {
            return (
                <GalleryWall
                    images={project.gallery}
                    title={title}
                    lang={lang}
                    onOpen={setLightboxIndex}
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
                    <img src={cld(project.cover, 1000)} alt={title} />
                </div>
            );
        }

        if (motionVideos) {
            return (
                <MotionWall
                    videos={motionVideos}
                    alt={title}
                    lang={lang}
                    root={scrollRef}
                    onOpen={setLightboxIndex}
                />
            );
        }

        if (isMotion && project.videos && project.videos.length) {
            return (
                <MotionPlayer
                    videos={project.videos}
                    cover={project.cover}
                    alt={title}
                    lang={lang}
                />
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
                <img src={cld(project.cover, 1000)} alt={title} />
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
                                <ShareButton project={project} lang={lang} />
                                <button onClick={onPrev} aria-label={t(COPY.prev, lang)} className="pm-btn">
                                    <ArrowLeft size={16} />
                                </button>
                                <button onClick={onNext} aria-label={t(COPY.next, lang)} className="pm-btn">
                                    <ArrowRight size={16} />
                                </button>
                                <button onClick={onClose} aria-label={t(COPY.close, lang)} className="pm-btn pm-btn-close">
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
                                    <motion.h2 variants={TITLE_IN} className="pm-title">
                                        {t(project.title, lang)}
                                    </motion.h2>
                                </div>
                                {project.summary ? (
                                    <motion.p variants={RISE} className="pm-lead">
                                        {t(project.summary, lang)}
                                    </motion.p>
                                ) : null}
                            </motion.div>

                            {/* Capa, moldura por categoria (nunca corta a imagem) */}
                            <motion.div
                                className="pm-cover"
                                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {renderCover()}
                            </motion.div>

                            {/* Realidade aumentada: no telemóvel abre a AR; no computador abre o visualizador 3D */}
                            {isAR ? (
                                <div className="pm-ar-cta">
                                    <button
                                        type="button"
                                        className="pm-cta group"
                                        onClick={() => {
                                            if (canLaunchAR()) {
                                                launchAR({
                                                    glb: project.model_glb,
                                                    usdz: project.model_usdz,
                                                    title: t(project.title, lang),
                                                    image: project.cover,
                                                });
                                            } else {
                                                setArOpen(true);
                                            }
                                        }}
                                    >
                                        <Box size={20} />
                                        {lang === "PT" ? "Ver em realidade aumentada" : "View in augmented reality"}
                                        <ArrowUpRight size={20} className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </button>
                                    <span className="pm-hint">
                                        {lang === "PT"
                                            ? "No telemóvel abre a câmara. No computador mostra o modelo 3D animado."
                                            : "On a phone it opens the camera. On a computer it shows the animated 3D model."}
                                    </span>
                                </div>
                            ) : null}

                            {/* CTA grande para testar o rich media */}
                            {isRM ? (
                                <div className="px-5 md:px-8 pt-5 flex justify-center">
                                    <a
                                        href={`/rm/${project.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
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
                            {isPostsProject || graphicWall ? null : !motionVideos && project.gallery?.length ? (
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
                                                aria-label={`${t(project.title, lang)} ${i + 1}`}
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
                                                            src={cld(src, 1000)}
                                                            srcSet={cldSrcSet(src, [1000, 1800])}
                                                            sizes="(min-width: 1024px) 50vw, 100vw"
                                                            alt={`${t(project.title, lang)} ${i + 1}`}
                                                            loading={i < 4 ? "eager" : "lazy"}
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
                                <button type="button" onClick={onNext} className="pm-next group">
                                    <span className="pm-label">{lang === "PT" ? "Projeto seguinte" : "Next project"}</span>
                                    <span className="pm-next-word">
                                        {lang === "PT" ? "Seguinte" : "Next"}
                                        <ArrowRight className="pm-next-arrow" strokeWidth={1.5} />
                                    </span>
                                </button>
                            ) : null}
                        </div>

                        <AnimatePresence>
                            {arOpen && isAR ? (
                                <ARViewer
                                    project={project}
                                    title={t(project.title, lang)}
                                    lang={lang}
                                    onClose={() => setArOpen(false)}
                                />
                            ) : null}
                        </AnimatePresence>
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
                                        src={cld(gallery[lightboxIndex], 1800)}
                                        alt={`${t(project.title, lang)} ${lightboxIndex + 1}`}
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
                                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.18em] text-bone/70 tabular-nums whitespace-nowrap">
                                        {String(lightboxIndex + 1).padStart(2, "0")}{" "}
                                        / {String(gallery.length).padStart(2, "0")}
                                        {motionVideos && motionVideos[lightboxIndex] && t(motionVideos[lightboxIndex].title, lang) ? (
                                            <span className="text-bone/90 normal-case tracking-normal ml-3">
                                                {t(motionVideos[lightboxIndex].title, lang)}
                                            </span>
                                        ) : null}
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
// Partilhar o projeto: no telemóvel abre o menu de partilha, no computador copia o link.
const ShareButton = ({ project, lang }) => {
    const [done, setDone] = useState(false);
    const onShare = async () => {
        const url = `${window.location.origin}${projectPath(project)}`;
        const title = t(project.title, lang);
        try {
            if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setDone(true);
            setTimeout(() => setDone(false), 2000);
        } catch (_) {
            /* cancelado */
        }
    };
    const label = done
        ? lang === "PT" ? "Link copiado" : "Link copied"
        : lang === "PT" ? "Partilhar projeto" : "Share project";
    return (
        <button type="button" onClick={onShare} aria-label={label} title={label} className="pm-btn">
            {done ? <Check size={16} /> : <Link2 size={16} />}
        </button>
    );
};

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
            // threshold 0 + margem: uma imagem ainda sem altura (a carregar)
            // também conta, senão a animação e o carregamento ficavam presos.
            { root: root && root.current ? root.current : null, threshold: 0, rootMargin: "0px 0px 200px 0px" },
        );
        io.observe(el);
        // segurança: nunca deixar conteúdo escondido
        const safety = setTimeout(() => setOn(true), 2500);
        return () => {
            io.disconnect();
            clearTimeout(safety);
        };
    }, [root]);
    const Tag = as;
    return (
        <Tag ref={ref} className={`pm-reveal ${on ? "is-in" : ""} ${className}`}>
            {children}
        </Tag>
    );
};

export default ProjectModal;
