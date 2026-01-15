import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import classNames from 'classnames';
import type { TileBlockProps } from '@/models';
import { LoadingStatus } from '@/enums';
import { useFetch } from '@/hooks';

type TileProps = TileBlockProps & {
  column?: 'left' | 'right';
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

const HUE_OFFSET = -134;

export const Tile: React.FC<TileProps> = ({
  image,
  title,
  subtitle,
  detail,
  column = 'left',
  containerRef
}) => {
  const [open, setOpen] = useState(false);
  const [hoverBox, setHoverBox] = useState<{ leftOffset: number; width: number }>({
    leftOffset: 0,
    width: 0
  });
  const articleRef = useRef<HTMLElement>(null);
  const gradientColors = useMemo(() => {
    const baseHue = Math.random() * 360;
    const pairedHue = (baseHue + HUE_OFFSET + 360) % 360;
    const format = (
      hue: number,
      alpha: number,
      lightness = 55,
      saturation = 78
    ) => `hsla(${hue.toFixed(1)}, ${saturation}%, ${lightness}%, ${alpha})`;

    return {
      start: format(baseHue, 0.15, 60),
      glow: format(baseHue, 0.12, 66),
      end: format(pairedHue, 0.1, 54),
      fade: format(pairedHue, 0, 48)
    };
  }, []);

  const handleToggle = useCallback(() => {
    setOpen(o => !o);
  }, []);

  const updateHoverBox = useCallback(() => {
    if (!articleRef.current) {
      return;
    }
    const articleRect = articleRef.current.getBoundingClientRect();
    const mainElement = articleRef.current.closest('main');
    const mainRect = mainElement?.getBoundingClientRect();
    const containerRect = containerRef?.current?.getBoundingClientRect();
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : articleRect.right;
    const isTwoColumn = typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches
      : false;

    let start = articleRect.left;
    let width = articleRect.width;

    if (mainRect && isTwoColumn) {
      const halfWidth = mainRect.width / 2;
      start = column === 'left'
        ? mainRect.left
        : mainRect.left + halfWidth;
      width = halfWidth;
    } else if (column === 'left') {
      const containerStart = containerRect?.left ?? articleRect.left;
      start = containerStart;
      width = articleRect.right - containerStart;
    } else {
      start = articleRect.left;
      width = viewportWidth - start;
    }

    setHoverBox({
      leftOffset: start - articleRect.left,
      width: Math.max(width, 0)
    });
  }, [column, containerRef]);

  useEffect(() => {
    updateHoverBox();
  }, [updateHoverBox, open]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => updateHoverBox();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateHoverBox]);

  const articleClasses = classNames([
      'surface-card',
      'group',
      'relative',
      'isolate',
      'overflow-visible',
      'p-8',
      'transition-all',
      'duration-500',
      'hover:-translate-y-1',
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
    <article ref={articleRef} className={articleClasses}>
      <span
        aria-hidden="true"
        className={classNames(
          'pointer-events-none',
          'block',
          'absolute',
          'top-0',
          'bottom-0',
          '-z-10',
          'opacity-0',
          'transition-opacity',
          'duration-500',
          'ease-out',
          'group-hover:opacity-100',
        )}
        style={{
          left: `${hoverBox.leftOffset}px`,
          width: `${hoverBox.width}px`,
          backgroundImage: `linear-gradient(${column === 'left' ? '90deg' : '270deg'}, ${gradientColors.start} 0%, ${gradientColors.glow} 40%, ${gradientColors.end} 75%, ${gradientColors.fade} 100%)`
        }}
      />
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
  apiBaseUrl?: string;
  apiKey?: string;
}> = ({ apiBaseUrl, apiKey }) => {
  const { data, status, error, reload } = useFetch<TileBlockProps[]>({
    path: `/api/features.json`,
    apiBaseUrl,
    apiKey
  });
  const features = Array.isArray(data) ? data : [];
  const containerRef = useRef<HTMLDivElement>(null);

  if (status === LoadingStatus.LOADING) {
    return (
      <div className="surface-card rounded-3xl border border-slate-800/70 p-8 text-center text-slate-300 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
          Loading
        </p>
        <p className="mt-3 text-base">Fetching feature tiles from the API…</p>
      </div>
    );
  }

  if (status === LoadingStatus.ERROR) {
    return (
      <div className="surface-card space-y-4 rounded-3xl border border-rose-800/70 p-8 text-center text-rose-100 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.35em]">
          API unreachable
        </p>
        <p className="text-base text-rose-50/80">
          {error ?? 'Something went wrong while loading tiles.'}
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:border-sky-400/50 hover:text-sky-200"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!features.length) {
    return (
      <div className="surface-card space-y-4 rounded-3xl border border-slate-800/70 p-8 text-center text-sm text-slate-300 md:p-12">
        <p>Tiles will show up here once the API has something to share.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grid md:grid-cols-2">
      {features.map((feature, i) => (
        <Tile
          key={`tile-${i}`}
          column={i % 2 === 0 ? 'left' : 'right'}
          containerRef={containerRef}
          {...feature}
        />
      ))}
    </div>
  );
};

export default Tiles;
