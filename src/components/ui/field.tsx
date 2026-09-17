import { useId } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldWrapperProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode;
};

export function FieldWrapper({ label, hint, error, optional, wrapperClassName, children }: FieldWrapperProps) {
  const inputId = useId();
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {optional && <span className="ml-1.5 font-normal text-[var(--color-text-muted)]">(optional)</span>}
      </label>
      {children({ inputId, describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClasses =
  "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] disabled:opacity-50 disabled:bg-[var(--color-surface-sunken)]";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
};

export function TextField({ label, hint, error, optional, wrapperClassName, className, ...props }: TextFieldProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} optional={optional} wrapperClassName={wrapperClassName}>
      {({ inputId, describedBy }) => (
        <input
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={cn(inputClasses, error && "border-[var(--color-error)]", className)}
          {...props}
        />
      )}
    </FieldWrapper>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
};

export function TextAreaField({ label, hint, error, optional, wrapperClassName, className, ...props }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} optional={optional} wrapperClassName={wrapperClassName}>
      {({ inputId, describedBy }) => (
        <textarea
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={cn(inputClasses, "min-h-28 resize-y", error && "border-[var(--color-error)]", className)}
          {...props}
        />
      )}
    </FieldWrapper>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

export function SelectField({ label, hint, error, optional, className, children, ...props }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} optional={optional}>
      {({ inputId, describedBy }) => (
        <select
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={cn(inputClasses, error && "border-[var(--color-error)]", className)}
          {...props}
        >
          {children}
        </select>
      )}
    </FieldWrapper>
  );
}
