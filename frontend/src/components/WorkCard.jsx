import React, { useEffect, useState } from "react";
import { getCoverInfo, peekCoverInfo, brandTint } from "../lib/coverInfo";
import { t } from "../context/LanguageContext";
import { CATEGORIES } from "../data/content";
import { cld, cldSrcSet } from "../lib/img";
import { ArrowUpRight } from "lucide-react";
import { isARProject } from "../lib/ar";

const localize = (v, lang) => (typeof v === "string" ? v : t(v, lang));

const catLabel = (id, lang) => {
    const c = CATEGORIES.find((x) => x.id === id);
    return c ? t(c.label, lang) : "";
};

// Cartão de projeto: número, etiquetas, título gigante e barra "Ver projeto" no hover.
// Capa com fundo transparente (logo): cartão limpo com um tom suave da cor da
// marca e o logo ao centro. Capa normal (foto/print): ocupa o cartão todo.
const useCover = (url) => {
    const [info, setInfo] = useState(() => peekCoverInfo(url));
    useEffect(() => {
        let alive = true;
        getCoverInfo(url).then((v) => alive && setInfo(v));
        return () => {
            alive = false;
        };
    }, [url]);
    return info;
};

// Logos: o Cloudinary corta as margens transparentes (e_trim) para todos os
// logos ficarem com o mesmo peso no cartão.
const trim = (u) => (u ? u.replace(/(res\.cloudinary\.com\/[^/]+\/image\/upload\/)/g, "$1e_trim/") : u);

const WorkCard = ({ p, i, lang, onOpen, className = "", fill = false }) => {
    const info = useCover(p.cover);
    const brand = !!(info && info.logo);
    const mode = !info ? "is-loading" : brand ? "work-card--brand" : "work-card--photo";
    return (
        <button
            type="button"
            onClick={() => onOpen(p.id)}
            data-cursor="project"
            aria-label={t(p.title, lang)}
            className={`work-card group ${fill ? "work-card--fill" : ""} ${mode} ${className}`}
            style={brand ? { "--card-tint": brandTint(info.color) } : undefined}
        >
            <div className="work-card-media">
                <img
                    className="work-card-img"
                    src={brand ? trim(cld(p.cover, 1400)) : cld(p.cover, 1400)}
                    srcSet={brand ? trim(cldSrcSet(p.cover, [700, 1000, 1400])) : cldSrcSet(p.cover, [700, 1000, 1400, 1800, 2400])}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    alt={t(p.title, lang)}
                    loading="lazy"
                    decoding="async"
                />
                <span className="work-card-shade" aria-hidden="true" />
                <span className="work-card-no">({String(i + 1).padStart(2, "0")})</span>
                <span className="work-card-tags">
                    <span>{catLabel(p.category, lang)}</span>
                    {isARProject(p) ? <span className="work-card-ar">AR</span> : null}
                    {p.year ? <span>{p.year}</span> : null}
                </span>
                <span className="work-card-title">
                    <span className="work-card-client">{p.highlightLabel ? t(p.highlightLabel, lang) : localize(p.client, lang)}</span>
                    <span className="font-condensed uppercase">{t(p.title, lang)}</span>
                </span>
                {/* barra por cima da imagem: aparece no hover sem mexer no tamanho do cartão */}
                <span className="work-card-bar" aria-hidden="true">
                    <span>{lang === "PT" ? "Ver o projeto" : "View project"}</span>
                    <ArrowUpRight size={18} />
                </span>
            </div>
        </button>
    );
};

export default WorkCard;
