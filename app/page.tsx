"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { EditorProvider, useEditor } from '@/lib/editor-store'
import EditorCanvas from '@/components/editor/editor-canvas'
import Toolbar from '@/components/toolbar/toolbar'
import SettingsPanel from '@/components/settings/settings-panel'
import { EditorLoadingScreen } from '@/components/editor/loading'

function EditorApp() {
  const [settingsOpen, setSettingsOpen] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const { undo, redo } = useEditor()

  // Simulate initial loading (fonts, settings from localStorage, etc.)
  useEffect(() => {
    // Wait for fonts and initial state hydration
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          redo()
        } else {
          e.preventDefault()
          undo()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  if (!isReady) {
    return <EditorLoadingScreen />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-in fade-in duration-500">
      <Toolbar
        onToggleSettings={() => setSettingsOpen(!settingsOpen)}
        settingsOpen={settingsOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <EditorCanvas />
        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <EditorProvider>
      <EditorApp />
    </EditorProvider>
  )
}
