import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface MediaThumbProps {
  src: string;
  alt: string;
  className?: string;
}

export function MediaThumb({ src, alt, className = 'w-16 h-16' }: MediaThumbProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`${className} rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0`}
        aria-label={alt}
      >
        <ImageIcon className="w-5 h-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100`}
    />
  );
}
