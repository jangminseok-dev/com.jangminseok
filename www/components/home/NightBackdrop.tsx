// 메인 전체에 고정되는 배경 — 다크는 야경, 라이트는 같은 구도의 낮 풍경. 글을 읽을 수 있도록 아래로 갈수록 짙어지는 그라데이션을 덮는다
export default function NightBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      <picture className="light:hidden">
        <source media="(max-width: 767px)" srcSet="/bg/night-mobile.webp" />
        <img src="/bg/night.webp" alt="" fetchPriority="high" className="h-full w-full object-cover" />
      </picture>
      {/* 숨겨진 lazy 이미지는 받지 않으므로 다크 방문자는 낮 사진을 내려받지 않는다 */}
      <picture className="hidden light:block">
        <source media="(max-width: 767px)" srcSet="/bg/day-mobile.webp" />
        <img src="/bg/day.webp" alt="" loading="lazy" className="h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 bg-linear-to-b from-night/70 via-night/80 to-night/92 light:from-night/45 light:via-night/65 light:to-night/85" />
    </div>
  );
}
