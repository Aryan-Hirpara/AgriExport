export const CROP_IMAGES = {
  onion: '/crops/onion.webp',
  'red-onion': '/crops/onion.webp',
  'gujarat-red-onion': '/crops/onion.webp',
  soyabean: '/crops/soyabean.jpeg',
  soybean: '/crops/soyabean.jpeg',
  soya: '/crops/soyabean.jpeg',
  cotton: '/crops/cotton.jpeg',
  kapas: '/crops/cotton.jpeg',
  'shankar-6': '/crops/cotton.jpeg',
  jeera: '/crops/jeera.jpeg',
  cumin: '/crops/jeera.jpeg',
  'cumin-jeera': '/crops/jeera.jpeg',
  groundnut: '/crops/mandvi.jpeg',
  mandvi: '/crops/mandvi.jpeg',
  peanut: '/crops/mandvi.jpeg',
};

/**
 * Returns a valid image URL for a given crop if available.
 * Handles crop object, slug, name, or explicit photo/image prop.
 */
export function getCropImage(cropOrSlugOrName, candidateImage = null) {
  // If candidate is a valid image URL (not an emoji or empty), use it
  if (
    candidateImage &&
    typeof candidateImage === 'string' &&
    (candidateImage.startsWith('/') ||
      candidateImage.startsWith('http://') ||
      candidateImage.startsWith('https://') ||
      candidateImage.startsWith('data:image/'))
  ) {
    return candidateImage;
  }

  if (!cropOrSlugOrName) return null;

  const key = String(cropOrSlugOrName)
    .toLowerCase()
    .trim()
    .replace(/[\s_()]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (CROP_IMAGES[key]) return CROP_IMAGES[key];

  // Fuzzy substring matches for common aliases
  if (key.includes('onion')) return CROP_IMAGES.onion;
  if (key.includes('soya')) return CROP_IMAGES.soyabean;
  if (key.includes('cotton') || key.includes('kapas')) return CROP_IMAGES.cotton;
  if (key.includes('jeera') || key.includes('cumin')) return CROP_IMAGES.jeera;
  if (key.includes('groundnut') || key.includes('peanut') || key.includes('mandvi')) return CROP_IMAGES.groundnut;

  return null;
}
