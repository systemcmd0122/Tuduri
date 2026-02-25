"use client"

import React, { useRef, useCallback, useState } from 'react'
import { useEditor } from '@/lib/editor-store'
import { exportToPNG, exportToPDF, printDocument } from '@/lib/export'
import { getTemplateList } from '@/lib/templates'
import { importFile, getAcceptedFileTypes } from '@/lib/file-import'
import { FONT_WEIGHT_OPTIONS } from '@/lib/editor-types'
import { FullScreenLoader } from '@/components/editor/loading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Undo2,
  Redo2,
  FileDown,
  ImageIcon,
  Printer,
  Settings,
  FileText,
  Type,
  Upload,
  Moon,
  Sun,
  Bold,
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface ToolbarProps {
  onToggleSettings: () => void
  settingsOpen: boolean
}

export default function Toolbar({ onToggleSettings, settingsOpen }: ToolbarProps) {
  const { state, undo, redo, canUndo, canRedo, loadTemplate, setContent, setSettings } = useEditor()
  const { settings } = state
  const { theme, setTheme } = useTheme()
  const templates = getTemplateList()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)

  const handleTemplateSelect = (key: string) => {
    const template = templates.find((t) => t.key === key)
    if (template) {
      loadTemplate(template.content, template.key)
    }
  }

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoadingMessage('ファイルを読み込み中...')

    try {
      const result = await importFile(file)
      if (result.success) {
        setContent(result.content)
      } else {
        alert(result.error ?? 'インポートに失敗しました')
      }
    } catch {
      alert('ファイルの読み込みに失敗しました')
    } finally {
      setLoadingMessage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [setContent])

  const handleExportPDF = async () => {
    setLoadingMessage('PDFを生成中...')
    try {
      const el = document.getElementById('print-canvas')
      if (el) await exportToPDF(el, settings)
    } finally {
      setLoadingMessage(null)
    }
  }

  const handleExportPNG = async () => {
    setLoadingMessage('PNG画像を生成中...')
    try {
      const el = document.getElementById('print-canvas')
      if (el) await exportToPNG(el, settings)
    } finally {
      setLoadingMessage(null)
    }
  }

  const handlePrint = () => {
    printDocument()
  }

  const toggleWritingMode = () => {
    setSettings({
      writingMode: settings.writingMode === 'vertical' ? 'horizontal' : 'vertical',
    })
  }

  const cycleFontWeight = () => {
    const currentIdx = FONT_WEIGHT_OPTIONS.findIndex(o => o.value === settings.fontWeight)
    const nextIdx = (currentIdx + 1) % FONT_WEIGHT_OPTIONS.length
    setSettings({ fontWeight: FONT_WEIGHT_OPTIONS[nextIdx].value })
  }

  const currentWeightLabel = FONT_WEIGHT_OPTIONS.find(o => o.value === settings.fontWeight)?.label ?? '標準'

  return (
    <>
      {loadingMessage && <FullScreenLoader message={loadingMessage} />}

      <header className="no-print flex items-center h-12 px-3 bg-toolbar border-b border-border gap-1 shrink-0 relative">
        {/* Logo / Title */}
        <div className="flex items-center gap-2 mr-2">
          <span className="text-sm font-medium text-toolbar-foreground tracking-wider font-serif">
            綴（つづり）
          </span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Template selector */}
        <div className="flex items-center gap-1 ml-2">
          <Select onValueChange={handleTemplateSelect}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SelectTrigger size="sm" className="w-36 h-8 text-xs bg-secondary/50 border-border/50">
                  <FileText className="size-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="テンプレート" />
                </SelectTrigger>
              </TooltipTrigger>
              <TooltipContent>テンプレートを選択</TooltipContent>
            </Tooltip>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  <span className="text-xs">{t.label}</span>
                  <span className="text-muted-foreground text-xs ml-1">- {t.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* File import button */}
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedFileTypes()}
            onChange={handleFileUpload}
            className="hidden"
            aria-label="ファイルを読み込み"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => fileInputRef.current?.click()}
                aria-label="ファイルを読み込み"
              >
                <Upload className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              ファイルを読み込み (.txt / .docx)
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={undo}
                disabled={!canUndo}
                aria-label="元に戻す"
              >
                <Undo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>元に戻す (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={redo}
                disabled={!canRedo}
                aria-label="やり直す"
              >
                <Redo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>やり直す (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Writing mode toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={settings.writingMode === 'vertical' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={toggleWritingMode}
              aria-label="縦書き/横書き切替"
            >
              {settings.writingMode === 'vertical' ? (
                <Type className="size-4 rotate-90" />
              ) : (
                <Type className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {settings.writingMode === 'vertical' ? '横書きに切替' : '縦書きに切替'}
          </TooltipContent>
        </Tooltip>

        {/* Font weight quick toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={settings.fontWeight >= 700 ? 'secondary' : 'ghost'}
              size="sm"
              onClick={cycleFontWeight}
              aria-label="文字の太さを変更"
              className="gap-1 px-2 h-8"
            >
              <Bold className="size-3.5" />
              <span className="text-xs">{currentWeightLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>文字の太さを変更 (クリックで切替)</TooltipContent>
        </Tooltip>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export buttons */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleExportPDF}
                aria-label="PDF出力"
              >
                <FileDown className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>PDF出力</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleExportPNG}
                aria-label="PNG出力"
              >
                <ImageIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>PNG出力</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handlePrint}
                aria-label="印刷"
              >
                <Printer className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>印刷</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="ダークモード切替"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {theme === 'dark' ? 'ライトモード' : 'ダークモード'}
          </TooltipContent>
        </Tooltip>

        {/* Settings toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={settingsOpen ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={onToggleSettings}
              aria-label="設定パネル"
            >
              <Settings className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>設定パネル</TooltipContent>
        </Tooltip>
      </header>
    </>
  )
}
