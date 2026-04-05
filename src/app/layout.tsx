import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="th">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
