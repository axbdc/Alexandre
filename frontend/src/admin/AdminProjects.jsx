// frontend/src/admin/AdminProjects.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
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
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { PROJECTS } from "@/data/content";
import { uploadToCloudinary, CLOUDINARY_CLOUD } from "@/lib/cloudinary";
import RichMediaEditor from "@/admin/RichMediaEditor";

const CATS = [
    { id: "ar3d", label: "AR & 3D" },
    { id: "graphic", label: "Design Gráfico" },
    { id: "photo", label: "Fotografia" },
    { id: "web", label: "Web" },
    { id: "motion", label: "Motion & Rich Media" },
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
    tools: p.tools || [],
    gallery: p.gallery && p.gallery.length > 1 ? p.gallery : [],
    model_glb: p.model_glb || "",
    model_usdz: p.model_usdz || "",
    is_richmedia: !!(p.richmedia && p.richmedia.screens && p.richmedia.screens.length),
    rm_fit: (p.richmedia && p.richmedia.fit) || "contain",
    screens: (p.richmedia && p.richmedia.screens) || [],
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
    tools: [],
    gallery: [],
    model_glb: "",
    model_usdz: "",
    is_richmedia: false,
    rm_fit: "contain",
    screens: [],
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

const AdminProjects = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [editing, setEditing] = useState(null); // {id?, ...fields}
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState("");

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
        try {
            if (id) {
                await updateDoc(doc(db, "projects", id), data);
            } else {
                data.sort_order = items.length;
                await addDoc(collection(db, "projects"), data);
            }
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
                if (target === "cover") {
                    setEditing((e) => ({ ...e, cover: url }));
                } else {
                    setEditing((e) => ({
                        ...e,
                        gallery: [...(e.gallery || []), url],
                    }));
                }
            }
        } catch (e) {
            setMsg("Upload falhou: " + e.message);
        } finally {
            setUploading(false);
        }
    };

    const logout = async () => {
        await signOut(auth);
        navigate("/admin/login", { replace: true });
    };

    const shown =
        filter === "all" ? items : items.filter((i) => i.category === filter);

    // ---------- EDITOR ----------
    if (editing) {
        const set = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

        return (
            <div className="min-h-screen bg-bone text-ink">
                <header className="hairline-bottom flex items-center justify-between px-6 h-14">
                    <span className="overline">
                        {editing.id ? "Editar projeto" : "Novo projeto"}
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

                    <label className="block mb-3">
                        <span className="overline text-mist">
                            Ferramentas (separadas por vírgula)
                        </span>
                        <input
                            value={(editing.tools || []).join(", ")}
                            onChange={(e) =>
                                set(
                                    "tools",
                                    e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                )
                            }
                            className="w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink"
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="overline text-mist">
                            Galeria (um URL por linha)
                        </span>
                        <textarea
                            rows={3}
                            value={(editing.gallery || []).join("\n")}
                            onChange={(e) =>
                                set(
                                    "gallery",
                                    e.target.value
                                        .split("\n")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                )
                            }
                            className="w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink"
                        />
                    </label>

                    <label className="cursor-pointer inline-flex text-xs tracking-[0.18em] uppercase border border-hairline px-3 py-2 hover:border-ink mb-6">
                        {uploading ? "A carregar…" : "Carregar p/ galeria"}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                                handleUpload(e.target.files, "gallery")
                            }
                        />
                    </label>

                    {editing.category === "motion" ? (
                        <div className="mb-6 border border-hairline p-4">
                            <label className="flex items-center gap-2 text-sm mb-1">
                                <input
                                    type="checkbox"
                                    checked={!!editing.is_richmedia}
                                    onChange={(e) =>
                                        set("is_richmedia", e.target.checked)
                                    }
                                />
                                Protótipo de rich media (Marvel — ecrãs clicáveis)
                            </label>
                            {editing.is_richmedia ? (
                                <RichMediaEditor
                                    screens={editing.screens || []}
                                    fit={editing.rm_fit || "contain"}
                                    onScreens={(s) => set("screens", s)}
                                    onFit={(f) => set("rm_fit", f)}
                                    onMsg={setMsg}
                                />
                            ) : null}
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

                    <button
                        onClick={save}
                        disabled={busy}
                        className="bg-ink text-bone px-6 py-2.5 text-xs tracking-[0.18em] uppercase hover:bg-terracotta transition-colors disabled:opacity-50"
                    >
                        {busy ? "A guardar…" : "Guardar"}
                    </button>

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
            <header className="hairline-bottom flex items-center justify-between px-6 h-14">
                <span className="overline">Portfólio — Projetos</span>
                <button
                    onClick={logout}
                    className="text-xs tracking-[0.18em] uppercase text-mist hover:text-ink"
                >
                    Sair
                </button>
            </header>

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
                        {shown.map((it) => (
                            <li
                                key={it.id}
                                className="flex items-center justify-between px-4 py-3"
                            >
                                <div>
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
