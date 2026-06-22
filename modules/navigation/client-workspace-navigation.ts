"use client";

const WORKSPACE_PATH_PATTERN = /^\/(?:dashboard|dispatcher|kitchen)(?:\/|\?|#|$)/;

function toInternalHref(href: string) {
  const url = new URL(href, window.location.origin);
  const nextHref = `${url.pathname}${url.search}${url.hash}`;

  return url.origin === window.location.origin && WORKSPACE_PATH_PATTERN.test(nextHref)
    ? nextHref
    : null;
}

export function navigateWithinWorkspace(href: string) {
  if (typeof window === "undefined") {
    return;
  }

  const nextHref = toInternalHref(href);

  if (!nextHref) {
    window.location.assign(href);
    return;
  }

  window.dispatchEvent(new CustomEvent("foodlike:workspace-navigate", {
    detail: { href: nextHref },
  }));
}

export function refreshWorkspaceRoute() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("foodlike:workspace-refresh"));
}
