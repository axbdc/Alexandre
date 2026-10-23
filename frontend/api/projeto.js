// Página de um projeto para quem partilha o link (LinkedIn, WhatsApp, Google):
// devolve o index.html do site com título, descrição e imagem desse projeto.
// O site em si arranca igual e abre o projeto.
const KEY = "AIzaSyDD8Ktr4ozcNj2SdwSbiz8ynHE_I_7yHYs";
const DOC = "https://firestore.googleapis.com/v1/projects/portfolio-5d3ee/databases/(default)/documents/projects/";
const SITE = "https://www.alexandrecosme.com";

const esc = (s) =>
    String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const ogImage = (url) => {
    const re = /(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?:f_auto,q_auto(?:,w_\d+,c_limit)?\/)?/;
    if (!url || !re.test(url)) return `${SITE}/og-image.jpg`;
    return url.replace(re, "$1c_fill,g_auto,w_1200,h_630,f_jpg,q_80/");
};

const setMeta = (html, attr, name, value) => {
    const re = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`);
    return html.replace(re, `$1${value}$2`);
};

export default async function handler(req, res) {
    const slug = String(req.query.slug || "");
    // id inteiro (ex.: "red-panda-ar3d-02") ou "titulo-<id automático>"
    // tenta o segmento inteiro e depois cada final depois de um hífen
    const parts = slug.split("-");
    const candidates = parts.map((_, i) => parts.slice(i).join("-")).filter((c) => c.length >= 3).slice(0, 8);
    const host = req.headers["x-forwarded-host"] || req.headers.host || "www.alexandrecosme.com";
    const proto = req.headers["x-forwarded-proto"] || "https";

    let html;
    try {
        html = await fetch(`${proto}://${host}/index.html`).then((r) => r.text());
    } catch (e) {
        res.redirect(302, "/");
        return;
    }

    let data = null;
    for (const id of candidates) {
        if (data) break;
        try {
            const r = await fetch(`${DOC}${encodeURIComponent(id)}?key=${KEY}`);
            if (!r.ok) continue;
            const j = await r.json();
            const f = j.fields || {};
            const s = (k) => (f[k] && f[k].stringValue) || "";
            if (f.published && f.published.booleanValue) {
                data = {
                    id,
                    title: s("title_pt") || s("title_en"),
                    summary: s("summary_pt") || s("subtitle_pt") || s("summary_en"),
                    client: s("client"),
                    cover: s("cover"),
                };
            }
        } catch (e) {
            /* tenta o próximo */
        }
    }

    if (!data) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, s-maxage=60");
        res.status(404).send(html);
        return;
    }

    const url = `${SITE}${req.url.split("?")[0]}`;
    const showClient = data.client && data.client.toLowerCase() !== data.title.toLowerCase() && !data.title.toLowerCase().includes(data.client.toLowerCase());
    const title = `${data.title}${showClient ? " · " + data.client : ""} | Alexandre Cosme`;
    const desc = (data.summary || `Projeto de Alexandre Cosme${data.client ? " para " + data.client : ""}.`)
        .replace(/\s+/g, " ")
        .slice(0, 200);
    const img = ogImage(data.cover);

    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);
    html = setMeta(html, "name", "description", esc(desc));
    html = setMeta(html, "property", "og:type", "article");
    html = setMeta(html, "property", "og:url", esc(url));
    html = setMeta(html, "property", "og:title", esc(title));
    html = setMeta(html, "property", "og:description", esc(desc));
    html = setMeta(html, "property", "og:image", esc(img));
    html = setMeta(html, "property", "og:image:alt", esc(data.title));
    html = setMeta(html, "name", "twitter:title", esc(title));
    html = setMeta(html, "name", "twitter:description", esc(desc));
    html = setMeta(html, "name", "twitter:image", esc(img));

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
    res.status(200).send(html);
}
