import mammoth from 'mammoth'

export type SupportedFileType = '.txt' | '.docx' | '.doc'

const ACCEPTED_TYPES = '.txt,.doc,.docx'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function getAcceptedFileTypes(): string {
  return ACCEPTED_TYPES
}

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase()
}

async function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsText(file, 'UTF-8')
  })
}

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsArrayBuffer(file)
  })
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await readAsArrayBuffer(file)
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value.trim()
}

async function parseTxt(file: File): Promise<string> {
  const text = await readAsText(file)
  return text.trim()
}

export interface ImportResult {
  success: boolean
  content: string
  filename: string
  error?: string
}

export async function importFile(file: File): Promise<ImportResult> {
  const filename = file.name

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      content: '',
      filename,
      error: 'ファイルサイズが大きすぎます（最大10MB）',
    }
  }

  const ext = getFileExtension(filename)

  try {
    let content: string

    switch (ext) {
      case '.txt':
        content = await parseTxt(file)
        break
      case '.doc':
      case '.docx':
        content = await parseDocx(file)
        break
      default:
        return {
          success: false,
          content: '',
          filename,
          error: '対応していないファイル形式です。.txt、.doc、.docx ファイルをお使いください。',
        }
    }

    if (!content) {
      return {
        success: false,
        content: '',
        filename,
        error: 'ファイルの中身が空です',
      }
    }

    return {
      success: true,
      content,
      filename,
    }
  } catch (err) {
    return {
      success: false,
      content: '',
      filename,
      error: err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました',
    }
  }
}
