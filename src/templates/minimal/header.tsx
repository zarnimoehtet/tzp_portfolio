"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ImageAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/templates/navigation";

interface HeaderProps {
  name: string;
  logo: ImageAsset | null;
}

export function Header({ name, logo }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const hasHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const threshold = hasHero ? window.innerHeight - 80 : 12;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hasHero]);

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const navLinks = NAV_LINKS.filter((l) => l.href !== "/contact");
  const overHero = hasHero && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter,color] duration-300",
          open
            ? "bg-paper shadow-[0_1px_0_var(--site-line)]"
            : scrolled
              ? "bg-paper/90 shadow-[0_1px_0_var(--site-line)] backdrop-blur-md"
              : "bg-transparent",
          overHero && "text-white",
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between gap-4 px-4 pt-[env(safe-area-inset-top)] md:h-[4.5rem] md:px-8",
            hasHero ? "max-w-[1400px]" : "max-w-[1200px]",
          )}
        >
          <Link href="/" className="relative z-50 flex items-center" aria-label={`${name} — home`}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo.medium_url}
                alt={name}
                width={logo.medium_width}
                height={Math.round((logo.height / logo.width) * logo.medium_width)}
                className="h-7 w-auto md:h-8"
              />
            ) : (
              <span className="font-display text-xl tracking-[-0.02em] md:text-[1.35rem]">{name}</span>
            )}
          </Link>

          <nav
            aria-label="Main"
            className="absolute left-1/2 hidden -translate-x-1/2 md:block"
          >
            <ul
              className={cn(
                "flex items-center gap-1 rounded-full border p-1 backdrop-blur-md transition-colors duration-300",
                overHero ? "border-white/20 bg-white/15" : "border-line/80 bg-paper/70",
              )}
            >
              {navLinks.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                        active
                          ? "bg-ink text-paper"
                          : overHero
                            ? "text-white/85 hover:text-white"
                            : "text-muted-ink hover:text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative z-50 flex items-center gap-2">
            <Link
              href="/contact"
              className={cn(
                "pill-btn hidden !px-5 !py-2.5 text-[0.8125rem] sm:inline-flex",
                overHero && "!bg-white !text-black",
              )}
            >
              Contact
            </Link>
            <button
              type="button"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full border md:hidden",
                overHero ? "border-white/30" : "border-line",
              )}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{open ? "Close" : "Menu"}</span>
              <span aria-hidden className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    "block h-px w-4 bg-current transition-transform",
                    open && "translate-y-[3.5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-4 bg-current transition-transform",
                    open && "-translate-y-[3.5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Outside <header>: backdrop-filter would trap a nested fixed overlay. */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fade-in fixed inset-0 z-30 overflow-y-auto bg-paper text-ink md:hidden"
      >
        <nav
          aria-label="Mobile"
          className="flex min-h-full flex-col px-5 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]"
        >
          <ul className="divide-y divide-line border-y border-line">
            {[{ href: "/", label: "Home" }, ...NAV_LINKS].map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between py-4 font-display text-[2rem] tracking-[-0.03em] transition-colors",
                      active ? "text-ink" : "text-muted-ink active:text-ink",
                    )}
                  >
                    {link.label}
                    <span aria-hidden className="text-base">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/contact" className="pill-btn mt-8 w-full !py-4">
            Get in touch
          </Link>
        </nav>
      </div>
    </>
  );
}
