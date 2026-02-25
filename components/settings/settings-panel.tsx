"use client"

import React from 'react'
import { useEditor } from '@/lib/editor-store'
import { FONT_OPTIONS, FONT_WEIGHT_OPTIONS, PAPER_PRESETS, type PaperType, type PaperOrientation } from '@/lib/editor-types'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Type,
  Ruler,
  Columns2,
  Eye,
  FileText,
  ChevronRight,
  Grip,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

function SettingSection({ title, icon, children }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {icon}
        {title}
      </div>
      <div className="space-y-3 pl-1">
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs text-foreground/80 shrink-0">{label}</Label>
      <div className="flex-1 max-w-[160px]">{children}</div>
    </div>
  )
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { state, setSettings } = useEditor()
  const { settings } = state

  const handlePaperTypeChange = (type: PaperType) => {
    if (type === 'custom') {
      setSettings({ paperType: type })
      return
    }

    const [width, height] = PAPER_PRESETS[type][settings.paperOrientation]
    setSettings({
      paperType: type,
      paperWidth: width,
      paperHeight: height,
    })
  }

  const handleOrientationChange = (orientation: PaperOrientation) => {
    if (settings.paperType === 'custom') {
      setSettings({ paperOrientation: orientation })
      return
    }

    const [width, height] = PAPER_PRESETS[settings.paperType as Exclude<PaperType, 'custom'>][orientation]
    setSettings({
      paperOrientation: orientation,
      paperWidth: width,
      paperHeight: height,
    })
  }

  if (!open) return null

  return (
    <aside className="no-print w-72 border-l border-border bg-card flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium text-card-foreground">設定</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="設定パネルを閉じる"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Font Settings */}
          <SettingSection title="文字設定" icon={<Type className="size-3.5" />}>
            <SettingRow label="フォント">
              <Select
                value={settings.fontFamily}
                onValueChange={(v) => setSettings({ fontFamily: v })}
              >
                <SelectTrigger size="sm" className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <span className="text-xs">{f.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="文字サイズ">
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([v]) => setSettings({ fontSize: v })}
                  min={12}
                  max={48}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {settings.fontSize}
                </span>
              </div>
            </SettingRow>

            <SettingRow label="文字の太さ">
              <Select
                value={String(settings.fontWeight)}
                onValueChange={(v) => setSettings({ fontWeight: Number(v) })}
              >
                <SelectTrigger size="sm" className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHT_OPTIONS.map((w) => (
                    <SelectItem key={w.value} value={String(w.value)}>
                      <span className="text-xs" style={{ fontWeight: w.value }}>{w.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="行間">
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.lineHeight * 10]}
                  onValueChange={([v]) => setSettings({ lineHeight: v / 10 })}
                  min={10}
                  max={40}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {settings.lineHeight.toFixed(1)}
                </span>
              </div>
            </SettingRow>
          </SettingSection>

          <Separator />

          {/* Paper Settings */}
          <SettingSection title="用紙設定" icon={<FileText className="size-3.5" />}>
            <SettingRow label="用紙サイズ">
              <Select
                value={settings.paperType}
                onValueChange={(v) => handlePaperTypeChange(v as PaperType)}
              >
                <SelectTrigger size="sm" className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4"><span className="text-xs">A4 (210x297)</span></SelectItem>
                  <SelectItem value="A3"><span className="text-xs">A3 (297x420)</span></SelectItem>
                  <SelectItem value="B4"><span className="text-xs">B4 (257x364)</span></SelectItem>
                  <SelectItem value="B5"><span className="text-xs">B5 (182x257)</span></SelectItem>
                  <SelectItem value="custom"><span className="text-xs">カスタム</span></SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            {settings.paperType !== 'custom' && (
              <SettingRow label="向き">
                <div className="flex bg-muted rounded-md p-0.5">
                  <button
                    onClick={() => handleOrientationChange('portrait')}
                    className={`flex-1 text-[10px] py-1 px-2 rounded-sm transition-colors ${settings.paperOrientation === 'portrait' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    縦
                  </button>
                  <button
                    onClick={() => handleOrientationChange('landscape')}
                    className={`flex-1 text-[10px] py-1 px-2 rounded-sm transition-colors ${settings.paperOrientation === 'landscape' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    横
                  </button>
                </div>
              </SettingRow>
            )}

            <SettingRow label="用紙幅 (mm)">
              <Input
                type="number"
                value={settings.paperWidth}
                onChange={(e) => setSettings({ paperWidth: Number(e.target.value) || 210, paperType: 'custom' })}
                className="h-7 text-xs"
                min={50}
                max={2000}
              />
            </SettingRow>
            <SettingRow label="用紙高 (mm)">
              <Input
                type="number"
                value={settings.paperHeight}
                onChange={(e) => setSettings({ paperHeight: Number(e.target.value) || 297, paperType: 'custom' })}
                className="h-7 text-xs"
                min={50}
                max={5000}
              />
            </SettingRow>
          </SettingSection>

          <Separator />

          {/* Margin Settings */}
          <SettingSection title="余白設定" icon={<Ruler className="size-3.5" />}>
            <SettingRow label="上余白 (mm)">
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.marginTop]}
                  onValueChange={([v]) => setSettings({ marginTop: v })}
                  min={0}
                  max={80}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {settings.marginTop}
                </span>
              </div>
            </SettingRow>

            <SettingRow label="下余白 (mm)">
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.marginBottom]}
                  onValueChange={([v]) => setSettings({ marginBottom: v })}
                  min={0}
                  max={80}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {settings.marginBottom}
                </span>
              </div>
            </SettingRow>

            <SettingRow label="右余白 (mm)">
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.marginRight]}
                  onValueChange={([v]) => setSettings({ marginRight: v })}
                  min={0}
                  max={80}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {settings.marginRight}
                </span>
              </div>
            </SettingRow>

            <SettingRow label="左余白 (mm)">
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.marginLeft]}
                  onValueChange={([v]) => setSettings({ marginLeft: v })}
                  min={0}
                  max={80}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {settings.marginLeft}
                </span>
              </div>
            </SettingRow>
          </SettingSection>

          <Separator />

          {/* Column Settings */}
          <SettingSection title="段組設定" icon={<Columns2 className="size-3.5" />}>
            <SettingRow label="列数">
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.columns]}
                  onValueChange={([v]) => setSettings({ columns: v })}
                  min={1}
                  max={6}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {settings.columns}
                </span>
              </div>
            </SettingRow>

            {settings.columns > 1 && (
              <SettingRow label="段間 (mm)">
                <div className="flex items-center gap-2">
                  <Slider
                    value={[settings.columnGap]}
                    onValueChange={([v]) => setSettings({ columnGap: v })}
                    min={5}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {settings.columnGap}
                  </span>
                </div>
              </SettingRow>
            )}
          </SettingSection>

          <Separator />

          {/* Row Lines Settings (for 御巻紙) */}
          <SettingSection title="行間線 (御巻紙用)" icon={<Grip className="size-3.5" />}>
            <SettingRow label="行間線を表示">
              <Switch
                checked={settings.showRowLines}
                onCheckedChange={(v) => setSettings({ showRowLines: v })}
              />
            </SettingRow>

            {settings.showRowLines && (
              <>
                <SettingRow label="線の色">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.rowLineColor}
                      onChange={(e) => setSettings({ rowLineColor: e.target.value })}
                      className="w-7 h-7 rounded border border-border cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">
                      {settings.rowLineColor}
                    </span>
                  </div>
                </SettingRow>

                <SettingRow label="線の濃さ">
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[settings.rowLineOpacity * 100]}
                      onValueChange={([v]) => setSettings({ rowLineOpacity: v / 100 })}
                      min={5}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {Math.round(settings.rowLineOpacity * 100)}%
                    </span>
                  </div>
                </SettingRow>
              </>
            )}
          </SettingSection>

          <Separator />

          {/* Display Settings */}
          <SettingSection title="表示設定" icon={<Eye className="size-3.5" />}>
            <SettingRow label="ルーラー">
              <Switch
                checked={settings.showRuler}
                onCheckedChange={(v) => setSettings({ showRuler: v })}
              />
            </SettingRow>

            <SettingRow label="ガイドライン">
              <Switch
                checked={settings.showGuidelines}
                onCheckedChange={(v) => setSettings({ showGuidelines: v })}
              />
            </SettingRow>

            <SettingRow label="セーフエリア">
              <Switch
                checked={settings.showSafeArea}
                onCheckedChange={(v) => setSettings({ showSafeArea: v })}
              />
            </SettingRow>

            <SettingRow label="区切りマーカー">
              <Switch
                checked={settings.showSectionMarkers}
                onCheckedChange={(v) => setSettings({ showSectionMarkers: v })}
              />
            </SettingRow>
          </SettingSection>
        </div>
      </ScrollArea>

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          {state.content.length > 0
            ? `${state.content.length} 文字`
            : 'テンプレートを選択、または入力を開始'}
        </p>
      </div>
    </aside>
  )
}
