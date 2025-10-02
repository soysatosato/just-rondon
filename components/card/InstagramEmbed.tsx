"use client";
import { useEffect } from "react";

interface InstagramEmbedProps {
  url: string;
  isDialogOpen?: boolean;
  style?: React.CSSProperties;
}

export default function InstagramEmbed({
  url,
  isDialogOpen,
  style,
}: InstagramEmbedProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.instagram.com/embed.js";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isDialogOpen && (window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    }
  }, [isDialogOpen]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        width: "100%",
        minHeight: 600, // 高さを大きくして全体を表示
        margin: "0 auto",
        ...style,
      }}
    ></blockquote>
  );
}
