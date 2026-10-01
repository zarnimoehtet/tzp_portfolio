import Link from "next/link";

import { NAV_LINKS } from "@/templates/navigation";
import type { SiteContext } from "@/templates/types";
import { Container } from "./components";

export function Footer({ site }: { site: SiteContext }) {
  const { contact, socialLinks, about } = site;
  const year = new Date().getFullYear();

  const talkLinks = [
    contact.email && { label: "Email", href: `mailto:${contact.email}` },
    contact.whatsapp && {
      label: "WhatsApp",
      href: `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`,
    },
    contact.phone && {
      label: "Phone",
      href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`,
    },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="border-t border-line pt-16 pb-10 md:pt-20">
      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Link href="/" className="font-display text-2xl tracking-[-0.02em]">
              {about.name}
            </Link>
            {about.headline && (
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-ink">
                {about.headline}
              </p>
            )}
            {contact.location && (
              <p className="mt-4 text-sm text-muted-ink">{contact.location}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-8 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-ink">Discover</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/" className="hover:opacity-60">
                    Home
                  </Link>
                </li>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:opacity-60">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {socialLinks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-ink">Follow</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {socialLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-60"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-muted-ink">Let’s talk</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/contact" className="hover:opacity-60">
                    Book a call
                  </Link>
                </li>
                {talkLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:opacity-60">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted-ink md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {about.name}.
          </p>
          <p>All photographs are protected by copyright.</p>
        </div>
      </Container>
    </footer>
  );
}
