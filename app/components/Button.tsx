import type { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'primary' | 'danger' | 'accent'

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'jin-btn',
  primary: 'jin-btn jin-btn--primary',
  danger: 'jin-btn jin-btn--danger',
  accent: 'jin-btn jin-btn--accent',
}

export function Button({
  variant = 'default',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const classes = className
    ? `${VARIANT_CLASS[variant]} ${className}`
    : VARIANT_CLASS[variant]
  return <button type="button" className={classes} {...props} />
}
