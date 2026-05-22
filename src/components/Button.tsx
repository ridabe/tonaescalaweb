import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'accent' | 'ghost';
  icon?: ReactNode;
};

export function Button({ className = '', variant = 'primary', icon, children, ...props }: Props) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
