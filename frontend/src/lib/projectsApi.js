// frontend/src/lib/projectsApi.js
// Lê os projetos publicados pela API REST do Firestore, sem carregar o SDK do
// Firebase no site público (poupa muito JavaScript no telemóvel).
//
// O pedido começa logo no index.html (window.__PTF_PROJECTS__), em paralelo com
// o download do JavaScript. Se por algum motivo não existir, é feito aqui.

export const RUNQUERY_URL =
    "https://firestore.googleapis.com/v1/projects/portfolio-5d3ee/databases/(default)/documents:runQuery?key=AIzaSyDD8Ktr4ozcNj2SdwSbiz8ynHE_I_7yHYs";

export const RUNQUERY_BODY =
    '{"structuredQuery":{"from":[{"collectionId":"projects"}],"where":{"fieldFilter":{"field":{"fieldPath":"published"},"op":"EQUAL","value":{"booleanValue":true}}}}}';

// Converte o formato do Firestore REST ({ stringValue: "x" }) em valores normais.
const val = (v) => {
    if (!v) return undefined;
    if ("stringValue" in v) return v.stringValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("doubleValue" in v) return v.doubleValue;
    if ("nullValue" in v) return null;
    if ("timestampValue" in v) return v.timestampValue;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(val);
    if ("mapValue" in v) return fields(v.mapValue.fields || {});
    return undefined;
};
const fields = (f) =>
    Object.fromEntries(Object.entries(f).map(([k, v]) => [k, val(v)]));

export async function fetchPublishedProjects() {
    let json = null;
    if (typeof window !== "undefined" && window.__PTF_PROJECTS__) {
        json = await window.__PTF_PROJECTS__;
        window.__PTF_PROJECTS__ = null; // só usa o pedido inicial uma vez
    }
    if (!Array.isArray(json)) {
        const res = await fetch(RUNQUERY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: RUNQUERY_BODY,
        });
        if (!res.ok) throw new Error("Firestore " + res.status);
        json = await res.json();
    }
    return json
        .filter((row) => row && row.document)
        .map((row) => ({
            id: row.document.name.split("/").pop(),
            data: fields(row.document.fields || {}),
        }));
}
