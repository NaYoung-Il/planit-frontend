import Input from './Input'

// FormField: label + input + error 조합
export default function FormField({
  label,
  error,
  required = false,
  className = '',
  children,
  ...inputProps
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-semibold text-text ${className}`}>
      {label && (
        <span className="text-xs font-semibold text-text-soft">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}

      {children || <Input error={error} required={required} {...inputProps} />}

      {error && (
        <span className="text-xs text-red-500 font-normal">{error}</span>
      )}
    </label>
  )
}
