"use client";

import { useEffect, useState } from "react";

export const SYSTEM_AVATARS = [
  { id: "smile", label: "Улыбка", mark: "☺", className: "from-[#d50014] to-[#ff6b6b]" },
  { id: "star", label: "Звезда", mark: "★", className: "from-[#7c2d12] to-[#f59e0b]" },
  { id: "spark", label: "Искра", mark: "✦", className: "from-[#241316] to-[#d50014]" },
  { id: "heart", label: "Сердце", mark: "♥", className: "from-[#be123c] to-[#fb7185]" },
  { id: "chef", label: "Шеф", mark: "◆", className: "from-[#0f766e] to-[#14b8a6]" },
] as const;

export type AvatarId = (typeof SYSTEM_AVATARS)[number]["id"];

const AVATAR_STORAGE_KEY = "foodlike-public-avatar";

export function usePublicAvatar() {
  const [avatarId, setAvatarIdState] = useState<AvatarId>("smile");

  useEffect(() => {
    const saved = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    const timerId = window.setTimeout(() => {
      if (SYSTEM_AVATARS.some((avatar) => avatar.id === saved)) {
        setAvatarIdState(saved as AvatarId);
      }
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function setAvatarId(nextAvatarId: AvatarId) {
    setAvatarIdState(nextAvatarId);
    window.localStorage.setItem(AVATAR_STORAGE_KEY, nextAvatarId);
  }

  return { avatarId, avatar: getPublicAvatar(avatarId), setAvatarId };
}

export function getPublicAvatar(avatarId: AvatarId) {
  return SYSTEM_AVATARS.find((avatar) => avatar.id === avatarId) ?? SYSTEM_AVATARS[0];
}

export function PublicAvatarBadge({
  avatarId,
  className = "size-10 rounded-full text-lg",
}: {
  avatarId: AvatarId;
  className?: string;
}) {
  const avatar = getPublicAvatar(avatarId);

  return (
    <span className={`inline-flex items-center justify-center bg-gradient-to-br ${avatar.className} font-black text-white shadow-sm shadow-[#d50014]/18 ${className}`}>
      {avatar.mark}
    </span>
  );
}
