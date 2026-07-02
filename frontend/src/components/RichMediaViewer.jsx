// frontend/src/components/RichMediaViewer.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useLang, t } from "../context/LanguageContext";
import useProjects from "../hooks/useProjects";
import { RichMediaPlayer } from "./RichMedia";

const RichMediaViewer = () => {
    const { id } = useParams();
    const { lang } = useLang();
    const { projects } = useProjects();
    const p = projects.find((x) => x.id === id);

    return (
        <div className="min-h-screen bg-bone text-ink flex flex-col">
            <header className="hairline-bottom flex items-center justify-between px-6 h-14">
                <span className="overline truncate">
                    {p ? t(p.title, lang) : "Rich media"}
                </span>
                <Link
                    to="/"
                    className="text-xs tracking-[0.18em] uppercase text-mist hover:text-ink transition-colors"
                >
                    Fechar
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center p-6">
                {p && p.richmedia && p.richmedia.screens?.length ? (
                    <RichMediaPlayer
                        screens={p.richmedia.screens}
                        fit={p.richmedia.fit}
                        lang={lang}
                    />
                ) : (
                    <span className="overline text-mist">A carregar…</span>
                )}
            </div>
        </div>
    );
};

export default RichMediaViewer;
