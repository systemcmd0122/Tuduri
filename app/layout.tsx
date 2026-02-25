import type { Metadata, Viewport } from 'next'
import { Noto_Serif_JP } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '900'],
  variable: '--font-noto-serif-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: '綴（つづり） - 本格派 縦書き式辞作成エディター',
    template: '%s | 綴（つづり）',
  },
  description: '大切な瞬間の言葉を、美しく、品格ある縦書きで。式辞・祝辞・弔辞の作成から御巻紙への印刷レイアウト調整までをサポートする、本格的な縦書きドキュメント作成ツール。',
  keywords: ['式辞', '祝辞', '弔辞', '縦書き', '御巻紙', 'エディター', '印刷', 'マナー'],
  authors: [{ name: '綴 制作チーム' }],
  creator: '綴 制作チーム',
  publisher: '綴 制作チーム',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tsuzuri-editor.vercel.app'), // 必要に応じて変更してください
  openGraph: {
    title: '綴（つづり） - 本格派 縦書き式辞作成エディター',
    description: '大切な瞬間の言葉を、美しく、品格ある縦書きで。',
    url: 'https://tsuzuri-editor.vercel.app',
    siteName: '綴（つづり）',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '綴（つづり） - 本格派 縦書き式辞作成エディター',
    description: '大切な瞬間の言葉を、美しく、品格ある縦書きで。',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1612' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSerifJP.variable} font-serif antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
