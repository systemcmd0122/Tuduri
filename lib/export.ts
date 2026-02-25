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
    width: settings.paperWidth * MM_TO_PX,
    height: canvasElement.offsetHeight, // Use actual height for PNG
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
  const paperHeightMM = settings.paperHeight || 297

  const canvas = await html2canvas(canvasElement, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: paperWidthMM * MM_TO_PX,
    height: paperHeightMM * MM_TO_PX,
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

export function printDocument(): void {
  window.print()
}
