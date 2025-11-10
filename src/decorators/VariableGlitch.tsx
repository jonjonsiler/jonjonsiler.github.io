import { useEffect, useRef, useState } from "react";

const variableNames = [
  "foo","$foo","bar","$bar","baz","$baz","qux","$qux","data","$data","result","$result",
  "value","$value","count","$count","user","$user","config","$config","error","$error",
  "success","$success","status","$status","token","$token","id","$id","file","$file",
  "content","$content","title","$title","description","$description","json","$json","html","$html",
  "css","$css","script","$script","module","$module","component","$component","args","$args","params","$params"
];

const getRandomVariable = () =>
  variableNames[Math.floor(Math.random() * variableNames.length)];

function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return scrollY;
}

export function VariableGlitch({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousScrollY = useRef(0);
  const revertTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollY = useScrollPosition();

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const { current: container } = containerRef;
    const velocity = Math.abs(scrollY - previousScrollY.current);
    previousScrollY.current = scrollY;

    const headings = [...container.querySelectorAll<HTMLHeadingElement>("h1,h2,h3,h4,h5,h6")];

    for (const h of headings) h.dataset.originalText ??= h.textContent ?? "";

    if (velocity > 2) {
      for (const h of headings)
        Object.assign(h.style, {
          transform: `rotate(${(Math.random() - 0.5) * 10}deg) scale(${1 + Math.random() * 0.1})`,
          transition: "transform 0.1s ease-out, color 0.1s ease-out",
          color: `hsl(${Math.random() * 360}, 80%, 60%)`,
        }),
        (h.textContent = getRandomVariable());
    }

    clearTimeout(revertTimer.current);
    revertTimer.current = setTimeout(() => {
      for (const h of headings)
        Object.assign(h.style, { transform: "rotate(0) scale(1)", color: "" }),
        (h.textContent = h.dataset.originalText ?? "");
    }, 500);

    return () => clearTimeout(revertTimer.current);
  }, [scrollY]);

  return <div ref={containerRef}>{children}</div>;
}