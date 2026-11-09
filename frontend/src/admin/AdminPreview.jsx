import React, { useEffect, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { mapDoc } from "@/hooks/useProjects";
import WorkCard from "@/components/WorkCard";
import ProjectModal from "@/components/ProjectModal";

// Pré-visualização de um projeto tal como aparece no site.
// O admin escreve o projeto (mesmo sem estar guardado) em localStorage e esta
// página lê-o. Enquanto estiveres a editar, a pré-visualização atualiza sozinha.
export const PREVIEW_KEY = "ptf:preview";

const read = () => {
    try {
        const raw = localStorage.getItem(PREVIEW_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
};

const AdminPreview = () => {
    const { lang, toggle } = useLang();
    const [entry, setEntry] = useState(read);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === PREVIEW_KEY) setEntry(read());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    useEffect(() => {
        document.title = "Pré-visualização · Admin";
    }, []);

    if (!entry || !entry.data) {
        return (
            <div className="App site-zoom theme-neutral min-h-screen bg-bone text-ink flex items-center justify-center">
                <p className="text-sm text-mist">
                    Nada para pré-visualizar. Abre um projeto no admin e carrega em Ver.
                </p>
            </div>
        );
    }

    const project = mapDoc(entry.id || "preview", entry.data);
    const published = !!entry.data.published;
    const hora = entry.ts
        ? new Date(entry.ts).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "";

    return (
        <div className="App site-zoom theme-neutral min-h-screen bg-bone text-ink">
            <div className="fixed top-0 inset-x-0 z-[200] flex items-center justify-between gap-3 px-4 md:px-6 h-11 bg-ink text-bone text-[11px] tracking-[0.18em] uppercase">
                <span className="truncate">
                    Pré-visualização · {published ? "publicado" : "rascunho"}
                    {entry.unsaved ? " · com alterações por guardar" : ""}
                    {hora ? <span className="text-bone/50"> · {hora}</span> : null}
                </span>
                <span className="flex items-center gap-4 shrink-0">
                    <button onClick={toggle} className="hover:text-bone/70">
                        {lang === "PT" ? "Ver em EN" : "Ver em PT"}
                    </button>
                    <button onClick={() => setOpen((o) => !o)} className="hover:text-bone/70">
                        {open ? "Ver cartão" : "Abrir projeto"}
                    </button>
                </span>
            </div>

            <main className="pt-24 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto">
                <p className="overline text-mist mb-6">Cartão na grelha de trabalhos</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <WorkCard p={project} i={0} lang={lang} onOpen={() => setOpen(true)} />
                </div>
            </main>

            <ProjectModal
                project={open ? project : null}
                index={0}
                total={1}
                onClose={() => setOpen(false)}
                onPrev={() => {}}
                onNext={() => {}}
            />
        </div>
    );
};

export default AdminPreview;
