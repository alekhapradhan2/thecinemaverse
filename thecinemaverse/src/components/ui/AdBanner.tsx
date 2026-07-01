import React from "react";

export function AdBanner({ slot, format = "auto", className = "" }: {
  slot: string; format?: string; className?: string;
}) {
  return (
    <div className={`adsense-container overflow-hidden rounded-xl ${className}`} aria-hidden="true">
      {/* Replace the ins tag below with your real AdSense code */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      {/* Script to push AdSense — add once in _document.tsx instead of inline */}
      {/* <script>(adsbygoogle = window.adsbygoogle || []).push({});</script> */}
    </div>
  );
}
