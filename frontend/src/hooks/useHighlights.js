import { useEffect, useState } from "react";
import { fetchPublishedHighlights } from "../lib/projectsApi";

// Destaques publicados no admin (aba "Destaques"). Guarda em cache local para
// aparecerem logo nas visitas seguintes. Se não houver, devolve [].
const KEY = "ptf:highlights:v1";
const read = () => {
    try {
        return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch (e) {
        return null;
    }
};

export default function useHighlights() {
    const [items, setItems] = useState(() => read() || []);
    useEffect(() => {
        let on = true;
        fetchPublishedHighlights()
            .then((rows) => {
                if (!on) return;
                setItems(rows);
                try {
                    localStorage.setItem(KEY, JSON.stringify(rows));
                } catch (e) {
                    /* ignora */
                }
            })
            .catch(() => {});
        return () => {
            on = false;
        };
    }, []);
    return items;
}
