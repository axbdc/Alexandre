// frontend/src/lib/img.js
// Imagens do Cloudinary otimizadas: formato automático (AVIF/WebP), qualidade
// automática e largura máxima. Não mexe em vídeos nem em URLs de fora do Cloudinary.

const CLD = /(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?:f_auto,q_auto(?:,w_\d+,c_limit)?\/)?/;

export const isCloudinaryImage = (url) =>
    typeof url === "string" && CLD.test(url);

// cld(url, 800) -> mesma imagem, no máximo 800px de largura, formato/qualidade auto.
export const cld = (url, width) => {
    if (!isCloudinaryImage(url)) return url;
    const t = width ? `f_auto,q_auto,w_${width},c_limit/` : "f_auto,q_auto/";
    return url.replace(CLD, `$1${t}`);
};

// srcSet para <img>: deixa o browser escolher o tamanho certo para o ecrã.
// Máximo 800px: numa grelha de cartões chega mesmo em ecrãs retina.
export const cldSrcSet = (url, widths = [400, 600, 800]) =>
    isCloudinaryImage(url)
        ? widths.map((w) => `${cld(url, w)} ${w}w`).join(", ")
        : undefined;
