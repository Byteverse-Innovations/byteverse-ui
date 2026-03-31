import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { Quote, Invoice } from '../../api/admin-api'
import { QUOTE_PRINT_LOGO_PUBLIC_PATH } from '../../lib/quote-print-branding'
import { buildInvoicePrintHtml, buildQuotePrintHtml } from '../../lib/quote-print-html'

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
 * Footer band in html2canvas pixel Y (0 = top of capture), so paging can avoid splitting it across PDF pages.
 */
function footerBandCanvasPx(
  idoc: Document,
  body: HTMLElement,
  canvasHeightPx: number,
  scale: number
): { top: number; bottom: number } | null {
  const el = idoc.querySelector('.bv-footer-brand') as HTMLElement | null
  if (!el) return null
  void el.offsetWidth
  const br = body.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  const top = (er.top - br.top + body.scrollTop) * scale
  const bottom = (er.bottom - br.top + body.scrollTop) * scale
  const t = Math.max(0, Math.min(top, canvasHeightPx))
  const b = Math.max(t + 1, Math.min(bottom, canvasHeightPx))
  if (b - t < 2) return null
  return { top: t, bottom: b }
}

function addCanvasToPdfPaged(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  footerBandPx: { top: number; bottom: number } | null
) {
  const margin = PDF_MARGIN_MM
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const contentW = pageW - margin * 2
  const contentH = pageH - margin * 2
  const imgHmm = (canvas.height * contentW) / canvas.width
  const pagePx = (contentH / imgHmm) * canvas.height

  let srcY = 0
  let pageIndex = 0

  while (srcY < canvas.height - 0.5) {
    if (pageIndex > 0) pdf.addPage()

    let sliceH = Math.min(pagePx, canvas.height - srcY)

    if (footerBandPx) {
      const { top: ft, bottom: fb } = footerBandPx
      const sliceEnd = srcY + sliceH
      // Slice would start above the footer but end inside it — end this page before the footer.
      if (srcY < ft && sliceEnd > ft && sliceEnd < fb) {
        sliceH = ft - srcY
      } else if (srcY >= ft && srcY < fb) {
        // Slice starts inside the footer — take at least the full footer when it fits one page.
        const need = fb - srcY
        if (need <= pagePx + 1) {
          sliceH = Math.max(sliceH, need)
        }
        sliceH = Math.min(sliceH, canvas.height - srcY)
      }
    }

    if (sliceH < 1) {
      sliceH = Math.min(pagePx, canvas.height - srcY)
    }
    if (sliceH < 0.5) break

    const mmThisPage = (sliceH / canvas.height) * imgHmm

    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = Math.max(1, Math.ceil(sliceH))
    const ctx = slice.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, mmThisPage)

    srcY += sliceH
    pageIndex++
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

async function renderPrintHtmlToPdfFile(html: string, filename: string): Promise<void> {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = `position:fixed;left:-10000px;top:0;width:${PRINT_VIEWPORT_CSS_PX}px;height:8000px;border:0;opacity:0;pointer-events:none`
  document.body.appendChild(iframe)

  try {
    const htmlForIframe = preparePrintHtmlForSrcdoc(html)

    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('iframe load timeout')), 75_000)
      iframe.onload = () => {
        window.clearTimeout(timer)
        resolve()
      }
      iframe.srcdoc = htmlForIframe
    })

    const idoc = iframe.contentDocument
    if (!idoc?.body) throw new Error('Print iframe document has no body')

    await waitForTimelineRendered(idoc)
    await waitForDocumentImagesDecoded(idoc)

    const body = idoc.body
    const canvas = await html2canvas(body, {
      scale: HTML2CANVAS_SCALE,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: body.scrollWidth,
      height: body.scrollHeight,
      windowWidth: PRINT_VIEWPORT_CSS_PX,
      windowHeight: body.scrollHeight,
    })

    const footerBandPx = footerBandCanvasPx(idoc, body, canvas.height, HTML2CANVAS_SCALE)

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    addCanvasToPdfPaged(pdf, canvas, footerBandPx)
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
