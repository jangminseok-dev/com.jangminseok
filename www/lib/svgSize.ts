// SVG 원문에서 그림의 가로세로 크기를 읽는다 — viewBox가 우선, 없으면 width와 height 속성. 알 수 없으면 null
export function svgSize(svg: string): { width: number; height: number } | null {
  const open = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!open) return null;
  const viewBox = open.match(/\bviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i);
  const attr = (name: string) => Number(open.match(new RegExp(`\\b${name}\\s*=\\s*["']([\\d.]+)(?:px)?["']`, "i"))?.[1]);
  const width = viewBox ? Number(viewBox[1]) : attr("width");
  const height = viewBox ? Number(viewBox[2]) : attr("height");
  return width > 0 && height > 0 ? { width, height } : null;
}
