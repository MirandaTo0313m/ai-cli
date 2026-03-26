"use client";

import type { Heading } from "fromsrc";
import { useEffect, useRef, useState } from "react";

export function Outline({ headings }: { headings: Heading[] }) {
  const [active, setactive] = useState(headings[0]?.id ?? "");
  const railref = useRef<HTMLDivElement>(null);
  const thumbref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = headings
      .map((heading) => ({
        id: heading.id,
        element: document.getElementById(heading.id),
      }))
      .filter((item): item is { id: string; element: HTMLElement } =>
        Boolean(item.element)
      );

    if (items.length === 0) {return;}

    const updateactive = (): void => {
      let current = items[0]?.id ?? "";

      for (const item of items) {
        if (item.element.getBoundingClientRect().top <= 140) {current = item.id;}
        else {break;}
      }

      setactive(current);
    };

    updateactive();
    window.addEventListener("scroll", updateactive, { passive: true });
    window.addEventListener("resize", updateactive, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateactive);
      window.removeEventListener("resize", updateactive);
    };
  }, [headings]);

  useEffect(() => {
    const rail = railref.current;
    const thumb = thumbref.current;
    if (!rail || !thumb) {return;}

    let ticking = false;

    const updateprogress = (): void => {
      const docheight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = docheight > 0 ? window.scrollY / docheight : 0;
      const railheight = rail.offsetHeight;
      const thumbheight = thumb.offsetHeight;
      const max = Math.max(railheight - thumbheight, 0);
      thumb.style.transform = `translateY(${percent * max}px)`;
    };

    const onscroll = (): void => {
      if (ticking) {return;}
      requestAnimationFrame(() => {
        updateprogress();
        ticking = false;
      });
      ticking = true;
    };

    updateprogress();
    window.addEventListener("scroll", onscroll, { passive: true });
    window.addEventListener("resize", updateprogress, { passive: true });

    return () => {
      window.removeEventListener("scroll", onscroll);
      window.removeEventListener("resize", updateprogress);
    };
  }, []);

  if (headings.length === 0) {return null;}

  return (
    <aside className="hidden lg:block w-56 shrink-0 py-12 pl-8">
      <div className="sticky top-12">
        <p className="mb-4 text-xs text-muted">on this page</p>
        <nav aria-label="table of contents" className="flex gap-3">
          <div
            ref={railref}
            className="relative w-0.5 rounded-full bg-line"
            role="presentation"
            aria-hidden="true"
          >
            <div
              ref={thumbref}
              className="absolute left-0 top-0 h-3 w-full rounded-full bg-fg"
              style={{ willChange: "transform" }}
            />
          </div>
          <ul role="list" className="space-y-1">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  aria-current={active === heading.id ? "location" : undefined}
                  className={`block py-1 text-xs transition-colors ${heading.level === 3 ? "pl-2" : ""} ${
                    active === heading.id
                      ? "text-fg"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
