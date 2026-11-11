import React, { useEffect, useRef, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebaseAdmin";
import { warmProject } from "@/lib/warm";
import { PROJECTS } from "@/data/content";
import { uploadToCloudinary, CLOUDINARY_CLOUD } from "@/lib/cloudinary";
import RichMediaEditor from "@/admin/RichMediaEditor";
import { bundleRichMedia } from "@/lib/rmBundle";
import AdminTabs from "@/admin/AdminTabs";

// Pré-visualização: guarda o projeto em localStorage e abre /admin/preview
// noutro separador. A página de preview lê daí e atualiza-se sozinha.
const PREVIEW_KEY = "ptf:preview";
const PREVIEW_WIN = "ac-preview";
const writePreview = (p, unsaved) => {
    const { id, ...data } = p;
    try {
        localStorage.setItem(PREVIEW_KEY, JSON.stringify({ id: id || "preview", data, unsaved: !!unsaved, ts: Date.now() }));
    } catch (e) {
        /* sem espaço: ignora */
    }
};
// Rich media em HTML: junta a pasta num só ficheiro e guarda-o no Cloudinary.
const uploadRmHtml = async (files) => {
    const { html, used } = await bundleRichMedia(files);
    const fd = new FormData();
    fd.append("file", new File([html], "rich-media.html", { type: "text/html" }));
    fd.append("upload_preset", "portfolio");
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/raw/upload`, { method: "POST", body: fd });
    const j = await r.json();
    if (!j.secure_url) throw new Error((j.error && j.error.message) || "Falhou o upload");
    return { url: j.secure_url, used, kb: Math.round(html.length / 1024) };
};

// Vídeos de um projeto motion. Os antigos só têm `video`: vira o primeiro da lista.
const videoList = (p) =>
    Array.isArray(p.videos) && p.videos.length
        ? p.videos
        : p.video
          ? [{ src: p.video, title_pt: "", title_en: "" }]
          : [];

const openPreview = (p, unsaved) => {
    writePreview(p, unsaved);
    window.open("/admin/preview", PREVIEW_WIN);
};

const CATS = [
    { id: "ar3d", label: "AR & 3D" },
    { id: "graphic", label: "Design Gráfico" },
    { id: "photo", label: "Fotografia" },
    { id: "web", label: "Web" },
    { id: "motion", label: "Motion" },
    { id: "richmedia", label: "Rich Media" },
];

const L = (v, l) => (typeof v === "string" ? v : (v && v[l]) || "");

// content.js -> documento Firestore (plano)
const toDoc = (p, i) => ({
    category: p.category || "web",
    title_pt: L(p.title, "PT"),
    title_en: L(p.title, "EN"),
    subtitle_pt: L(p.subtitle, "PT"),
    subtitle_en: L(p.subtitle, "EN"),
    client: L(p.client, "PT") || "",
    year: p.year || "",
    summary_pt: L(p.summary, "PT"),
    summary_en: L(p.summary, "EN"),
    details_pt: p.details ? L(p.details, "PT") : "",
    details_en: p.details ? L(p.details, "EN") : "",
    cover: p.cover || "",
    url: p.url || "",
    video: p.video || "",
    tools: p.tools || [],
    gallery: p.gallery && p.gallery.length > 1 ? p.gallery : [],
    model_glb: p.model_glb || "",
    model_usdz: p.model_usdz || "",
    is_richmedia: !!(p.richmedia && p.richmedia.screens && p.richmedia.screens.length),
    rm_fit: (p.richmedia && p.richmedia.fit) || "contain",
    screens: (p.richmedia && p.richmedia.screens) || [],
    subtype: p.subtype || "",
    posts: p.posts || [],
    stories: p.stories || [],
    sort_order: i,
    published: true,
});

const emptyDoc = () => ({
    category: "web",
    title_pt: "",
    title_en: "",
    subtitle_pt: "",
    subtitle_en: "",
    client: "",
    year: "",
    summary_pt: "",
    summary_en: "",
    details_pt: "",
    details_en: "",
    cover: "",
    url: "",
    video: "",
    videos: [],
    tools: [],
    gallery: [],
    model_glb: "",
    model_usdz: "",
    is_richmedia: false,
    rm_fit: "contain",
    screens: [],
    subtype: "posts",
    posts: [],
    stories: [],
    sort_order: 0,
    published: true,
});

// Campo estável (definido fora do componente para o input não perder o foco).
const Field = ({ label, value, onChange, area }) => (
    <label className="block mb-3">
        <span className="overline text-mist">{label}</span>
        {area ? (
            <textarea
                rows={4}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink"
            />
        ) : (
            <input
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink"
            />
        )}
    </label>
);

// Campo de lista (ferramentas, imagens). Guarda o texto tal como é escrito
// e só converte para array por baixo, assim dá para escrever vírgulas,
// espaços e mudanças de linha sem serem apagados a meio.
const parseList = (text, sep) =>
    text
        .split(sep)
        .map((s) => s.trim())
        .filter(Boolean);

const ListInput = ({ value, onChange, sep, area, rows, className }) => {
    const joiner = sep === "," ? ", " : "\n";
    const [text, setText] = useState((value || []).join(joiner));
    const last = useRef(value || []);

    // Se o array mudar por fora (ex.: upload de imagem, abrir outro projeto),
    // atualiza o texto.
    useEffect(() => {
        const v = value || [];
        if (JSON.stringify(v) !== JSON.stringify(last.current)) {
            last.current = v;
            setText(v.join(joiner));
        }
    }, [value, joiner]);

    const handle = (e) => {
        const t = e.target.value;
        setText(t);
        const arr = parseList(t, sep);
        last.current = arr;
        onChange(arr);
    };

    return area ? (
        <textarea rows={rows} value={text} onChange={handle} className={className} />
    ) : (
        <input value={text} onChange={handle} className={className} />
    );
};

// Lista de imagens (URLs, um por linha) + upload. Fora do componente (foco).
const ImageListField = ({ label, help, value, onChange, onUpload, uploading, accept = "image/*", buttonLabel = "Carregar imagens" }) => (
    <div className="mb-4">
        <div className="overline text-mist mb-1">{label}</div>
        {help ? <div className="text-[11px] text-mist mb-1">{help}</div> : null}
        <ListInput
            area
            rows={3}
            sep={"\n"}
            value={value}
            onChange={onChange}
            className="w-full border border-hairline bg-bone px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <label className="cursor-pointer inline-flex text-xs tracking-[0.18em] uppercase border border-hairline px-3 py-2 hover:border-ink mt-2">
            {uploading ? "A carregar…" : buttonLabel}
            <input
                type="file"
                accept={accept}
                multiple
                className="hidden"
                onChange={onUpload}
            />
        </label>
    </div>
);

const AdminProjects = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [editing, setEditing] = useState(null); // {id?, ...fields}
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState("");
    const previewOn = useRef(false);
    const [rmBusy, setRmBusy] = useState(false);

    // com a pré-visualização aberta, cada alteração no editor aparece lá
    useEffect(() => {
        if (!editing || !previewOn.current) return undefined;
        const tmr = setTimeout(() => writePreview(editing, true), 300);
        return () => clearTimeout(tmr);
    }, [editing]);

    const load = async () => {
        setLoading(true);
        const q = query(collection(db, "projects"), orderBy("sort_order"));
        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const importDefaults = async () => {
        if (!window.confirm("Importar os 18 projetos do site para a base de dados?"))
            return;
        setBusy(true);
        setMsg("");
        try {
            for (let i = 0; i < PROJECTS.length; i++) {
                const p = PROJECTS[i];
                await setDoc(doc(db, "projects", p.id), toDoc(p, i));
            }
            setMsg("Projetos importados.");
            await load();
        } catch (e) {
            setMsg("Erro a importar: " + e.message);
        } finally {
            setBusy(false);
        }
    };

    const save = async () => {
        setBusy(true);
        setMsg("");
        const { id, ...data } = editing;
        // motion: a lista de vídeos manda; `video` fica igual ao primeiro (compatibilidade)
        if (Array.isArray(data.videos)) {
            data.videos = data.videos.filter((v) => v && v.src);
            data.video = data.videos[0] ? data.videos[0].src : "";
        }
        data.is_richmedia = data.category === "richmedia";
        // 3D: "ar" (realidade aumentada) ou "render" (só renderização)
        if (data.category === "ar3d") data.subtype = data.subtype === "render" ? "render" : "ar";
        try {
            if (id) {
                await updateDoc(doc(db, "projects", id), data);
            } else {
                data.sort_order = items.length;
                await addDoc(collection(db, "projects"), data);
            }
            warmProject(data); // gera já as versões otimizadas no Cloudinary
            setEditing(null);
            await load();
        } catch (e) {
            setMsg("Erro a guardar: " + e.message);
        } finally {
            setBusy(false);
        }
    };

    const remove = async (it) => {
        if (!window.confirm(`Apagar "${it.title_pt}"? Definitivo.`)) return;
        await deleteDoc(doc(db, "projects", it.id));
        await load();
    };

    // Abre o editor com uma cópia do projeto. Só é criado na base de dados
    // quando carregas em Guardar (entra como rascunho e no fim da lista).
    const duplicate = (it) => {
        const { id, sort_order, ...rest } = it;
        const copy = JSON.parse(JSON.stringify(rest));
        setMsg("");
        setEditing({
            ...copy,
            title_pt: (it.title_pt || "") + " (cópia)",
            title_en: (it.title_en || "") + " (copy)",
            published: false,
        });
        window.scrollTo(0, 0);
    };

    const togglePublish = async (it) => {
        await updateDoc(doc(db, "projects", it.id), { published: !it.published });
        await load();
    };

    const handleUpload = async (files, target) => {
        const list = Array.from(files || []);
        if (!list.length) return;
        if (!CLOUDINARY_CLOUD || CLOUDINARY_CLOUD.startsWith("PÕE")) {
            setMsg("Configura o Cloudinary primeiro em lib/cloudinary.js.");
            return;
        }
        setUploading(true);
        setMsg("");
        try {
            for (const file of list) {
                const url = await uploadToCloudinary(file);
                if (target === "videos") {
                    setEditing((e) => ({
                        ...e,
                        videos: [...videoList(e), { src: url, title_pt: "", title_en: "" }],
                    }));
                } else if (target === "cover" || target === "video" || target === "model_glb" || target === "model_usdz") {
                    setEditing((e) => ({ ...e, [target]: url }));
                } else {
                    // gallery | posts | stories
                    setEditing((e) => ({
                        ...e,
                        [target]: [...(e[target] || []), url],
                    }));
                }
            }
        } catch (e) {
            setMsg("Upload falhou: " + e.message);
        } finally {
            setUploading(false);
        }
    };

    const shown =
        filter === "all" ? items : items.filter((i) => i.category === filter);

    // Ordem dos projetos no site: troca com o vizinho da lista visível
    // (com um filtro ativo troca dentro dessa categoria) e regrava a ordem toda.
    const [ordering, setOrdering] = useState(false);
    const saveOrder = async (next) => {
        setItems(next);
        setOrdering(true);
        try {
            const batch = writeBatch(db);
            next.forEach((x, i) => batch.update(doc(db, "projects", x.id), { sort_order: i }));
            await batch.commit();
            setMsg("");
        } catch (e) {
            setMsg("Erro a guardar a ordem: " + e.message);
            await load();
        } finally {
            setOrdering(false);
        }
    };
    const move = (it, dir) => {
        const pos = shown.findIndex((x) => x.id === it.id);
        const other = shown[pos + dir];
        if (!other || ordering) return;
        const next = [...items];
        const a = next.findIndex((x) => x.id === it.id);
        const b = next.findIndex((x) => x.id === other.id);
        [next[a], next[b]] = [next[b], next[a]];
        saveOrder(next);
    };
    const moveToTop = (it) => {
        if (ordering) return;
        const first = shown[0];
        if (!first || first.id === it.id) return;
        const next = items.filter((x) => x.id !== it.id);
        next.splice(next.findIndex((x) => x.id === first.id), 0, it);
        saveOrder(next);
    };

    // ---------- EDITOR ----------
    if (editing) {
        const set = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

        return (
            <div className="min-h-screen bg-bone text-ink">
                <header className="hairline-bottom flex items-center justify-between px-6 h-14">
                    <span className="overline">
                        {editing.id
                            ? "Editar projeto"
                            : editing.title_pt && editing.title_pt.endsWith(" (cópia)")
                              ? "Duplicar projeto"
                              : "Novo projeto"}
                    </span>
                    <button
                        onClick={() => setEditing(null)}
                        className="text-xs tracking-[0.18em] uppercase text-mist hover:text-ink"
                    >
                        Cancelar
                    </button>
                </header>

                <div className="max-w-2xl mx-auto px-6 py-8">
                    <label className="block mb-3">
                        <span className="overline text-mist">Categoria</span>
                        <select
                            value={editing.category}
                            onChange={(e) => set("category", e.target.value)}
                            className="w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink"
                        >
                            {CATS.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    {editing.category === "graphic" ? (
                        <label className="block mb-3">
                            <span className="overline text-mist">
                                Tipo de design
                            </span>
                            <select
                                value={editing.subtype || "posts"}
                                onChange={(e) => set("subtype", e.target.value)}
                                className="w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink"
                            >
                                <option value="posts">Posts &amp; Stories</option>
                                <option value="banners">Banners</option>
                                <option value="posters">Posters</option>
                                <option value="print">Impressão / Outros</option>
                            </select>
                        </label>
                    ) : null}

                    {editing.category === "ar3d" ? (
                        <div className="mb-4 border border-hairline bg-white p-4 space-y-3">
                            <label className="block">
                                <span className="overline text-mist">Tipo de projeto 3D</span>
                                <select
                                    value={editing.subtype === "render" ? "render" : "ar"}
                                    onChange={(e) => set("subtype", e.target.value)}
                                    className="w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink"
                                >
                                    <option value="ar">Realidade aumentada (com botão “Ver em AR”)</option>
                                    <option value="render">Só renderização (imagens / vídeo, sem AR)</option>
                                </select>
                            </label>
                            {editing.subtype !== "render" ? (
                                <>
                                    <p className="text-xs text-mist">
                                        GLB: obrigatório (Android e visualizador no computador; as animações tocam sozinhas).
                                        USDZ: para a AR no iPhone/iPad. Mantém os ficheiros leves (idealmente abaixo de 10 MB).
                                    </p>
                                    {[
                                        ["model_glb", "Modelo GLB", ".glb,model/gltf-binary"],
                                        ["model_usdz", "Modelo USDZ (iPhone)", ".usdz,model/vnd.usdz+zip"],
                                    ].map(([key, label, accept]) => (
                                        <div key={key}>
                                            <span className="overline text-mist">{label}</span>
                                            <div className="flex items-center gap-3 mt-1">
                                                <input
                                                    value={editing[key] || ""}
                                                    onChange={(e) => set(key, e.target.value)}
                                                    placeholder="URL do ficheiro (ou carrega ao lado)"
                                                    className="flex-1 border border-hairline bg-bone px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                                                />
                                                <label className="shrink-0 cursor-pointer border border-ink px-3 py-2 text-xs tracking-[0.14em] uppercase hover:bg-ink hover:text-bone transition-colors">
                                                    {uploading ? "A carregar…" : "Carregar"}
                                                    <input
                                                        type="file"
                                                        accept={accept}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            handleUpload(e.target.files, key);
                                                            e.target.value = "";
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            {editing[key] ? (
                                                <div className="text-xs text-graphite mt-1 truncate"> {editing[key].split("/").pop()}</div>
                                            ) : null}
                                        </div>
                                    ))}
                                    {!editing.model_glb ? (
                                        <div className="text-xs text-terracotta">
                                            Sem GLB o botão de AR não aparece no site.
                                        </div>
                                    ) : null}
                                </>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Field label="Título (PT)" value={editing.title_pt} onChange={(v) => set("title_pt", v)} />
                        <Field label="Título (EN)" value={editing.title_en} onChange={(v) => set("title_en", v)} />
                        <Field label="Subtítulo (PT)" value={editing.subtitle_pt} onChange={(v) => set("subtitle_pt", v)} />
                        <Field label="Subtítulo (EN)" value={editing.subtitle_en} onChange={(v) => set("subtitle_en", v)} />
                        <Field label="Cliente" value={editing.client} onChange={(v) => set("client", v)} />
                        <Field label="Ano" value={editing.year} onChange={(v) => set("year", v)} />
                    </div>

                    <Field label="Resumo (PT)" value={editing.summary_pt} onChange={(v) => set("summary_pt", v)} area />
                    <Field label="Resumo (EN)" value={editing.summary_en} onChange={(v) => set("summary_en", v)} area />
                    <Field label="Descrição completa (PT)" value={editing.details_pt} onChange={(v) => set("details_pt", v)} area />
                    <Field label="Descrição completa (EN)" value={editing.details_en} onChange={(v) => set("details_en", v)} area />

                    <Field label="Imagem de capa (URL)" value={editing.cover} onChange={(v) => set("cover", v)} />
                    <div className="-mt-1 mb-3 flex items-center gap-3">
                        <label className="cursor-pointer text-xs tracking-[0.18em] uppercase border border-hairline px-3 py-2 hover:border-ink">
                            {uploading ? "A carregar…" : "Carregar capa"}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    handleUpload(e.target.files, "cover")
                                }
                            />
                        </label>
                        {editing.cover ? (
                            <img
                                src={editing.cover}
                                alt=""
                                className="h-12 w-12 object-cover border border-hairline"
                            />
                        ) : null}
                    </div>
                    <Field label="Link (site live / vídeo)" value={editing.url} onChange={(v) => set("url", v)} />

                    {editing.category === "motion" ? (
                        <div className="mb-4 border border-hairline p-3">
                            <div className="overline text-mist mb-1">Vídeos (tocam dentro do site)</div>
                            <div className="text-[11px] text-mist mb-3">
                                Podes pôr vários vídeos do mesmo cliente. O primeiro abre logo; os outros aparecem por baixo para escolher. A capa serve de imagem do primeiro antes do play. Máx. ~100 MB por vídeo no plano grátis do Cloudinary.
                            </div>
                            {videoList(editing).map((v, i, arr) => {
                                const upd = (patch) =>
                                    set(
                                        "videos",
                                        arr.map((x, j) => (j === i ? { ...x, ...patch } : x)),
                                    );
                                const mv = (d) => {
                                    const next = [...arr];
                                    const k = i + d;
                                    if (k < 0 || k >= next.length) return;
                                    [next[i], next[k]] = [next[k], next[i]];
                                    set("videos", next);
                                };
                                return (
                                    <div key={v.src + i} className="flex gap-3 items-start border-t border-hairline pt-3 mb-3">
                                        <video
                                            src={v.src}
                                            className="w-28 h-20 bg-black object-contain shrink-0"
                                            muted
                                            preload="metadata"
                                            controls
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] text-mist mb-1">
                                                {String(i + 1).padStart(2, "0")}
                                                {i === 0 ? " · principal" : ""}
                                            </div>
                                            <input
                                                value={v.title_pt || ""}
                                                onChange={(e) => upd({ title_pt: e.target.value })}
                                                placeholder="Nome do vídeo (PT), ex.: Natal 2025"
                                                className="w-full border border-hairline bg-bone px-2 py-1.5 text-sm text-ink outline-none focus:border-ink mb-1.5"
                                            />
                                            <input
                                                value={v.title_en || ""}
                                                onChange={(e) => upd({ title_en: e.target.value })}
                                                placeholder="Nome do vídeo (EN)"
                                                className="w-full border border-hairline bg-bone px-2 py-1.5 text-sm text-ink outline-none focus:border-ink"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0 text-xs">
                                            <button type="button" onClick={() => mv(-1)} disabled={i === 0} className="border border-hairline px-2 py-1 hover:border-ink disabled:opacity-30">↑</button>
                                            <button type="button" onClick={() => mv(1)} disabled={i === arr.length - 1} className="border border-hairline px-2 py-1 hover:border-ink disabled:opacity-30">↓</button>
                                            <button
                                                type="button"
                                                onClick={() => set("videos", arr.filter((_, j) => j !== i))}
                                                className="border border-hairline px-2 py-1 text-mist hover:text-terracotta hover:border-terracotta"
                                            >
                                                apagar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex items-center gap-3 flex-wrap">
                                <label className="cursor-pointer text-xs tracking-[0.18em] uppercase border border-hairline px-3 py-2 hover:border-ink">
                                    {uploading ? "A carregar…" : "Carregar vídeos"}
                                    <input
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleUpload(e.target.files, "videos")}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const u = window.prompt("URL do vídeo (Cloudinary ou .mp4)");
                                        if (u && u.trim())
                                            set("videos", [...videoList(editing), { src: u.trim(), title_pt: "", title_en: "" }]);
                                    }}
                                    className="text-xs tracking-[0.18em] uppercase border border-hairline px-3 py-2 hover:border-ink"
                                >
                                    Adicionar por URL
                                </button>
                            </div>
                        </div>
                    ) : null}

                    <label className="block mb-3">
                        <span className="overline text-mist">
                            Ferramentas (separadas por vírgula)
                        </span>
                        <ListInput
                            sep=","
                            value={editing.tools}
                            onChange={(a) => set("tools", a)}
                            className="w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink"
                        />
                    </label>

                    {editing.category === "graphic" &&
                    (editing.subtype || "posts") === "posts" ? (
                        <>
                            <ImageListField
                                label="Posts"
                                help="Imagens dos posts (aparecem em cima na galeria)."
                                value={editing.posts}
                                onChange={(a) => set("posts", a)}
                                onUpload={(e) =>
                                    handleUpload(e.target.files, "posts")
                                }
                                uploading={uploading}
                            />
                            <ImageListField
                                label="Stories"
                                help="Imagens verticais dos stories (aparecem por baixo)."
                                value={editing.stories}
                                onChange={(a) => set("stories", a)}
                                onUpload={(e) =>
                                    handleUpload(e.target.files, "stories")
                                }
                                uploading={uploading}
                            />
                        </>
                    ) : (
                        <ImageListField
                            label={editing.category === "motion" ? "Galeria (imagens e vídeos)" : "Galeria"}
                            help={editing.category === "motion" ? "Um URL por linha. Podes misturar imagens e vídeos (mp4, webm, mov); os vídeos são reconhecidos sozinhos." : undefined}
                            accept={editing.category === "motion" ? "image/*,video/*" : "image/*"}
                            buttonLabel={editing.category === "motion" ? "Carregar imagens / vídeos" : "Carregar imagens"}
                            value={editing.gallery}
                            onChange={(a) => set("gallery", a)}
                            onUpload={(e) =>
                                handleUpload(e.target.files, "gallery")
                            }
                            uploading={uploading}
                        />
                    )}

                    {editing.category === "richmedia" ? (
                        <div className="mb-6 border border-hairline p-4">
                            <div className="overline text-mist mb-2">
                                Ecrãs do rich media (protótipo Marvel)
                            </div>
                            <RichMediaEditor
                                screens={editing.screens || []}
                                fit={editing.rm_fit || "contain"}
                                onScreens={(s) => set("screens", s)}
                                onFit={(f) => set("rm_fit", f)}
                                onMsg={setMsg}
                            />
                        </div>
                    ) : null}

                    {editing.category === "richmedia" ? (
                        <div className="mb-6 border border-hairline p-4">
                            <div className="overline text-mist mb-1">Rich media em HTML (interativo)</div>
                            <div className="text-[11px] text-mist mb-3">
                                Escolhe a pasta da entrega (a que tem o index.html e as pastas das imagens). Fica tudo num só ficheiro e o site mostra o rich media a funcionar. Se não houver HTML, o site usa os ecrãs de cima como protótipo.
                            </div>
                            {editing.rm_html ? (
                                <div className="flex items-center gap-3 flex-wrap text-sm mb-3">
                                    <span className="text-ink">HTML carregado</span>
                                    <a href={editing.rm_html} target="_blank" rel="noopener noreferrer" className="link-underline text-ink">
                                        abrir
                                    </a>
                                    <button type="button" onClick={() => set("rm_html", "")} className="text-mist hover:text-terracotta">
                                        remover
                                    </button>
                                </div>
                            ) : null}
                            <label className="cursor-pointer inline-block text-xs tracking-[0.18em] uppercase border border-hairline px-3 py-2 hover:border-ink">
                                {rmBusy ? "A preparar…" : editing.rm_html ? "Substituir pasta" : "Carregar pasta"}
                                <input
                                    type="file"
                                    className="hidden"
                                    webkitdirectory=""
                                    directory=""
                                    multiple
                                    onChange={async (e) => {
                                        const files = e.target.files;
                                        if (!files || !files.length) return;
                                        setRmBusy(true);
                                        try {
                                            const r = await uploadRmHtml(files);
                                            set("rm_html", r.url);
                                            setMsg(`Rich media em HTML carregado (${r.used.length} ficheiros embutidos, ${r.kb} KB).`);
                                        } catch (err) {
                                            setMsg(`Erro no HTML: ${err.message}`);
                                        } finally {
                                            setRmBusy(false);
                                            e.target.value = "";
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    ) : null}

                    <label className="flex items-center gap-2 mb-6 text-sm">
                        <input
                            type="checkbox"
                            checked={!!editing.published}
                            onChange={(e) => set("published", e.target.checked)}
                        />
                        Publicado (visível no site)
                    </label>

                    {msg ? (
                        <div className="text-sm text-terracotta mb-3">{msg}</div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={save}
                            disabled={busy}
                            className="bg-ink text-bone px-6 py-2.5 text-xs tracking-[0.18em] uppercase hover:bg-terracotta transition-colors disabled:opacity-50"
                        >
                            {busy ? "A guardar…" : "Guardar"}
                        </button>
                        <button
                            onClick={() => {
                                previewOn.current = true;
                                openPreview(editing, true);
                            }}
                            className="border border-ink text-ink px-6 py-2.5 text-xs tracking-[0.18em] uppercase hover:bg-ink hover:text-bone transition-colors"
                        >
                            Ver
                        </button>
                    </div>

                    <p className="text-[12px] text-mist mt-6">
                        Imagens: por agora cola o URL (ex.: thum.io ou Cloudinary).
                        O upload direto no admin e o editor de ecrãs/hotspots do
                        rich media chegam no passo seguinte.
                    </p>
                </div>
            </div>
        );
    }

    // ---------- LISTA ----------
    return (
        <div className="min-h-screen bg-bone text-ink">
            <AdminTabs />

            <div className="max-w-3xl mx-auto px-6 py-8">
                {msg ? (
                    <div className="text-sm text-graphite mb-4">{msg}</div>
                ) : null}

                {!loading && items.length === 0 ? (
                    <div className="border border-hairline bg-white p-6 mb-8 text-center">
                        <p className="text-sm text-graphite mb-4">
                            A base de dados está vazia. Importa os teus 18
                            projetos do site para começares.
                        </p>
                        <button
                            onClick={importDefaults}
                            disabled={busy}
                            className="bg-ink text-bone px-6 py-2.5 text-xs tracking-[0.18em] uppercase hover:bg-terracotta transition-colors disabled:opacity-50"
                        >
                            {busy ? "A importar…" : "Importar projetos do site"}
                        </button>
                    </div>
                ) : null}

                <p className="text-xs text-mist mb-3">
                    A ordem desta lista é a ordem dos projetos no site. Usa as setas para mudar; com um filtro ativo, as setas mexem só dentro dessa categoria.
                    {ordering ? " A guardar…" : ""}
                </p>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1 border ${filter === "all" ? "border-ink text-ink" : "border-hairline text-mist"}`}
                        >
                            Todos
                        </button>
                        {CATS.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setFilter(c.id)}
                                className={`px-3 py-1 border ${filter === c.id ? "border-ink text-ink" : "border-hairline text-mist"}`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setEditing(emptyDoc())}
                        className="bg-ink text-bone px-4 py-2 text-xs tracking-[0.18em] uppercase hover:bg-terracotta transition-colors"
                    >
                        + Novo
                    </button>
                </div>

                {loading ? (
                    <div className="text-sm text-mist">A carregar…</div>
                ) : (
                    <ul className="divide-y divide-hairline border border-hairline bg-white">
                        {shown.map((it, idx) => (
                            <li
                                key={it.id}
                                className="flex items-center justify-between px-4 py-3 gap-4"
                            >
                                <div className="flex items-center gap-1 shrink-0">
                                    <span className="w-7 text-right text-[11px] tabular-nums text-mist">
                                        {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    <button
                                        onClick={() => move(it, -1)}
                                        disabled={idx === 0 || ordering}
                                        className="h-7 w-7 border border-hairline text-ink hover:border-ink disabled:opacity-30"
                                        aria-label="Subir"
                                        title="Subir"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => move(it, 1)}
                                        disabled={idx === shown.length - 1 || ordering}
                                        className="h-7 w-7 border border-hairline text-ink hover:border-ink disabled:opacity-30"
                                        aria-label="Descer"
                                        title="Descer"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        onClick={() => moveToTop(it)}
                                        disabled={idx === 0 || ordering}
                                        className="h-7 px-2 border border-hairline text-[10px] tracking-[0.12em] uppercase text-ink hover:border-ink disabled:opacity-30"
                                        title="Pôr em primeiro"
                                    >
                                        Topo
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-ink">
                                        {it.title_pt || "(sem título)"}
                                        {!it.published ? (
                                            <span className="ml-2 text-[11px] text-mist">
                                                (rascunho)
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="text-[12px] text-mist">
                                        {CATS.find((c) => c.id === it.category)
                                            ?.label || it.category}
                                        {it.client ? ` · ${it.client}` : ""}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <button
                                        onClick={() => setEditing(it)}
                                        className="link-underline text-ink"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openPreview(it, false)}
                                        className="text-mist hover:text-ink"
                                    >
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => duplicate(it)}
                                        className="text-mist hover:text-ink"
                                    >
                                        Duplicar
                                    </button>
                                    <button
                                        onClick={() => togglePublish(it)}
                                        className="text-mist hover:text-ink"
                                    >
                                        {it.published ? "Despublicar" : "Publicar"}
                                    </button>
                                    <button
                                        onClick={() => remove(it)}
                                        className="text-mist hover:text-terracotta"
                                    >
                                        Apagar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminProjects;
