import { jsPDF } from 'jspdf'
import type { Quote, Invoice, LineItem } from '../../api/admin-api'

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

export function downloadQuotePdf(quote: Quote, filename?: string) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Quote', 14, 20)
  doc.setFontSize(10)
  doc.text(`Client: ${quote.clientName}`, 14, 28)
  doc.text(`Email: ${quote.clientEmail}`, 14, 34)
  doc.text(`Status: ${quote.status}`, 14, 40)
  doc.text(`Date: ${quote.createdAt ?? '—'}`, 14, 46)
  let y = 56
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
