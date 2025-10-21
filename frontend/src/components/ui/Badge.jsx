// Badge: 배지 컴포넌트
export default function Badge({
  children,
  variant = 'default',
  className = '',
}) {
  const variants = {
    default: 'bg-emerald-500/15 text-text',
    purple: 'bg-emerald-400/15 text-text',
  }

  return (
    <span className={`inline-flex px-2 py-1 rounded-xl text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
