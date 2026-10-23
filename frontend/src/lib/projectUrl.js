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

// Lê o id a partir de /projeto/... ou do formato antigo /?p=<id>
export const idFromLocation = (loc = window.location) => {
    const m = loc.pathname.match(/^\/projeto\/(?:.*-)?([A-Za-z0-9]{10,})\/?$/);
    if (m) return m[1];
    return new URLSearchParams(loc.search).get("p");
};
