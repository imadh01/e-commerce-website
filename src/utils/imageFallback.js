const FALLBACK = "https://placehold.co/400?text=No+Image";

export function handleImgError(e) {
  e.target.onerror = null;
  e.target.src = FALLBACK;
}
