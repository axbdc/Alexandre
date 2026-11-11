// Junta a pasta de entrega de um rich media (index.html + png/, css, js...) num
// único ficheiro HTML, com as imagens e restantes ficheiros embutidos.
// Assim o rich media corre dentro do portfólio sem depender de caminhos locais.

const readText = (f) => f.text();
const readDataURL = (f) =>
    new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(f);
    });

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// todas as formas como um caminho pode aparecer no código
const variants = (rel) => {
    const out = new Set([rel, `./${rel}`, encodeURI(rel), `./${encodeURI(rel)}`]);
    return [...out].sort((a, b) => b.length - a.length);
};

const replaceAll = (text, rel, value) => {
    let t = text;
    for (const v of variants(rel)) {
        // só substitui quando o caminho está entre aspas, parênteses ou =
        const re = new RegExp(`(["'(=\\s])${escapeRe(v)}(?=["')\\s?#])`, "g");
        t = t.replace(re, `$1${value}`);
    }
    return t;
};

export async function bundleRichMedia(fileList) {
    const files = [...fileList].filter((f) => !/(^|\/)(__MACOSX|\.DS_Store)/.test(f.webkitRelativePath || f.name));
    const pathOf = (f) => (f.webkitRelativePath || f.name).replace(/\\/g, "/");
    const htmls = files
        .filter((f) => /\.html?$/i.test(f.name))
        .sort((a, b) => {
            const ai = /^index\.html?$/i.test(a.name) ? 0 : 1;
            const bi = /^index\.html?$/i.test(b.name) ? 0 : 1;
            return ai - bi || pathOf(a).split("/").length - pathOf(b).split("/").length;
        });
    if (!htmls.length) throw new Error("Não encontrei nenhum index.html nessa pasta.");
    const index = htmls[0];
    const base = pathOf(index).split("/").slice(0, -1).join("/");
    const relOf = (f) => {
        const p = pathOf(f);
        return base && p.startsWith(base + "/") ? p.slice(base.length + 1) : p;
    };

    let html = await readText(index);
    const others = files.filter((f) => f !== index);
    const used = [];

    // 1) CSS e JS ligados: passam a ir dentro do HTML
    for (const f of others) {
        const rel = relOf(f);
        if (/\.css$/i.test(f.name) && html.includes(rel)) {
            let css = await readText(f);
            const dir = rel.split("/").slice(0, -1).join("/");
            for (const g of others) {
                const r2 = relOf(g);
                const local = dir && r2.startsWith(dir + "/") ? r2.slice(dir.length + 1) : r2;
                if (!/\.(css|js|html?)$/i.test(g.name) && (css.includes(local) || css.includes(r2))) {
                    const data = await readDataURL(g);
                    css = replaceAll(replaceAll(css, local, data), r2, data);
                }
            }
            const re = new RegExp(`<link[^>]+href=["']\\.?/?${escapeRe(rel)}["'][^>]*>`, "gi");
            html = html.replace(re, `<style>\n${css}\n</style>`);
            used.push(rel);
        } else if (/\.js$/i.test(f.name) && html.includes(rel)) {
            const js = await readText(f);
            const re = new RegExp(`<script([^>]*)src=["']\\.?/?${escapeRe(rel)}["']([^>]*)>\\s*</script>`, "gi");
            html = html.replace(re, `<script$1$2>\n${js.replace(/<\/script/gi, "<\\/script")}\n</script>`);
            used.push(rel);
        }
    }

    // 2) imagens, fontes, vídeos e áudio: passam a data URIs
    for (const f of others) {
        if (/\.(css|js|html?)$/i.test(f.name)) continue;
        const rel = relOf(f);
        if (!variants(rel).some((v) => html.includes(v))) continue;
        const data = await readDataURL(f);
        html = replaceAll(html, rel, data);
        used.push(rel);
    }

    return { html, used, name: pathOf(index) };
}
