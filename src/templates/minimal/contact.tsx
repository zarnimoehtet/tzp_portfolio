import { ContactForm } from "@/components/site/contact-form";
import type { ContactPageProps } from "@/templates/types";
import { Container, PageIntro, SectionLabel, StatusBadge } from "./components";

export function MinimalContactPage({ site, packages }: ContactPageProps) {
  const { contact, socialLinks } = site;

  const details = [
    contact.email && { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.phone && {
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`,
    },
    contact.location && { label: "Based in", value: contact.location },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <>
      <PageIntro label="Contact" title="Let’s talk.">
        {contact.availability ||
          "Now booking for the coming seasons. Tell me a little about your plans and I’ll reply personally."}
      </PageIntro>

      <Container className="grid gap-12 pb-20 md:grid-cols-12 md:gap-10 md:pb-28">
        <aside className="space-y-8 md:col-span-4">
          {contact.availability && (
            <StatusBadge label={contact.availability} />
          )}
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-medium text-muted-ink">{d.label}</p>
              {d.href ? (
                <a
                  href={d.href}
                  className="mt-2 block font-display text-xl tracking-[-0.02em] break-words hover:opacity-60 md:text-2xl"
                >
                  {d.value}
                </a>
              ) : (
                <p className="mt-2 font-display text-xl tracking-[-0.02em] md:text-2xl">
                  {d.value}
                </p>
              )}
            </div>
          ))}
          {socialLinks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-ink">Social</p>
              <ul className="mt-3 space-y-2 text-sm">
                {socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-60"
                    >
                      {link.label} <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="rounded-[1.75rem] border border-line p-6 md:col-span-7 md:col-start-6 md:rounded-[2rem] md:p-10">
          <SectionLabel>Send a message</SectionLabel>
          <div className="mt-8">
            <ContactForm packageNames={packages.map((p) => p.name)} />
          </div>
        </div>
      </Container>
    </>
  );
}
