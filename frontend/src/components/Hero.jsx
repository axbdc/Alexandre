import React from "react";
import { useLang, t } from "../context/LanguageContext";
import { HERO } from "../data/content";
import { ArrowDownRight, ArrowUpRight, MapPin, Camera } from "lucide-react";
import HeroWaves from "./HeroWaves";

// Foto do hero: define HERO.photo em data/content.js. Sem foto, mostra um placeholder.
const Portrait = ({ lang }) => {
    if (HERO.photo) {
        return (
            <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-pebble">
                <img
                    src={HERO.photo}
                    alt="Alexandre Cosme"
                    className="h-full w-full object-cover"
                    loading="eager"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bone/60 via-transparent to-transparent" />
                <div className="absolute left-5 bottom-5 inline-flex items-center gap-2 rounded-full bg-bone/80 backdrop-blur px-4 py-2 text-xs text-ink">
                    <MapPin size={13} />
                    {t(HERO.location, lang)}
                </div>
            </div>
        );
    }
    return (
        <div
            className="relative h-full w-full overflow-hidden rounded-[28px] border border-dashed border-ink/20 bg-pebble flex flex-col items-center justify-center gap-4 text-center p-8"
            data-testid="hero-photo-placeholder"
        >
            <div className="h-14 w-14 rounded-full border border-hairline flex items-center justify-center text-mist">
                <Camera size={22} />
            </div>
            <div>
                <div className="text-sm text-ink">
                    {lang === "PT" ? "A tua foto aqui" : "Your photo here"}
                </div>
                <div className="mt-1 text-xs text-mist max-w-[220px]">
                    {lang === "PT"
                        ? "Retrato vertical 4:5. Define HERO.photo em content.js"
                        : "Vertical 4:5 portrait. Set HERO.photo in content.js"}
                </div>
            </div>
            <div className="absolute left-5 bottom-5 inline-flex items-center gap-2 rounded-full bg-bone/80 backdrop-blur px-4 py-2 text-xs text-ink">
                <MapPin size={13} />
                {t(HERO.location, lang)}
            </div>
        </div>
    );
};

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
            className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24 px-6 md:px-12"
        >
            {/* ondas animadas em linha fina (fundo) */}
            <HeroWaves />

            {/* brilho de fundo subtil */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-terracotta/[0.06] blur-[120px]"
            />

            <div className="mx-auto max-w-[1400px] relative grid grid-cols-12 gap-y-12 md:gap-x-10 lg:gap-x-16 items-end">
                {/* Texto */}
                <div className={`col-span-12 ${HERO.showPhoto ? "lg:col-span-7" : "lg:col-span-10"}`}>
                    <div
                        className="inline-flex items-center gap-3 rounded-full border border-hairline bg-pebble/60 px-4 py-2"
                        data-testid="hero-overline"
                    >
                        <span className="pulse-dot" aria-hidden="true" />
                        <span className="text-xs md:text-sm text-ink">
                            {t(HERO.available, lang)}
                        </span>
                    </div>

                    <h1
                        data-testid="hero-name"
                        className="font-display mt-8 md:mt-10 text-[17vw] sm:text-[14vw] lg:text-[8.5rem] xl:text-[9.5rem] leading-[0.88] tracking-[-0.045em] text-ink"
                    >
                        Alexandre
                        <br />
                        <span className="inline-block mt-[0.08em] font-serif-italic italic font-normal tracking-[-0.02em] text-terracotta">
                            Cosme
                        </span>
                    </h1>

                    <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="font-display text-xl md:text-2xl text-ink">
                            {t(HERO.role, lang)}
                        </span>
                        <span className="h-px w-8 bg-ink/30" aria-hidden="true" />
                        <span className="text-sm md:text-base text-graphite">
                            {t(HERO.floating_note, lang)}
                        </span>
                    </div>

                    <p
                        data-testid="hero-intro"
                        className="mt-6 text-lg md:text-xl leading-relaxed text-graphite max-w-xl"
                    >
                        {t(HERO.intro, lang)}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-10">
                        <button
                            onClick={scrollTo("work")}
                            data-testid="hero-cta-work"
                            className="group inline-flex items-center justify-between gap-6 rounded-full bg-terracotta px-7 py-4 text-bone hover:bg-terracotta-hover transition-colors duration-300 sm:min-w-[220px]"
                        >
                            <span className="text-sm font-medium tracking-wide">
                                {t(HERO.cta, lang)}
                            </span>
                            <ArrowDownRight
                                size={18}
                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                            />
                        </button>

                        <button
                            onClick={scrollTo("contact")}
                            data-testid="hero-cta-contact"
                            className="group inline-flex items-center justify-between gap-6 rounded-full border border-hairline px-7 py-4 text-ink hover:border-ink transition-colors duration-300 sm:min-w-[200px]"
                        >
                            <span className="text-sm font-medium tracking-wide">
                                {t(HERO.cta_secondary, lang)}
                            </span>
                            <ArrowUpRight
                                size={18}
                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </button>
                    </div>
                </div>

                {/* Foto (liga/desliga em content.js -> HERO.showPhoto) */}
                {HERO.showPhoto ? (
                <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-8">
                    <div className="relative aspect-[4/5] w-full max-w-[460px] mx-auto lg:ml-auto lg:mr-0">
                        <Portrait lang={lang} />
                        <div
                            aria-hidden="true"
                            className="absolute -left-6 top-10 -rotate-6 rounded-full bg-ink text-bone px-5 py-2.5 text-xs tracking-[0.2em] uppercase shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)]"
                        >
                            Portfolio ’26
                        </div>
                    </div>
                </div>
                ) : null}
            </div>

            {/* Especialidades (estático — substitui o carrossel) */}
            <div className="mx-auto max-w-[1400px] relative mt-16 md:mt-24 pt-8 hairline-top">
                <ul
                    className="flex flex-wrap gap-2 md:gap-3"
                    data-testid="hero-disciplines"
                >
                    {HERO.disciplines.map((d) => (
                        <li
                            key={d.EN}
                            className="rounded-full border border-hairline px-4 py-2 text-sm text-graphite"
                        >
                            {t(d, lang)}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default Hero;
