-- The first versions seeded obviously fake contacts. Clear exactly those values (and only if
-- nobody has replaced them yet): an empty contact is not shown on the site.
UPDATE "site_contacts"
SET "phone_display" = '', "phone_href" = ''
WHERE "phone_href" = '+380000000000';

UPDATE "site_contacts"
SET "whatsapp_url" = ''
WHERE "whatsapp_url" = 'https://wa.me/380000000000';
