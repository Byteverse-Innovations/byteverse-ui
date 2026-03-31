/** Tight crop (303×319); the non-cropped asset is 1280×1024 so the mark was microscopic in a small CSS box. */
import quotePrintLogoUrl from '../assets/icon-only-transparent (cropped).png?url'

/**
 * Client-only quote branding for admin PDF / print HTML.
 * Logo URL is bundled via Vite (`?url`) so the print iframe (same origin) can load it for html2canvas.
 *
 * ms-billing still embeds a data-URI in lambda/lib/quote-branding.ts for server renders.
 */
export const QUOTE_PRINT_LOGO_PUBLIC_PATH = quotePrintLogoUrl

export const quoteClientBrandStyles = `
  .bv-brand-strip {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 24px;
    margin: 0 0 20px 0;
    background: linear-gradient(120deg, #01113f 0%, #0956be 55%, #3595cd 100%);
    color: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,.12);
  }
  .bv-brand-strip .bv-brand-logo-img {
    height: 96px;
    width: auto;
    max-width: 110px;
    flex-shrink: 0;
    object-fit: contain;
    object-position: center;
    display: block;
  }
  .bv-brand-text { line-height: 1.2; }
  .bv-brand-name { font-size: 1.35rem; font-weight: 700; letter-spacing: 0.06em; margin: 0; text-transform: uppercase; }
  .bv-brand-tagline { margin: 4px 0 0; font-size: 0.78rem; opacity: 0.92; font-weight: 500; }
  .bv-doc-title { font-size: 1.45rem; margin: 0 0 4px; font-weight: 600; color: #111; }
  .bv-footer-brand {
    margin-top: 2rem;
    padding-top: 12px;
    border-top: 1px solid #dde1e8;
    font-size: 0.75rem;
    color: #555;
  }
`

/** @param docTitleEscaped Already HTML-escaped document title (e.g. from escapeHtml). */
export function quoteClientBrandHeaderHtml(docTitleEscaped: string): string {
  return `
  <header class="bv-brand-strip" role="banner">
    <img class="bv-brand-logo-img" src="${QUOTE_PRINT_LOGO_PUBLIC_PATH}" alt="" width="96" height="96" crossorigin="anonymous" />
    <div class="bv-brand-text">
      <p class="bv-brand-name">Byteverse</p>
      <p class="bv-brand-tagline">reach@byteverseinnov.com</p>
    </div>
    <div style="margin-left:auto;text-align:right;color:rgba(255,255,255,.9);">
      <div class="bv-doc-title" style="color:#fff;margin:0;">${docTitleEscaped}</div>
    </div>
  </header>`
}

export function quoteClientFooterHtml(): string {
  return `<footer class="bv-footer-brand">© ${new Date().getFullYear()} Byteverse. All rights reserved.</footer>`
}

/** Dark timeline / interactive pages (nav bar strip). */
export const quoteTimelineBrandStyles = `
  .bv-brand-strip-timeline {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin: -16px -16px 16px -16px;
    background: linear-gradient(120deg, #01113f 0%, #0956be 50%, #1a3a6e 100%);
    border-bottom: 1px solid rgba(255,255,255,.12);
  }
  .bv-brand-strip-timeline .bv-brand-logo-img {
    height: 64px;
    width: auto;
    max-width: 72px;
    flex-shrink: 0;
    object-fit: contain;
    display: block;
  }
  .bv-brand-strip-timeline .bv-brand-name { margin: 0; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.06em; color: #fff; }
`

export function quoteTimelineBrandRowHtml(): string {
  return `
  <div class="bv-brand-strip-timeline">
    <img class="bv-brand-logo-img" src="${QUOTE_PRINT_LOGO_PUBLIC_PATH}" alt="" width="64" height="64" crossorigin="anonymous" />
    <span class="bv-brand-name">Byteverse</span>
  </div>`
}
