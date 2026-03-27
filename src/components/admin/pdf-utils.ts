import { jsPDF } from 'jspdf'
import type { Quote, Invoice, LineItem } from '../../api/admin-api'
import logoSrc from '../../assets/icon-only-transparent-no-buffer.png'

async function loadImageDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function addLineItems(doc: jsPDF, lineItems: LineItem[], startY: number): number {
  let y = startY
  doc.setFontSize(10)
  lineItems.forEach((item) => {
    doc.text(item.description, 14, y, { maxWidth: 100 })
    doc.text(String(item.quantity), 120, y)
    doc.text(item.unitPrice.toFixed(2), 140, y)
    doc.text(item.amount.toFixed(2), 170, y)
    y += 6
  })
  return y
}

export async function downloadQuotePdf(quote: Quote, filename?: string) {
  const doc = new jsPDF()
  const logoDataUrl = await loadImageDataUrl(logoSrc)
  doc.addImage(logoDataUrl, 'PNG', 14, 10, 12, 12)
  doc.setFontSize(11)
  doc.setTextColor(9, 86, 190)
  doc.text('Byteverse', 29, 16)
  doc.setTextColor(17, 17, 17)
  doc.setFontSize(17)
  doc.text('Quote', 29, 23)
  doc.setFontSize(9)
  doc.setTextColor(85, 85, 85)
  doc.text('reach@byteverseinnov.com', 29, 28)
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`Client: ${quote.clientName}`, 14, 38)
  doc.text(`Email: ${quote.clientEmail}`, 14, 44)
  doc.text(`Status: ${quote.status}`, 14, 50)
  doc.text(`Date: ${quote.createdAt ?? '—'}`, 14, 56)
  let y = 66
  doc.setFontSize(11)
  doc.text('Line items', 14, y)
  y += 8
  doc.setFontSize(9)
  doc.text('Description', 14, y)
  doc.text('Qty', 120, y)
  doc.text('Unit price', 140, y)
  doc.text('Amount', 170, y)
  y += 6
  y = addLineItems(doc, quote.lineItems ?? [], y)
  y += 6
  doc.setFontSize(11)
  doc.text(`Total: $${(quote.total ?? 0).toFixed(2)}`, 14, y)
  y += 8
  const events = quote.timelineEvents?.filter((e) => e.chartLabel) ?? []
  if (events.length > 0) {
    if (y > 250) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(11)
    doc.text('Timeline & scope', 14, y)
    y += 7
    doc.setFontSize(9)
    for (const ev of events) {
      const head = `${ev.chartLabel} (${ev.startDate?.slice(0, 10) ?? '—'} → ${ev.endDate?.slice(0, 10) ?? '—'})`
      const lines = doc.splitTextToSize(head, 180)
      doc.text(lines, 14, y)
      y += lines.length * 5 + 1
      if (ev.description?.trim()) {
        const body = doc.splitTextToSize(ev.description.trim(), 176)
        doc.text(body, 18, y)
        y += body.length * 4 + 4
      }
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    }
  }
  if (quote.quoteAssetsPrefix) {
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text(`Client package (S3): ${quote.quoteAssetsPrefix}`, 14, y)
    doc.setTextColor(0)
  }
  const year = new Date().getFullYear()
  if (y > 280) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text(`© ${year} Byteverse. All rights reserved.`, 14, 288)
  doc.setTextColor(0)
  doc.save(filename ?? `quote-${quote.id}.pdf`)
}

export function downloadInvoicePdf(invoice: Invoice, filename?: string) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Invoice', 14, 20)
  doc.setFontSize(10)
  doc.text(`Client: ${invoice.clientName}`, 14, 28)
  doc.text(`Email: ${invoice.clientEmail}`, 14, 34)
  doc.text(`Status: ${invoice.status}`, 14, 40)
  doc.text(`Due: ${invoice.dueDate ?? '—'}`, 14, 46)
  doc.text(`Paid: ${invoice.paidAt ?? '—'}`, 14, 52)
  let y = 62
  doc.setFontSize(11)
  doc.text('Line items', 14, y)
  y += 8
  doc.setFontSize(9)
  doc.text('Description', 14, y)
  doc.text('Qty', 120, y)
  doc.text('Unit price', 140, y)
  doc.text('Amount', 170, y)
  y += 6
  y = addLineItems(doc, invoice.lineItems ?? [], y)
  y += 6
  doc.setFontSize(11)
  doc.text(`Total: $${(invoice.total ?? 0).toFixed(2)}`, 14, y)
  doc.save(filename ?? `invoice-${invoice.id}.pdf`)
}
