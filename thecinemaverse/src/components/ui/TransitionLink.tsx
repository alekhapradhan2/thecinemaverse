"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  showSpinner?: boolean;
}

export function TransitionLink({ 
  href, 
  children, 
  className = "",
  showSpinner = true,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <a
      href={href}
      className={`relative ${className} ${isPending ? "opacity-70 pointer-events-none" : ""}`}
      onClick={(e) => {
        // Fallback for command/ctrl click
        if (e.metaKey || e.ctrlKey) return;
        
        if (props.onClick) {
          props.onClick(e);
        }
        
        e.preventDefault();
        startTransition(() => {
          router.push(href);
        });
      }}
      {...props}
    >
      {children}
      {isPending && showSpinner && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 z-20" style={{ borderRadius: 'inherit' }}>
          <Loader2 className="w-5 h-5 text-brand-500 animate-spin drop-shadow-md" />
        </span>
      )}
    </a>
  );
}
