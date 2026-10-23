// Endereço próprio de cada projeto: /projeto/<titulo-em-slug>-<id>
// O id do Firestore vai no fim (não tem hífenes), o título é só para ser legível.
export const slugify = (s) =>
    String(s || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
        .replace(/-+$/g, "");

const titleOf = (p) =>
    (p && p.title && (p.title.PT || p.title.EN)) || (p && p.title_pt) || "";

export const projectPath = (p) => {
    const s = slugify(titleOf(p));
    return `/projeto/${s ? s + "-" : ""}${p.id}`;
};

// Segmento do endereço: /projeto/<isto> (ou o antigo /?p=<id>)
export const segmentFromLocation = (loc = window.location) => {
    const m = loc.pathname.match(/^\/projeto\/([^/]+)\/?$/);
    if (m) return decodeURIComponent(m[1]);
    return new URLSearchParams(loc.search).get("p");
};

// Encontra o projeto a que o segmento pertence (id inteiro ou "titulo-<id>").
export const findBySegment = (projects, seg) =>
    seg ? projects.find((p) => p.id === seg) || projects.find((p) => seg.endsWith("-" + p.id)) || null : null;
