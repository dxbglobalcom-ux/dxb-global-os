import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "DXB Global — Command Center",
  description: "AI-native operating system of the DXB Global holding",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // safe-area insets on phones (§5)
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
