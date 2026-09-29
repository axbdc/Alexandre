import React from "react";
import { useLang, t } from "../context/LanguageContext";
import { ABOUT, SERVICES, TOOLS, SECTION_LABELS } from "../data/content";
import useReveal from "../hooks/useReveal";

const AboutServices = () => {
    const { lang } = useLang();
    const rootRef = useReveal([lang]);

    return (
        <section
            ref={rootRef}
            className="hairline-top"
            data-testid="about-services-section"
        >
            {/* About */}
            <div
                id="about"
                className="px-6 md:px-12 py-24 md:py-40 bg-pebble"
            >
                <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-y-12 md:gap-12">
                    <div className="col-span-12 md:col-span-3 reveal">
                        <span className="overline !text-terracotta">— 02</span>
                        <h2 className="font-display text-4xl md:text-5xl mt-3 text-ink">
                            {t(SECTION_LABELS.about, lang)}
                        </h2>
                    </div>

                    <div className="col-span-12 md:col-span-9 md:pl-8">
                        <p className="reveal font-display text-3xl md:text-5xl leading-[1.05] text-ink max-w-3xl">
                            {t(ABOUT.heading, lang)}
                        </p>

                        <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-8 md:gap-16 max-w-4xl">
                            {ABOUT.body.map((para, i) => (
                                <p
                                    key={i}
                                    className="reveal text-base md:text-lg leading-relaxed text-graphite"
                                >
                                    {t(para, lang)}
                                </p>
                            ))}
                        </div>

                        <p className="reveal mt-16 font-serif-italic italic text-2xl md:text-3xl text-terracotta max-w-2xl">
                            “{t(ABOUT.pull, lang)}”
                        </p>

                        <div className="mt-16 md:mt-20 reveal">
                            <span className="overline">
                                {lang === "PT" ? "Ferramentas" : "Tools"}
                            </span>
                            <ul className="mt-5 flex flex-wrap gap-2 md:gap-3">
                                {TOOLS.map((tool) => (
                                    <li
                                        key={tool}
                                        className="rounded-full border border-hairline bg-bone/40 px-4 py-2 text-sm md:text-base text-ink"
                                    >
                                        {tool}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services */}
            <div
                id="services"
                className="px-6 md:px-12 py-24 md:py-40"
            >
                <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-y-12 md:gap-12">
                    <div className="col-span-12 md:col-span-3 reveal">
                        <span className="overline !text-terracotta">— 03</span>
                        <h2 className="font-display text-4xl md:text-5xl mt-3 text-ink">
                            {t(SECTION_LABELS.services, lang)}
                        </h2>
                    </div>

                    <div className="col-span-12 md:col-span-9 md:pl-8">
                        <ul className="divide-y divide-hairline border-y border-hairline">
                            {SERVICES.map((s) => (
                                <li
                                    key={s.no}
                                    data-testid={`service-row-${s.no}`}
                                    className="reveal group py-6 md:py-8 grid grid-cols-12 gap-4 items-baseline cursor-default"
                                >
                                    <span className="overline col-span-2 md:col-span-1">
                                        {s.no}
                                    </span>
                                    <h3 className="font-display text-2xl md:text-4xl text-ink col-span-10 md:col-span-5 group-hover:text-terracotta transition-colors duration-500">
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
        </section>
    );
};

export default AboutServices;
