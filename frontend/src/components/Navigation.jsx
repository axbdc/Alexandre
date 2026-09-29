import React, { useEffect, useState } from "react";
import { useLang, t } from "../context/LanguageContext";
import { NAV } from "../data/content";

const links = [
    { id: "work", testid: "nav-link-work" },
    { id: "about", testid: "nav-link-about" },
    { id: "services", testid: "nav-link-services" },
    { id: "experience", testid: "nav-link-experience" },
    { id: "contact", testid: "nav-link-contact" },
];

const Navigation = () => {
    const { lang, toggle } = useLang();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const go = (id) => (e) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setOpen(false);
        }
    };

    return (
        <header
            data-testid="site-nav"
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "backdrop-blur-md bg-bone/80 hairline-bottom"
                    : "bg-transparent"
            }`}
        >
            <nav className="mx-auto max-w-[1400px] px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
                <a
                    href="#top"
                    onClick={go("top")}
                    data-testid="nav-logo"
                    className="font-display text-lg md:text-xl tracking-tight text-ink"
                >
                    Alexandre Cosme<span className="text-terracotta">.</span>
                </a>

                <ul className="hidden md:flex items-center gap-10">
                    {links.map((l) => (
                        <li key={l.id}>
                            <a
                                href={`#${l.id}`}
                                onClick={go(l.id)}
                                data-testid={l.testid}
                                className="link-underline text-sm tracking-wide text-ink"
                            >
                                {t(NAV[l.id], lang)}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={toggle}
                        data-testid="nav-pt-en-toggle"
                        className="text-sm tracking-wider text-ink"
                        aria-label="Toggle language"
                    >
                        <span
                            className={
                                lang === "PT"
                                    ? "text-ink"
                                    : "text-mist"
                            }
                        >
                            PT
                        </span>
                        <span className="text-mist mx-1.5">/</span>
                        <span
                            className={
                                lang === "EN"
                                    ? "text-ink"
                                    : "text-mist"
                            }
                        >
                            EN
                        </span>
                    </button>

                    <a
                        href="#contact"
                        onClick={go("contact")}
                        data-testid="nav-cta"
                        className="hidden md:inline-flex items-center gap-2 rounded-full bg-ink text-bone px-5 py-2.5 text-sm font-medium hover:bg-terracotta transition-colors duration-300"
                    >
                        {lang === "PT" ? "Vamos falar" : "Let's talk"}
                    </a>

                    <button
                        onClick={() => setOpen((s) => !s)}
                        data-testid="nav-mobile-toggle"
                        className="md:hidden inline-flex flex-col items-end gap-1.5 px-2 py-2"
                        aria-label="Menu"
                    >
                        <span className="block h-px w-6 bg-ink" />
                        <span className="block h-px w-4 bg-ink" />
                    </button>
                </div>
            </nav>

            {open && (
                <div
                    data-testid="nav-mobile-panel"
                    className="md:hidden bg-bone hairline-top px-6 py-8"
                >
                    <ul className="flex flex-col gap-5">
                        {links.map((l) => (
                            <li key={l.id}>
                                <a
                                    href={`#${l.id}`}
                                    onClick={go(l.id)}
                                    data-testid={`nav-mobile-link-${l.id}`}
                                    className="font-display text-2xl text-ink"
                                >
                                    {t(NAV[l.id], lang)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </header>
    );
};

export default Navigation;
