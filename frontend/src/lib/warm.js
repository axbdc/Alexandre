// frontend/src/lib/warm.js
// "Aquece" o Cloudinary: pede já todas as versões otimizadas das imagens de um
// projeto (tamanhos x formatos AVIF/WebP/original). A primeira vez que o
// Cloudinary gera uma versão demora ~1s; depois fica em cache na CDN e passa a
// ser instantânea para todos os visitantes. Corre em segundo plano ao guardar.
import { cld, isCloudinaryImage } from "./img";

// Os mesmos tamanhos usados no site (SelectedWorks + useProjects).
const COVER_WIDTHS = [400, 600, 800];
const BIG_WIDTHS = [1000, 1800];
const SCREEN_WIDTH = 1200;
// Cada browser pede um formato diferente (Safari/Chrome recentes: AVIF).
const ACCEPTS = ["image/avif,image/webp,*/*", "image/webp,*/*", "*/*"];

export function warmProject(p) {
    if (!p) return;
    const urls = [];
    COVER_WIDTHS.forEach((w) => urls.push(cld(p.cover, w)));
    [p.cover, ...(p.gallery || []), ...(p.posts || []), ...(p.stories || [])].forEach((u) =>
        BIG_WIDTHS.forEach((w) => urls.push(cld(u, w))),
    );
    (p.screens || []).forEach((s) => s && urls.push(cld(s.src, SCREEN_WIDTH)));

    const list = [...new Set(urls.filter(isCloudinaryImage))];
    let i = 0;
    const next = () => {
        if (i >= list.length) return;
        const u = list[i++];
        Promise.all(
            ACCEPTS.map((a) => fetch(u, { headers: { Accept: a } }).catch(() => null)),
        ).finally(next);
    };
    for (let k = 0; k < 4; k++) next(); // 4 em paralelo
}
