"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/ui/icons";

export type ComboboxOption = { value: string; label: string; hint?: string };

/**
 * Accessible combobox (ARIA 1.2 combobox-with-listbox pattern): a text input
 * that filters a known option list as you type, with full keyboard support.
 * `allowCustom` lets the typed value be submitted even if it doesn't match
 * an existing option — used for skills, where the catalog is extensible.
 */
export function Combobox({
  name,
  label,
  options,
  defaultValue = "",
  placeholder,
  allowCustom = true,
  required,
  hint,
}: {
  name: string;
  label: string;
  options: ComboboxOption[];
  defaultValue?: string;
  placeholder?: string;
  allowCustom?: boolean;
  required?: boolean;
  hint?: string;
}) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered =
    query.trim().length === 0
      ? options.slice(0, 30)
      : options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 30);

  const exactMatch = options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  function selectOption(label: string) {
    setQuery(label);
    setOpen(false);
    setActiveIndex(-1);
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
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        e.preventDefault();
        selectOption(filtered[activeIndex].label);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {!required && <span className="ml-1.5 font-normal text-[var(--color-text-muted)]">(optional)</span>}
      </label>
      <div ref={containerRef} className="relative">
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          name={allowCustom ? name : undefined}
          value={query}
          placeholder={placeholder}
          required={required}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 pr-9 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
        />
        {!allowCustom && <input type="hidden" name={name} value={exactMatch ? query : ""} />}
        <ChevronDownIcon width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />

        {open && filtered.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-[var(--shadow-md)]"
          >
            {filtered.map((option, i) => (
              <li key={option.value} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option.label)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm",
                    i === activeIndex ? "bg-[var(--color-accent-subtle-bg)] text-[var(--color-accent-text)]" : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]"
                  )}
                >
                  <span>{option.label}</span>
                  {option.hint && <span className="text-xs text-[var(--color-text-muted)]">{option.hint}</span>}
                </button>
              </li>
            ))}
            {allowCustom && query.trim().length > 0 && !exactMatch && (
              <li role="option" aria-selected={false}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(query.trim())}
                  className="flex w-full items-center gap-1.5 border-t border-[var(--color-border)] px-3.5 py-2 text-left text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-surface-sunken)]"
                >
                  Use “{query.trim()}”
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
      {hint && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  );
}
