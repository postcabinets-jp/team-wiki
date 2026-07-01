import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'team-wiki — Notionの完全OSS代替',
  description: 'セルフホスト可能なオープンソースのチームWiki。ブロックエディタ、インラインDB、バージョン管理、AIアシスタントを無制限に使える。',
  openGraph: {
    title: 'team-wiki — Notionの完全OSS代替',
    description: 'セルフホスト可能なオープンソースのチームWiki',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
