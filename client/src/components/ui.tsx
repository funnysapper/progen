import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import s from './ui.module.css';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${s.card} ${className ?? ''}`}>{children}</div>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'accent' | 'secondary';
  block?: boolean;
  loading?: boolean;
};

export function Button({ variant = 'primary', block, loading, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={`${s.btn} ${s[variant]} ${block ? s.block : ''}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className={s.spinner} />}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className={s.field}>
      <span className={s.label}>{label}</span>
      {children}
      {hint && <span className={s.hint}>{hint}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={s.input} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={s.textarea} {...props} />;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <div className={s.error}>{children}</div>;
}
