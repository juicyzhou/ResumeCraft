import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "简序 · 在线简历编辑器",
  description: "所见即所得的在线简历编辑器。",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
