"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const fallbackImage = "/images/beauty-mart-hero.png";

// Replace only the original demo photos; real product uploads keep their own images.
const sampleImages: Record<string, string> = {
  "photo-1556228578-8c89e6adf883": "hydrating-face-cleanser",
  "photo-1620916566398-39f1143ab7be": "vitamin-c-glow-serum",
  "photo-1608248597279-f99d160bfcbc": "daily-dew-moisturizer",
  "photo-1590156206657-a74f330af8a2": "velvet-matte-foundation",
  "photo-1583241800698-e8ab01830a84": "satin-blush-palette",
  "photo-1631214524020-7e18db9a8f92": "precision-liquid-liner",
  "photo-1608571423902-eed4a5ad8108": "nourishing-body-butter",
  "photo-1608248543803-ba4f8c70ae0b": "radiance-body-oil",
  "photo-1571781926291-c477ebfd024b": "shea-sugar-body-scrub",
  "photo-1586495777744-4413f21062fa": "gloss-veil-lip-oil",
  "photo-1582450871972-ab5ca641643d": "soft-matte-lip-cream",
  "photo-1599305090598-fe179d501227": "overnight-lip-mask",
};

function sampleImageFor(src?: string | null) {
  if (!src) return undefined;
  try {
    const url = new URL(src);
    return url.hostname === "images.unsplash.com"
      ? sampleImages[url.pathname.slice(1)]
      : undefined;
  } catch {
    return undefined;
  }
}

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
};

export function ProductImage({ src, alt, ...props }: ProductImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const sample = sampleImageFor(src);
  const imageSource = sample ? `/images/products/${sample}.webp` : src;
  const showFallback = !imageSource?.trim() || failedSource === imageSource;

  return (
    <Image
      {...props}
      src={showFallback ? fallbackImage : imageSource!}
      alt={showFallback || sample ? `${alt} — illustrative Beauty Mart image` : alt}
      onError={showFallback ? undefined : () => setFailedSource(imageSource!)}
    />
  );
}
