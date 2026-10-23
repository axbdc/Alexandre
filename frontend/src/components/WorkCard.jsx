import React from "react";
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
// fill: a imagem ocupa o cartão todo (destaques); sem fill fica inteira sobre fundo desfocado (grelha).
const WorkCard = ({ p, i, lang, onOpen, className = "", fill = false }) => (
    <button
        type="button"
        onClick={() => onOpen(p.id)}
        data-cursor="project"
        aria-label={t(p.title, lang)}
        className={`work-card group ${fill ? "work-card--fill" : ""} ${className}`}
    >
        <div className="work-card-media">
            {/* fundo: a mesma imagem desfocada, para a imagem principal nunca ser cortada */}
            {fill ? null : (
                <img className="work-card-bg" src={cld(p.cover, 200)} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            )}
            <img
                className="work-card-img"
                src={cld(p.cover, 1400)}
                srcSet={cldSrcSet(p.cover, [700, 1000, 1400, 1800, 2400])}
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


export default WorkCard;
