import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLang, t } from "../context/LanguageContext";
import { EXPERIENCE, SECTION_LABELS } from "../data/content";
import useReveal from "../hooks/useReveal";

const localize = (v, lang) => (typeof v === "string" ? v : t(v, lang));

const Experience = () => {
    const { lang } = useLang();
    const rootRef = useReveal([lang]);
    const [openIdx, setOpenIdx] = useState(null);

    const toggle = (i) => setOpenIdx((cur) => (cur === i ? null : i));

    return (
        <section
            id="experience"
            ref={rootRef}
            data-testid="experience-section"
            className="px-4 md:px-8 py-24 md:py-36 bg-bone"
        >
            <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-y-12 md:gap-12">
                <div className="col-span-12 md:col-span-3 reveal">
                    <span className="section-kicker">↳ {t(SECTION_LABELS.experience, lang)}</span>
                </div>

                <ul className="col-span-12 md:col-span-9 md:pl-8 divide-y divide-hairline border-y border-hairline">
                    {EXPERIENCE.map((e, i) => {
                        const isOpen = openIdx === i;
                        return (
                            <li
                                key={i}
                                data-testid={`experience-item-${i}`}
                                className="reveal"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(i)}
                                    aria-expanded={isOpen}
                                    aria-controls={`exp-panel-${i}`}
                                    data-testid={`experience-toggle-${i}`}
                                    className="group w-full text-left py-7 md:py-9 grid grid-cols-12 gap-4 items-baseline cursor-pointer"
                                >
                                    <span className="col-span-12 md:col-span-3 overline">
                                        {lang === "PT" ? e.period : e.period_en}
                                    </span>
                                    <div className="col-span-10 md:col-span-6">
                                        <h3 className="font-display text-2xl md:text-3xl text-ink group-hover:text-terracotta transition-colors duration-500">
                                            {t(e.role, lang)}
                                        </h3>
                                        <p className="mt-1 text-base md:text-lg text-graphite">
                                            {t(e.scope, lang)}
                                        </p>
                                    </div>
                                    <div className="col-span-2 md:col-span-3 md:text-right flex md:items-baseline md:justify-end items-center gap-3 md:gap-5">
                                        <span className="hidden md:inline text-base text-ink">
                                            {localize(e.company, lang)}
                                        </span>
                                        <span
                                            className={`shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-full border transition-colors duration-500 ${
                                                isOpen
                                                    ? "bg-ink text-bone border-ink"
                                                    : "border-hairline text-ink group-hover:border-ink"
                                            }`}
                                            aria-hidden="true"
                                        >
                                            {isOpen ? (
                                                <Minus size={16} />
                                            ) : (
                                                <Plus size={16} />
                                            )}
                                        </span>
                                    </div>
                                </button>

                                <div className="md:hidden -mt-4 mb-2 text-sm text-ink">
                                    {localize(e.company, lang)}
                                </div>

                                {/* Painel: abre/fecha só com CSS (grid 0fr -> 1fr), sem framer-motion */}
                                <div
                                    id={`exp-panel-${i}`}
                                    data-testid={`experience-panel-${i}`}
                                    aria-hidden={!isOpen}
                                    className={`exp-panel ${isOpen ? "is-open" : ""}`}
                                >
                                    <div className="overflow-hidden">
                                            <div className="pb-9 md:pb-12 grid grid-cols-12 gap-4">
                                                <div className="hidden md:block md:col-span-3" />
                                                <div className="col-span-12 md:col-span-9">
                                                    {e.details ? (
                                                        <ul className="space-y-3 max-w-2xl">
                                                            {(
                                                                e.details[
                                                                    lang
                                                                ] ||
                                                                e.details.PT ||
                                                                []
                                                            ).map((d, j) => (
                                                                <li
                                                                    key={j}
                                                                    className="flex gap-4 text-base md:text-lg text-graphite leading-relaxed"
                                                                >
                                                                    <span className="overline mt-2 shrink-0">
                                                                        {String(
                                                                            j +
                                                                                1,
                                                                        ).padStart(
                                                                            2,
                                                                            "0",
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        {d}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-base md:text-lg text-graphite">
                                                            {t(e.scope, lang)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
};

export default Experience;
