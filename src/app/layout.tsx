import type { Metadata, Viewport } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: "Thakkir - Islamic Dhikr Counter | تسبيح",
  description:
    "Beautiful Islamic dhikr counter app for remembering Allah. Count SubhanAllah, Alhamdulillah, Allahu Akbar, and more with progress tracking.",
  keywords: [
    "dhikr",
    "islamic",
    "counter",
    "tasbeeh",
    "tasbih",
    "muslim",
    "allah",
    "subhanallah",
    "alhamdulillah",
  ],
  authors: [{ name: "Thakkir App" }],
  creator: "Thakkir",
  publisher: "Thakkir",
  robots: "index, follow",
  openGraph: {
    title: "Thakkir - Islamic Dhikr Counter | تسبيح",
    description:
      "Beautiful Islamic dhikr counter app for remembering Allah | تطبيق جميل لعد التسبيح وذكر الله",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Thakkir - Islamic Dhikr Counter | تسبيح",
    description:
      "Beautiful Islamic dhikr counter app for remembering Allah | تطبيق جميل لعد التسبيح وذكر الله",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#059669",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
