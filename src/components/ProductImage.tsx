import { useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function ProductImage({ src, alt, className = 'w-full h-full object-cover' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const canShowImage = Boolean(src && !failed);

  if (!canShowImage) {
    return <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>;
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
}
