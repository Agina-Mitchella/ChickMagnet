import type { CSSProperties, ImgHTMLAttributes } from 'react';

type ResponsiveProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>['fetchPriority'];
};

function localVariantBase(src: string): string | null {
  if (!src.startsWith('/images/') || !/\.jpe?g$/i.test(src)) return null;
  if (src.includes('/hero-commercial-farm-')) return null;
  return src.replace(/\.jpe?g$/i, '');
}

export default function ResponsiveProductImage({
  src,
  alt,
  className,
  style,
  sizes,
  loading,
  fetchPriority,
}: ResponsiveProductImageProps) {
  const variantBase = localVariantBase(src);

  return (
    <picture className="block h-full w-full">
      {variantBase ? (
        <>
          <source
            type="image/avif"
            srcSet={`${variantBase}-640.avif 640w, ${variantBase}-1200.avif 1200w`}
            sizes={sizes}
          />
          <source
            type="image/webp"
            srcSet={`${variantBase}-640.webp 640w, ${variantBase}-1200.webp 1200w`}
            sizes={sizes}
          />
        </>
      ) : null}
      <img
        src={src}
        alt={alt}
        width="1200"
        height="1200"
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={className}
        style={style}
      />
    </picture>
  );
}
