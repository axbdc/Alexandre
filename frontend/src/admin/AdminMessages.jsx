// Aba "Mensagens": cópia de tudo o que chega pelo formulário de contacto,
// para não depender só do email (FormSubmit).
import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseAdmin";
import AdminTabs from "@/admin/AdminTabs";

const fmt = (iso) => {
    if (!iso) return "";
    const d = typeof iso === "string" ? new Date(iso) : iso.toDate ? iso.toDate() : new Date(iso);
    return d.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const AdminMessages = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const [openId, setOpenId] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(query(collection(db, "messages"), orderBy("created_at", "desc")));
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (e) {
            setMsg("Erro a carregar: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggle = async (it) => {
        setOpenId((cur) => (cur === it.id ? null : it.id));
        if (!it.read) {
            setItems((list) => list.map((x) => (x.id === it.id ? { ...x, read: true } : x)));
            try {
                await updateDoc(doc(db, "messages", it.id), { read: true });
            } catch (e) {
                setMsg("Não deu para marcar como lida: " + e.message);
            }
        }
    };

    const remove = async (it) => {
        if (!window.confirm(`Apagar a mensagem de ${it.name || it.email}?`)) return;
        try {
            await deleteDoc(doc(db, "messages", it.id));
            setItems((list) => list.filter((x) => x.id !== it.id));
        } catch (e) {
            setMsg("Erro a apagar: " + e.message);
        }
    };

    const unread = items.filter((x) => !x.read).length;

    return (
        <div className="min-h-screen bg-bone text-ink">
            <AdminTabs />
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="flex items-end justify-between mb-6">
                    <h1 className="font-condensed uppercase text-4xl">Mensagens</h1>
                    <span className="overline text-mist">
                        {items.length} no total{unread ? ` · ${unread} por ler` : ""}
                    </span>
                </div>
                {msg ? <div className="text-sm text-terracotta mb-4">{msg}</div> : null}
                {loading ? (
                    <div className="text-sm text-mist">A carregar…</div>
                ) : !items.length ? (
                    <div className="text-sm text-mist">Ainda não chegou nenhuma mensagem pelo formulário.</div>
                ) : (
                    <ul className="border-t border-hairline">
                        {items.map((it) => {
                            const open = openId === it.id;
                            return (
                                <li key={it.id} className="border-b border-hairline">
                                    <button
                                        type="button"
                                        onClick={() => toggle(it)}
                                        className="w-full text-left py-4 flex items-start gap-4"
                                    >
                                        <span
                                            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${it.read ? "bg-transparent" : "bg-terracotta"}`}
                                        />
                                        <span className="flex-1 min-w-0">
                                            <span className="flex flex-wrap items-baseline justify-between gap-2">
                                                <span className={`text-base ${it.read ? "" : "font-semibold"}`}>
                                                    {it.name || "Sem nome"}
                                                </span>
                                                <span className="text-xs text-mist">{fmt(it.created_at)}</span>
                                            </span>
                                            <span className="block text-sm text-graphite truncate">
                                                {it.subject || it.message}
                                            </span>
                                        </span>
                                    </button>
                                    {open ? (
                                        <div className="pl-6 pb-5 space-y-4">
                                            <div className="text-sm text-graphite">{it.email}</div>
                                            <p className="text-base whitespace-pre-wrap leading-relaxed">{it.message}</p>
                                            <div className="flex gap-3">
                                                <a
                                                    href={`mailto:${it.email}?subject=${encodeURIComponent("Re: " + (it.subject || "o teu contacto"))}`}
                                                    className="border border-ink px-3 py-2 text-xs tracking-[0.14em] uppercase hover:bg-ink hover:text-bone transition-colors"
                                                >
                                                    Responder
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(it)}
                                                    className="px-3 py-2 text-xs tracking-[0.14em] uppercase text-terracotta hover:underline"
                                                >
                                                    Apagar
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
