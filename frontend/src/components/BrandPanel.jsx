import React, { useEffect } from "react";
import { X } from "lucide-react";
import { t } from "../context/LanguageContext";
import { CATEGORIES } from "../data/content";
import WorkCard from "./WorkCard";

// Painel de uma marca: todos os trabalhos feitos para ela, separados por tipo.
// Tocar num trabalho abre o projeto por cima deste painel.
const BrandPanel = ({ brand, lang, active, onOpen, onClose, hidden }) => {
    useEffect(() => {
        if (!brand) return undefined;
        const onKey = (e) => {
            if (e.key === "Escape" && !hidden) onClose();
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        if (window.__lenis) window.__lenis.stop();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
            if (window.__lenis) window.__lenis.start();
        };
    }, [brand, onClose, hidden]);

    if (!brand) return null;

    const cats = CATEGORIES.filter((c) => c.id !== "all")
        .map((c) => ({ ...c, items: brand.projects.filter((p) => p.category === c.id) }))
        .filter((c) => c.items.length)
        .sort((a, b) => (a.id === active ? -1 : b.id === active ? 1 : 0));
    let n = 0;

    return (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center md:p-6" data-lenis-prevent role="dialog" aria-modal="true">
            <div className="absolute inset-0 pm-backdrop brand-fade" onClick={onClose} />
            <div className="relative w-full max-w-[1200px] max-h-[94vh] md:max-h-[90vh] overflow-y-auto bg-bone rounded-t-[22px] md:rounded-[22px] shadow-2xl brand-rise">
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 md:px-8 h-14 bg-bone/90 backdrop-blur border-b border-hairline">
                    <span className="overline text-terracotta">
                        {lang === "PT" ? "Marca" : "Brand"} · {String(brand.projects.length).padStart(2, "0")}{" "}
                        {lang === "PT" ? "trabalhos" : "pieces of work"}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={lang === "PT" ? "Fechar" : "Close"}
                        className="h-10 w-10 rounded-full bg-ink text-bone flex items-center justify-center hover:bg-terracotta transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="px-5 md:px-8 pt-8 pb-10">
                    <h3 className="font-condensed uppercase text-5xl md:text-7xl text-ink leading-[0.9]">{brand.name}</h3>
                    <p className="mt-3 text-sm text-graphite">{cats.map((c) => t(c.label, lang)).join(" · ")}</p>
                    <div className="mt-8 space-y-10">
                        {cats.map((c) => (
                            <div key={c.id}>
                                <div className="pm-label mb-4">↳ {t(c.label, lang)}</div>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {c.items.map((p) => {
                                        const i = n++;
                                        return (
                                            <li key={p.id}>
                                                <WorkCard p={p} i={i} lang={lang} onOpen={onOpen} />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandPanel;
