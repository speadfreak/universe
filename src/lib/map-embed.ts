/**
 * Google Maps embed URLs for the clinic branches.
 *
 * The Addis Ababa embed is the REAL Universe Medical Center pin (client
 * provided). `resolveMapEmbedUrl` transparently upgrades older database rows
 * that still carry the generic keyless address search — so the live site
 * shows the true clinic pin without any manual admin step, while any custom
 * URL set later in Admin → Branches is always respected.
 */

/** Real Universe Medical Center embed (Google Maps "Embed a map" snippet). */
export const UNIVERSE_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1370.6896758079797!2d38.87642151590901!3d9.01542916539681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b9b1ee77a9921%3A0x72e0b3226d77515e!2sUniverse%20Medical%20Center!5e1!3m2!1sen!2set!4v1794503554161!5m2!1sen!2set";

/** The seeded defaults that shipped before the real pin was available. */
const LEGACY_DEFAULTS = new Set([
  "https://maps.google.com/maps?q=Lemi%20Kura%20Subcity%2C%20Ayat-Bole%20Arabsa%20Main%20Road%2C%20Addis%20Ababa%2C%20Ethiopia&z=15&output=embed",
  "https://www.google.com/maps?q=Lemi%20Kura%20Subcity%2C%20Ayat-Bole%20Arabsa%20Main%20Road%2C%20Addis%20Ababa%2C%20Ethiopia&z=15&output=embed",
]);

/**
 * Returns the embed URL a branch should render:
 *  - the real Universe pin for the main Addis Ababa branch when the stored
 *    URL is empty or still the legacy address-search default;
 *  - otherwise whatever the branch row carries (admin-edited URLs win).
 */
export function resolveMapEmbedUrl(nameEn: string, url: string): string {
  const isMain = /addis ababa branch|universe medical center/i.test(nameEn || "");
  if (isMain && (!url || LEGACY_DEFAULTS.has(url))) return UNIVERSE_MAP_EMBED;
  return url;
}
