"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const fallbackImage = "/images/beauty-mart-hero.png";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
};

export function ProductImage({ src, alt, ...props }: ProductImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const showFallback = !src?.trim() || failedSource === src;

  return (
    <Image
      {...props}
      src={showFallback ? fallbackImage : src!}
      alt={showFallback ? `${alt} — illustrative Beauty Mart image` : alt}
      onError={showFallback ? undefined : () => setFailedSource(src!)}
    />
  );
}
