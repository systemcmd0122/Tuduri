"use client"

import React from 'react'

export function EditorLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 47px,
          currentColor 47px,
          currentColor 48px
        )`,
      }} />

      <div className="relative flex flex-col items-center gap-8">
        {/* Vertical text animation */}
        <div className="relative flex items-center justify-center">
          <div className="writing-vertical text-5xl tracking-[0.2em] text-foreground/90 font-serif animate-pulse"
            style={{ fontFeatureSettings: '"palt" 1' }}
          >
            綴
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-px bg-border relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-accent"
            style={{
              animation: 'loading-bar 1.8s ease-in-out infinite',
            }}
          />
        </div>

        {/* Status text */}
        <p className="text-xs text-muted-foreground tracking-[0.3em]">
          言の葉を整えています
        </p>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; left: 0%; }
          50% { width: 60%; left: 20%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
    </div>
  )
}

export function FullScreenLoader({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 rounded-lg bg-card border border-border shadow-lg">
        {/* Spinner with vertical text aesthetic */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent"
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-6 bg-accent/30 rounded-full" />
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60" style={{ animation: 'dot-pulse 1.4s ease-in-out 0s infinite' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60" style={{ animation: 'dot-pulse 1.4s ease-in-out 0.2s infinite' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60" style={{ animation: 'dot-pulse 1.4s ease-in-out 0.4s infinite' }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
