export function ProgressBar({ percentage, label }: { percentage: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)]"
      >
        <div
          className="h-full rounded-full bg-[var(--color-accent-decorative)] transition-[width] duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
