// frontend/src/hooks/useProjects.js
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { PROJECTS as FALLBACK } from "../data/content";

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
    cover: d.cover || "",
    url: d.url || undefined,
    tools: Array.isArray(d.tools) ? d.tools : [],
    gallery:
        Array.isArray(d.gallery) && d.gallery.length
            ? d.gallery
            : [d.cover].filter(Boolean),
    model_glb: d.model_glb || undefined,
    model_usdz: d.model_usdz || undefined,
    richmedia:
        d.category === "richmedia" || d.is_richmedia
            ? { fit: d.rm_fit || "contain", screens: d.screens || [] }
            : undefined,
    sort_order: typeof d.sort_order === "number" ? d.sort_order : 0,
});

// Começa com o content.js (render imediato), e troca pelos dados do Firebase
// quando chegarem. Se o Firebase falhar ou estiver vazio, mantém o content.js.
export default function useProjects() {
    const [projects, setProjects] = useState(FALLBACK);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const snap = await getDocs(
                    query(
                        collection(db, "projects"),
                        where("published", "==", true),
                    ),
                );
                if (!active || snap.empty) return;
                const rows = snap.docs
                    .map((doc) => mapDoc(doc.id, doc.data()))
                    .sort((a, b) => a.sort_order - b.sort_order);
                setProjects(rows);
            } catch (e) {
                // Mantém o fallback do content.js
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    return { projects };
}
