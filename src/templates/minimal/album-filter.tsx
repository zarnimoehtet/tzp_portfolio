"use client";

import { useMemo, useState } from "react";

import type { AlbumWithCover } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlbumCard } from "./components";

const ALL = "All";

/** Category pills filter albums instantly on the client; no extra requests. */
export function AlbumFilter({ albums }: { albums: AlbumWithCover[] }) {
  const [active, setActive] = useState(ALL);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const album of albums) if (album.category) set.add(album.category);
    return [ALL, ...set];
  }, [albums]);

  const visible =
    active === ALL ? albums : albums.filter((a) => a.category === active);

  return (
    <>
      {categories.length > 2 && (
        <div
          role="tablist"
          aria-label="Filter by category"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active === category}
              onClick={() => setActive(category)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active === category
                  ? "bg-ink text-paper"
                  : "border border-line text-muted-ink hover:text-ink",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-12 md:gap-x-8 md:gap-y-16 lg:grid-cols-3">
        {visible.map((album, i) => (
          <li key={album.id} className={cn(i % 3 === 1 && "lg:mt-12")}>
            <AlbumCard
              album={album}
              priority={i < 3}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </>
  );
}
