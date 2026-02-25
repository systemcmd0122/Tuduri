"use client"

import { MM_TO_PX } from './editor-types'
import type { EditorSettings } from './editor-types'

export async function exportToPNG(
  canvasElement: HTMLElement,
  settings: EditorSettings
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas')
  
  const canvas = await html2canvas(canvasElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: canvasElement.scrollWidth,
    height: canvasElement.scrollHeight,
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
  const paperHeightMM = settings.paperHeight

  const pdf = new jsPDF({
    orientation: paperHeightMM >= paperWidthMM ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [paperWidthMM, paperHeightMM],
  })

  // Find all page containers
  const pageElements = canvasElement.querySelectorAll('.page-container')

  if (pageElements.length === 0) {
    // Fallback to capturing the whole canvas as one page if no .page-container found
    const canvas = await html2canvas(canvasElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, paperWidthMM, paperHeightMM)
  } else {
    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) pdf.addPage([paperWidthMM, paperHeightMM])

      const pageEl = pageElements[i] as HTMLElement
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: paperWidthMM * MM_TO_PX,
        height: paperHeightMM * MM_TO_PX,
      })

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, paperWidthMM, paperHeightMM)
    }
  }

  pdf.save(`shikiji-${Date.now()}.pdf`)
}

export function printDocument(): void {
  window.print()
}
