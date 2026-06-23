// ============================================================
// GLOBAL SITE CONFIG
// Edit this file to customize the site for your partner.
// ============================================================

export interface SiteConfig {
  partnerName: string; // the recipient's name, used in hero greeting
  yourName: string;
  anniversaryDate: string; // the date this gift is "for" (display only)
  heroTitle: string; // big welcome headline on landing page
  heroSubtitle?: string; // optional subtitle below the headline
}

export const siteConfig: SiteConfig = {
  partnerName: "Her şeyden çok sevdiğim aşkıma", // TODO: replace with your partner's name
  yourName: "Eray", // TODO: replace with your name
  anniversaryDate: "2023-06-23", // TODO: replace with your anniversary date
  heroTitle: "3.yılımız kutlu olsun sevgilim, seni her şeyden çok seviyorum. Senin için küçük sevimli bir site yaptimmm",
  heroSubtitle: "Her gün seninle geçirmek bir armağan...",
};
