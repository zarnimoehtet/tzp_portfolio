"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_FAQS = [
  {
    q: "How soon should I book?",
    a: "Most projects are booked several weeks ahead to ensure availability. Peak seasons fill earlier, so reach out as soon as you have dates in mind.",
  },
  {
    q: "Do you travel for projects?",
    a: "Yes — travel is welcome. Destination sessions and events can be arranged; travel fees depend on location and schedule.",
  },
  {
    q: "How long until final delivery?",
    a: "Typical turnaround is two to four weeks after your session, depending on the package and editing scope. You’ll receive a clear timeline when we book.",
  },
  {
    q: "Do you provide image licensing?",
    a: "Personal and commercial usage rights are included based on your package. Extended licensing for campaigns or publications is available on request.",
  },
  {
    q: "How many photos will I receive?",
    a: "Delivery counts vary by package. Every gallery is thoughtfully curated so you receive polished, meaningful images — not unedited dumps.",
  },
  {
    q: "How do we get started?",
    a: "Send a message with your date, location, and vision. We’ll reply personally, discuss fit, and share next steps for booking.",
  },
];

export function FaqAccordion({
  items = DEFAULT_FAQS,
}: {
  items?: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState(0);

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[1.5rem] border border-line md:rounded-[2rem]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-7 md:py-6"
            >
              <span className="text-[0.9375rem] font-medium tracking-[-0.01em] md:text-base">
                {item.q}
              </span>
              <span
                aria-hidden
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-sm transition-transform",
                  isOpen && "rotate-45 bg-ink text-paper",
                )}
              >
                +
              </span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-ink md:px-7 md:pb-6 md:text-[0.9375rem]">
                  {item.a}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
