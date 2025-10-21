// Button: 모든 버튼 스타일 통합 컴포넌트
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  // 기본 스타일
  const baseStyles = 'rounded font-medium transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'

  // 버튼 색상 테마
  const variants = {
    primary: 'bg-gradient-primary text-white hover:shadow-md',
    ghost: 'bg-white text-text border border-primary-dark/20 hover:bg-emerald-50',
    inverse: 'bg-gradient-primary text-white shadow-button hover:shadow-lg',
    danger: 'bg-gradient-danger text-white hover:shadow-md',
  }

  // 버튼 크기
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
