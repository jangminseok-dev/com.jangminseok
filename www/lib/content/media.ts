// YAML의 "media/03-1.webp" → 정적 경로 "/media/<slug>/03-1.webp" (sync-media.mjs가 복사한 위치)
export const mediaUrl = (slug: string, mediaPath: string): string =>
  `/media/${slug}/${mediaPath.replace(/^media\//, "")}`;
