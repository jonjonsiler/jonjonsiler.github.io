import React, { useEffect, useRef, useState } from 'react';
import './finder.scss';

type FinderLink = {
  href: string;
  label: string;
};

const initialLinks: FinderLink[] = [
  { href: '#', label: 'Programs' },
  { href: '#', label: 'Apply Now' },
  { href: '#', label: 'Paying for College' },
  { href: '#', label: 'Financial Aid' },
  { href: '#', label: 'Schedule a Visit' },
  { href: '#', label: 'Campus Life' },
];

const initialSplitIndex = 3;

const rotate = <T,>(items: T[], direction: 'forward' | 'backward') => {
  if (items.length < 2) {
    return items;
  }
  return direction === 'forward'
    ? [...items.slice(1), items[0]]
    : [items[items.length - 1], ...items.slice(0, -1)];
};

export const Finder = () => {
  const [links, setLinks] = useState<FinderLink[]>(initialLinks);
  const [splitIndex] = useState(() => Math.min(initialSplitIndex, initialLinks.length));

  const finderRef = useRef<HTMLElement | null>(null);
  const medallionRef = useRef<HTMLHeadingElement | null>(null);
  const leftNavRef = useRef<HTMLDivElement | null>(null);
  const rightNavRef = useRef<HTMLDivElement | null>(null);
  const updateTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handlePosition = () => {
      if (updateTimeout.current) {
        window.clearTimeout(updateTimeout.current);
      }

      updateTimeout.current = window.setTimeout(() => {
        const finder = finderRef.current;
        const medallion = medallionRef.current;
        const leftNav = leftNavRef.current;
        const rightNav = rightNavRef.current;

        if (!finder || !medallion || !leftNav || !rightNav) {
          return;
        }

        let offset = 0;
        const tempBanner = document.querySelector('.temp-banner') as HTMLElement | null;
        if (tempBanner) {
          offset = tempBanner.offsetHeight + 50;
        }

        const max = 500 + offset;
        const min = 460 + offset;
        const top = finder.getBoundingClientRect().top;
        const percent = Math.min(100, Math.max(0, ((max - top) / (max - min)) * 100));
        const halfPercent = `${percent / 2}%`;

        if (finder.clientHeight > 0) {
          medallion.style.top = halfPercent;
          leftNav.style.left = halfPercent;
          rightNav.style.right = halfPercent;
        } else {
          medallion.style.top = '';
          leftNav.style.left = '';
          rightNav.style.right = '';
        }
      }, 10);
    };

    window.addEventListener('scroll', handlePosition);
    window.addEventListener('load', handlePosition);
    window.addEventListener('resize', handlePosition);
    handlePosition();

    return () => {
      window.removeEventListener('scroll', handlePosition);
      window.removeEventListener('load', handlePosition);
      window.removeEventListener('resize', handlePosition);
      if (updateTimeout.current) {
        window.clearTimeout(updateTimeout.current);
      }
    };
  }, []);

  const leftLinks = links.slice(0, splitIndex);
  const rightLinks = links.slice(splitIndex).reverse();

  return (
    <section className="s-finder" id="finder" ref={finderRef}>
      <h2 className="medallion" ref={medallionRef} style={{ top: '50%' }}>
        Find your Way
      </h2>
      <div className="finder-nav">
        <div className="left-nav" ref={leftNavRef} style={{ left: '50%' }}>
          {leftLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
          <div className="rotate-nav">
            <button
              type="button"
              title="Rotate clockwise"
              className="btn rotate-cw"
              onClick={() => setLinks((prev) => rotate(prev, 'forward'))}
            >
              Rotate clockwise
            </button>
            <button
              type="button"
              title="Rotate counterclockwise"
              className="btn rotate-ccw"
              onClick={() => setLinks((prev) => rotate(prev, 'backward'))}
            >
              Rotate counterclockwise
            </button>
          </div>
        </div>
        <div className="right-nav" ref={rightNavRef} style={{ right: '50%' }}>
          {rightLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
          <div className="rotate-nav">
            <button
              type="button"
              title="Rotate clockwise"
              className="btn rotate-cw"
              onClick={() => setLinks((prev) => rotate(prev, 'forward'))}
            >
              Rotate clockwise
            </button>
            <button
              type="button"
              title="Rotate counterclockwise"
              className="btn rotate-ccw"
              onClick={() => setLinks((prev) => rotate(prev, 'backward'))}
            >
              Rotate counterclockwise
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
