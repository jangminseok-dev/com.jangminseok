// 트러블슈팅 대표 숫자 — 고치기 전의 실패 숫자는 성과 숫자(색)와 헷갈리지 않게 흰 글자에 '고치기 전' 표시를 단다
export default function TroubleFigure({
  figure,
  tone,
  className = "",
}: {
  figure: { value: string; label: string; before?: boolean };
  tone: string;
  className?: string;
}) {
  return (
    <p className={className}>
      {figure.before ? (
        <span className="mb-2.5 inline-block rounded-full border border-white/30 px-2.5 py-0.5 text-sm font-semibold text-white/85">
          고치기 전
        </span>
      ) : null}
      <span className={`num block text-4xl leading-none md:text-5xl ${figure.before ? "text-white" : tone}`}>{figure.value}</span>
      <span className="mt-2 block text-sm break-keep text-white/70">{figure.label}</span>
    </p>
  );
}
