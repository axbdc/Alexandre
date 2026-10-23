// Aba "Destaques": as imagens que aparecem na faixa horizontal do início do site.
// Cada destaque = uma imagem (a melhor campanha, post, 3D...) ligada a um projeto.
// Ao clicar no destaque, o site abre esse projeto.
import React, { useEffect, useMemo, useState } from "react";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebaseAdmin";
import { uploadToCloudinary } from "@/lib/cloudinary";
import AdminTabs from "@/admin/AdminTabs";

const empty = () => ({
    image: "",
    project_id: "",
    label_pt: "",
    label_en: "",
    published: true,
});

const input =
    "w-full border border-hairline bg-bone px-3 py-2 mt-1 text-sm text-ink outline-none focus:border-ink";

const AdminHighlights = () => {
    const [items, setItems] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [h, p] = await Promise.all([
                getDocs(query(collection(db, "highlights"), orderBy("sort_order"))),
                getDocs(query(collection(db, "projects"), orderBy("sort_order"))),
            ]);
            setItems(h.docs.map((d) => ({ id: d.id, ...d.data() })));
            setProjects(p.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (e) {
            setMsg("Erro a carregar: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const projectName = useMemo(() => {
        const m = {};
        projects.forEach((p) => (m[p.id] = p.title_pt || p.id));
        return m;
    }, [projects]);

    const save = async () => {
        if (!editing.image || !editing.project_id) {
            setMsg("Falta a imagem ou o projeto.");
            return;
        }
        setBusy(true);
        setMsg("");
        try {
            const { id, ...data } = editing;
            if (id) {
                await updateDoc(doc(db, "highlights", id), data);
            } else {
                const max = items.reduce((m, it) => Math.max(m, it.sort_order || 0), 0);
                await addDoc(collection(db, "highlights"), { ...data, sort_order: max + 1 });
            }
            setEditing(null);
            setMsg("Destaque guardado.");
            await load();
        } catch (e) {
            setMsg("Erro a guardar: " + e.message);
        } finally {
            setBusy(false);
        }
    };

    const remove = async (it) => {
        // confirmação dentro da página (sem janelas do browser)
        if (editing && editing.__confirmDelete !== it.id) {
            setEditing({ ...editing, __confirmDelete: it.id });
            return;
        }
        await deleteDoc(doc(db, "highlights", it.id));
        setEditing(null);
        setMsg("Destaque apagado.");
        await load();
    };

    const togglePublish = async (it) => {
        await updateDoc(doc(db, "highlights", it.id), { published: !it.published });
        await load();
    };

    const move = async (index, dir) => {
        const j = index + dir;
        if (j < 0 || j >= items.length) return;
        const next = [...items];
        [next[index], next[j]] = [next[j], next[index]];
        setItems(next);
        const batch = writeBatch(db);
        next.forEach((it, i) => batch.update(doc(db, "highlights", it.id), { sort_order: i + 1 }));
        await batch.commit();
    };

    const onUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setEditing((ed) => ({ ...ed, image: url }));
        } catch (err) {
            setMsg("Upload falhou: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // ---------- EDITOR ----------
    if (editing && editing.__confirmDelete === undefined) {
        return (
            <div className="min-h-screen bg-bone text-ink">
                <AdminTabs />
                <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
                    <div className="flex items-center justify-between">
                        <h1 className="font-display text-2xl">
                            {editing.id ? "Editar destaque" : "Novo destaque"}
                        </h1>
                        <button
                            onClick={() => setEditing(null)}
                            className="text-xs tracking-[0.18em] uppercase text-mist hover:text-ink"
                        >
                            Cancelar
                        </button>
                    </div>

                    <div>
                        <label className="overline text-mist">Imagem do destaque</label>
                        <p className="text-xs text-mist mt-1">
                            A tua melhor campanha, post, 3D... Tem de ser quadrada, tamanho de post (1080x1080 ou maior). Ocupa o cartão todo; se não for quadrada, as pontas ficam cortadas.
                        </p>
                        {editing.image ? (
                            <img src={editing.image} alt="" className="mt-3 w-full max-w-[360px] aspect-square object-cover bg-pebble border border-hairline" />
                        ) : null}
                        <input type="file" accept="image/*,video/*" onChange={onUpload} className="mt-3 text-sm" />
                        {uploading ? <div className="text-xs text-mist mt-1">A carregar imagem…</div> : null}
                        <input
                            className={input}
                            placeholder="ou cola aqui o URL da imagem"
                            value={editing.image}
                            onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="overline text-mist">Abre o projeto</label>
                        <select
                            className={input}
                            value={editing.project_id}
                            onChange={(e) => setEditing({ ...editing, project_id: e.target.value })}
                        >
                            <option value="">Escolhe o projeto</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title_pt || p.id}
                                    {p.published ? "" : " (não publicado)"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="overline text-mist">Etiqueta PT (opcional)</label>
                            <input
                                className={input}
                                placeholder="ex.: Melhor campanha"
                                value={editing.label_pt}
                                onChange={(e) => setEditing({ ...editing, label_pt: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="overline text-mist">Etiqueta EN (opcional)</label>
                            <input
                                className={input}
                                placeholder="e.g. Best campaign"
                                value={editing.label_en}
                                onChange={(e) => setEditing({ ...editing, label_en: e.target.value })}
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={!!editing.published}
                            onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                        />
                        Publicado (aparece no site)
                    </label>

                    {msg ? <div className="text-sm text-terracotta">{msg}</div> : null}

                    <button
                        onClick={save}
                        disabled={busy || uploading}
                        className="bg-ink text-bone px-6 py-2.5 text-xs tracking-[0.18em] uppercase hover:bg-terracotta transition-colors disabled:opacity-50"
                    >
                        {busy ? "A guardar…" : "Guardar"}
                    </button>
                </div>
            </div>
        );
    }

    // ---------- LISTA ----------
    const confirmId = editing && editing.__confirmDelete;
    return (
        <div className="min-h-screen bg-bone text-ink">
            <AdminTabs />
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="font-display text-2xl">Destaques</h1>
                    <button
                        onClick={() => setEditing(empty())}
                        className="bg-ink text-bone px-4 py-2 text-xs tracking-[0.18em] uppercase hover:bg-terracotta transition-colors"
                    >
                        + Novo destaque
                    </button>
                </div>
                <p className="text-sm text-graphite mb-6">
                    Aparecem na faixa horizontal do início do site, por esta ordem. Ao clicar, abre o projeto escolhido.
                    Enquanto não houver destaques publicados, o site mostra os primeiros projetos.
                </p>
                {msg ? <div className="text-sm text-graphite mb-4">{msg}</div> : null}

                {loading ? (
                    <div className="text-sm text-mist">A carregar…</div>
                ) : items.length === 0 ? (
                    <div className="border border-hairline bg-white p-6 text-center text-sm text-graphite">
                        Ainda não tens destaques. Carrega em “+ Novo destaque”.
                    </div>
                ) : (
                    <ul className="divide-y divide-hairline border border-hairline bg-white">
                        {items.map((it, i) => (
                            <li key={it.id} className="flex items-center gap-4 px-4 py-3">
                                <img src={it.image} alt="" className="h-14 w-20 object-contain bg-pebble shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm text-ink truncate">
                                        {it.label_pt || projectName[it.project_id] || "(sem projeto)"}
                                    </div>
                                    <div className="text-xs text-mist truncate">
                                        Abre: {projectName[it.project_id] || "projeto apagado"}
                                        {it.published ? "" : " · não publicado"}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs shrink-0">
                                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-mist hover:text-ink disabled:opacity-30" aria-label="Subir">↑</button>
                                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-mist hover:text-ink disabled:opacity-30" aria-label="Descer">↓</button>
                                    <button onClick={() => setEditing({ ...it })} className="text-ink">Editar</button>
                                    <button onClick={() => togglePublish(it)} className="text-mist hover:text-ink">
                                        {it.published ? "Despublicar" : "Publicar"}
                                    </button>
                                    {confirmId === it.id ? (
                                        <>
                                            <button onClick={() => remove(it)} className="text-terracotta">Confirmar</button>
                                            <button onClick={() => setEditing(null)} className="text-mist">Não</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setEditing({ __confirmDelete: it.id })} className="text-mist hover:text-terracotta">
                                            Apagar
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminHighlights;
