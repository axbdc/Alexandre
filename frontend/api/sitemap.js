// sitemap.xml gerado na hora: página inicial + um endereço por projeto publicado.
const RUNQUERY =
    "https://firestore.googleapis.com/v1/projects/portfolio-5d3ee/databases/(default)/documents:runQuery?key=AIzaSyDD8Ktr4ozcNj2SdwSbiz8ynHE_I_7yHYs";
const BODY =
    '{"structuredQuery":{"from":[{"collectionId":"projects"}],"where":{"fieldFilter":{"field":{"fieldPath":"published"},"op":"EQUAL","value":{"booleanValue":true}}}}}';
const SITE = "https://www.alexandrecosme.com";

const slugify = (s) =>
    String(s || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
        .replace(/-+$/g, "");

export default async function handler(req, res) {
    const urls = [`<url><loc>${SITE}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`];
    try {
        const rows = await fetch(RUNQUERY, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: BODY,
        }).then((r) => r.json());
        for (const row of Array.isArray(rows) ? rows : []) {
            if (!row.document) continue;
            const id = row.document.name.split("/").pop();
            const f = row.document.fields || {};
            const title = (f.title_pt && f.title_pt.stringValue) || (f.title_en && f.title_en.stringValue) || "";
            const s = slugify(title);
            const lastmod = (row.document.updateTime || "").slice(0, 10);
            urls.push(
                `<url><loc>${SITE}/projeto/${s ? s + "-" : ""}${id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>0.7</priority></url>`,
            );
        }
    } catch (e) {
        /* sem Firestore: fica só a página inicial */
    }
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
    );
}
