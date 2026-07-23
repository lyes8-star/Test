"use client";

import { useEffect } from "react";

function isProtectedMedia(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("img, picture, .case-media-img, .hero-media, .case-media-frame, .ba-compare"));
}

/** Dissuasion légère : pas de menu contextuel / drag sur les médias uniquement. */
export function MediaCopyGuard() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (isProtectedMedia(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (isProtectedMedia(e.target)) e.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
