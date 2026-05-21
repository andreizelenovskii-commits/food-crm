"use client";

export function TechCardVariantToggle({
  name,
  checked,
  title,
  description,
  onChange,
}: {
  name: string;
  checked: boolean;
  title: string;
  description: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[16px] border border-red-950/10 bg-white/76 px-3 py-3 shadow-sm shadow-red-950/5">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-zinc-950">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-zinc-500">{description}</span>
      </span>
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-red-800" : "bg-zinc-300"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}
