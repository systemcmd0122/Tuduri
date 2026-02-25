"use client"

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { useEditor } from '@/lib/editor-store'
import { MM_TO_PX } from '@/lib/editor-types'

export default function EditorCanvas() {
  const { state, setContent } = useEditor()
  const { settings } = state
  const canvasRef = useRef<HTMLDivElement>(null)
  const editableRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const isVertical = settings.writingMode === 'vertical'

  const paperWidthPx = settings.paperWidth * MM_TO_PX
  const paperHeightPx = settings.paperHeight * MM_TO_PX
  const marginTopPx = settings.marginTop * MM_TO_PX
  const marginBottomPx = settings.marginBottom * MM_TO_PX
  const marginRightPx = settings.marginRight * MM_TO_PX
  const marginLeftPx = settings.marginLeft * MM_TO_PX

  const handleInput = useCallback(() => {
    if (!editableRef.current) return
    const text = editableRef.current.innerText
    setContent(text)
  }, [setContent])

  // Sync content to editable div when it changes externally (template load, undo/redo)
  const lastContentRef = useRef(state.content)
  useEffect(() => {
    if (!editableRef.current) return
    if (editableRef.current.innerText !== state.content) {
      const selection = window.getSelection()
      editableRef.current.innerText = state.content
      if (selection && editableRef.current.childNodes.length > 0) {
        const range = document.createRange()
        range.selectNodeContents(editableRef.current)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
    lastContentRef.current = state.content
  }, [state.content])

  // Ruler marks
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

  // Row lines calculation for vertical writing
  // In vertical writing, "rows" are vertical columns going right-to-left
  // The line-height * fontSize determines the spacing between columns
  const rowLineSpacing = settings.fontSize * settings.lineHeight

  // Row lines for horizontal writing are horizontal lines
  // spaced by lineHeight * fontSize

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
      <div className="flex-1 flex items-start justify-center overflow-auto p-6">
        <div className="relative flex flex-col items-center">
          {/* Horizontal Ruler (for horizontal writing) */}
          {settings.showRuler && !isVertical && (
            <div
              className="ruler flex items-end mb-1 select-none relative"
              style={{
                width: `${paperWidthPx}px`,
                height: '20px',
                marginLeft: `${marginLeftPx}px`,
              }}
            >
              {rulerMarks.map((mark, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${mark.pos}px` }}
                >
                  <span className="text-muted-foreground leading-none" style={{ fontSize: '8px' }}>
                    {mark.label}
                  </span>
                  <div
                    className="bg-muted-foreground/40"
                    style={{
                      width: '1px',
                      height: mark.isMajor ? '8px' : '4px',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Paper Canvas */}
          <div
            ref={canvasRef}
            id="print-canvas"
            className="relative bg-card shadow-sm transition-all duration-200"
            style={{
              width: `${paperWidthPx}px`,
              height: isVertical ? `${paperHeightPx}px` : 'auto',
              minHeight: `${paperHeightPx}px`,
              border: '1px solid var(--border)',
            }}
          >
            {/* Safe area indicator */}
            {settings.showSafeArea && (
              <div
                className="absolute pointer-events-none safe-area z-10"
                style={{
                  top: `${marginTopPx}px`,
                  right: `${marginRightPx}px`,
                  bottom: `${marginBottomPx}px`,
                  left: `${marginLeftPx}px`,
                }}
              />
            )}

            {/* Row Lines overlay for 御巻紙 */}
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
                  /* Vertical writing: vertical lines going left from right edge */
                  <svg
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                  >
                    {Array.from({ length: Math.ceil((paperWidthPx - marginLeftPx - marginRightPx) / rowLineSpacing) + 1 }).map((_, i) => {
                      // In vertical-rl, lines are spaced from the right
                      const contentWidth = paperWidthPx - marginLeftPx - marginRightPx
                      const x = contentWidth - (i * rowLineSpacing)
                      if (x < -1) return null // Allow small overflow for the last line
                      return (
                        <line
                          key={i}
                          x1={x}
                          y1={0}
                          x2={x}
                          y2="100%"
                          stroke={settings.rowLineColor}
                          strokeOpacity={settings.rowLineOpacity}
                          strokeWidth="0.75"
                        />
                      )
                    })}
                  </svg>
                ) : (
                  /* Horizontal writing: horizontal lines */
                  <svg
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                  >
                    {Array.from({ length: Math.ceil((paperHeightPx - marginTopPx - marginBottomPx) / rowLineSpacing) + 1 }).map((_, i) => {
                      const y = i * rowLineSpacing
                      return (
                        <line
                          key={i}
                          x1={0}
                          y1={y}
                          x2="100%"
                          y2={y}
                          stroke={settings.rowLineColor}
                          strokeOpacity={settings.rowLineOpacity}
                          strokeWidth="0.75"
                        />
                      )
                    })}
                  </svg>
                )}
              </div>
            )}

            {/* Guidelines */}
            {settings.showGuidelines && settings.columns > 1 && (
              <div
                className="absolute inset-0 pointer-events-none z-10 flex"
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
                outline-none jp-text
                ${isVertical ? 'writing-vertical' : 'writing-horizontal'}
                ${isFocused ? 'ring-1 ring-gold/20' : ''}
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
                minHeight: `${paperHeightPx}px`,
                height: isVertical ? `${paperHeightPx}px` : 'auto',
                width: '100%',
                overflowX: isVertical ? 'auto' : 'hidden',
                overflowY: isVertical ? 'hidden' : 'auto',
                color: 'var(--canvas-foreground)',
                columnCount: !isVertical && settings.columns > 1 ? settings.columns : undefined,
                columnGap: !isVertical && settings.columns > 1 ? `${settings.columnGap * MM_TO_PX}px` : undefined,
                whiteSpace: 'pre-wrap',
              }}
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              role="textbox"
              aria-label="綴（つづり）"
              aria-multiline="true"
            />
          </div>
        </div>
      </div>

      {/* Fixed Vertical Ruler (pinned to the right edge, always visible) */}
      {settings.showRuler && isVertical && (
        <div
          className="no-print absolute top-0 right-0 h-full select-none z-20 pointer-events-none bg-muted/60 backdrop-blur-sm"
          style={{ width: '28px', borderLeft: '1px solid var(--border)' }}
        >
          <div className="relative h-full" style={{ paddingTop: '24px' }}>
            {rulerMarks.map((mark, i) => {
              if (mark.pos > 2000) return null
              return (
                <div
                  key={i}
                  className="absolute flex items-center"
                  style={{ top: `${mark.pos + 24}px`, right: '2px' }}
                >
                  <div
                    className="bg-muted-foreground/50"
                    style={{
                      height: '1px',
                      width: mark.isMajor ? '10px' : '5px',
                    }}
                  />
                  {mark.label && (
                    <span
                      className="text-muted-foreground leading-none absolute"
                      style={{ fontSize: '7px', right: '14px', transform: 'translateX(-50%)' }}
                    >
                      {mark.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
