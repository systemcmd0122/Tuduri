'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { DEFAULT_SETTINGS, type EditorSettings, type EditorState } from './editor-types'

const STORAGE_KEY = 'shikiji-editor-state'
const MAX_UNDO = 50

type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Partial<EditorSettings> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_STATE'; payload: { content: string; settings: EditorSettings } }
  | { type: 'RESET'; payload?: string }

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CONTENT': {
      const newUndo = [...state.undoStack, state.content].slice(-MAX_UNDO)
      return {
        ...state,
        content: action.payload,
        undoStack: newUndo,
        redoStack: [],
        isDirty: true,
      }
    }
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        isDirty: true,
      }
    case 'UNDO': {
      if (state.undoStack.length === 0) return state
      const prev = state.undoStack[state.undoStack.length - 1]
      return {
        ...state,
        content: prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.content],
        isDirty: true,
      }
    }
    case 'REDO': {
      if (state.redoStack.length === 0) return state
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        ...state,
        content: next,
        undoStack: [...state.undoStack, state.content],
        redoStack: state.redoStack.slice(0, -1),
        isDirty: true,
      }
    }
    case 'LOAD_STATE':
      return {
        ...state,
        content: action.payload.content,
        settings: action.payload.settings,
        isDirty: false,
      }
    case 'RESET':
      return {
        ...state,
        content: action.payload ?? '',
        undoStack: [],
        redoStack: [],
        activeTemplate: null,
        isDirty: true,
      }
    default:
      return state
  }
}

const initialState: EditorState = {
  content: '',
  settings: DEFAULT_SETTINGS,
  undoStack: [],
  redoStack: [],
  isDirty: false,
  activeTemplate: null,
}

interface EditorContextType {
  state: EditorState
  setContent: (content: string) => void
  setSettings: (settings: Partial<EditorSettings>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  loadTemplate: (content: string, templateKey: string) => void
  resetEditor: (content?: string) => void
}

const EditorContext = createContext<EditorContextType | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoaded = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            content: parsed.content || '',
            settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          },
        })
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Auto-save with debounce
  useEffect(() => {
    if (!state.isDirty) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            content: state.content,
            settings: state.settings,
          })
        )
      } catch {
        // storage full, ignore
      }
    }, 500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [state.content, state.settings, state.isDirty])

  const setContent = useCallback((content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content })
  }, [])

  const setSettings = useCallback((settings: Partial<EditorSettings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  const loadTemplate = useCallback((content: string, templateKey: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content })
    // We store activeTemplate via a second dispatch to keep it simple
  }, [])

  const resetEditor = useCallback((content?: string) => {
    dispatch({ type: 'RESET', payload: content })
  }, [])

  const value: EditorContextType = {
    state,
    setContent,
    setSettings,
    undo,
    redo,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    loadTemplate,
    resetEditor,
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}
