// frontend/src/hooks/useProjects.js
import { useEffect, useState } from "react";
import { fetchPublishedProjects } from "../lib/projectsApi";
import { PROJECTS as FALLBACK } from "../data/content";
import { cld } from "../lib/img";

// Largura máxima das imagens dentro do modal: 1000px no telemóvel (nítido em
// retina) e 1800px em ecrãs grandes. Só estes dois tamanhos, para o Cloudinary
// os ter sempre em cache (ver lib/warm.js).
const BIG =
    typeof window !== "undefined" && window.innerWidth < 768 ? 1000 : 1800;
const big = (u) => cld(u, BIG);

// Documento Firestore (plano) -> forma que os componentes esperam.
const mapDoc = (id, d) => ({
    id,
    category: d.category,
    title: { PT: d.title_pt || "", EN: d.title_en || "" },
    subtitle: { PT: d.subtitle_pt || "", EN: d.subtitle_en || "" },
    client: d.client || "",
    year: d.year || "",
    summary: { PT: d.summary_pt || "", EN: d.summary_en || "" },
    details:
        d.details_pt || d.details_en
            ? { PT: d.details_pt || "", EN: d.details_en || "" }
            : undefined,
    cover: big(d.cover || ""),
    url: d.url || undefined,
    video: d.video || undefined,
    tools: Array.isArray(d.tools) ? d.tools : [],
    gallery:
        Array.isArray(d.gallery) && d.gallery.length
            ? d.gallery.map(big)
            : [big(d.cover)].filter(Boolean),
    model_glb: d.model_glb || undefined,
    model_usdz: d.model_usdz || undefined,
    richmedia:
        d.category === "richmedia" || d.is_richmedia
            ? {
                  fit: d.rm_fit || "contain",
                  screens: (d.screens || []).map((sc) =>
                      sc && sc.src ? { ...sc, src: cld(sc.src, 1200) } : sc,
                  ),
              }
            : undefined,
    subtype: d.subtype || "",
    posts: Array.isArray(d.posts) ? d.posts.map(big) : [],
    stories: Array.isArray(d.stories) ? d.stories.map(big) : [],
    sort_order: typeof d.sort_order === "number" ? d.sort_order : 0,
});

// Cache local da última lista (visitas seguintes aparecem logo).
const CACHE_KEY = "ptf:projects:v1";
const readCache = () => {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
};
const writeCache = (rows) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
    } catch (e) {
        /* sem espaço / modo privado: ignora */
    }
};
const toProjects = (rows) =>
    rows
        .map(({ id, data }) => mapDoc(id, data))
        .sort((a, b) => a.sort_order - b.sort_order);

// Mostra logo a lista em cache (se houver) e atualiza com a do Firestore.
// Já não mostra os projetos de exemplo do content.js enquanto carrega (evitava
// descarregar imagens que iam ser trocadas); só os usa se o Firestore falhar.
export default function useProjects() {
    const [projects, setProjects] = useState(() => {
        const cached = readCache();
        return cached && cached.length ? toProjects(cached) : null;
    });

    useEffect(() => {
        let active = true;
        fetchPublishedProjects()
            .then((rows) => {
                if (!active) return;
                if (rows.length) {
                    setProjects(toProjects(rows));
                    writeCache(rows);
                } else {
                    setProjects((p) => p || FALLBACK);
                }
            })
            .catch(() => {
                if (active) setProjects((p) => p || FALLBACK);
            });
        return () => {
            active = false;
        };
    }, []);

    return { projects: projects || [], loading: !projects };
}
