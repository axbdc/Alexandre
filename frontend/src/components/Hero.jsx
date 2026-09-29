import React from "react";
import { useLang, t } from "../context/LanguageContext";
import { HERO } from "../data/content";
import { ArrowDownRight } from "lucide-react";
import Hero3D from "./three/Hero3D";

const Hero = () => {
    const { lang } = useLang();

    const scrollTo = (id) => () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section
            id="top"
            data-testid="hero-section"
            className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-6 md:px-12"
        >
            <div className="mx-auto max-w-[1400px] relative">
                <Hero3D />

                <div className="flex items-center justify-between mb-12 md:mb-20">
                    <span className="overline" data-testid="hero-overline">
                        {t(HERO.overline, lang)}
                    </span>
                    <span className="overline hidden md:inline">
                        {t(HERO.location, lang)}
                    </span>
                </div>

                <h1
                    data-testid="hero-name"
                    className="font-display text-[14vw] md:text-[12vw] lg:text-[11rem] xl:text-[13rem] leading-[0.86] tracking-[-0.04em] text-ink"
                >
                    Alexandre
                    <br />
                    <span className="inline-flex items-center gap-6 md:gap-10">
                        <span className="font-serif-italic italic font-normal text-[0.92em] text-terracotta">
                            Cosme
                        </span>
                        <span className="hidden md:inline-block h-[1px] w-[calc(18vw/var(--site-zoom))] bg-ink/40 align-middle" />
                    </span>
                </h1>

                <div className="grid grid-cols-12 gap-6 md:gap-10 mt-12 md:mt-20 items-end">
                    <div className="col-span-12 md:col-span-7">
                        <p
                            data-testid="hero-intro"
                            className="text-lg md:text-2xl leading-relaxed text-graphite max-w-xl"
                        >
                            {t(HERO.intro, lang)}
                        </p>
                    </div>

                    <div className="col-span-12 md:col-span-5 md:text-right">
                        <div className="overline mb-2">
                            {t(HERO.role, lang)}
                        </div>
                        <div className="font-display text-2xl md:text-3xl text-ink">
                            {t(HERO.floating_note, lang)}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-14 md:mt-20">
                    <button
                        onClick={scrollTo("work")}
                        data-testid="hero-cta-work"
                        className="group inline-flex items-center justify-between gap-6 px-7 py-5 border border-ink text-ink hover:bg-ink hover:text-bone transition-colors duration-500 min-w-[260px]"
                    >
                        <span className="text-sm tracking-[0.18em] uppercase">
                            {t(HERO.cta, lang)}
                        </span>
                        <ArrowDownRight
                            size={18}
                            className="transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1"
                        />
                    </button>

                    <button
                        onClick={scrollTo("contact")}
                        data-testid="hero-cta-contact"
                        className="group inline-flex items-center justify-between gap-6 px-7 py-5 text-ink hover:text-terracotta transition-colors duration-500 min-w-[220px]"
                    >
                        <span className="text-sm tracking-[0.18em] uppercase">
                            {t(HERO.cta_secondary, lang)}
                        </span>
                        <ArrowDownRight
                            size={18}
                            className="transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1"
                        />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
