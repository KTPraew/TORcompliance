import type { Metadata } from "next";
import "./globals.css";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Providers } from "./providers";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TOR Compliance AI — ระบบตรวจสอบมาตรฐานเว็บไซต์ภาครัฐ",
  description:
    "ระบบ AI สำหรับวิเคราะห์ TOR และตรวจสอบความสอดคล้องของเว็บไซต์ภาครัฐกับมาตรฐาน WCAG, TWCAG และนโยบายเว็บไซต์ภาครัฐ",
  keywords: ["TOR", "WCAG", "TWCAG", "Accessibility", "Compliance", "Government"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={ibmPlexSansThai.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
