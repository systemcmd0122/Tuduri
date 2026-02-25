"use client"

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { useEditor } from '@/lib/editor-store'
import { MM_TO_PX } from '@/lib/editor-types'
import { paginateContent } from '@/lib/utils'

interface PageProps {
  content: string
  index: number
  isVertical: boolean
  settings: any
  onInput: (text: string) => void
  onFocus: () => void
  onBlur: () => void
}

const Page = React.memo(({ content, index, isVertical, settings, onInput, onFocus, onBlur }: PageProps) => {
  const editableRef = useRef<HTMLDivElement>(null)

  const paperWidthPx = settings.paperWidth * MM_TO_PX
  const paperHeightPx = settings.paperHeight * MM_TO_PX
  const marginTopPx = settings.marginTop * MM_TO_PX
  const marginBottomPx = settings.marginBottom * MM_TO_PX
  const marginRightPx = settings.marginRight * MM_TO_PX
  const marginLeftPx = settings.marginLeft * MM_TO_PX
  const rowLineSpacing = settings.fontSize * settings.lineHeight

  // Sync content to editable div
  useEffect(() => {
    if (editableRef.current && editableRef.current.innerText !== content) {
      // Save selection before update
      const selection = window.getSelection()
      let savedSelection: { node: Node, offset: number } | null = null

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (editableRef.current.contains(range.startContainer)) {
          savedSelection = {
            node: range.startContainer,
            offset: range.startOffset
          }
        }
      }

      editableRef.current.innerText = content

      // Restore selection if it was in this page and the node still exists
      if (savedSelection && selection && editableRef.current.contains(savedSelection.node)) {
        try {
          const range = document.createRange()
          const maxOffset = savedSelection.node.textContent?.length || 0
          range.setStart(savedSelection.node, Math.min(savedSelection.offset, maxOffset))
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        } catch (e) {
          // Fallback to end of page if node is gone or offset invalid
        }
      }
    }
  }, [content])

  return (
    <div
      className="relative bg-card shadow-lg mb-8 last:mb-0 transition-all duration-200 page-container group"
      style={{
        width: `${paperWidthPx}px`,
        height: `${paperHeightPx}px`,
        border: '1px solid var(--border)',
      }}
    >
      {/* Page number indicator */}
      <div className="no-print absolute -left-10 top-0 text-muted-foreground/40 text-xs font-mono select-none group-hover:text-muted-foreground transition-colors">
        P.{index + 1}
      </div>

      {/* Safe area indicator */}
      {settings.showSafeArea && (
        <div
          className="no-print absolute pointer-events-none safe-area z-10"
          style={{
            top: `${marginTopPx}px`,
            right: `${marginRightPx}px`,
            bottom: `${marginBottomPx}px`,
            left: `${marginLeftPx}px`,
          }}
        />
      )}

      {/* Row Lines overlay */}
      {settings.showRowLines && (
        <div
          className="absolute inset-0 pointer-events-none z-5"
          style={{
            top: `${marginTopPx}px`,
            right: `${marginRightPx}px`,
            bottom: `${marginBottomPx}px`,
            left: `${marginLeftPx}px`,
          }}
        >
          {isVertical ? (
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {Array.from({ length: Math.ceil((paperWidthPx - marginLeftPx - marginRightPx) / rowLineSpacing) + 1 }).map((_, i) => {
                const contentWidth = paperWidthPx - marginLeftPx - marginRightPx
                const x = contentWidth - (i * rowLineSpacing)
                if (x < -1) return null
                return (
                  <line key={i} x1={x} y1={0} x2={x} y2="100%" stroke={settings.rowLineColor} strokeOpacity={settings.rowLineOpacity} strokeWidth="0.75" />
                )
              })}
            </svg>
          ) : (
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {Array.from({ length: Math.ceil((paperHeightPx - marginTopPx - marginBottomPx) / rowLineSpacing) + 1 }).map((_, i) => {
                const y = i * rowLineSpacing
                return (
                  <line key={i} x1={0} y1={y} x2="100%" y2={y} stroke={settings.rowLineColor} strokeOpacity={settings.rowLineOpacity} strokeWidth="0.75" />
                )
              })}
            </svg>
          )}
        </div>
      )}

      {/* Guidelines */}
      {settings.showGuidelines && settings.columns > 1 && (
        <div
          className="no-print absolute inset-0 pointer-events-none z-10 flex"
          style={{
            flexDirection: isVertical ? 'row' : 'column',
            padding: `${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px`,
            gap: `${settings.columnGap * MM_TO_PX}px`,
          }}
        >
          {Array.from({ length: settings.columns }).map((_, i) => (
            <div
              key={i}
              className="flex-1 guide-line"
              style={
                i < settings.columns - 1
                  ? isVertical
                    ? { borderRight: '1px dashed oklch(0.70 0.06 200 / 0.3)' }
                    : { borderBottom: '1px dashed oklch(0.70 0.06 200 / 0.3)' }
                  : {}
              }
            />
          ))}
        </div>
      )}

      {/* Editable content area */}
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        className={`
          outline-none jp-text w-full h-full
          ${isVertical ? 'writing-vertical' : 'writing-horizontal'}
        `}
        style={{
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}px`,
          fontWeight: settings.fontWeight,
          lineHeight: settings.lineHeight,
          paddingTop: `${marginTopPx}px`,
          paddingBottom: `${marginBottomPx}px`,
          paddingRight: `${marginRightPx}px`,
          paddingLeft: `${marginLeftPx}px`,
          color: 'var(--canvas-foreground)',
          columnCount: !isVertical && settings.columns > 1 ? settings.columns : undefined,
          columnGap: !isVertical && settings.columns > 1 ? `${settings.columnGap * MM_TO_PX}px` : undefined,
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
        }}
        onInput={(e) => onInput(e.currentTarget.innerText)}
        onFocus={onFocus}
        onBlur={onBlur}
        role="textbox"
        aria-label={`ページ ${index + 1}`}
        aria-multiline="true"
      />
    </div>
  )
})

Page.displayName = 'Page'

export default function EditorCanvas() {
  const { state, setContent } = useEditor()
  const { settings, content } = state
  const [isFocused, setIsFocused] = useState(false)
  const [activePageIndex, setActivePageIndex] = useState(0)

  const isVertical = settings.writingMode === 'vertical'

  const pages = useMemo(() => {
    return paginateContent(content, settings)
  }, [content, settings])

  const handlePageInput = useCallback((index: number, pageContent: string) => {
    const newPages = [...pages]
    newPages[index] = pageContent
    // Use join('') because paginateContent splits lines carefully without losing characters
    setContent(newPages.join(''))
  }, [pages, setContent])

  // Ruler marks
  const paperWidthPx = settings.paperWidth * MM_TO_PX
  const paperHeightPx = settings.paperHeight * MM_TO_PX
  const marginLeftPx = settings.marginLeft * MM_TO_PX

  const rulerMarks = useMemo(() => {
    const marks: { pos: number; label: string; isMajor: boolean }[] = []
    const rulerLength = Math.max(paperWidthPx, paperHeightPx, 2000)
    for (let i = 0; i <= rulerLength; i += 10 * MM_TO_PX) {
      const mm = Math.round(i / MM_TO_PX)
      const isMajor = mm % 50 === 0
      marks.push({ pos: i, label: isMajor ? `${mm}` : '', isMajor })
    }
    return marks
  }, [paperWidthPx, paperHeightPx])

  return (
    <div className="flex-1 flex relative overflow-hidden bg-muted/30" id="editor-scroll-area">
      {/* Dynamic Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: ${settings.paperWidth}mm ${settings.paperHeight}mm;
            margin: 0;
          }
        }
      ` }} />

      {/* Scrollable canvas area */}
      <div className="flex-1 flex flex-col items-center overflow-auto p-12 pt-6">
        <div className="relative flex flex-col items-center min-h-full">
          {/* Horizontal Ruler */}
          {settings.showRuler && !isVertical && (
            <div
              className="ruler flex items-end mb-4 select-none relative shrink-0"
              style={{
                width: `${paperWidthPx}px`,
                height: '20px',
                marginLeft: `${marginLeftPx}px`,
              }}
            >
              {rulerMarks.map((mark, i) => (
                <div key={i} className="absolute flex flex-col items-center" style={{ left: `${mark.pos}px` }}>
                  <span className="text-muted-foreground leading-none" style={{ fontSize: '8px' }}>{mark.label}</span>
                  <div className="bg-muted-foreground/40" style={{ width: '1px', height: mark.isMajor ? '8px' : '4px' }} />
                </div>
              ))}
            </div>
          )}

          {/* Vertical stack of pages */}
          <div id="print-canvas" className="flex flex-col items-center">
            {pages.map((pageContent, i) => (
              <React.Fragment key={i}>
                <Page
                  content={pageContent}
                  index={i}
                  isVertical={isVertical}
                  settings={settings}
                  onInput={(text) => handlePageInput(i, text)}
                  onFocus={() => {
                    setIsFocused(true)
                    setActivePageIndex(i)
                  }}
                  onBlur={() => setIsFocused(false)}
                />
                <div className="page-break print-only" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Vertical Ruler */}
      {settings.showRuler && isVertical && (
        <div
          className="no-print absolute top-0 right-0 h-full select-none z-20 pointer-events-none bg-muted/60 backdrop-blur-sm"
          style={{ width: '28px', borderLeft: '1px solid var(--border)' }}
        >
          <div className="relative h-full" style={{ paddingTop: '24px' }}>
            {rulerMarks.map((mark, i) => {
              if (mark.pos > 5000) return null
              return (
                <div key={i} className="absolute flex items-center" style={{ top: `${mark.pos + 24}px`, right: '2px' }}>
                  <div className="bg-muted-foreground/50" style={{ height: '1px', width: mark.isMajor ? '10px' : '5px' }} />
                  {mark.label && <span className="text-muted-foreground leading-none absolute" style={{ fontSize: '7px', right: '14px', transform: 'translateX(-50%)' }}>{mark.label}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
