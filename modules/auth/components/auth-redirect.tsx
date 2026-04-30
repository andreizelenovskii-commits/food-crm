export function AuthRedirect({ href }: { href: string }) {
  const script = `window.location.replace(${JSON.stringify(href)});`;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <a
        href={href}
        className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
      >
        Перейти к входу
      </a>
    </main>
  );
}
