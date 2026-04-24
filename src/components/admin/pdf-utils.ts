import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { Quote, Invoice, Audit } from '../../api/admin-api'
import { QUOTE_PRINT_LOGO_PUBLIC_PATH } from '../../lib/quote-print-branding'
import { buildInvoicePrintHtml, buildQuotePrintHtml } from '../../lib/quote-print-html'
import { buildAuditPrintHtml } from '../../lib/audit-print-html'

/** srcdoc iframes need absolute logo URLs so the asset still loads cross-document. */
function preparePrintHtmlForSrcdoc(html: string): string {
  const abs = new URL(QUOTE_PRINT_LOGO_PUBLIC_PATH, window.location.href).href
  return html.split(QUOTE_PRINT_LOGO_PUBLIC_PATH).join(abs)
}

const CHART_POLL_MS = 200
const CHART_MAX_WAIT_MS = 90_000
/** Match Puppeteer sleep in ms-billing render (~5500ms) for Google Charts + axis labels. */
const POST_CHART_SETTLE_MS = 5800

/** A4 content width at 96dpi — matches PDF text scale when this maps 1:1 to jsPDF content area. */
const PRINT_VIEWPORT_CSS_PX = 794

const HTML2CANVAS_SCALE = 2

/** Tight margins so the raster uses more of the page (mm). */
const PDF_MARGIN_MM = 6

/**
 * Keep raster slices above the jsPDF page-number line (`addPageNumberFooters` at ~pageH − 4mm).
 * Without this, the last rows on each page can visually collide with “© … Page n of m”.
 */
const PDF_PAGE_NUMBER_RESERVE_MM = 9

/**
 * Footer band in html2canvas pixel Y (0 = top of capture), so paging can avoid splitting it across PDF pages.
 */
function footerBandCanvasPx(
  root: HTMLElement,
  canvasHeightPx: number,
  scale: number
): { top: number; bottom: number } | null {
  const el = root.querySelector('.bv-footer-brand') as HTMLElement | null
  if (!el) return null
  void el.offsetWidth
  const br = root.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  const scrollTop = root.scrollTop ?? 0
  const top = (er.top - br.top + scrollTop) * scale
  const bottom = (er.bottom - br.top + scrollTop) * scale
  const t = Math.max(0, Math.min(top, canvasHeightPx))
  const b = Math.max(t + 1, Math.min(bottom, canvasHeightPx))
  if (b - t < 2) return null
  return { top: t, bottom: b }
}

/**
 * `.totals-block` bounds in the given section slice canvas (same scale as html2canvas output).
 * Keeps TOTAL / BALANCE DUE on one PDF page when the line-item section spans multiple pages.
 */
function totalsBlockBandInSectionSliceCanvasPx(
  section: HTMLElement,
  body: HTMLElement,
  sectionSliceHeightPx: number,
  scale: number
): { top: number; bottom: number } | null {
  const el = section.querySelector('.totals-block') as HTMLElement | null
  if (!el) return null
  void el.offsetWidth
  const br = body.getBoundingClientRect()
  const sr = section.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  const scrollTop = body.scrollTop ?? 0
  const secTopDoc = sr.top - br.top + scrollTop
  const topDoc = er.top - br.top + scrollTop
  const bottomDoc = er.bottom - br.top + scrollTop
  const topPx = (topDoc - secTopDoc) * scale
  const bottomPx = (bottomDoc - secTopDoc) * scale
  const t = Math.max(0, Math.min(topPx, sectionSliceHeightPx))
  const b = Math.max(t + 2, Math.min(bottomPx, sectionSliceHeightPx))
  if (b - t < 4) return null
  return { top: t, bottom: b }
}

/** `.bv-footer-brand` in a section slice — same coordinates as `totalsBlockBandInSectionSliceCanvasPx`. */
function footerBrandBandInSectionSliceCanvasPx(
  section: HTMLElement,
  body: HTMLElement,
  sectionSliceHeightPx: number,
  scale: number
): { top: number; bottom: number } | null {
  const el = section.querySelector('.bv-footer-brand') as HTMLElement | null
  if (!el) return null
  void el.offsetWidth
  const br = body.getBoundingClientRect()
  const sr = section.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  const scrollTop = body.scrollTop ?? 0
  const secTopDoc = sr.top - br.top + scrollTop
  const topDoc = er.top - br.top + scrollTop
  const bottomDoc = er.bottom - br.top + scrollTop
  const topPx = (topDoc - secTopDoc) * scale
  const bottomPx = (bottomDoc - secTopDoc) * scale
  const t = Math.max(0, Math.min(topPx, sectionSliceHeightPx))
  const b = Math.max(t + 2, Math.min(bottomPx, sectionSliceHeightPx))
  if (b - t < 4) return null
  return { top: t, bottom: b }
}

/** Shrink or extend a vertical slice so it does not cut through any "keep together" band. */
function constrainSliceHeightForBands(
  srcY: number,
  sliceH: number,
  pagePx: number,
  canvasHeight: number,
  bands: { top: number; bottom: number }[]
): number {
  let h = sliceH
  const sorted = [...bands].sort((a, b) => a.top - b.top)
  for (const { top: ft, bottom: fb } of sorted) {
    const end = srcY + h
    if (srcY < ft && end > ft && end < fb) {
      h = ft - srcY
    } else if (srcY >= ft && srcY < fb) {
      const need = fb - srcY
      if (need <= pagePx + 1) {
        h = Math.max(h, need)
      }
      h = Math.min(h, canvasHeight - srcY)
    }
  }
  return h
}

/** Sample the “content” band (not full bleed) — used for section slices and per-page raster chunks. */
function isPrintSliceMostlyBlank(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')
  if (!ctx || canvas.width < 2 || canvas.height < 2) return true
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const x0 = Math.floor(width * 0.04)
  const x1 = Math.ceil(width * 0.96)
  const y0 = Math.floor(height * 0.06)
  const y1 = Math.ceil(height * 0.86)
  const whiteThreshold = 252
  let nonWhite = 0
  let count = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4
      if (data[i]! < whiteThreshold || data[i + 1]! < whiteThreshold || data[i + 2]! < whiteThreshold) {
        nonWhite++
      }
      count++
    }
  }
  if (count === 0) return true
  return nonWhite / count < 0.002
}

function addCanvasToPdfPaged(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  opts?: { avoidSplitBands?: { top: number; bottom: number }[] }
) {
  const bands = opts?.avoidSplitBands ?? []
  const margin = PDF_MARGIN_MM
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const contentW = pageW - margin * 2
  const contentH = pageH - margin * 2
  const sliceBudgetMm = Math.max(12, contentH - PDF_PAGE_NUMBER_RESERVE_MM)
  const imgHmm = (canvas.height * contentW) / canvas.width
  const pagePx = (sliceBudgetMm / imgHmm) * canvas.height

  let srcY = 0
  let pageIndex = 0
  let emittedAny = false

  while (srcY < canvas.height - 0.5) {
    let sliceH = Math.min(pagePx, canvas.height - srcY)

    if (bands.length > 0) {
      sliceH = constrainSliceHeightForBands(srcY, sliceH, pagePx, canvas.height, bands)
    }

    if (sliceH < 1) {
      sliceH = Math.min(pagePx, canvas.height - srcY)
    }
    if (sliceH < 0.5) break

    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = Math.max(1, Math.ceil(sliceH))
    const ctx = slice.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH)

    const moreBelow = srcY + sliceH < canvas.height - 0.5
    /**
     * Band constraints can produce a “page” that is only the white gap before `.totals-block`.
     * Skip emitting those (and other interior blank chunks); still advance srcY.
     * Trailing blank slivers are dropped without adding a page.
     */
    if (isPrintSliceMostlyBlank(slice) && moreBelow) {
      srcY += sliceH
      continue
    }
    if (isPrintSliceMostlyBlank(slice) && !moreBelow) {
      srcY += sliceH
      break
    }

    if (pageIndex > 0) pdf.addPage()

    const mmThisPage = (sliceH / canvas.height) * imgHmm
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, mmThisPage)

    srcY += sliceH
    pageIndex++
    emittedAny = true
  }

  /** If every chunk was blank (shouldn’t happen), keep jsPDF’s first page from being totally empty. */
  if (!emittedAny && pageIndex === 0) {
    const h = Math.min(pagePx, canvas.height)
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = Math.max(1, Math.ceil(h))
    const ctx = slice.getContext('2d')
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, canvas.width, h, 0, 0, canvas.width, h)
      const mm = (h / canvas.height) * imgHmm
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, mm)
    }
  }
}

function addPageNumberFooters(pdf: jsPDF) {
  const total = pdf.getNumberOfPages()
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const year = new Date().getFullYear()
  /** Bottom-aligned so the line sits in the margin and is not clipped. */
  const footY = pageH - 4
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(40, 40, 40)
    const label = `© ${year} Byteverse · Page ${i} of ${total}`
    pdf.text(label, pageW / 2, footY, { align: 'center', baseline: 'bottom' })
  }
}

/** Ensure embedded raster / bg images are decoded before html2canvas snapshots. */
async function waitForDocumentImagesDecoded(doc: Document): Promise<void> {
  const images = Array.from(doc.images)
  await Promise.all(
    images.map(async (img) => {
      try {
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
        }
        await img.decode()
      } catch {
        /* invalid or undecodeable image — continue capture */
      }
    })
  )
}

async function waitForTimelineRendered(doc: Document): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const t0 = Date.now()
    const iv = window.setInterval(() => {
      if (Date.now() - t0 > CHART_MAX_WAIT_MS) {
        window.clearInterval(iv)
        reject(new Error('Timed out waiting for timeline chart'))
        return
      }
      const chartEl = doc.getElementById('timeline-chart')
      if (!chartEl) {
        window.clearInterval(iv)
        resolve()
        return
      }
      const text = chartEl.textContent ?? ''
      const noRows = text.includes('No timeline events')
      const hasSvg = chartEl.querySelector('svg') != null
      if (noRows || hasSvg) {
        window.clearInterval(iv)
        window.setTimeout(resolve, POST_CHART_SETTLE_MS)
      }
    }, CHART_POLL_MS)
  })
}

async function waitForIframeReady(iframe: HTMLIFrameElement, html: string): Promise<Document> {
  const htmlForIframe = preparePrintHtmlForSrcdoc(html)
  /** Blob URL is more reliable in Chrome than `srcdoc` for charts/layout. */
  const blob = new Blob([htmlForIframe], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      URL.revokeObjectURL(url)
      reject(new Error('iframe load timeout'))
    }, 75_000)
    const done = () => {
      window.clearTimeout(timer)
      URL.revokeObjectURL(url)
      resolve()
    }
    iframe.onload = done
    iframe.src = url
  })
  const idoc = iframe.contentDocument
  if (!idoc?.body) throw new Error('Print iframe document has no body')
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
  void idoc.body.getBoundingClientRect()
  return idoc
}

function collectPrintSections(idoc: Document): HTMLElement[] {
  const main = idoc.querySelector('.bv-print-main')
  const fromMain =
    main != null
      ? Array.from(main.children).filter(
          (el): el is HTMLElement =>
            el instanceof HTMLElement && el.classList.contains('quote-pdf-page')
        )
      : []
  if (fromMain.length > 0) return fromMain
  return Array.from(idoc.querySelectorAll('.quote-pdf-page')) as HTMLElement[]
}

function sliceSectionCanvases(
  full: HTMLCanvasElement,
  body: HTMLElement,
  sections: HTMLElement[]
): HTMLCanvasElement[] {
  const bodyH = Math.max(body.scrollHeight, body.offsetHeight, body.getBoundingClientRect().height)
  const ratio = full.height / Math.max(bodyH, 1)
  const br = body.getBoundingClientRect()
  const out: HTMLCanvasElement[] = []
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const sr = section.getBoundingClientRect()
    const topDoc = sr.top - br.top + body.scrollTop
    const bottomDoc =
      i + 1 < sections.length
        ? sections[i + 1]!.getBoundingClientRect().top - br.top + body.scrollTop
        : bodyH
    let y0 = Math.floor(topDoc * ratio)
    let y1 = Math.ceil(bottomDoc * ratio)
    y0 = Math.max(0, Math.min(y0, full.height - 1))
    y1 = Math.max(y0 + 1, Math.min(y1, full.height))
    const sliceH = y1 - y0
    const sub = document.createElement('canvas')
    sub.width = full.width
    sub.height = sliceH
    const ctx = sub.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    ctx.drawImage(full, 0, y0, full.width, sliceH, 0, 0, full.width, sliceH)
    out.push(sub)
  }
  return out
}

async function renderPrintHtmlToPdfFile(html: string, filename: string): Promise<void> {
  const iframe = document.createElement('iframe')
  /**
   * Chrome often under-lays out or skips painting in far off-screen / `opacity:0` iframes.
   * Keep a barely visible frame in the viewport so the document (and Google Charts) actually render.
   */
  iframe.setAttribute('aria-hidden', 'true')
  iframe.tabIndex = -1
  iframe.style.cssText = `position:fixed;left:0;top:0;width:${PRINT_VIEWPORT_CSS_PX}px;height:min(9200px,320vh);max-height:9200px;border:0;margin:0;padding:0;opacity:0.02;z-index:2147483646;pointer-events:none;overflow:hidden`
  document.body.appendChild(iframe)

  try {
    const idoc = await waitForIframeReady(iframe, html)

    await waitForTimelineRendered(idoc)
    await waitForDocumentImagesDecoded(idoc)

    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
    const body = idoc.body
    void body.offsetWidth
    void idoc.documentElement.getBoundingClientRect()

    const sections = collectPrintSections(idoc)

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

    const bodyH = Math.max(body.scrollHeight, body.offsetHeight, 400)

    if (sections.length > 0) {
      const fullCanvas = await html2canvas(body, {
        scale: HTML2CANVAS_SCALE,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: PRINT_VIEWPORT_CSS_PX,
        windowHeight: bodyH,
      })
      const slices = sliceSectionCanvases(fullCanvas, body, sections)
      const blankFlags = slices.map(isPrintSliceMostlyBlank)
      const hasAnyNonBlank = blankFlags.some((b) => !b)
      let pageAdded = false
      for (let i = 0; i < slices.length; i++) {
        const canvas = slices[i]!
        if (blankFlags[i] && (hasAnyNonBlank || i > 0)) continue
        if (pageAdded) pdf.addPage()
        pageAdded = true
        const firstSection = sections[0]
        const sectionEl = sections[i]!
        const totalsBand =
          i === 0 && firstSection
            ? totalsBlockBandInSectionSliceCanvasPx(firstSection, body, canvas.height, HTML2CANVAS_SCALE)
            : null
        const footerBrandBand =
          i === sections.length - 1
            ? footerBrandBandInSectionSliceCanvasPx(sectionEl, body, canvas.height, HTML2CANVAS_SCALE)
            : null
        const avoidSplitBands = [totalsBand, footerBrandBand].filter(Boolean) as {
          top: number
          bottom: number
        }[]
        /** First section: keep totals on one page; last: keep `.bv-footer-brand` intact; © sits below raster. */
        addCanvasToPdfPaged(pdf, canvas, {
          avoidSplitBands,
        })
      }
    } else {
      const canvas = await html2canvas(body, {
        scale: HTML2CANVAS_SCALE,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: body.scrollWidth,
        height: body.scrollHeight,
        windowWidth: PRINT_VIEWPORT_CSS_PX,
        windowHeight: bodyH,
      })
      const footerBandPx = footerBandCanvasPx(body, canvas.height, HTML2CANVAS_SCALE)
      addCanvasToPdfPaged(pdf, canvas, {
        avoidSplitBands: footerBandPx ? [footerBandPx] : [],
      })
    }

    addPageNumberFooters(pdf)
    pdf.save(filename)
  } finally {
    iframe.remove()
  }
}

export async function downloadQuotePdf(quote: Quote, filename?: string) {
  const html = buildQuotePrintHtml(quote)
  await renderPrintHtmlToPdfFile(html, filename ?? `quote-${quote.id}.pdf`)
}

export async function downloadInvoicePdf(invoice: Invoice, filename?: string) {
  const html = buildInvoicePrintHtml(invoice)
  await renderPrintHtmlToPdfFile(html, filename ?? `invoice-${invoice.id}.pdf`)
}

function auditFilenameSlug(audit: Audit): string {
  const parts = [audit.target, audit.title]
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter((s) => s.length > 0)
  if (parts.length === 0) return `audit-${audit.id}`
  return `audit-${parts.join('-')}`
}

export async function downloadAuditPdf(audit: Audit, filename?: string) {
  const html = buildAuditPrintHtml(audit)
  await renderPrintHtmlToPdfFile(html, filename ?? `${auditFilenameSlug(audit)}.pdf`)
}
