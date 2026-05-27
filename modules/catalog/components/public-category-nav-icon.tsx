function CategoryIconFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#d50014] transition duration-300 group-hover:scale-110 group-hover:bg-[#d50014] group-hover:text-white ${className}`}>
      {children}
    </span>
  );
}

export function CategoryNavIcon({ category }: { category: string }) {
  if (category === "Пицца") {
    return (
      <CategoryIconFrame className="group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4.2 20.1 11.5 3.7c.22-.5.86-.66 1.3-.34 4.08 2.93 6.48 7.03 7.3 12.24.08.53-.38.98-.91.89L4.2 20.1Zm7.78-13.96-4.9 11.02 10.43-2.52c-.82-3.5-2.63-6.33-5.53-8.5Z"
          />
          <circle cx="12.1" cy="12.1" r="1.25" fill="white" opacity="0.92" />
          <circle cx="14.8" cy="9.3" r="1.05" fill="white" opacity="0.9" />
          <circle cx="10.1" cy="15.2" r="0.95" fill="white" opacity="0.88" />
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Роллы") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-500 group-hover:rotate-180" aria-hidden="true">
          <circle cx="12" cy="12" r="8.2" fill="currentColor" />
          <circle cx="12" cy="12" r="5.6" fill="white" opacity="0.94" />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" opacity="0.9" />
          <path d="M12 6.8v10.4M6.8 12h10.4" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" opacity="0.42" />
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Суши-доги") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:rotate-3" aria-hidden="true">
          <path d="M5.2 11.8c0-3 2.35-5.4 5.25-5.4h3.1c2.9 0 5.25 2.4 5.25 5.4s-2.35 5.4-5.25 5.4h-3.1c-2.9 0-5.25-2.4-5.25-5.4Z" fill="currentColor" />
          <path d="M7.6 11.8c0-1.7 1.35-3.1 3-3.1h2.8c1.65 0 3 1.4 3 3.1s-1.35 3.1-3 3.1h-2.8c-1.65 0-3-1.4-3-3.1Z" fill="white" opacity="0.94" />
          <path d="M9.5 11.8c0-.75.6-1.35 1.35-1.35h2.3c.75 0 1.35.6 1.35 1.35s-.6 1.35-1.35 1.35h-2.3c-.75 0-1.35-.6-1.35-1.35Z" fill="currentColor" opacity="0.92" />
          <path d="M11.2 10.9v1.8M12.8 10.9v1.8" stroke="white" strokeLinecap="round" strokeWidth="0.95" opacity="0.62" />
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Фастфуд") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:-rotate-3" aria-hidden="true">
          <path d="M5.4 11.1c.45-3.55 3.18-6 6.6-6s6.15 2.45 6.6 6H5.4Z" fill="currentColor" />
          <path d="M7.4 10.6h9.2" fill="none" stroke="white" strokeLinecap="round" strokeWidth="1.25" opacity="0.9" />
          <path d="M5.2 13h13.6c.45 0 .8.35.8.8v.1c0 .44-.35.8-.8.8H5.2a.8.8 0 0 1-.8-.8v-.1c0-.45.35-.8.8-.8Z" fill="white" opacity="0.95" />
          <path d="M6.2 15.8h11.6c.55 0 1 .45 1 1v.1c0 1.1-.9 2-2 2H7.2c-1.1 0-2-.9-2-2v-.1c0-.55.45-1 1-1Z" fill="currentColor" />
          <path d="M8.1 7.9h.02M11.8 6.9h.02M15.3 8.1h.02" fill="white" stroke="white" strokeLinecap="round" strokeWidth="1.55" opacity="0.95" />
          <path d="M7.5 17.1h9" fill="none" stroke="white" strokeLinecap="round" strokeWidth="1.2" opacity="0.78" />
        </svg>
      </CategoryIconFrame>
    );
  }

  return null;
}
