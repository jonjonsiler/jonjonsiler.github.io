import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import type { TileBlockProps } from '@/models';

export const Tile: React.FC<TileBlockProps> = ({
  image,
  title,
  subtitle,
  detail
}) => {
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => {
    setOpen(o => !o);
  }, []);

  const articleClasses = classNames([
      'surface-card',
      'group',
      'relative',
      'isolate',
      'overflow-hidden',
      'p-8',
      'transition-all',
      'duration-500',
      'hover:-translate-y-1',
      'hover:border-sky-400/60',
      'hover:shadow-sky-500/20',
      'focus-within:border-sky-400/60',
      'focus-within:shadow-sky-500/20',
    ],
    {
      'lg:col-span-2': open
    }
  );
  const detailPanelClasses = classNames([
      'grid',
      'transition-all',
      'duration-500',
      'ease-in-out'
    ],
    {
      'grid-rows-[1fr]': open,
      'opacity-100': open,
      'mt-6': open,
      'grid-rows-[0fr]': !open,
      'opacity-60': !open,
      'mt-0': !open,
    }
);

  return (
    <article className={articleClasses}>
      {/* <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className={`h-full w-full object-cover opacity-60 transition-transform duration-700 ease-out group-hover:scale-105 ${open ? 'scale-105 opacity-50' : ''}`}
        />
        <div className={`absolute inset-0 bg-slate-950/65 transition-colors duration-500 group-hover:bg-slate-950/45 ${open ? 'bg-slate-950/35' : ''}`} />
      </div> */}
      <div className="relative z-10 flex flex-col gap-5">
        <button
          type="button"
          onClick={handleToggle}
          className="flex w-full flex-col items-start gap-4 text-left focus:outline-none"
        >
          <h3 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {title}
          </h3>
          <p className="text-sm text-slate-200/90">
            {subtitle}
          </p>

          {detail && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-200 transition group-hover:border-sky-400/50 group-hover:text-sky-200">
              {open ? 'Hide details' : 'Explore details'}
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              >
                <path
                  d="M12 15.5a1 1 0 0 1-.7-.29l-5-5a1 1 0 0 1 1.4-1.42l4.3 4.29l4.3-4.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-.7.3z"
                  fill="currentColor"
                />
              </svg>
            </span>
          )}
        </button>
        {detail && (
          <div className={detailPanelClasses}>
            <div
              className="overflow-hidden text-sm text-slate-100/95 md:text-base"
              dangerouslySetInnerHTML={{ __html: detail }}
            />
          </div>
        )}
      </div>
    </article>
  );
};


export const Tiles: React.FC<{
  features: Array<TileBlockProps>
}> = ({ features }) => (
  <div className="grid md:grid-cols-2">
    {features.map((feature, i) => (
      <Tile key={`tile-${i}`} {...feature} />
    ))}
  </div>
);

export default Tiles;
