import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function paginateContent(
  text: string,
  settings: {
    writingMode: 'vertical' | 'horizontal'
    paperWidth: number
    paperHeight: number
    marginTop: number
    marginBottom: number
    marginRight: number
    marginLeft: number
    fontSize: number
    lineHeight: number
  }
) {
  const {
    writingMode,
    paperWidth,
    paperHeight,
    marginTop,
    marginBottom,
    marginRight,
    marginLeft,
    fontSize,
    lineHeight,
  } = settings

  const MM_TO_PX = 3.7795275591
  const fontSizeMM = fontSize / MM_TO_PX

  const availWidthMM = paperWidth - marginLeft - marginRight
  const availHeightMM = paperHeight - marginTop - marginBottom

  let charsPerLine: number
  let linesPerPage: number

  if (writingMode === 'vertical') {
    charsPerLine = Math.floor(availHeightMM / (fontSizeMM * 1.05))
    linesPerPage = Math.floor(availWidthMM / (fontSizeMM * lineHeight))
  } else {
    charsPerLine = Math.floor(availWidthMM / (fontSizeMM * 0.9))
    linesPerPage = Math.floor(availHeightMM / (fontSizeMM * lineHeight))
  }

  linesPerPage = Math.max(1, linesPerPage)
  charsPerLine = Math.max(1, charsPerLine)

  const pages: string[] = []
  if (!text) return ['']

  const lines = text.split('\n')
  let currentText = ""
  let currentRows = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let remainingLine = line
    let isFirstChunkOfOriginalLine = true

    while (remainingLine.length > 0 || line === "") {
      const rowsAvailable = linesPerPage - currentRows
      const charsAvailable = rowsAvailable * charsPerLine

      if (charsAvailable <= 0) {
        if (currentText !== "") pages.push(currentText)
        currentText = ""
        currentRows = 0
        continue
      }

      const chunk = remainingLine.slice(0, charsAvailable)
      const chunkRows = Math.ceil(Math.max(1, chunk.length) / charsPerLine)

      // If this is the start of a new original line, add a newline if not at start of page
      if (isFirstChunkOfOriginalLine && i > 0 && currentText !== "" && !currentText.endsWith('\n')) {
        currentText += "\n"
      }

      currentText += chunk
      currentRows += chunkRows
      remainingLine = remainingLine.slice(charsAvailable)
      isFirstChunkOfOriginalLine = false

      if (line === "") break // Handle empty lines

      if (currentRows >= linesPerPage && remainingLine.length > 0) {
        pages.push(currentText)
        currentText = ""
        currentRows = 0
      }
    }
  }

  if (currentText !== "" || pages.length === 0) {
    pages.push(currentText)
  }

  return pages
}
