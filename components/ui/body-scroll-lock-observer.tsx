"use client";

import { useEffect } from "react";

const MODAL_SELECTOR = '[aria-modal="true"], [data-scroll-lock="true"]';

export function BodyScrollLockObserver() {
  useEffect(() => {
    let isLocked = false;
    let scrollY = 0;
    let previousPosition = "";
    let previousTop = "";
    let previousWidth = "";
    let previousOverflow = "";
    let previousPaddingRight = "";

    function lockBody() {
      if (isLocked) {
        return;
      }

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      scrollY = window.scrollY;
      previousPosition = document.body.style.position;
      previousTop = document.body.style.top;
      previousWidth = document.body.style.width;
      previousOverflow = document.body.style.overflow;
      previousPaddingRight = document.body.style.paddingRight;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      isLocked = true;
    }

    function unlockBody() {
      if (!isLocked) {
        return;
      }

      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.scrollTo(0, scrollY);
      isLocked = false;
    }

    function syncLock() {
      if (document.querySelector(MODAL_SELECTOR)) {
        lockBody();
      } else {
        unlockBody();
      }
    }

    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-modal", "data-scroll-lock"],
    });
    syncLock();

    return () => {
      observer.disconnect();
      unlockBody();
    };
  }, []);

  return null;
}
