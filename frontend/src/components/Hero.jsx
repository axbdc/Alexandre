import React from "react";
import { useLang, t } from "../context/LanguageContext";
import { HERO } from "../data/content";
import { ArrowDownRight } from "lucide-react";
import StretchText from "./StretchText";
import HeroWaves from "./HeroWaves";
import { scrollToId } from "../lib/scroll";

const Hero = () => {
    const { lang } = useLang();

    const scrollTo = (id) => (e) => {
        e.preventDefault();
        scrollToId(id);
    };

    return (
        <section
            id="top"
            data-testid="hero-section"
            className="relative overflow-hidden pt-28 md:pt-36 pb-10 md:pb-14 px-4 md:px-8"
        >
            {/* ondas finas, bem transparentes, por trás do nome */}
            <HeroWaves />
            <div className="mx-auto max-w-[1600px] relative">
                {/* linha de cima */}
                <div className="hero-meta flex flex-wrap items-center justify-between gap-3">
                    <span data-testid="hero-overline">{t(HERO.overline, lang)}</span>
                    <span>{t(HERO.location_line, lang)}</span>
                </div>

                {/* frase + CTA */}
                <div className="mt-12 md:mt-20 grid grid-cols-12 gap-y-8 items-end">
                    <p
                        data-testid="hero-intro"
                        className="col-span-12 md:col-span-7 lg:col-span-6 hero-statement"
                    >
                        {t(HERO.statement, lang)}
                    </p>
                    <div className="col-span-12 md:col-span-5 lg:col-span-6 flex md:justify-end gap-6">
                        <a
                            href="#work"
                            onClick={scrollTo("work")}
                            data-testid="hero-cta-work"
                            className="hero-link group"
                        >
                            {t(HERO.cta, lang)}
                            <ArrowDownRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                        </a>
                        <a
                            href="#contact"
                            onClick={scrollTo("contact")}
                            data-testid="hero-cta-contact"
                            className="hero-link group"
                        >
                            {t(HERO.cta_secondary, lang)}
                        </a>
                    </div>
                </div>

                {/* nome gigante que estica com o rato */}
                <h1 data-testid="hero-name" className="mt-10 md:mt-14 text-terracotta">
                    <div className="md:hidden">
                        <StretchText text="ALEXANDRE" className="hero-word" />
                        <StretchText text="COSME" className="hero-word" />
                    </div>
                    <div className="hidden md:block">
                        <StretchText text="ALEXANDRE COSME" className="hero-word" />
                    </div>
                </h1>

                {/* rodapé do hero */}
                <div className="mt-6 md:mt-8 pt-5 hairline-top flex flex-wrap items-center justify-between gap-4">
                    <span className="hero-meta">{t(HERO.role, lang)}</span>
                    <ul className="flex flex-wrap gap-x-5 gap-y-1 hero-meta" data-testid="hero-disciplines">
                        {HERO.disciplines.map((d) => (
                            <li key={d.EN}>{t(d, lang)}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Hero;
