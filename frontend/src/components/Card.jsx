// 제목, 부제, 우측 액션이 포함될 수 있는 섹션 컨테이너
export default function Card({title, subtitle, right, children, className}){
  return (
    <section className={`bg-surface border border-primary-dark/15 rounded-lg shadow-card backdrop-blur relative overflow-hidden p-5 pt-6 ${className||''}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <h3 className="text-base font-semibold leading-tight text-text">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs leading-snug text-text-soft">{subtitle}</p>}
          </div>
          {right && <div className="flex gap-3 items-center">{right}</div>}
        </div>
      )}
      <div className="flex flex-col gap-3.5">{children}</div>
    </section>
  )
}
