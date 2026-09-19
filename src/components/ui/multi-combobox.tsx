"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/icons";

export type ComboboxOption = { value: string; label: string };

/**
 * Multi-select combobox: type to filter a known option list, pick multiple,
 * each shown as a removable chip. Submits as repeated `name` values via
 * hidden inputs, so a plain <form action={serverAction}> + formData.getAll(name)
 * picks them all up — no client state needs to be lifted into the parent form.
 */
export function MultiCombobox({
  name,
  label,
  options,
  defaultValues = [],
  placeholder,
  allowCustom = false,
  required,
  hint,
  error,
}: {
  name: string;
  label: string;
  options: ComboboxOption[];
  defaultValues?: string[];
  placeholder?: string;
  allowCustom?: boolean;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  const inputId = useId();
  const listId = useId();
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedSet = new Set(selected.map((s) => s.toLowerCase()));
  const filtered = options
    .filter((o) => !selectedSet.has(o.label.toLowerCase()))
    .filter((o) => query.trim().length === 0 || o.label.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 30);

  const exactMatch = options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  function addValue(value: string) {
    const trimmed = value.trim();
    if (!trimmed || selectedSet.has(trimmed.toLowerCase())) return;
    setSelected((s) => [...s, trimmed]);
    setQuery("");
    setActiveIndex(-1);
  }

  function removeValue(value: string) {
    setSelected((s) => s.filter((v) => v !== value));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        addValue(filtered[activeIndex].label);
      } else if (allowCustom && query.trim()) {
        addValue(query.trim());
      }
    } else if (e.key === "Backspace" && query === "" && selected.length > 0) {
      removeValue(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {!required && <span className="ml-1.5 font-normal text-[var(--color-text-muted)]">(optional)</span>}
      </label>

      {selected.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}

      <div className="relative">
        <div
          className={cn(
            "flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-[var(--radius-sm)] border bg-[var(--color-surface)] px-2 py-1.5",
            error ? "border-[var(--color-error)]" : "border-[var(--color-border-strong)]"
          )}
        >
          {selected.map((value) => (
            <span
              key={value}
              className="flex items-center gap-1 rounded-full bg-[var(--color-accent-subtle-bg)] py-1 pl-2.5 pr-1 text-xs font-medium text-[var(--color-accent-text)]"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                aria-label={`Remove ${value}`}
                className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
              >
                <CloseIcon width={10} height={10} />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
            aria-invalid={!!error}
            autoComplete="off"
            value={query}
            placeholder={selected.length === 0 ? placeholder : ""}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleKeyDown}
            className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
          />
        </div>

        {open && (filtered.length > 0 || (allowCustom && query.trim())) && (
          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-[var(--shadow-md)]"
          >
            {filtered.map((option, i) => (
              <li key={option.value} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addValue(option.label)}
                  className={cn(
                    "flex w-full items-center px-3.5 py-2 text-left text-sm",
                    i === activeIndex ? "bg-[var(--color-accent-subtle-bg)] text-[var(--color-accent-text)]" : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]"
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
            {allowCustom && query.trim().length > 0 && !exactMatch && (
              <li role="option" aria-selected={false}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addValue(query.trim())}
                  className="flex w-full items-center gap-1.5 border-t border-[var(--color-border)] px-3.5 py-2 text-left text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-surface-sunken)]"
                >
                  Add “{query.trim()}”
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-[var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
