"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, forwardRef } from "react";
import { DEFAULT_LANGUAGE } from "@/lib/languages";

// Inner component that actually reads search params
const LocalizedLinkInner = forwardRef<HTMLAnchorElement, any>((props, ref) => {
  const searchParams = useSearchParams();
  const lang = searchParams?.get("lang");
  
  let href = props.href;
  if (lang && lang !== DEFAULT_LANGUAGE.key && typeof href === "string" && !href.includes("lang=")) {
    href += href.includes("?") ? `&lang=${lang}` : `?lang=${lang}`;
  }
  
  return <Link {...props} href={href} ref={ref} />;
});
LocalizedLinkInner.displayName = "LocalizedLinkInner";

// Wrapper component that uses Suspense so we don't opt out of static rendering
export const LocalizedLink = forwardRef<HTMLAnchorElement, any>((props, ref) => {
  return (
    <Suspense fallback={<Link {...props} href={props.href || "#"} ref={ref} />}>
      <LocalizedLinkInner {...props} ref={ref} />
    </Suspense>
  );
});
LocalizedLink.displayName = "LocalizedLink";
