import React, { useState } from "react";
import { useLang, t } from "../context/LanguageContext";
import { CONTACT, SECTION_LABELS, SOCIAL, FOOTER } from "../data/content";
import { ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import StretchText from "./StretchText";

// Chave pública do Web3Forms (web3forms.com). Não é segredo: fica no site.
const WEB3FORMS_KEY = "";

const initialForm = { name: "", email: "", subject: "", message: "" };

const Contact = () => {
    const { lang } = useLang();
    const rootRef = useReveal([lang]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    // Mensagem por baixo do botão: { type: "ok" | "error", text }
    const [status, setStatus] = useState(null);

    const [copied, setCopied] = useState(false);
    const mailHref = `mailto:${SOCIAL.email}?subject=${encodeURIComponent(
        lang === "PT" ? "Contacto pelo portfólio" : "Contact from your portfolio",
    )}&body=${encodeURIComponent(lang === "PT" ? "Olá Alexandre,\n\n" : "Hi Alexandre,\n\n")}`;
    // Abre a app de email; se o computador não tiver nenhuma, o email fica copiado.
    const onMailClick = () => {
        try {
            navigator.clipboard?.writeText(SOCIAL.email);
        } catch (_) {
            /* ignora */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
    };

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!form.name || !form.email || !form.message) {
            setStatus({
                type: "error",
                text:
                    lang === "PT"
                        ? "Preenche nome, email e mensagem."
                        : "Fill in name, email and message.",
            });
            return;
        }
        setLoading(true);
        setStatus(null);

        // Envio por email via Web3Forms. Sem chave (ou se falhar) abre a app de
        // email da pessoa com a mensagem já escrita, para nunca se perder nada.
        let delivered = false;
        const accessKey = import.meta.env.VITE_WEB3FORMS_KEY || WEB3FORMS_KEY;
        if (accessKey) {
            try {
                const ctrl = new AbortController();
                const timer = setTimeout(() => ctrl.abort(), 15000);
                const resp = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    signal: ctrl.signal,
                    body: JSON.stringify({
                        access_key: accessKey,
                        name: form.name,
                        email: form.email,
                        subject: form.subject || `Nova mensagem de ${form.name} · Portfólio`,
                        message: form.message,
                        from_name: "Portfólio alexandrecosme.com",
                    }),
                });
                clearTimeout(timer);
                const data = await resp.json();
                delivered = !!data.success;
            } catch (_) {
                delivered = false;
            }
        }

        if (!delivered) {
            setLoading(false);
            const subject = form.subject || (lang === "PT" ? "Contacto pelo portfólio" : "Contact from your portfolio");
            const body = `${form.message}\n\n${form.name}\n${form.email}`;
            window.location.href = `mailto:${SOCIAL.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            setStatus({
                type: "ok",
                text:
                    lang === "PT"
                        ? `Abri a tua app de email com a mensagem pronta. Se não abriu, escreve para ${SOCIAL.email}.`
                        : `Your email app should open with the message ready. If not, write to ${SOCIAL.email}.`,
            });
            return;
        }

        setLoading(false);
        setStatus({ type: "ok", text: t(CONTACT.fields.success, lang) });
        setForm(initialForm);
    };

    return (
        <section
            id="contact"
            ref={rootRef}
            className="px-4 md:px-8 py-24 md:py-36 contact-band"
        >
            <div className="mx-auto max-w-[1600px] mb-20 md:mb-28">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <span className="section-kicker !text-bone/80">↳ {lang === "PT" ? "Tens um projeto em mente?" : "Got a project in mind?"}</span>
                    <p className="text-bone/90 text-lg md:text-xl max-w-sm leading-snug">{t(CONTACT.sub, lang)}</p>
                </div>
                <a
                    href={mailHref}
                    onClick={onMailClick}
                    className="contact-big group mt-10 md:mt-14"
                >
                    <StretchText text={lang === "PT" ? "VAMOS FALAR" : "LET'S TALK"} className="contact-big-word" />
                    <ArrowUpRight className="contact-big-arrow" strokeWidth={1.5} />
                </a>
                <p role="status" aria-live="polite" className={`mt-4 text-bone/90 text-sm md:text-base transition-opacity duration-300 ${copied ? "opacity-100" : "opacity-0"}`}>
                    {lang === "PT"
                        ? `Se a tua app de email não abriu, o endereço ${SOCIAL.email} já está copiado.`
                        : `If your email app didn't open, ${SOCIAL.email} is already copied.`}
                </p>
            </div>

            <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-y-16 md:gap-12 contact-panel">
                <div className="col-span-12 md:col-span-5 reveal">
                    <span className="section-kicker">↳ {lang === "PT" ? "Ou deixa aqui a mensagem" : "Or leave a message here"}</span>
                    <h2
                        className="font-condensed uppercase text-5xl md:text-7xl mt-4 text-ink"
                    >
                        {lang === "PT" ? "Fala comigo" : "Say hello"}
                    </h2>

                    <ul className="mt-12 space-y-4">
                        <li>
                            <a
                                href={mailHref}
                                onClick={onMailClick}
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
                                className="group inline-flex items-center gap-3 text-lg md:text-xl text-ink"
                            >
                                <span className="link-underline">LinkedIn</span>
                                <ArrowUpRight
                                    size={16}
                                    className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                />
                            </a>
                        </li>
                        <li>
                            <a
                                href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 text-lg md:text-xl text-ink"
                            >
                                <span className="link-underline">Instagram</span>
                                <ArrowUpRight
                                    size={16}
                                    className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                />
                            </a>
                        </li>
                        <li>
                            <a
                                href={`tel:${SOCIAL.phone.replace(/\s/g, "")}`}
                                className="group inline-flex items-center gap-3 text-lg md:text-xl text-ink"
                            >
                                <span className="link-underline">{SOCIAL.phone}</span>
                                <ArrowUpRight
                                    size={16}
                                    className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                />
                            </a>
                        </li>
                    </ul>
                </div>

                <form
                    onSubmit={onSubmit}
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
                            required
                        />
                    </div>

                    <div className="pt-10">
                        <button
                            type="submit"
                            disabled={loading}
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
                        <p
                            role="status"
                            aria-live="polite"
                            className={`mt-4 min-h-[1.25rem] text-sm ${
                                status?.type === "error" ? "text-terracotta" : "text-ink"
                            }`}
                        >
                            {status ? status.text : ""}
                        </p>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <footer className="mx-auto max-w-[1600px] mt-24 md:mt-32 pt-10 contact-footer flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="font-display text-4xl md:text-6xl text-ink leading-[0.9]">
                    Alexandre Cosme
                    <span className="text-terracotta">.</span>
                </div>
                <div className="text-sm text-graphite md:text-right space-y-1">
                    <div>© {new Date().getFullYear()} · {t(FOOTER.rights, lang)}</div>
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
