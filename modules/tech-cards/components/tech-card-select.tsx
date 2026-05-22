"use client";

import { useState } from "react";

export function TechCardSelect<TValue extends string>({
  name,
  value,
  placeholder,
  options,
  onChange,
}: {
  name: string;
  value: TValue | "";
  placeholder: string;
  options: readonly TValue[];
  onChange: (value: TValue | "") => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-[14px] border px-4 text-left text-sm font-medium shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10 ${
          value
            ? "border-red-200 bg-red-50/60 text-zinc-950"
            : "border-red-950/10 bg-white/90 text-zinc-400"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value || placeholder}</span>
        <span className={`shrink-0 text-red-800 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-40 max-h-64 overflow-y-auto rounded-[16px] border border-red-950/10 bg-white/96 p-1.5 shadow-[0_18px_50px_rgba(127,29,29,0.16)] backdrop-blur-2xl"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`flex h-9 w-full items-center rounded-[11px] px-3 text-left text-sm font-semibold transition ${
              !value ? "bg-red-800 text-white" : "text-zinc-500 hover:bg-red-50 hover:text-red-900"
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => {
            const isSelected = value === option;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`mt-0.5 flex h-9 w-full items-center justify-between gap-3 rounded-[11px] px-3 text-left text-sm font-semibold transition ${
                  isSelected ? "bg-red-800 text-white" : "text-zinc-700 hover:bg-red-50 hover:text-red-900"
                }`}
              >
                <span>{option}</span>
                {isSelected ? <span aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
