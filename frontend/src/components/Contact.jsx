import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { useLang, t } from "../context/LanguageContext";
import { CONTACT, SECTION_LABELS, SOCIAL, FOOTER } from "../data/content";
import { ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const initialForm = { name: "", email: "", subject: "", message: "" };

const Contact = () => {
    const { lang } = useLang();
    const rootRef = useReveal([lang]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!form.name || !form.email || !form.message) {
            toast.error(
                lang === "PT"
                    ? "Preenche nome, email e mensagem."
                    : "Fill in name, email and message.",
            );
            return;
        }
        setLoading(true);
        const accessKey = process.env.REACT_APP_WEB3FORMS_KEY;
        let delivered = false;

        // 1) Try Web3Forms (client-side delivery). Failure is non-fatal.
        if (accessKey) {
            try {
                const fd = new FormData();
                fd.append("access_key", accessKey);
                fd.append("name", form.name);
                fd.append("email", form.email);
                fd.append(
                    "subject",
                    form.subject || `Nova mensagem de ${form.name} — Portfólio`,
                );
                fd.append("message", form.message);
                fd.append("from_name", "Alexandre Cosme Portfolio");
                const resp = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: fd,
                });
                const data = await resp.json();
                delivered = !!data.success;
            } catch (_) {
                delivered = false;
            }
        }

        // 2) Always persist a backup copy on our backend.
        let stored = false;
        try {
            await axios.post(`${API}/contact`, form, { timeout: 12000 });
            stored = true;
        } catch (_) {
            stored = false;
        }

        setLoading(false);

        if (!delivered && !stored) {
            toast.error(t(CONTACT.fields.error, lang));
            return;
        }

        if (delivered) {
            toast.success(t(CONTACT.fields.success, lang));
        } else {
            toast.warning(
                lang === "PT"
                    ? "Mensagem recebida e guardada. O envio por email ficou pendente."
                    : "Message received and stored. Email delivery is pending.",
            );
        }
        setForm(initialForm);
    };

    return (
        <section
            id="contact"
            ref={rootRef}
            data-testid="contact-section"
            className="px-6 md:px-12 py-24 md:py-40 hairline-top bg-pebble"
        >
            <Toaster position="bottom-center" richColors closeButton />

            <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-y-16 md:gap-12">
                <div className="col-span-12 md:col-span-5 reveal">
                    <span className="overline !text-terracotta">— 05</span>
                    <h2
                        className="font-display text-4xl md:text-6xl mt-3 text-ink whitespace-pre-line leading-[0.95]"
                        data-testid="contact-heading"
                    >
                        {t(CONTACT.heading, lang)}
                    </h2>
                    <p className="mt-8 text-base md:text-lg text-graphite max-w-md">
                        {t(CONTACT.sub, lang)}
                    </p>

                    <ul className="mt-12 space-y-4">
                        <li>
                            <a
                                href={`mailto:${SOCIAL.email}`}
                                data-testid="contact-direct-email"
                                className="group inline-flex items-center gap-3 text-lg md:text-xl text-ink"
                            >
                                <span className="link-underline">
                                    {SOCIAL.email}
                                </span>
                                <ArrowUpRight
                                    size={16}
                                    className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                />
                            </a>
                        </li>
                        <li>
                            <a
                                href={SOCIAL.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid="contact-linkedin"
                                className="group inline-flex items-center gap-3 text-lg md:text-xl text-ink"
                            >
                                <span className="link-underline">LinkedIn</span>
                                <ArrowUpRight
                                    size={16}
                                    className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                />
                            </a>
                        </li>
                        <li className="overline pt-4">
                            {SOCIAL.phone} · {SOCIAL.location}
                        </li>
                    </ul>
                </div>

                <form
                    onSubmit={onSubmit}
                    data-testid="contact-form"
                    className="col-span-12 md:col-span-6 md:col-start-7 reveal space-y-2"
                    noValidate
                >
                    <div>
                        <label
                            htmlFor="name"
                            className="overline block mb-2"
                        >
                            {t(CONTACT.fields.name, lang)}
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={onChange}
                            className="elegant-input"
                            data-testid="contact-input-name"
                            required
                        />
                    </div>

                    <div className="pt-6">
                        <label
                            htmlFor="email"
                            className="overline block mb-2"
                        >
                            {t(CONTACT.fields.email, lang)}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            className="elegant-input"
                            data-testid="contact-input-email"
                            required
                        />
                    </div>

                    <div className="pt-6">
                        <label
                            htmlFor="subject"
                            className="overline block mb-2"
                        >
                            {t(CONTACT.fields.subject, lang)}
                        </label>
                        <input
                            id="subject"
                            name="subject"
                            type="text"
                            value={form.subject}
                            onChange={onChange}
                            className="elegant-input"
                            data-testid="contact-input-subject"
                        />
                    </div>

                    <div className="pt-6">
                        <label
                            htmlFor="message"
                            className="overline block mb-2"
                        >
                            {t(CONTACT.fields.message, lang)}
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            rows={5}
                            value={form.message}
                            onChange={onChange}
                            className="elegant-input resize-none"
                            data-testid="contact-input-message"
                            required
                        />
                    </div>

                    <div className="pt-10">
                        <button
                            type="submit"
                            disabled={loading}
                            data-testid="contact-form-submit"
                            className="group inline-flex items-center justify-between gap-6 rounded-full bg-terracotta px-7 py-4 text-bone hover:bg-terracotta-hover transition-colors duration-300 min-w-[260px] disabled:opacity-50 disabled:cursor-wait"
                        >
                            <span className="text-sm font-medium tracking-wide">
                                {loading
                                    ? t(CONTACT.fields.sending, lang)
                                    : t(CONTACT.fields.submit, lang)}
                            </span>
                            <ArrowUpRight
                                size={18}
                                className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                            />
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <footer className="mx-auto max-w-[1400px] mt-32 md:mt-48 pt-10 hairline-top flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="font-display text-4xl md:text-6xl text-ink leading-[0.9]">
                    Alexandre Cosme
                    <span className="text-terracotta">.</span>
                </div>
                <div className="text-sm text-graphite md:text-right space-y-1">
                    <div>© {new Date().getFullYear()} — {t(FOOTER.rights, lang)}</div>
                    <div className="text-mist">{t(FOOTER.colophon, lang)}</div>
                    <div className="overline pt-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta mr-2 align-middle" />
                        {t(FOOTER.available, lang)}
                    </div>
                </div>
            </footer>
        </section>
    );
};

export default Contact;
