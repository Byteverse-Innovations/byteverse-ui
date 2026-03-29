import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { Quote, Invoice } from '../../api/admin-api'
import { buildInvoicePrintHtml, buildQuotePrintHtml } from '../../lib/quote-print-html'

const CHART_POLL_MS = 200
const CHART_MAX_WAIT_MS = 90_000
/** Match Puppeteer sleep in ms-billing render (~5500ms) for Google Charts + axis labels. */
const POST_CHART_SETTLE_MS = 5800

function addCanvasToPdfPaged(pdf: jsPDF, canvas: HTMLCanvasElement) {
  const margin = 14
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const contentW = pageW - margin * 2
  const contentH = pageH - margin * 2
  const imgHmm = (canvas.height * contentW) / canvas.width
  let mmDone = 0
  let pageIndex = 0
  while (mmDone < imgHmm - 0.01) {
    if (pageIndex > 0) pdf.addPage()
    const mmThisPage = Math.min(contentH, imgHmm - mmDone)
    const srcY = (mmDone / imgHmm) * canvas.height
    const srcH = (mmThisPage / imgHmm) * canvas.height
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = Math.max(1, Math.ceil(srcH))
    const ctx = slice.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, mmThisPage)
    mmDone += mmThisPage
    pageIndex++
  }
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
  iframe.style.cssText =
    'position:fixed;left:-12000px;top:0;width:1200px;height:8000px;border:0;opacity:0;pointer-events:none'
  document.body.appendChild(iframe)
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('iframe load timeout')), 75_000)
      iframe.onload = () => {
        window.clearTimeout(timer)
        resolve()
      }
      iframe.srcdoc = html
    })

    const idoc = iframe.contentDocument
    if (!idoc?.body) throw new Error('Print iframe has no document')

    await waitForTimelineRendered(idoc)

    const body = idoc.body
    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: body.scrollWidth,
      height: body.scrollHeight,
      windowWidth: body.scrollWidth,
      windowHeight: body.scrollHeight,
    })

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    addCanvasToPdfPaged(pdf, canvas)
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
