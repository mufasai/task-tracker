import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Tudoo - Modern Task Tracker & Project Management",
    template: "%s | Tudoo"
  },
  description: "Tudoo adalah aplikasi task tracker dan project management modern untuk mengorganisir pekerjaan, mencatat tugas, dan melacak progress tim Anda. Gratis dan mudah digunakan.",
  keywords: [
    "tudoo",
    "task tracker",
    "task management",
    "project management",
    "pencatatan tugas",
    "to do list",
    "todo app",
    "manajemen proyek",
    "productivity app",
    "team collaboration",
    "kanban board",
    "task organizer",
    "work tracker",
    "tugas harian",
    "aplikasi produktivitas"
  ],
  authors: [{ name: "Tudoo Team" }],
  creator: "Tudoo",
  publisher: "Tudoo",
  generator: "Next.js",
  applicationName: "Tudoo",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tudoo.app"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "id-ID": "/id",
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    url: "/",
    siteName: "Tudoo",
    title: "Tudoo - Modern Task Tracker & Project Management",
    description: "Aplikasi task tracker dan project management modern untuk mengorganisir pekerjaan dan melacak progress tim Anda.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tudoo - Modern Task Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tudoo - Modern Task Tracker & Project Management",
    description: "Aplikasi task tracker dan project management modern untuk mengorganisir pekerjaan dan melacak progress tim Anda.",
    images: ["/og-image.png"],
    creator: "@tudooapp",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/manifest.json",
  category: "productivity",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
