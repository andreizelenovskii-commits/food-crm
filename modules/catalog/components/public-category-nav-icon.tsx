function CategoryIconFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#d50014] transition duration-300 group-hover:scale-110 group-hover:bg-[#d50014] group-hover:text-white group-data-[current=true]:scale-110 group-data-[current=true]:bg-[#d50014] group-data-[current=true]:text-white ${className}`}>
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

  if (category.toLowerCase().includes("ролл")) {
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

  if (category === "Сеты") {
    return (
      <CategoryIconFrame><svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:rotate-3" aria-hidden="true"><rect x="4.8" y="5" width="14.4" height="14" rx="3.1" fill="currentColor" /><path d="M8.8 9h6.4M8.8 12h6.4M8.8 15h6.4" stroke="white" strokeLinecap="round" strokeWidth="1.35" opacity="0.92" /><path d="M8.4 9h.02M8.4 12h.02M8.4 15h.02" stroke="white" strokeLinecap="round" strokeWidth="1.7" opacity="0.92" /></svg></CategoryIconFrame>
    );
  }

  if (category === "Суши-доги") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:rotate-3" aria-hidden="true">
          <g transform="rotate(-18 12 12)">
            <path
              d="M4.7 10.1c0-1.5 1.2-2.7 2.7-2.7h9.2c1.5 0 2.7 1.2 2.7 2.7v3.8c0 1.5-1.2 2.7-2.7 2.7H7.4c-1.5 0-2.7-1.2-2.7-2.7v-3.8Z"
              fill="currentColor"
            />
            <path
              d="M7.3 9.6h9.4c.72 0 1.3.58 1.3 1.3v2.2c0 .72-.58 1.3-1.3 1.3H7.3c-.72 0-1.3-.58-1.3-1.3v-2.2c0-.72.58-1.3 1.3-1.3Z"
              fill="white"
              opacity="0.94"
            />
            <path
              d="M9.2 12h5.6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.55"
              opacity="0.9"
            />
            <path
              d="M7.9 9.9v4.2M16.1 9.9v4.2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.05"
              opacity="0.5"
            />
          </g>
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Паназиатская кухня") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:rotate-3" aria-hidden="true">
          <path
            d="M6.1 12.7h11.8c-.25 3.65-2.55 5.75-5.9 5.75s-5.65-2.1-5.9-5.75Z"
            fill="currentColor"
          />
          <path
            d="M5.35 12.25c0-.67.54-1.2 1.2-1.2h10.9c.66 0 1.2.53 1.2 1.2s-.54 1.2-1.2 1.2H6.55c-.66 0-1.2-.53-1.2-1.2Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M7.65 7.1 16.8 4.8M8.2 9.35 18 6.9"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.2"
            opacity="0.9"
          />
          <path
            d="M9.1 15.45h5.8"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="1.05"
            opacity="0.75"
          />
          <circle cx="11.3" cy="9.6" r="0.75" fill="currentColor" opacity="0.9" />
          <circle cx="13.6" cy="9.25" r="0.6" fill="currentColor" opacity="0.82" />
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Пасты") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:-rotate-3" aria-hidden="true">
          <path
            d="M5.7 13.2h12.6c-.2 3.45-2.62 5.35-6.3 5.35s-6.1-1.9-6.3-5.35Z"
            fill="currentColor"
          />
          <path
            d="M5.1 12.8c0-.67.54-1.2 1.2-1.2h11.4c.66 0 1.2.53 1.2 1.2s-.54 1.2-1.2 1.2H6.3c-.66 0-1.2-.53-1.2-1.2Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M9.15 10.25c1.15-1.75 4.4-1.68 5.22.2.62 1.4-.72 2.42-2.34 1.72-1.3-.56-1.03-1.7.18-1.76.9-.05 1.5.32 2.06.92"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.2"
            opacity="0.95"
          />
          <path
            d="M16.8 6.3v4.4M15.65 6.3v2.5M17.95 6.3v2.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.05"
            opacity="0.9"
          />
          <path
            d="M8.7 15.5h6.6"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="1.05"
            opacity="0.75"
          />
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Супы") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:-rotate-3" aria-hidden="true">
          <path
            d="M6 12.2h12c-.18 4-2.65 6.2-6 6.2s-5.82-2.2-6-6.2Z"
            fill="currentColor"
          />
          <path
            d="M5.2 11.8c0-.68.55-1.22 1.22-1.22h11.16c.67 0 1.22.54 1.22 1.22s-.55 1.22-1.22 1.22H6.42c-.67 0-1.22-.54-1.22-1.22Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M8.3 7.9c-.55-.62-.55-1.28 0-1.9M12 8.1c-.55-.62-.55-1.28 0-1.9M15.7 7.9c-.55-.62-.55-1.28 0-1.9"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.25"
            opacity="0.9"
          />
          <path
            d="M8.4 15.4h7.2"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="1.1"
            opacity="0.75"
          />
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Салаты") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:rotate-3" aria-hidden="true">
          <path
            d="M6.2 12.8h11.6c-.2 3.6-2.55 5.6-5.8 5.6s-5.6-2-5.8-5.6Z"
            fill="currentColor"
          />
          <path
            d="M5.5 12.5c0-.62.5-1.12 1.12-1.12h10.76c.62 0 1.12.5 1.12 1.12s-.5 1.12-1.12 1.12H6.62c-.62 0-1.12-.5-1.12-1.12Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M8.1 9.9c-.58-1.45.24-2.9 1.92-3.4.64 1.44-.18 2.86-1.92 3.4ZM13.8 9.4c.52-1.54 1.95-2.18 3.44-1.5-.54 1.5-1.96 2.12-3.44 1.5Z"
            fill="currentColor"
          />
          <circle cx="12.2" cy="9.2" r="1.05" fill="currentColor" opacity="0.88" />
          <path
            d="M8.9 15.3h6.2"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="1.05"
            opacity="0.75"
          />
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Комбо") {
    return (
      <CategoryIconFrame>
        <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:-rotate-3" aria-hidden="true">
          <path
            d="M4.9 9.6h14.2c.64 0 1.12.58 1 1.21l-.98 6.3a2.7 2.7 0 0 1-2.67 2.29h-8.9a2.7 2.7 0 0 1-2.67-2.29l-.98-6.3c-.1-.63.36-1.21 1-1.21Z"
            fill="currentColor"
          />
          <path
            d="M6.8 12.15h10.4"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="1.35"
            opacity="0.9"
          />
          <path
            d="M8.2 8.25c.42-1.98 1.92-3.35 3.8-3.35s3.38 1.37 3.8 3.35H8.2Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M10.1 7.85h3.8M8.4 15.55h1.85M11.1 15.55h1.85M13.8 15.55h1.85"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="1.15"
            opacity="0.82"
          />
        </svg>
      </CategoryIconFrame>
    );
  }

  if (category === "Десерты") {
    return (
      <CategoryIconFrame><svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:rotate-3" aria-hidden="true"><path d="M6.2 10.25h11.6c.62 0 1.12.5 1.12 1.12v.28c0 .62-.5 1.12-1.12 1.12H6.2c-.62 0-1.12-.5-1.12-1.12v-.28c0-.62.5-1.12 1.12-1.12Z" fill="currentColor" /><path d="M6.95 12.3h10.1l-.7 4.3a2.35 2.35 0 0 1-2.32 1.98H9.97a2.35 2.35 0 0 1-2.32-1.98l-.7-4.3Z" fill="currentColor" opacity="0.92" /><path d="M7.7 13.25h8.6M8.25 15.6h7.5M10.35 8.55c.55-.55 1.4-.55 1.95 0 .55.55 1.4.55 1.95 0" fill="none" stroke="white" strokeLinecap="round" strokeWidth="1.05" opacity="0.85" /><path d="M8.25 10.2c.42-2.55 1.98-4 3.75-4s3.33 1.45 3.75 4h-7.5Z" fill="currentColor" /><circle cx="12" cy="5.45" r="0.95" fill="currentColor" /></svg></CategoryIconFrame>
    );
  }

  if (category === "Напитки" || category === "Баббл-напитки") {
    return (
      <CategoryIconFrame><svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:rotate-3" aria-hidden="true"><path d="M8 8.3h8l-.72 8.9a2.2 2.2 0 0 1-2.2 2H10.9a2.2 2.2 0 0 1-2.19-2L8 8.3Z" fill="currentColor" /><path d="M7.45 8.25h9.1M12.45 8.05 15.8 4.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" /><path d="M10.2 11.35h3.6M10.45 14.2h3.1" fill="none" stroke="white" strokeLinecap="round" strokeWidth="1.15" opacity="0.85" /><circle cx="11.1" cy="16.8" r="0.7" fill="white" opacity="0.92" /><circle cx="13.3" cy="16.45" r="0.58" fill="white" opacity="0.82" /></svg></CategoryIconFrame>
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
