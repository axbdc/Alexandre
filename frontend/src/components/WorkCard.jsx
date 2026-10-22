import React from "react";
import { t } from "../context/LanguageContext";
import { CATEGORIES } from "../data/content";
import { cld, cldSrcSet } from "../lib/img";
import { ArrowUpRight } from "lucide-react";

const localize = (v, lang) => (typeof v === "string" ? v : t(v, lang));

const catLabel = (id, lang) => {
    const c = CATEGORIES.find((x) => x.id === id);
    return c ? t(c.label, lang) : "";
};

// Cartão de projeto: número, etiquetas, título gigante e barra "Ver projeto" no hover.
const WorkCard = ({ p, i, lang, onOpen, className = "" }) => (
    <button
        type="button"
        onClick={() => onOpen(p.id)}
        data-testid={`project-card-${p.id}`}
        data-cursor="project"
        aria-label={t(p.title, lang)}
        className={`work-card group ${className}`}
    >
        <div className="work-card-media">
            <img
                src={cld(p.cover, 900)}
                srcSet={cldSrcSet(p.cover)}
                sizes="(min-width: 768px) 50vw, 100vw"
                alt={t(p.title, lang)}
                loading="lazy"
                decoding="async"
            />
            <span className="work-card-shade" aria-hidden="true" />
            <span className="work-card-no">({String(i + 1).padStart(2, "0")})</span>
            <span className="work-card-tags">
                <span>{catLabel(p.category, lang)}</span>
                {p.year ? <span>{p.year}</span> : null}
            </span>
            <span className="work-card-title">
                <span className="work-card-client">{localize(p.client, lang)}</span>
                <span className="font-condensed uppercase">{t(p.title, lang)}</span>
            </span>
        </div>
        <span className="work-card-bar">
            <span>{lang === "PT" ? "Ver o projeto" : "View project"}</span>
            <ArrowUpRight size={18} />
        </span>
    </button>
);


export default WorkCard;
