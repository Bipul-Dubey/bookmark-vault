import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemesProvider from "@/components/common/theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { QueryProvider } from "@/context/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BookmarkVault - Smart Bookmark Manager",
    template: "%s | BookmarkVault",
  },
  description:
    "Organize, search, and manage your bookmarks with ease. Save links with custom tags, notes, and favorites. Access your bookmarks anywhere with our web app and browser extension.",
  keywords: [
    "bookmark manager",
    "bookmark organizer",
    "save bookmarks",
    "bookmark tags",
    "link manager",
    "web bookmarks",
    "bookmark extension",
    "organize links",
    "bookmark sync",
    "personal bookmarks",
  ],
  authors: [{ name: "BookmarkVault Team" }],
  creator: "BookmarkVault",
  publisher: "BookmarkVault",
  applicationName: "BookmarkVault",
  category: "productivity",
  classification: "Bookmark Management Tool",

  // Open Graph
  openGraph: {
    type: "website",
    siteName: "BookmarkVault",
    title: "BookmarkVault - Smart Bookmark Manager",
    description:
      "Organize, search, and manage your bookmarks with ease. Save links with custom tags, notes, and favorites.",
    url: "https://BookmarkVault.com", // Replace with your actual domain
    images: [
      {
        url: "bookmark.png",
        width: 1200,
        height: 630,
        alt: "BookmarkVault - Smart Bookmark Manager",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // App-specific
  manifest: "/manifest.json",

  // Additional meta tags
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "BookmarkVault",
    "application-name": "BookmarkVault",
    "msapplication-TileColor": "#2563eb",
    "theme-color": "#ffffff",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <ThemesProvider>
          <AuthProvider>
            <QueryProvider>
              <AuthGuard>{children}</AuthGuard>
            </QueryProvider>
          </AuthProvider>
        </ThemesProvider>
      </body>
    </html>
  );
}
