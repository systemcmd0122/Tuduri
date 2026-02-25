export type PaperType = 'A4' | 'A3' | 'B4' | 'B5' | 'custom'
export type PaperOrientation = 'portrait' | 'landscape'

export interface EditorSettings {
  // Writing mode
  writingMode: 'vertical' | 'horizontal'

  // Paper settings (mm)
  paperType: PaperType
  paperOrientation: PaperOrientation
  paperWidth: number
  paperHeight: number
  marginTop: number
  marginBottom: number
  marginRight: number
  marginLeft: number

  // Column settings
  columns: number
  columnGap: number

  // Font settings
  fontFamily: string
  fontSize: number
  lineHeight: number
  fontWeight: number

  // Display toggles
  showGuidelines: boolean
  showSafeArea: boolean
  showRuler: boolean
  showSectionMarkers: boolean
  showRowLines: boolean

  // Row line settings
  rowLineColor: string
  rowLineOpacity: number
}

export interface EditorState {
  content: string
  settings: EditorSettings
  undoStack: string[]
  redoStack: string[]
  isDirty: boolean
  activeTemplate: string | null
}

export type TemplateKey =
  | 'shikiji'
  | 'shukuji'
  | 'chouji'
  | 'souji'
  | 'touji'
  | 'kanreki'
  | 'jigyou_aisatsu'
  | 'pta_aisatsu'
  | 'kanchouji'
  | 'shunin_aisatsu'
  | 'blank'

export interface Template {
  key: TemplateKey
  label: string
  description: string
  content: string
}

export const DEFAULT_SETTINGS: EditorSettings = {
  writingMode: 'vertical',
  paperType: 'A4',
  paperOrientation: 'portrait',
  paperWidth: 210,
  paperHeight: 297,
  marginTop: 30,
  marginBottom: 30,
  marginRight: 30,
  marginLeft: 30,
  columns: 1,
  columnGap: 20,
  fontFamily: 'Noto Serif JP',
  fontSize: 24,
  lineHeight: 2.0,
  fontWeight: 400,
  showGuidelines: false,
  showSafeArea: false,
  showRuler: true,
  showSectionMarkers: false,
  showRowLines: false,
  rowLineColor: '#8b7355',
  rowLineOpacity: 0.25,
}

export const FONT_OPTIONS = [
  { value: 'Noto Serif JP', label: 'Noto Serif JP' },
  { value: 'Yu Mincho', label: '游明朝' },
  { value: 'Yu Gothic', label: '游ゴシック' },
  { value: 'Hiragino Mincho ProN', label: 'ヒラギノ明朝' },
  { value: 'MS Mincho', label: 'MS 明朝' },
] as const

export const FONT_WEIGHT_OPTIONS = [
  { value: 300, label: '細字' },
  { value: 400, label: '標準' },
  { value: 500, label: '中太' },
  { value: 700, label: '太字' },
  { value: 900, label: '極太' },
] as const

export const MM_TO_PX = 3.7795275591

export const PAPER_PRESETS: Record<Exclude<PaperType, 'custom'>, { portrait: [number, number]; landscape: [number, number] }> = {
  A4: { portrait: [210, 297], landscape: [297, 210] },
  A3: { portrait: [297, 420], landscape: [420, 297] },
  B4: { portrait: [257, 364], landscape: [364, 257] },
  B5: { portrait: [182, 257], landscape: [257, 182] },
}
