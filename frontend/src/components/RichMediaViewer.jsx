import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLang, t } from "../context/LanguageContext";
import useProjects, { mapDoc } from "../hooks/useProjects";
import { RichMediaPlayer } from "./RichMedia";

// Rich media em HTML: o ficheiro vem do Cloudinary como "raw", que o browser
// descarrega em vez de abrir. Por isso lê-se o código e mostra-se aqui dentro.
const HtmlRm = ({ url, title }) => {
    const [doc, setDoc] = useState("");
    useEffect(() => {
        let vivo = true;
        fetch(url)
            .then((r) => r.text())
            .then((h) => {
                // encolhe o telemóvel para caber sempre na altura do ecrã
                const fit =
                    "<script>(function(){function f(){var b=document.body;if(!b)return;b.style.zoom=1;" +
                    "var z=Math.min(1,(window.innerHeight-8)/document.documentElement.scrollHeight);b.style.zoom=z}" +
                    "window.addEventListener('load',f);window.addEventListener('resize',f)})()<\/script>";
                const html = /<\/body>/i.test(h) ? h.replace(/<\/body>/i, fit + "</body>") : h + fit;
                if (vivo) setDoc(html);
            })
            .catch(() => {});
        return () => {
            vivo = false;
        };
    }, [url]);
    if (!doc) return <span className="overline text-mist">A carregar…</span>;
    return (
        <iframe
            title={title}
            srcDoc={doc}
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            className="w-full border-0"
            style={{ height: "calc(100vh - 56px)" }}
        />
    );
};

const RichMediaViewer = () => {
    const { id } = useParams();
    const { lang } = useLang();
    const { projects } = useProjects();
    // projetos ainda em rascunho: vêm da pré-visualização do admin
    const rascunho = () => {
        try {
            const e = JSON.parse(localStorage.getItem("ptf:preview") || "null");
            return e && e.id === id && e.data ? mapDoc(e.id, e.data) : null;
        } catch (err) {
            return null;
        }
    };
    const p = projects.find((x) => x.id === id) || rascunho();

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

            <div className={`flex-1 flex items-center justify-center ${p && p.richmedia && p.richmedia.html ? "" : "p-6"}`}>
                {p && p.richmedia && p.richmedia.html ? (
                    <HtmlRm url={p.richmedia.html} title={t(p.title, lang)} />
                ) : p && p.richmedia && p.richmedia.screens?.length ? (
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
