// 메인 전체에 고정되는 야경 배경 — 글을 읽을 수 있도록 아래로 갈수록 짙어지는 그라데이션을 덮는다
export default function NightBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      <picture>
        <source media="(max-width: 767px)" srcSet="/bg/night-mobile.webp" />
        <img src="/bg/night.webp" alt="" fetchPriority="high" className="h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-0 bg-linear-to-b from-night/70 via-night/80 to-night/92" />
    </div>
  );
}
