import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";

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
    default: "Komando Center",
    template: "%s - Komando Center",
  },
  description: "Sistem manajemen perintah dan pelaporan operasi sosial media.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/ROSS_favicon.ico", sizes: "any" }],
    shortcut: "/ROSS_favicon.ico",
    apple: { url: "/ROSS_favicon.ico", sizes: "180x180" },
  },
  appleWebApp: {
    title: "Komando Center",
  },
};

const initScript = `
(function() {
  try {
    var p = localStorage.getItem('theme-preset') || 'neutral';
    var r = localStorage.getItem('theme-radius');
    var d = document.documentElement;
    d.dataset.themePreset = p;
    if (r) d.style.setProperty('--radius', r + 'rem');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
