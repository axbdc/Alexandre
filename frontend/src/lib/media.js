// frontend/src/lib/media.js
// Ajuda a distinguir imagens de vídeos nas galerias.

export const isVideo = (url) =>
    typeof url === "string" &&
    (/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url) ||
        /res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(url));

// Miniatura de um vídeo do Cloudinary (primeiro frame em .jpg).
export const videoPoster = (url) =>
    /res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(url || "")
        ? url.replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg")
        : undefined;
