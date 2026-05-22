import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Field({ label, hint, ...props }: InputProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ label, ...props }: TextareaProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea {...props} />
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  );
}
