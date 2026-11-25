import { DEFAULT_SITE_SECTIONS } from "@/lib/admin-store";
import { useSiteContent } from "@/lib/site-content";
import { SocialLinks, getSocialLinks, hasValue } from "@/components/site/SocialLinks";
import { siteAsset } from "@/lib/assets";

const logo = siteAsset("images/logo-wings.webp");

export function Footer() {
  const { contacts, settings } = useSiteContent();
  const footer = (settings.sections ?? DEFAULT_SITE_SECTIONS).footer;

  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Wings Bucha" className="h-10 w-10" width={40} height={40} />
              <div>
                <div className="text-base font-bold">WINGS BUCHA</div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Крила Бучі
                </div>
              </div>
            </div>
            {hasValue(footer.about) && (
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                {footer.about}
              </p>
            )}
          </div>

          {(hasValue(contacts.phoneDisplay) ||
            hasValue(contacts.email) ||
            hasValue(contacts.address) ||
            getSocialLinks(contacts).length > 0) && (
            <div>
              <h4 className="text-sm font-semibold">Контакти</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {hasValue(contacts.phoneDisplay) && (
                  <li>
                    {hasValue(contacts.phoneHref) ? (
                      <a href={`tel:${contacts.phoneHref.trim()}`} className="hover:text-primary">
                        {contacts.phoneDisplay}
                      </a>
                    ) : (
                      contacts.phoneDisplay
                    )}
                  </li>
                )}
                {hasValue(contacts.email) && (
                  <li>
                    <a href={`mailto:${contacts.email.trim()}`} className="hover:text-primary">
                      {contacts.email}
                    </a>
                  </li>
                )}
                {hasValue(contacts.address) && <li>{contacts.address}</li>}
              </ul>
              <SocialLinks
                contacts={contacts}
                className="mt-4"
                linkClassName="border border-border bg-background text-foreground/80 hover:border-primary hover:text-primary"
              />
            </div>
          )}

          {hasValue(footer.developerName) && (
            <div>
              {hasValue(footer.developerTitle) && (
                <h4 className="text-sm font-semibold">{footer.developerTitle}</h4>
              )}
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>{footer.developerName}</li>
              </ul>
            </div>
          )}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>
            © {new Date().getFullYear()}
            {hasValue(footer.copyright) ? ` ${footer.copyright}` : ""}
          </span>
          {hasValue(footer.tagline) && <span>{footer.tagline}</span>}
        </div>
      </div>
    </footer>
  );
}
