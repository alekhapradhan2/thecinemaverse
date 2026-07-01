"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function CastCrewLink({ member, isSmall }: { member: any; isSmall?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const disabled = !member.castId;
  const href = disabled ? "#" : `/cast/${member.castId}`;

  const sizeClass = isSmall ? "w-7 h-7" : "w-8 h-8";

  const content = (
    <>
      <div className={`relative ${sizeClass} rounded-full overflow-hidden flex-shrink-0 border border-[#333]`}>
        <Image
          src={member.photo || "/placeholder-person.svg"}
          alt={member.name}
          fill
          className="object-cover"
        />
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
            <Loader2 className="w-3.5 h-3.5 text-brand-500 animate-spin" />
          </div>
        )}
      </div>
      <span className="text-sm font-semibold text-white group-hover/link:text-brand-400 transition-colors break-words min-w-0">
        {member.name}
      </span>
    </>
  );

  if (disabled) {
    return (
      <div className="flex items-center gap-2.5 opacity-60" aria-disabled={true}>
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      className={`flex items-center gap-2.5 group/link ${
        isPending ? "opacity-70 pointer-events-none" : ""
      }`}
      onClick={(e) => {
        // Fallback for command/ctrl click
        if (e.metaKey || e.ctrlKey) return;
        
        e.preventDefault();
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {content}
    </a>
  );
}
