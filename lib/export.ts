"use client"

import { MM_TO_PX } from './editor-types'
import type { EditorSettings } from './editor-types'

export async function exportToPNG(
  canvasElement: HTMLElement,
  settings: EditorSettings
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas')
  
  const canvas = await html2canvas(canvasElement, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })
  
  const link = document.createElement('a')
  link.download = `shikiji-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportToPDF(
  canvasElement: HTMLElement,
  settings: EditorSettings
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas')
  const { jsPDF } = await import('jspdf')

  const paperWidthMM = settings.paperWidth
  // For the scroll paper, height is determined by content
  const canvasRect = canvasElement.getBoundingClientRect()
  const aspectRatio = canvasRect.height / canvasRect.width
  const paperHeightMM = paperWidthMM * aspectRatio

  const canvas = await html2canvas(canvasElement, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const pdf = new jsPDF({
    orientation: paperHeightMM > paperWidthMM ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [paperWidthMM, paperHeightMM],
  })

  const imgData = canvas.toDataURL('image/png')
  pdf.addImage(imgData, 'PNG', 0, 0, paperWidthMM, paperHeightMM)
  pdf.save(`shikiji-${Date.now()}.pdf`)
}

export function printDocument(canvasElement: HTMLElement): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n')
      } catch {
        return ''
      }
    })
    .join('\n')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>式辞 - 印刷</title>
      <style>
        ${styles}
        @page { margin: 0; }
        body { margin: 0; padding: 0; background: white; }
        .no-print { display: none !important; }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap" rel="stylesheet">
    </head>
    <body>
      ${canvasElement.outerHTML}
    </body>
    </html>
  `)
  printWindow.document.close()
  
  // Wait for fonts to load
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 1000)
}
