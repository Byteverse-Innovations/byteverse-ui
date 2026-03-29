/**
 * Client-side copy of ms-billing/lambda/lib/quote-branding.ts — keep in sync.
 *
 * Byteverse quote / timeline branding (48×48 PNG mark, matches site navbar asset).
 * Embedded so Lambda renders logo without S3 or network fetches.
 */
export const QUOTE_LOGO_DATA_URI =
  'data:image/png;base64,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'

export const quoteClientBrandStyles = `
  .bv-brand-strip {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    margin: -24px -24px 20px -24px;
    background: linear-gradient(120deg, #01113f 0%, #0956be 55%, #3595cd 100%);
    color: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,.12);
  }
  .bv-brand-strip img { width: 44px; height: 44px; flex-shrink: 0; object-fit: contain; }
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
    <img src="${QUOTE_LOGO_DATA_URI}" alt="" width="44" height="44" />
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
  .bv-brand-strip-timeline img { width: 36px; height: 36px; object-fit: contain; }
  .bv-brand-strip-timeline .bv-brand-name { margin: 0; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.06em; color: #fff; }
`

export function quoteTimelineBrandRowHtml(): string {
  return `
  <div class="bv-brand-strip-timeline">
    <img src="${QUOTE_LOGO_DATA_URI}" alt="" width="36" height="36" />
    <span class="bv-brand-name">Byteverse</span>
  </div>`
}
