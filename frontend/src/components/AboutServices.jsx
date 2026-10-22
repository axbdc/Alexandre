import React from "react";
import { useLang, t } from "../context/LanguageContext";
import { ABOUT, SERVICES, TOOLS, SECTION_LABELS } from "../data/content";
import useReveal from "../hooks/useReveal";
import WordReveal from "./WordReveal";
import IdBadge from "./IdBadge";

const AboutServices = ({ part = "both" }) => {
    const { lang } = useLang();
    const rootRef = useReveal([lang]);

    return (
        <section
            ref={rootRef}
        >
            {part !== "services" ? (
            <>
            {/* Sobre */}
            <div id="about" className="px-4 md:px-8 py-24 md:py-36">
                <div className="mx-auto max-w-[1600px]">
                    <span className="section-kicker reveal">↳ {t(SECTION_LABELS.about, lang)}</span>
                    <WordReveal
                        text={t(ABOUT.heading, lang)}
                        className="mt-6 md:mt-8 about-heading max-w-[1250px]"
                    />

                    <div className="mt-16 md:mt-24 grid grid-cols-12 gap-y-14 md:gap-x-12 items-start">
                        <div className="col-span-12 md:col-span-5 lg:col-span-5 flex justify-center">
                            <IdBadge lang={lang} />
                        </div>

                        <div className="col-span-12 md:col-span-7 lg:col-span-7 lg:col-start-6 md:pt-24">
                            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
                                {ABOUT.body.map((para, i) => (
                                    <p key={i} className="reveal text-base md:text-lg leading-relaxed text-graphite">
                                        {t(para, lang)}
                                    </p>
                                ))}
                            </div>

                            <p className="reveal mt-12 font-serif-italic italic text-2xl md:text-3xl text-terracotta max-w-2xl">
                                “{t(ABOUT.pull, lang)}”
                            </p>

                            <div className="mt-14 grid sm:grid-cols-2 gap-10">
                                <div className="reveal">
                                    <span className="section-kicker">{lang === "PT" ? "Clientes & marcas ↴" : "Clients & brands ↴"}</span>
                                    <ul className="mt-4 list-caps">
                                        {ABOUT.clients.map((c) => (
                                            <li key={c}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="reveal">
                                    <span className="section-kicker">{lang === "PT" ? "Ferramentas ↴" : "Tools ↴"}</span>
                                    <ul className="mt-4 list-caps">
                                        {TOOLS.map((tool) => (
                                            <li key={tool}>{tool}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </>
            ) : null}

            {part !== "about" ? (
            <>
            {/* Services */}
            <div
                id="services"
                className="px-4 md:px-8 py-24 md:py-36"
            >
                <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-y-12 md:gap-12">
                    <div className="col-span-12 reveal">
                        <span className="section-kicker">↳ {t(SECTION_LABELS.services, lang)}</span>
                        <h2 className="font-condensed uppercase text-6xl md:text-8xl mt-4 text-ink leading-[0.9]">
                            {lang === "PT" ? "O que faço" : "What I do"}
                        </h2>
                    </div>

                    <div className="col-span-12">
                        <ul className="exp-list">
                            {SERVICES.map((s) => (
                                <li
                                    key={s.no}
                                    className="reveal group py-6 md:py-8 grid grid-cols-12 gap-4 items-baseline cursor-default"
                                >
                                    <span className="hero-meta col-span-2 md:col-span-1">
                                        {s.no}
                                    </span>
                                    <h3 className="font-condensed uppercase text-3xl md:text-5xl text-ink col-span-10 md:col-span-5 group-hover:text-terracotta transition-colors duration-500">
                                        {t(s.title, lang)}
                                    </h3>
                                    <p className="text-base md:text-lg text-graphite col-span-12 md:col-span-6">
                                        {t(s.body, lang)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            </>
            ) : null}
        </section>
    );
};

export default AboutServices;
