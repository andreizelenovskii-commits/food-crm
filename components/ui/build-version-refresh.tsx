"use client";

import { useEffect } from "react";

const BUILD_STORAGE_KEY = "foodlike:build-version";
const RELOAD_FLAG_PREFIX = "foodlike:build-reloaded:";

export function BuildVersionRefresh({ buildVersion }: { buildVersion: string }) {
  useEffect(() => {
    if (!buildVersion || buildVersion === "development") {
      return;
    }

    const previousBuild = window.localStorage.getItem(BUILD_STORAGE_KEY);
    if (previousBuild === buildVersion) {
      return;
    }

    window.localStorage.setItem(BUILD_STORAGE_KEY, buildVersion);

    if (!previousBuild) {
      return;
    }

    const reloadFlag = `${RELOAD_FLAG_PREFIX}${buildVersion}`;
    if (window.sessionStorage.getItem(reloadFlag) === "1") {
      return;
    }

    window.sessionStorage.setItem(reloadFlag, "1");

    void clearBrowserCaches().finally(() => {
      window.location.reload();
    });
  }, [buildVersion]);

  return null;
}

async function clearBrowserCaches() {
  if (!("caches" in window)) {
    return;
  }

  const cacheNames = await window.caches.keys();
  await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
}
